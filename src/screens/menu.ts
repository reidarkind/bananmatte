import { html, onClick } from "./dom";

export function renderMenu(root: HTMLElement, actions: {
  play: () => void;
  scores: () => void;
  settings: () => void;
  about: () => void;
  install: () => void;
}): void {
  root.replaceChildren(html`
    <section class="screen menu">
      <img class="logo" src="${import.meta.env.BASE_URL}logo.png" alt="Gorilla med banan og kurv" width="160" height="160" />
      <h1>Bananmatte</h1>
      <p class="lead">Fang bananer. Regn etterpå.</p>
      <div class="stack">
        <button class="btn primary" data-go="play">Spill</button>
        <button class="btn" data-go="scores">Rekorder</button>
        <button class="btn" data-go="settings">Innstillinger</button>
        <button class="btn" data-go="install">Installer</button>
        <button class="btn ghost" data-go="about">Om appen</button>
      </div>
    </section>
  `);
  onClick(root, "[data-go]", (button) => {
    const go = button.dataset.go;
    if (go === "play") actions.play();
    if (go === "scores") actions.scores();
    if (go === "settings") actions.settings();
    if (go === "install") actions.install();
    if (go === "about") actions.about();
  });
}
