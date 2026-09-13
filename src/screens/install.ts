import { t } from "../i18n";
import type { Locale } from "../types";
import { installCopy } from "./install-copy";
import { html, onClick } from "./dom";
import { moreLinks } from "./more-links";

export function renderInstall(root: HTMLElement, back: () => void, locale: Locale = "nb"): void {
  const c = installCopy(locale);
  root.replaceChildren(html`
    <article class="screen pad install-page">
      <button class="back" data-back type="button">${t(locale, "back")}</button>
      <header class="install-hero">
        <img class="logo small" src="${import.meta.env.BASE_URL}logo.png" alt="${t(locale, "menu.logo")}" width="96" height="96" />
        <h1>Bananmatte</h1>
      </header>
      <section>
        <h2>${c.whatThisIs}</h2>
        <p>${c.whatThisIsBody}</p>
      </section>
      <section>
        <h2>${c.privacy}</h2>
        <p>${c.privacyBody1}</p>
        <p>${c.privacyBody2}</p>
      </section>
      <section>
        <h2>${c.addToHome}</h2>
        <p>${c.addToHomeBody}</p>
        <h3>iPhone</h3>
        <ol>
          <li>${c.ios1}</li>
          <li>${c.ios2}</li>
          <li>${c.ios3}</li>
          <li>${c.ios4}</li>
        </ol>
        <p>${c.iosNote}</p>
        <h3>Android</h3>
        <ol>
          <li>${c.android1}</li>
          <li>${c.android2}</li>
          <li>${c.android3}</li>
        </ol>
        <p>${c.androidNote}</p>
      </section>
      <section>
        <h2>${c.origin}</h2>
        <p>${c.originBody}</p>
      </section>
      ${moreLinks(locale)}
    </article>
  `);
  onClick(root, "[data-back]", back);
}
