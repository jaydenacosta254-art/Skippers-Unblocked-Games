# Credits & licenses

Skipper's Arcade itself (the site, the layout, **Neon Snake** and **Neon Breakout**)
is an original work. Everything else is open-source software written by other
people, bundled here so the games load from this domain instead of a third-party
server.

Each game folder keeps its upstream `LICENSE` file. If a license is missing from
a folder it is because the upstream repository didn't ship one — check the
upstream link before reusing that code.

## Bundled games

| Game | Author | License | Upstream |
| --- | --- | --- | --- |
| 2048 | Gabriele Cirulli | MIT | https://github.com/gabrielecirulli/2048 |
| Hextris | Hextris team | GPL-3.0 | https://github.com/Hextris/hextris |
| Tetris | chvin | see upstream | https://github.com/chvin/react-tetris |
| Pac-Man (pacman-canvas) | platzhersh | CC0-1.0 | https://github.com/platzhersh/pacman-canvas |
| Floppy Bird | Nebez Briefkani | Apache-2.0 | https://github.com/nebez/floppybird |
| Clumsy Bird | Ellison Leão | GPL-3.0 | https://github.com/ellisonleao/clumsy-bird |
| Dino Run (t-rex-runner) | 牛さん / Chromium team | BSD-3-Clause | https://github.com/wayou/t-rex-runner |
| Astray | wwwtyro | public domain / Unlicense | https://github.com/wwwtyro/Astray |
| HexGL | Thibaut Despoulain (BKcore) | MIT | https://github.com/BKcore/HexGL |
| Turbo Racer (javascript-racer) | Jake Gordon | MIT | https://github.com/jakesgordon/javascript-racer |
| Infinite Mario (mariohtml5) | Robert Kleffner | public domain / Unlicense | https://github.com/robertkleffner/mariohtml5 |
| Gauntlet (javascript-gauntlet) | Jake Gordon | MIT | https://github.com/jakesgordon/javascript-gauntlet |
| A Dark Room | Doublespeak Games | MPL-2.0 | https://github.com/doublespeakgames/adarkroom |
| Untrusted | Alex Nisnevich | CC-BY-NC-SA-3.0 (non-commercial) | https://github.com/AlexNisnevich/untrusted |

**Heads up on Untrusted:** it is licensed non-commercially. Keep it out of any
paid or ad-supported version of this site. The GPL games (Hextris, Clumsy Bird)
require their source to remain available — it does, right here in `games/`.

## Fonts

- **Space Grotesk** — Florian Karsten, SIL Open Font License 1.1
- **Inter** — Rasmus Andersson, SIL Open Font License 1.1

Both are self-hosted (via Fontsource) so the site never calls a font CDN.

## What was changed in the bundled games

- Analytics, ad and donation scripts were removed (Google Analytics, AdSense,
  Dotgears/umami, Google Tag Manager, PayPal buttons, Dropbox datastore SDK).
- CDN dependencies were replaced with local copies: jQuery 1.10.2 (Pac-Man,
  Mario, Untrusted, A Dark Room), fonts left to system fallbacks.
- Unused bulk was pruned to keep the repository small (replays, duplicate texture
  sets, unused tracks, raw `.wav` masters).
- No gameplay code was rewritten. Games are served byte-for-byte apart from the
  removals above.
