# Sorting practice

A small, static practice app for Bubble Sort and Selection Sort. No dependencies, build step, account, or backend.

## Run locally

Run `npm start` (requires Python 3), then open http://localhost:8000. Serve the files over HTTP because the app uses JavaScript modules.

## Practice

- Click two bars, or drag one onto another, to propose a swap.
- Bubble Sort checks every adjacent comparison, including decisions to keep the current order. It stops after a pass with no swaps.
- Selection Sort checks one minimum-placement decision per pass. Students scan the remaining values themselves.
- Incorrect moves leave the numbers in place. Hints explain the current decision.
- Switching algorithms preserves the numbers for comparison.
- The EN / RO toggle changes all instructions and feedback without restarting. Your language choice is remembered when browser storage is available.

## Code

`sorting.js` generates the algorithm steps and validates swaps. `app.js` manages the exercise and renders the interface. `translations.js` holds the English and Romanian text. `styles.css` contains the responsive layout. Run `npm test` with Node.js 18 or later to check the sorting rules.

The app uses system fonts and works without external services.

## GitHub Pages

Push this folder to a GitHub repository on the `main` branch. In **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow runs the tests and publishes only the five static app files. Relative asset paths support both repository and custom-domain sites.
