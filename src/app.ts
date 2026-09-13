import { sfx } from "./game/audio";
import { createPlaySession, type PlaySession } from "./game/session";
import { overCopy, t } from "./i18n";
import { applyScore, mathBonus } from "./math/scoring";
import { answersMatch, planRound } from "./math/questions";
import { createRng } from "./math/rng";
import { homeUrl, installUrl, isInstallRoute } from "./lib/routes";
import { renderAbout } from "./screens/about";
import { renderGameOver } from "./screens/gameover";
import { renderGameShell, updateHud } from "./screens/game";
import { renderHighscores } from "./screens/highscore";
import { renderInstall } from "./screens/install";
import { parseBonusCheat } from "./bonus/cheat";
import { isBonusLevel } from "./bonus/milestones";
import { renderBonusRide } from "./screens/bonus";
import { renderMath } from "./screens/math";
import { renderMenu } from "./screens/menu";
import { renderSettings } from "./screens/settings";
import { clearHighscores, loadHighscores, qualifies, saveHighscores, submitHighscore } from "./storage/highscores";
import { loadSettings, saveSettings } from "./storage/settings";
import { LOCALE_HTML, type Locale, type MaxN, type PlayStyle, type RoundPlan, type Settings } from "./types";

function applyDocumentLocale(locale: Locale): void {
  document.documentElement.lang = LOCALE_HTML[locale];
}

export function startApp(root: HTMLElement): void {
  let settings = loadSettings();
  applyDocumentLocale(settings.locale);
  let session: PlaySession | null = null;
  let plan: RoundPlan | null = null;
  let level = 1;
  let score = 0;
  let savedHighlight: { maxN: MaxN; index: number } | undefined;

  const showMenu = () => {
    session?.stop();
    session = null;
    renderMenu(root, {
      play: startGame,
      scores: () => showScores(settings.maxN),
      settings: showSettings,
      about: () => renderAbout(root, showMenu, settings.locale),
      install: goInstall,
    }, settings.locale);
  };

  const showInstall = () => {
    session?.stop();
    session = null;
    renderInstall(root, goHome, settings.locale);
  };

  const goInstall = () => {
    const next = installUrl(window.location.origin, import.meta.env.BASE_URL);
    if (`${window.location.origin}${window.location.pathname}`.replace(/\/+$/, "") !== next.replace(/\/+$/, "")) {
      history.pushState({ screen: "install" }, "", next);
    }
    showInstall();
  };

  const goHome = () => {
    const next = homeUrl(window.location.origin, import.meta.env.BASE_URL);
    history.pushState({ screen: "menu" }, "", next);
    showMenu();
  };

  const syncRoute = () => {
    if (isInstallRoute(window.location.pathname, window.location.hash)) {
      showInstall();
    } else {
      showMenu();
    }
  };

  const showScores = (maxN: MaxN, highlight?: { maxN: MaxN; index: number }) => {
    renderHighscores(
      root,
      loadHighscores(),
      maxN,
      {
        back: showMenu,
        change: (next) => showScores(next, highlight),
      },
      highlight?.maxN === maxN ? highlight.index : undefined,
      settings.locale,
    );
  };

  const showSettings = () => {
    renderSettings(root, settings, {
      back: showMenu,
      save: (next: Settings) => {
        settings = next;
        saveSettings(settings);
        applyDocumentLocale(settings.locale);
      },
      resetHighscores: () => {
        clearHighscores();
      },
    });
  };

  const paintHud = (
    hud: HTMLElement,
    extra: { lives: number; collected: number; target: number; score: number; rottenCaught?: number; playStyle?: PlayStyle },
  ) => {
    if (!plan) return;
    updateHud(hud, {
      ...extra,
      mode: plan.mode,
      level,
      locale: settings.locale,
    });
  };

  const startGame = () => {
    level = 1;
    score = 0;
    const rng = createRng(Date.now() % 1_000_000);
    plan = planRound(settings, rng);
    const shell = renderGameShell(root, plan.mode, showMenu, settings.locale);
    session?.stop();
    session = createPlaySession({
      canvas: shell.canvas,
      settings,
      rng,
      onHud: (hud) => {
        paintHud(shell.hud, hud);
      },
      onRoundComplete: (state) => {
        score = state.score;
        if (!plan) return;
        renderMath(shell.overlay, plan, (answer, raw) => {
          const cheat = typeof plan!.answer === "number" && raw ? parseBonusCheat(raw, plan!.answer) : null;
          const ok = cheat !== null || answersMatch(plan!.answer, answer);
          if (!ok) {
            sfx.fail(settings.sound);
            endGame(t(settings.locale, "over.wrong"), plan!.explanation, score, level, true);
            return;
          }
          sfx.ok(settings.sound);
          score = applyScore(score, mathBonus(level));
          const bonusAt = cheat ?? (isBonusLevel(level) ? level : null);
          const continueMain = () => {
            level += 1;
            plan = planRound(settings, rng, plan!.mode);
            shell.overlay.replaceChildren();
            session?.beginRound(plan.catchTarget, level, score);
            paintHud(shell.hud, {
              lives: 2,
              collected: 0,
              target: plan.catchTarget,
              score,
              rottenCaught: state.rottenCaught,
              playStyle: session?.getPlayStyle(),
            });
          };
          if (bonusAt) {
            shell.overlay.replaceChildren();
            const play = (shell.canvas.closest(".play") as HTMLElement | null) ?? root;
            renderBonusRide(play, {
              milestone: bonusAt,
              locale: settings.locale,
              settings,
              rng,
              onDone: continueMain,
            });
            return;
          }
          continueMain();
        }, settings.locale);
      },
      onGameOver: (state) => {
        const copy = overCopy(settings.locale, session?.getPlayStyle() ?? "sank", state.endReason ?? "misses");
        endGame(copy.title, copy.detail, state.score, level);
      },
    });
    session.start();
    session.beginRound(plan.catchTarget, level, score);
    paintHud(shell.hud, {
      lives: 2,
      collected: 0,
      target: plan.catchTarget,
      score,
      rottenCaught: 0,
      playStyle: session.getPlayStyle(),
    });
  };

  const endGame = (title: string, detail: string, finalScore: number, finalLevel: number, ackFasit = false) => {
    session?.stop();
    session = null;
    const board = loadHighscores();
    const showOver = (askName: boolean) => {
      renderGameOver(
        root,
        { title, detail, score: finalScore, level: finalLevel, askName, ackFasit, locale: settings.locale },
        {
          submit: (name) => {
            const date = new Date().toISOString();
            const updated = submitHighscore(loadHighscores(), settings.maxN, {
              name,
              score: finalScore,
              level: finalLevel,
              date,
            });
            saveHighscores(updated);
            savedHighlight = {
              maxN: settings.maxN,
              index: (updated[String(settings.maxN)] ?? []).findIndex((entry) => entry.date === date),
            };
          },
          afterSave: () => {
            showScores(settings.maxN, savedHighlight?.index === -1 ? undefined : savedHighlight);
          },
          cancel: () => (ackFasit ? showMenu() : showOver(false)),
          again: startGame,
          menu: showMenu,
        },
      );
    };
    showOver(qualifies(board, settings.maxN, finalScore));
  };

  window.addEventListener("popstate", syncRoute);
  window.addEventListener("hashchange", syncRoute);
  syncRoute();
}
