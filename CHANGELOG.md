# Changelog

## 10.1 (2026-10-07)

- **Fixed:** `Ctrl+Shift+]` / `Ctrl+Shift+[` sweep shortcuts now match physical keys (`e.code`). With Shift held, `e.key` is `}` / `{`, so the old check never fired.
- **Added:** matches every Google country TLD under Tampermonkey (`@match https://www.google.tld/*`).
- **Added:** `@updateURL` / `@downloadURL` for one-click installs and auto-updates; `@license MIT`; `@noframes`.
- **UI:** consistent dark design tokens, readable contrast levels (descriptions, counts, empty states), 4px spacing grid, button press states, hover feedback on category chevrons, pop-in animation that respects `prefers-reduced-motion`.
- **Security:** dork keys and descriptions are HTML-escaped before rendering (custom dorks are user input).
- **Performance:** search-box detection coalesced to one lookup per animation frame.

## 10.0

- Initial release: category menu, live filter, cursor-aware insert, domain templates, favorites / recents / custom dorks, sweep mode with session persistence.
