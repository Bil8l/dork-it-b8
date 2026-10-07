A Google dorking assistant that lives in your search bar. Dork it B8 watches Google's search box, suggests from 100 curated dorks in 14 categories as you type, and inserts them at the cursor with the spacing handled. It also adds sweep mode, which runs a queue of dorks against one base query without retyping any of it.

![Dork it B8](https://raw.githubusercontent.com/Bil8l/dork-it-b8/main/media/menu-categories.svg)

## What it does

- **Filter as you type:** start typing any operator and the menu opens beside the search box, narrowing all 100 dorks by key, description, or category name.
- **Insert at the cursor:** a click or Enter replaces the word at your cursor with the full dork. Spacing around it is handled.
- **Domain templates:** recon dorks like `site:*.[domain] inurl:api` prompt for a domain and build the final query for you.
- **Favorites, recents, customs:** star the dorks you actually use. The last 10 inserts stay under Recent. Custom saves your own dorks with descriptions.
- **Sweep mode:** queue any number of dorks, then cycle through them with two keys while Google submits each query.

![The sweep bar over a Google query](https://raw.githubusercontent.com/Bil8l/dork-it-b8/main/media/sweep-bar.svg)

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge) or [Violentmonkey](https://violentmonkey.github.io/) (Firefox).
2. Click the green Install button at the top of this page.
3. Open Google. The ⠿ button appears at the right edge of the search box.

Works on any Google country domain (`google.de`, `google.co.in`, and so on) under Tampermonkey. Source code and updates: https://github.com/Bil8l/dork-it-b8

## Keyboard

| Keys                            | Action                                 |
| ------------------------------- | -------------------------------------- |
| `Ctrl+Shift+H`                  | show or hide the menu                  |
| *(just type)*                   | live-filter all 100 dorks              |
| `Tab`                           | jump from the search box into the menu |
| `↑` / `↓`                       | move through rows                      |
| `Enter`                         | insert the selected dork               |
| `Esc`                           | back one level, or close               |
| `Ctrl+Shift+]` / `Ctrl+Shift+[` | sweep: next or previous dork           |

## Sweep mode

1. Type the base query, for example `site:example.com ` with a trailing space.
2. Click ⊕ on every dork you want to run. A queue bar appears at the bottom of the page.
3. Press `Ctrl+Shift+]`. The next dork replaces the last one and Google submits.
4. Keep pressing. One query per dork, results one page at a time.

The queue and its position survive Google's page navigations within the tab, so the bar is still there when the results page loads. Toggle **Auto** off in the bar if you want to swap dorks without submitting.

## Privacy

The script makes no network requests of its own. It only reads and writes the Google page you are already on. Favorites, recents and custom dorks live in `localStorage` under the `db8.` prefix. Sweep state lives in `sessionStorage` for the current tab. Uninstalling the script or clearing site data wipes everything.

## Authorized use only

Dorking is OSINT: it queries Google's public index and nothing else. Use it on assets you own or are authorized to test, such as bug bounty scopes, your own servers, security assessments, or CTF practice. Every dork in the library is standard public GHDB-style knowledge. This script keeps them one keystroke away.
