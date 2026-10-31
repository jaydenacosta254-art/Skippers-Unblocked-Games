# Skipper's Arcade

A self-contained, animated unblocked-games arcade. Sixteen games — 3D racers,
platformers, puzzles and two in-house originals — live in this repository and are
served from this same domain, so there is no third-party embed for a network
filter to catch.

**Play it:** https://jaydenacosta254-art.github.io/Skippers-Unblocked-Games/

## What's inside

```
index.html            the arcade home page
css/style.css         design system, layout, animations
js/games.js           game catalog, categories, inline SVG icon set
js/app.js             search, filters, sorting, favorites, player, effects
fonts/                self-hosted Space Grotesk + Inter (woff2)
games/                16 playable games, one folder each
CREDITS.md            authors, licenses, what was modified
```

### Features

- Animated hero (gradient headline, parallax tiles, counters), boot screen,
  marquee ticker, featured rail, scroll reveals, 3D-tilt cards with spotlight
- Live search, category filters with counts, A→Z / Z→A / shuffle sorting,
  favorites-only view, "continue playing" history — all persisted in localStorage
- Full-screen player with loading state, restart, favorite, new tab, fullscreen
  and an escape hatch if a game refuses to boot
- Keyboard shortcuts: `/` or `⌘K` search, `R` random game, `F` favorites,
  `Esc` close. There is a Konami code too.
- Responsive down to small phones, `prefers-reduced-motion` respected,
  focus-visible styles and labelled controls throughout

## Run it locally

No build step, no dependencies. Any static file server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Add a game

1. Drop the game's web build into `games/my-game/` (needs an `index.html`).
2. Delete third-party analytics/ad scripts and vendor any CDN dependencies.
3. Add an entry to `GAMES` in `js/games.js`:

```js
{
  id: 'my-game', title: 'My Game', cat: 'arcade', icon: 'paddle',
  blurb: 'One line about it.',
  src: 'games/my-game/index.html',
  a1: '#8b5cff', a2: '#ff3d8b',     // card gradient
  tags: ['Retro', 'Keyboard'], controls: 'Arrow keys', author: 'Someone',
  featured: true                    // optional: show in the featured rail
}
```

The grid, filters, favorites and player pick it up automatically. Add the game
to `CREDITS.md` with its author and license.

## Deployment

`main` is published with GitHub Pages (branch → root). The site is plain static
files, so any host (Pages, Netlify, Cloudflare Pages) will serve it as-is.

## Licensing

Site code and the two original games (Neon Snake, Neon Breakout) are the
project's own work. The bundled games are third-party open-source projects with
their own licenses — please read [CREDITS.md](CREDITS.md) before reusing them.
Untrusted in particular is non-commercial (CC-BY-NC-SA).
