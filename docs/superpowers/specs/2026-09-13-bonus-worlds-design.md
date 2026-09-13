# Bonus Worlds Design

Date: 2026-09-13
Product: Bananmatte
Audience: Norwegian grades 1–2

## Goal

Keep one bonus engine. After every tenth level, dress the ride as a new world: vehicle, backdrop, and three obstacle skins. Rules stay the same. The bank is still theatre.

## How many levels

The **bonus journey** has seven worlds: 10, 20, 30, 40, 50, 60, 70.

The **math game** has no fixed last level today. After 70 it can keep going. Do not add endless new vehicles after the jet.

## Does the game end?

Yes, but softly. After the level-70 jet ride and the bank deposit, show a finish screen. The run is complete. Offer two clear choices:

- **Prøv på en ny måte** — open settings, so they can change class, modes, or largest number.
- **Lek videre** — stay in the current run. No more bonus worlds. A later crash or miss still uses the normal game-over.

Do not write a highscore on the finish screen unless they already would. Score is unchanged by the bonus. If they tap Lek videre and later lose, save as today.

If they skip the jet ride, still show the finish screen. They reached level 70.

Suggested Bokmål:

- Title: **Du klarte hele reisen!**
- Lead: **Apen kom fram med jetflyet. Poengene dine er trygge.**
- Hint: **Vil du prøve andre oppgaver? Åpne innstillingene.**
- Buttons: **Prøv på en ny måte** · **Lek videre**

Do not say they must stop. Do not say the old settings were wrong.

## Worlds

Same three rules everywhere:

- Soft: spin, keep driving.
- Hard: crash, bonus ends, main game continues.
- Math: pause, existing overlay. Right: resume. Wrong: show fasit, bonus ends.

| Level | Vehicle | Place | Soft | Hard | Math |
| --- | --- | --- | --- | --- | --- |
| 10 | Olabil | Hill, dirt track | Banana | Banana crate | Math book |
| 20 | Bil | Road | Banana | Banana crate | Math book |
| 30 | Vannscooter | Open water | Sea banana: normal banana, a bit orange | Boat buoy with a banana mark | Diver who looks puzzled |
| 40 | Båt | Fjord / harbour | Sea banana | Boat buoy with a banana mark | Diver who looks puzzled |
| 50 | Helikopter | Valley air | Flying banana | Crow with a banana bunch in its beak | Cloud with a short sum |
| 60 | Propellfly | Sky | Flying banana | Crow with a banana bunch | Cloud with a short sum |
| 70 | Jetfly | High sky | Flying banana | Crow with a banana bunch | Cloud with a short sum |

Level 10 is already in the game. Levels 20+ are stand-in skins today. This spec replaces those stand-ins and inserts the jet ski.

Do not put question math in canvas drawing. Clouds and divers are skins. The overlay still asks the real question.

## Intro copy later

When a world ships, the how-to can name that world’s skins. Until then, keep the generic banana / crate / book text.

Example for water: “Treffer du en sjøbanan, svinger du rundt. Det går fint.”

## Unlocked menu

Reached worlds are stored on the device (`bananmatte.unlocks.v1`). The menu item **Bonusspill** lists all seven worlds. Unlocked worlds can be replayed any time. Locked worlds stay shut.

A world unlocks when that bonus starts in the main run (cheat included). Replay from the menu does not change score and does not show the journey-end screen.

Clearing records in settings also clears unlocks. The confirm text must say so.

## Out of scope

A real savings pot. New score for the bank. WebGL. More worlds after 70. Mapping AA to Å.
