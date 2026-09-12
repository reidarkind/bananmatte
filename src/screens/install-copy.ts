export const INSTALL_COPY = {
  whatThisIs: "Hva dette er",
  whatThisIsBody:
    "Bananmatte er et matte- og fangstspill for 1. og 2. klasse. Du styrer en gorilla med kurv, fanger bananer og svarer på et mattespørsmål etter hver runde.",
  privacy: "Personvern",
  privacyBody1:
    "Appen lagrer ingenting i skyen. Poeng, navn og innstillinger ligger bare lokalt på telefonen. Bananmatte synkroniserer ikke mellom enheter.",
  privacyBody2:
    "Bytt telefon, eller slett nettsteddata: rekordene blir borte. Ingenting sendes på nett.",
  addToHome: "Legg til på hjem-skjermen",
  addToHomeBody:
    "Bananmatte er en nettside du installerer som app. Den ligger ikke i App Store eller Google Play. Åpne den over HTTPS.",
  origin: "Opphav",
  originBody: "Ideen er Reidar Kind sin. Utviklet ved hjelp av AI.",
  ios1: "Åpne Bananmatte i Safari (ikke Chrome, ikke en lenke inne i en annen app).",
  ios2: "Trykk Del (firkanten med pil opp) nederst på skjermen.",
  ios3:
    "Bla i Del-arket og trykk Legg til på Hjem-skjerm. Ser du den ikke: sveip nederste rad, eller trykk Rediger handlinger.",
  ios4: "Trykk Legg til. Åpne Bananmatte fra det nye ikonet.",
  iosNote: "Spill fra hjem-skjerm-ikonet, så appen fyller hele skjermen.",
  android1: "Åpne Bananmatte i Chrome (eller Samsung Internet).",
  android2:
    "Trykk menyen (tre prikker) oppe til høyre, deretter Installer app eller Legg til på startskjerm. Noen telefoner viser også et installasjonsbanner nederst.",
  android3: "Åpne Bananmatte fra startskjermen.",
  androidNote: "Etter installasjon åpner du appen fra ikonet, ikke fra en vanlig fane.",
} as const;

export const INSTALL_COPY_EN = {
  whatThisIs: "What this is",
  whatThisIsBody:
    "Bananmatte is a math and catch game for grades 1 and 2. You steer a gorilla with a basket, catch bananas, and answer a math question after each round.",
  privacy: "Privacy",
  privacyBody1:
    "The app stores nothing in the cloud. Scores, names and settings stay on this phone. Bananmatte does not sync between devices.",
  privacyBody2:
    "Change phone, or clear website data: the scores are gone. Nothing is sent online.",
  addToHome: "Add to the home screen",
  addToHomeBody:
    "Bananmatte is a website you install as an app. It is not in the App Store or Google Play. Open it over HTTPS.",
  origin: "Origin",
  originBody: "The idea is Reidar Kind's. Built with help from AI.",
  ios1: "Open Bananmatte in Safari (not Chrome, not a link inside another app).",
  ios2: "Tap Share (the square with the arrow up) at the bottom of the screen.",
  ios3:
    "Scroll the Share sheet and tap Add to Home Screen. If you do not see it: swipe the bottom row, or tap Edit Actions.",
  ios4: "Tap Add. Open Bananmatte from the new icon.",
  iosNote: "Play from the home-screen icon so the app fills the whole screen.",
  android1: "Open Bananmatte in Chrome (or Samsung Internet).",
  android2:
    "Tap the menu (three dots) at the top right, then Install app or Add to Home screen. Some phones also show an install banner at the bottom.",
  android3: "Open Bananmatte from the home screen.",
  androidNote: "After install, open the app from the icon, not from a regular tab.",
} as const;

export function installCopy(locale: "nb" | "en"): typeof INSTALL_COPY | typeof INSTALL_COPY_EN {
  return locale === "en" ? INSTALL_COPY_EN : INSTALL_COPY;
}
