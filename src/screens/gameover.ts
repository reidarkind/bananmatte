import { PLAYER_NAME_MAX } from "../storage/highscores";
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
  actions: {
    submit: (name: string) => void;
    afterSave: () => void;
    again: () => void;
    menu: () => void;
  },
): void {
  const nameField = info.askName
    ? `<label class="name-field">Navn
        <input data-name type="text" maxlength="${PLAYER_NAME_MAX}" autocomplete="nickname" enterkeyhint="done" placeholder="Skriv navnet ditt" />
      </label>`
    : "";

  const buttons = info.askName
    ? `<button class="btn primary" data-save>Lagre</button>`
    : `<button class="btn primary" data-again>Prøv igjen</button>
       <button class="btn ghost" data-menu>Meny</button>`;

  root.replaceChildren(html`
    <section class="overlay">
      <h2>${info.title}</h2>
      <p>${info.detail}</p>
      <p class="scoreline">Poeng ${info.score} · nivå ${info.level}</p>
      ${nameField}
      <div class="stack">${buttons}</div>
    </section>
  `);

  const input = root.querySelector<HTMLInputElement>("[data-name]");
  input?.focus();

  const save = () => {
    actions.submit(input?.value ?? "");
    actions.afterSave();
  };

  onClick(root, "[data-save]", save);
  onClick(root, "[data-again]", actions.again);
  onClick(root, "[data-menu]", actions.menu);
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  });
}
