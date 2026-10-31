/* ============================================================
   Skipper's Arcade — game catalog
   Every game here is an open-source HTML5 title that is served
   straight from this site (no external embeds, no trackers, so
   nothing gets blocked by a network filter).
   ============================================================ */

const ICONS = {
  tiles: `<rect x="6" y="6" width="16" height="16" rx="4.5"/><rect x="26" y="6" width="16" height="16" rx="4.5"/><rect x="6" y="26" width="16" height="16" rx="4.5"/><rect x="26" y="26" width="16" height="16" rx="4.5" fill="currentColor"/><circle cx="34" cy="34" r="3" fill="#0a0d18" stroke="none"/>`,
  hex: `<path d="M24 4.5 40 14v20L24 43.5 8 34V14z"/><path d="M24 14.5 33 20v10l-9 5-9-5V20z" opacity=".45"/><circle cx="24" cy="24.5" r="2.6" fill="currentColor" stroke="none"/>`,
  tetris: `<rect x="5" y="28" width="9.5" height="9.5" rx="2"/><rect x="16" y="28" width="9.5" height="9.5" rx="2"/><rect x="27" y="28" width="9.5" height="9.5" rx="2"/><rect x="27" y="17" width="9.5" height="9.5" rx="2" fill="currentColor"/><rect x="5" y="17" width="9.5" height="9.5" rx="2" opacity=".45"/><rect x="16" y="6" width="9.5" height="9.5" rx="2" opacity=".45"/>`,
  pac: `<path d="M23 24 36 16.5A15 15 0 1 0 36 31.5Z" fill="currentColor" stroke="none"/><circle cx="42" cy="24" r="2" fill="currentColor" stroke="none"/>`,
  bird: `<circle cx="20" cy="25" r="10.5"/><path d="M30.5 23.5 39 26l-8.5 3.4z" fill="currentColor" stroke="none"/><circle cx="23" cy="20.5" r="1.8" fill="currentColor" stroke="none"/><path d="M13.5 29.5c3 2.4 6.4 2.6 9.2 1"/><path d="M10 33.5c3.5 2.4 7.6 2.2 10.6.4" opacity=".45"/>`,
  egg: `<path d="M24 5.5c7.2 0 12.5 10.4 12.5 18.6A12.5 12.5 0 0 1 11.5 24C11.5 15.9 16.8 5.5 24 5.5z"/><path d="M14.5 27.5l4-3.6 3.6 4.2 3.6-4.2 3.7 3.6" /><path d="M18 34c2 1.4 4.2 1.6 6.4.6" opacity=".45"/>`,
  dino: `<rect x="15" y="18" width="16" height="10" rx="1.5" fill="currentColor" stroke="none"/><rect x="27" y="9" width="11" height="11" rx="2" fill="currentColor" stroke="none"/><rect x="19" y="27" width="4.4" height="8" fill="currentColor" stroke="none"/><rect x="26.5" y="27" width="4.4" height="8" fill="currentColor" stroke="none"/><rect x="9.5" y="19.5" width="6" height="4.4" rx="1.6" fill="currentColor" stroke="none"/><rect x="31" y="22.5" width="8" height="3.2" rx="1.6" fill="currentColor" stroke="none"/><circle cx="34.5" cy="12.6" r="1.7" fill="#0a0f1c" stroke="none"/><path d="M4 39.5h40" opacity=".35" stroke-dasharray="3 5"/>`,
  maze: `<path d="M24 5 40 14v20L24 43 8 34V14z"/><path d="M16 19h8v10h8V19h6" opacity=".55"/><path d="M16 30v-4" opacity=".55"/>`,
  ship: `<path d="M24 4.5 32.5 19H15.5z"/><rect x="15.5" y="19" width="17" height="13.5" rx="5"/><path d="M15.5 25.5 9 32.5l6.5 1.6M32.5 25.5 39 32.5l-6.5 1.6"/><path d="M21 34l3 8 3-8"/>`,
  car: `<path d="M7 32h34l-4-9H11z"/><circle cx="16" cy="34" r="4"/><circle cx="32" cy="34" r="4"/><path d="M5 18h9M3 24h7M42 18h3" opacity=".5"/>`,
  block: `<rect x="9" y="9" width="27" height="27" rx="4"/><path d="M19 18c0-3 2-5 5-5s5 2 5 4c0 4-5 4-5 8" stroke-width="3"/><circle cx="22.5" cy="30" r="2" fill="currentColor" stroke="none"/><circle cx="41" cy="12" r="4" opacity=".55"/>`,
  sword: `<path d="M24 4.5 28.5 11v15h-9V11z" fill="currentColor" stroke="none" opacity=".9"/><path d="M13 27.5h22"/><path d="M24 28.5v9"/><circle cx="24" cy="40" r="2.6"/><path d="M14.5 22.5 9 17M33.5 22.5 39 17" opacity=".4"/>`,
  fire: `<path d="M24 6c6 8 11 10 11 18a11 11 0 0 1-22 0c0-4 2-6 4-9 1 4 3 5 5 5-2-6 0-10 2-14z"/><path d="M9 39h30" opacity=".5"/><path d="M14 43h20" opacity=".3"/>`,
  code: `<path d="M18 13 7 24l11 11M30 13l11 11-11 11"/><circle cx="24" cy="28" r="2.4" fill="currentColor" stroke="none"/><path d="M24 34v6" opacity=".5"/>`,
  snake: `<path d="M12 34h14a5 5 0 0 0 0-10h-4a5 5 0 0 1 0-10h12"/><circle cx="12" cy="34" r="3.4" fill="currentColor" stroke="none"/><circle cx="38" cy="34" r="3" opacity=".7"/><path d="M35 14h4" opacity=".6"/>`,
  paddle: `<rect x="6" y="10" width="10" height="6" rx="1.8"/><rect x="19" y="10" width="10" height="6" rx="1.8" opacity=".6"/><rect x="32" y="10" width="10" height="6" rx="1.8"/><circle cx="24" cy="26" r="3.4" fill="currentColor" stroke="none"/><rect x="14" y="37" width="20" height="4.5" rx="2.2" fill="currentColor" stroke="none"/>`
};

const svg = (key) => `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ICONS.tiles}</svg>`;

const CATEGORIES = [
  { id: 'all', label: 'All games' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'action', label: 'Action' },
  { id: 'platformer', label: 'Platformer' },
  { id: 'racing', label: 'Racing' },
  { id: 'adventure', label: 'Adventure' }
];

const GAMES = [
  {
    id: 'hexgl', title: 'HexGL', cat: 'racing', icon: 'ship',
    blurb: 'Anti-gravity racing at 700km/h. WebGL, bloom, the works.',
    src: 'games/hexgl/index.html', a1: '#22e3ff', a2: '#4f7cff',
    tags: ['3D', 'Futuristic', 'Keyboard'], controls: 'WASD / Arrows to steer', author: 'BKcore', featured: true, weight: 10
  },
  {
    id: 'mario', title: 'Infinite Mario', cat: 'platformer', icon: 'block',
    blurb: 'The classic plumber in a never-ending HTML5 playground.',
    src: 'games/mario/main.html', a1: '#ff5c5c', a2: '#ffb703',
    tags: ['Retro', '8-bit', 'Keyboard'], controls: 'Arrows to move, Space to jump', author: 'Robert Kleffner', featured: true, weight: 9
  },
  {
    id: 'tetris', title: 'Tetris', cat: 'puzzle', icon: 'tetris',
    blurb: 'The block stacker, rebuilt with silky animations and music.',
    src: 'games/tetris/index.html', a1: '#22d3ee', a2: '#3b82f6',
    tags: ['Classic', 'Music', 'Keyboard'], controls: 'Arrows to move & rotate', author: 'chvin', featured: true, weight: 9
  },
  {
    id: 'hextris', title: 'Hextris', cat: 'puzzle', icon: 'hex',
    blurb: 'Tetris meets a spinning hexagon. Deceptively brutal.',
    src: 'games/hextris/index.html', a1: '#ff4d8d', a2: '#ff9f43',
    tags: ['Fast', 'Reflex', 'Touch'], controls: 'Arrow keys or tap sides', author: 'Hextris team', featured: true, weight: 8
  },
  {
    id: 'astray', title: 'Astray', cat: 'adventure', icon: 'maze',
    blurb: 'A WebGL labyrinth. Find the exit, or get gloriously lost.',
    src: 'games/astray/index.html', a1: '#7c5cff', a2: '#22e3ff',
    tags: ['3D', 'Maze', 'Keyboard'], controls: 'WASD / Arrows to move', author: 'wwwtyro', featured: true, weight: 7
  },
  {
    id: 'pacman', title: 'Pac-Man', cat: 'arcade', icon: 'pac',
    blurb: 'Chomp pellets, dodge ghosts, hit the power pellet combo.',
    src: 'games/pacman/index.htm', a1: '#ffe14d', a2: '#ff9f1a',
    tags: ['Classic', 'Maze', 'Arrows'], controls: 'Arrow keys to move', author: 'platzhersh', featured: true, weight: 8
  },
  {
    id: 'neon-snake', title: 'Neon Snake', cat: 'arcade', icon: 'snake',
    blurb: 'Our own glow-in-the-dark take on the Nokia legend.',
    src: 'games/neon-snake/index.html', a1: '#b6ff3c', a2: '#22e3ff',
    tags: ['Original', 'Endless', 'Touch'], controls: 'Arrows / WASD or swipe', author: 'Skipper Labs', featured: true, builtin: true, weight: 7
  },
  {
    id: 'racer', title: 'Turbo Racer', cat: 'racing', icon: 'car',
    blurb: 'Pseudo-3D outrun-style hills, curves and traffic. Full send.',
    src: 'games/racer/index.html', a1: '#ff3d8b', a2: '#ff8a3d',
    tags: ['Retro', 'Driving', 'Keyboard'], controls: 'Arrows to drive', author: 'Jake Gordon', weight: 8
  },
  {
    id: '2048', title: '2048', cat: 'puzzle', icon: 'tiles',
    blurb: 'Slide the grid, merge the numbers, chase that 2048 tile.',
    src: 'games/2048/index.html', a1: '#ffb347', a2: '#ff6b6b',
    tags: ['Classic', 'Brainy', 'Arrows'], controls: 'Arrow keys to slide', author: 'Gabriele Cirulli', weight: 8
  },
  {
    id: 'untrusted', title: 'Untrusted', cat: 'puzzle', icon: 'code',
    blurb: 'A roguelike you beat by rewriting its own JavaScript.',
    src: 'games/untrusted/index.html', a1: '#22e3ff', a2: '#b6ff3c',
    tags: ['Coding', 'Clever', 'Turn-based'], controls: 'Arrows + Edit the code', author: 'Alex Nisnevich', weight: 6
  },
  {
    id: 'adarkroom', title: 'A Dark Room', cat: 'adventure', icon: 'fire',
    blurb: 'A minimal text survival game that quietly steals your evening.',
    src: 'games/adarkroom/index.html', a1: '#ff9a3d', a2: '#ff5c39',
    tags: ['Story', 'Idle', 'Atmospheric'], controls: 'Mouse / tap to choose', author: 'Doublespeak Games', weight: 7
  },
  {
    id: 'gauntlet', title: 'Gauntlet', cat: 'action', icon: 'sword',
    blurb: 'Top-down dungeon crawling with a sword, a shield and bad odds.',
    src: 'games/gauntlet/index.html', a1: '#b6ff3c', a2: '#22c55e',
    tags: ['Dungeon', 'Combat', 'Keyboard'], controls: 'Arrows to fight and move', author: 'Jake Gordon', weight: 6
  },
  {
    id: 'trex', title: 'Dino Run', cat: 'arcade', icon: 'dino',
    blurb: 'The offline dinosaur, freed from the no-internet screen.',
    src: 'games/trex/index.html', a1: '#b8c4d9', a2: '#64748b',
    tags: ['Endless', 'One-button', 'Classic'], controls: 'Space / Up to jump', author: 'Chrome team', weight: 7
  },
  {
    id: 'floppybird', title: 'Floppy Bird', cat: 'arcade', icon: 'bird',
    blurb: 'Flap. Fail. Flap again. The one that started the rage.',
    src: 'games/floppybird/index.html', a1: '#7dffb2', a2: '#22c55e',
    tags: ['Endless', 'One-button', 'Rage'], controls: 'Click / Space to flap', author: 'Nebez Briefkani', weight: 8
  },
  {
    id: 'neon-breakout', title: 'Neon Breakout', cat: 'arcade', icon: 'paddle',
    blurb: 'Brick-smashing with particle explosions and power-ups.',
    src: 'games/neon-breakout/index.html', a1: '#8b5cff', a2: '#ff3d8b',
    tags: ['Original', 'Arcade', 'Mouse'], controls: 'Mouse or ← → to move', author: 'Skipper Labs', builtin: true, weight: 7
  },
  {
    id: 'clumsy-bird', title: 'Clumsy Bird', cat: 'arcade', icon: 'egg',
    blurb: 'A cheerier flapper with weather, eggs and juicy sounds.',
    src: 'games/clumsy-bird/index.html', a1: '#ffd166', a2: '#ff8fab',
    tags: ['Endless', 'One-button', 'Cute'], controls: 'Click / Space to flap', author: 'Ellison Leão', weight: 6
  }
];

GAMES.forEach((g, i) => { g.index = i; g.iconSvg = svg(g.icon); });
