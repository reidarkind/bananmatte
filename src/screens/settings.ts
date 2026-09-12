import { modeLabel, t } from "../i18n";
import { availableModes, isHundrevennAvailable, sanitizeSettings } from "../math/modes";
import type { Locale, MaxN, ModeId, PlaySelection, PlayStyleChoice, Settings } from "../types";
import { html, onClick } from "./dom";

const MAX_OPTIONS: MaxN[] = [10, 50, 100, 1000];
const PLAY_CHOICES: PlayStyleChoice[] = ["sank", "angrep", "forsvar", "mix"];

export function renderSettings(
  root: HTMLElement,
  settings: Settings,
  actions: { back: () => void; save: (next: Settings) => void; resetHighscores: () => void },
): void {
  const next: Settings = sanitizeSettings({
    ...settings,
    selectedModes: [...settings.selectedModes],
  });
  let resetStep: "idle" | "confirm" | "done" = "idle";
  let needOne = false;

  const paint = () => {
    const locale = next.locale;
    const available = availableModes(next);
    const modeChoices = (["mix", "selected", ...available] as const);
    const modeOptions = modeChoices
      .map((id) => `<option value="${id}" ${next.playSelection === id ? "selected" : ""}>${modeLabel(locale, id)}</option>`)
      .join("");

    root.replaceChildren(html`
      <section class="screen pad">
        <button class="back" data-back type="button">${t(locale, "back")}</button>
        <h1>${t(locale, "settings.title")}</h1>
        <label>${t(locale, "settings.language")}
          <div class="tabs">
            <button class="tab ${next.locale === "nb" ? "on" : ""}" data-lang="nb">${t(locale, "settings.nb")}</button>
            <button class="tab ${next.locale === "en" ? "on" : ""}" data-lang="en">${t(locale, "settings.en")}</button>
          </div>
        </label>
        <label>${t(locale, "settings.play")}
          <div class="tabs">
            ${PLAY_CHOICES.map((id) => `<button class="tab ${id === next.playStyle ? "on" : ""}" data-play="${id}">${t(locale, `play.${id}`)}</button>`).join("")}
          </div>
        </label>
        <label>${t(locale, "settings.max")}
          <div class="tabs">
            ${MAX_OPTIONS.map((n) => `<button class="tab ${n === next.maxN ? "on" : ""}" data-max="${n}">${n}</button>`).join("")}
          </div>
        </label>
        ${next.maxN === 1000 ? `
          <label class="check">
            <input type="checkbox" data-hundrevenn ${next.hundrevennEnabled ? "checked" : ""} />
            ${t(locale, "settings.hundrevenn")}
          </label>` : ""}
        <label>${t(locale, "settings.mode")}
          <select data-mode>${modeOptions}</select>
        </label>
        ${next.playSelection === "selected" ? `
          <fieldset>
            <legend>${t(locale, "settings.selected")}</legend>
            ${needOne ? `<p class="muted">${t(locale, "settings.needOne")}</p>` : ""}
            ${available.filter((id) => id !== "hundrevenn" || isHundrevennAvailable(next))
              .map((id) => `<label class="check"><input type="checkbox" data-sel="${id}" ${next.selectedModes.includes(id) ? "checked" : ""} /> ${modeLabel(locale, id)}</label>`)
              .join("")}
          </fieldset>` : ""}
        <label class="check">
          <input type="checkbox" data-sound ${next.sound ? "checked" : ""} />
          ${t(locale, "settings.sound")}
        </label>
        ${resetStep === "idle" ? `<button class="btn" data-reset-scores type="button">${t(locale, "settings.reset")}</button>` : ""}
        ${resetStep === "confirm" ? `
          <div class="reset-box">
            <p>${t(locale, "settings.resetAsk")}</p>
            <button class="btn" data-reset-confirm type="button">${t(locale, "settings.resetYes")}</button>
            <button class="btn" data-reset-cancel type="button">${t(locale, "settings.resetNo")}</button>
          </div>` : ""}
        ${resetStep === "done" ? `<p class="muted">${t(locale, "settings.resetDone")}</p>` : ""}
      </section>
    `);

    onClick(root, "[data-back]", () => {
      actions.save(sanitizeSettings(next));
      actions.back();
    });
    onClick(root, "[data-lang]", (button) => {
      next.locale = button.dataset.lang as Locale;
      paint();
    });
    onClick(root, "[data-play]", (button) => {
      next.playStyle = button.dataset.play as PlayStyleChoice;
      paint();
    });
    onClick(root, "[data-max]", (button) => {
      next.maxN = Number(button.dataset.max) as MaxN;
      Object.assign(next, sanitizeSettings(next));
      paint();
    });
    const mode = root.querySelector<HTMLSelectElement>("[data-mode]");
    mode?.addEventListener("change", () => {
      next.playSelection = mode.value as PlaySelection;
      Object.assign(next, sanitizeSettings(next));
      paint();
    });
    root.querySelector<HTMLInputElement>("[data-hundrevenn]")?.addEventListener("change", (event) => {
      next.hundrevennEnabled = (event.target as HTMLInputElement).checked;
      Object.assign(next, sanitizeSettings(next));
      paint();
    });
    root.querySelector<HTMLInputElement>("[data-sound]")?.addEventListener("change", (event) => {
      next.sound = (event.target as HTMLInputElement).checked;
    });
    root.querySelectorAll<HTMLInputElement>("[data-sel]").forEach((box) => {
      box.addEventListener("change", () => {
        const id = box.dataset.sel as ModeId;
        if (box.checked && !next.selectedModes.includes(id)) next.selectedModes.push(id);
        if (!box.checked) {
          const leftover = next.selectedModes.filter((modeId) => modeId !== id);
          if (leftover.length === 0) {
            needOne = true;
            paint();
            return;
          }
          next.selectedModes = leftover;
        }
        needOne = false;
        paint();
      });
    });
    onClick(root, "[data-reset-scores]", () => {
      resetStep = "confirm";
      paint();
    });
    onClick(root, "[data-reset-confirm]", () => {
      actions.resetHighscores();
      resetStep = "done";
      paint();
    });
    onClick(root, "[data-reset-cancel]", () => {
      resetStep = "idle";
      paint();
    });
  };

  paint();
}
