import { ARCADE_ALPHABET } from "../types";
import { html, onClick } from "./dom";

export function renderGameOver(
  root: HTMLElement,
  info: {
    title: string;
    detail: string;
    score: number;
    level: number;
    askName: boolean;
  },
  actions: { submit: (name: string) => void; again: () => void; menu: () => void },
): void {
  let chars = ["A", "A", "A"];
  let slot = 0;

  const paint = () => {
    const wheels = info.askName
      ? `<div class="arcade">
          ${chars.map((ch, i) => `<button class="letter ${i === slot ? "on" : ""}" data-slot="${i}">${ch}</button>`).join("")}
          <div class="row">
            <button class="btn" data-spin="-1">Forrige</button>
            <button class="btn" data-spin="1">Neste</button>
          </div>
        </div>`
      : "";

    root.replaceChildren(html`
      <section class="overlay">
        <h2>${info.title}</h2>
        <p>${info.detail}</p>
        <p class="scoreline">Poeng ${info.score} · nivå ${info.level}</p>
        ${wheels}
        <div class="stack">
          <button class="btn primary" data-again>${info.askName ? "Lagre og spill" : "Prøv igjen"}</button>
          <button class="btn ghost" data-menu>Meny</button>
        </div>
      </section>
    `);

    onClick(root, "[data-slot]", (button) => {
      slot = Number(button.dataset.slot);
      paint();
    });
    onClick(root, "[data-spin]", (button) => {
      const dir = Number(button.dataset.spin);
      const alphabet = ARCADE_ALPHABET;
      const index = alphabet.indexOf(chars[slot] ?? "A");
      chars[slot] = alphabet[(index + dir + alphabet.length) % alphabet.length] ?? "A";
      paint();
    });
    onClick(root, "[data-again]", () => {
      if (info.askName) actions.submit(chars.join(""));
      actions.again();
    });
    onClick(root, "[data-menu]", () => {
      if (info.askName) actions.submit(chars.join(""));
      actions.menu();
    });
  };

  paint();
}
