import { ALL_MODES, MODE_LABELS, type MaxN, type ModeId, type PlaySelection, type Settings } from "../types";
import { isHundrevennAvailable } from "../math/modes";
import { html, onClick } from "./dom";

const MAX_OPTIONS: MaxN[] = [10, 50, 100, 1000];

export function renderSettings(
  root: HTMLElement,
  settings: Settings,
  actions: { back: () => void; save: (next: Settings) => void },
): void {
  const next: Settings = {
    ...settings,
    selectedModes: [...settings.selectedModes],
  };

  const paint = () => {
    const modeOptions = (["mix", "selected", ...ALL_MODES] as const)
      .filter((id) => id !== "hundrevenn" || next.maxN === 1000)
      .map((id) => `<option value="${id}" ${next.playSelection === id ? "selected" : ""}>${MODE_LABELS[id]}</option>`)
      .join("");

    root.replaceChildren(html`
      <section class="screen pad">
        <button class="back" data-back type="button">Tilbake</button>
        <h1>Innstillinger</h1>
        <label>Største tall
          <div class="tabs">
            ${MAX_OPTIONS.map((n) => `<button class="tab ${n === next.maxN ? "on" : ""}" data-max="${n}">${n}</button>`).join("")}
          </div>
        </label>
        ${next.maxN === 1000 ? `
          <label class="check">
            <input type="checkbox" data-hundrevenn ${next.hundrevennEnabled ? "checked" : ""} />
            Ta med hundrevenn
          </label>` : ""}
        <label>Modus
          <select data-mode>${modeOptions}</select>
        </label>
        ${next.playSelection === "selected" ? `
          <fieldset>
            <legend>Utvalg</legend>
            ${ALL_MODES.filter((id) => id !== "hundrevenn" || isHundrevennAvailable(next))
              .map((id) => `<label class="check"><input type="checkbox" data-sel="${id}" ${next.selectedModes.includes(id) ? "checked" : ""} /> ${MODE_LABELS[id]}</label>`)
              .join("")}
          </fieldset>` : ""}
        <label class="check">
          <input type="checkbox" data-sound ${next.sound ? "checked" : ""} />
          Lyd
        </label>
      </section>
    `);

    onClick(root, "[data-back]", () => {
      actions.save(next);
      actions.back();
    });
    onClick(root, "[data-max]", (button) => {
      next.maxN = Number(button.dataset.max) as MaxN;
      if (next.playSelection === "hundrevenn" && next.maxN !== 1000) {
        next.playSelection = "tiervenn";
      }
      paint();
    });
    const mode = root.querySelector<HTMLSelectElement>("[data-mode]");
    mode?.addEventListener("change", () => {
      next.playSelection = mode.value as PlaySelection;
      paint();
    });
    root.querySelector<HTMLInputElement>("[data-hundrevenn]")?.addEventListener("change", (event) => {
      next.hundrevennEnabled = (event.target as HTMLInputElement).checked;
    });
    root.querySelector<HTMLInputElement>("[data-sound]")?.addEventListener("change", (event) => {
      next.sound = (event.target as HTMLInputElement).checked;
    });
    root.querySelectorAll<HTMLInputElement>("[data-sel]").forEach((box) => {
      box.addEventListener("change", () => {
        const id = box.dataset.sel as ModeId;
        if (box.checked && !next.selectedModes.includes(id)) next.selectedModes.push(id);
        if (!box.checked) next.selectedModes = next.selectedModes.filter((modeId) => modeId !== id);
      });
    });
  };

  paint();
}
