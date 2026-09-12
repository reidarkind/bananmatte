import { sfx } from "./game/audio";
import { createPlaySession, type PlaySession } from "./game/session";
import { applyScore, mathBonus } from "./math/scoring";
import { answersMatch, planRound } from "./math/questions";
import { createRng } from "./math/rng";
import { homeUrl, installUrl, isInstallRoute } from "./lib/routes";
import { renderAbout } from "./screens/about";
import { renderGameOver } from "./screens/gameover";
import { renderGameShell, updateHud } from "./screens/game";
import { renderHighscores } from "./screens/highscore";
import { renderInstall } from "./screens/install";
import { renderMath } from "./screens/math";
import { renderMenu } from "./screens/menu";
import { renderSettings } from "./screens/settings";
import { clearHighscores, loadHighscores, qualifies, saveHighscores, submitHighscore } from "./storage/highscores";
import { loadSettings, saveSettings } from "./storage/settings";
import type { MaxN, RoundPlan, Settings } from "./types";

export function startApp(root: HTMLElement): void {
  let settings = loadSettings();
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
      about: () => renderAbout(root, showMenu),
      install: goInstall,
    });
  };

  const showInstall = () => {
    session?.stop();
    session = null;
    renderInstall(root, goHome);
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
    );
  };

  const showSettings = () => {
    renderSettings(root, settings, {
      back: showMenu,
      save: (next: Settings) => {
        settings = next;
        saveSettings(settings);
      },
      resetHighscores: () => {
        clearHighscores();
      },
    });
  };

  const startGame = () => {
    level = 1;
    score = 0;
    const rng = createRng(Date.now() % 1_000_000);
    plan = planRound(settings, rng);
    const shell = renderGameShell(root, plan.mode, showMenu);
    session?.stop();
    session = createPlaySession({
      canvas: shell.canvas,
      settings,
      rng,
      onHud: (hud) => {
        if (!plan) return;
        updateHud(shell.hud, { ...hud, mode: plan.mode });
      },
      onRoundComplete: (state) => {
        score = state.score;
        if (!plan) return;
        renderMath(shell.overlay, plan, (answer) => {
          if (answersMatch(plan!.answer, answer)) {
            sfx.ok(settings.sound);
            score = applyScore(score, mathBonus(level));
            level += 1;
            plan = planRound(settings, rng);
            shell.overlay.replaceChildren();
            session?.beginRound(plan.catchTarget, level, score);
            updateHud(shell.hud, {
              mode: plan.mode,
              level,
              lives: 2,
              collected: 0,
              target: plan.catchTarget,
              score,
            });
          } else {
            sfx.fail(settings.sound);
            endGame("Feil svar", plan!.explanation, score, level);
          }
        });
      },
      onGameOver: (state) => {
        endGame("Du mistet for mange bananer!", "Prøv å fange de gule. La de brune falle.", state.score, level);
      },
    });
    session.start();
    session.beginRound(plan.catchTarget, level, score);
    updateHud(shell.hud, {
      mode: plan.mode,
      level,
      lives: 2,
      collected: 0,
      target: plan.catchTarget,
      score,
    });
  };

  const endGame = (title: string, detail: string, finalScore: number, finalLevel: number) => {
    session?.stop();
    session = null;
    const board = loadHighscores();
    const askName = qualifies(board, settings.maxN, finalScore);
    renderGameOver(
      root,
      { title, detail, score: finalScore, level: finalLevel, askName },
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
        again: startGame,
        menu: showMenu,
      },
    );
  };

  window.addEventListener("popstate", syncRoute);
  window.addEventListener("hashchange", syncRoute);
  syncRoute();
}
