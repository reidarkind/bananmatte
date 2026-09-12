import { html, onClick } from "./dom";

export function renderAbout(root: HTMLElement, back: () => void): void {
  root.replaceChildren(html`
    <section class="screen pad">
      <button class="back" data-back type="button">Tilbake</button>
      <h1>Om appen</h1>
      <p>Bananmatte er et matte- og fangstspill for 1. og 2. klasse.</p>
      <p>Du styrer gorillaen nederst. Fang gule bananer. La de brune være.</p>
      <p>Mister du to bananer, er det slutt. Feil svar viser fasit, og du starter på nytt.</p>
      <h2>Personvern</h2>
      <p>Poeng og navn lagres bare på denne telefonen. Ingenting sendes på nett.</p>
    </section>
  `);
  onClick(root, "[data-back]", back);
}
