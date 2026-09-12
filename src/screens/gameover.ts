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
  actions: { submit: (name: string) => void; again: () => void; menu: () => void },
): void {
  const nameField = info.askName
    ? `<label class="name-field">Navn
        <input data-name type="text" maxlength="${PLAYER_NAME_MAX}" autocomplete="nickname" enterkeyhint="done" placeholder="Skriv navnet ditt" />
      </label>`
    : "";

  root.replaceChildren(html`
    <section class="overlay">
      <h2>${info.title}</h2>
      <p>${info.detail}</p>
      <p class="scoreline">Poeng ${info.score} · nivå ${info.level}</p>
      ${nameField}
      <div class="stack">
        <button class="btn primary" data-again>${info.askName ? "Lagre og spill" : "Prøv igjen"}</button>
        <button class="btn ghost" data-menu>Meny</button>
      </div>
    </section>
  `);

  const input = root.querySelector<HTMLInputElement>("[data-name]");
  input?.focus();

  const finish = (then: () => void) => {
    if (info.askName) actions.submit(input?.value ?? "");
    then();
  };

  onClick(root, "[data-again]", () => finish(actions.again));
  onClick(root, "[data-menu]", () => finish(actions.menu));
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(actions.again);
    }
  });
}
