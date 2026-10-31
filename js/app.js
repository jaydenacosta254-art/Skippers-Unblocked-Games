/* ============================================================
   Skipper's Arcade — app.js
   Rendering, filtering, player, favorites, motion.
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const mq = (q) => (typeof window.matchMedia === 'function' ? window.matchMedia(q) : { matches: false });
  const reduceMotion = mq('(prefers-reduced-motion: reduce)').matches;
  const finePointer = mq('(hover: hover) and (pointer: fine)').matches;
  const byId = (id) => GAMES.find((g) => g.id === id);
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || { label: id }).label;

  /* ---------------- storage ---------------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('skipper:' + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('skipper:' + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  let favorites = store.get('favs', []);
  let recent = store.get('recent', []).filter((id) => byId(id));
  const saveFavs = () => store.set('favs', favorites);
  const saveRecent = () => store.set('recent', recent);
  const isFav = (id) => favorites.includes(id);

  /* ---------------- state ---------------- */
  const state = {
    query: '',
    category: 'all',
    sort: 'featured',
    favOnly: false,
    current: null
  };

  /* ---------------- boot ---------------- */
  const boot = $('#boot');
  const bootFill = $('#bootFill');
  const bootStatus = $('#bootStatus');
  const bootLines = ['waking the arcade…', 'loading 16 games…', 'polishing the pixels…', 'ready.'];
  let bootProgress = 0;
  const bootTimer = setInterval(() => {
    bootProgress = Math.min(100, bootProgress + Math.random() * 22 + 8);
    if (bootFill) bootFill.style.width = bootProgress + '%';
    if (bootStatus) bootStatus.textContent = bootLines[Math.min(3, Math.floor(bootProgress / 34))];
    if (bootProgress >= 100) {
      clearInterval(bootTimer);
      setTimeout(finishBoot, 260);
    }
  }, 130);

  function finishBoot() {
    if (!boot) return;
    boot.classList.add('done');
    document.body.classList.add('booted');
    setTimeout(() => boot.remove(), 900);
    startReveals();
  }

  /* ---------------- reveal on scroll ---------------- */
  function startReveals() {
    const items = $$('.reveal');
    items.forEach((el) => {
      const delay = el.dataset.delay;
      if (delay) el.style.setProperty('--d', delay + 'ms');
    });
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- animated counters ---------------- */
  function runCounters() {
    const nums = $$('.stat-num');
    if (!nums.length) return;
    const animate = (el) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion || target === 0) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const dur = 1200;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------------- nav ---------------- */
  const nav = $('#nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile sheet
  const burger = $('#navBurger');
  const sheet = document.createElement('div');
  sheet.className = 'mobile-sheet';
  sheet.innerHTML = `
    <a href="#library">Games</a>
    <a href="#featured">Featured</a>
    <a href="#why">Why here</a>
    <a href="#" data-fav>Favorites</a>
    <a href="#" data-random>Random game</a>`;
  document.body.appendChild(sheet);
  const closeSheet = () => {
    sheet.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  };
  if (burger) {
    burger.addEventListener('click', () => {
      const open = !sheet.classList.contains('open');
      sheet.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  sheet.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('a')) closeSheet();
    if (t.closest('[data-fav]')) { e.preventDefault(); setFavOnly(true); gotoLibrary(); }
    if (t.closest('[data-random]')) { e.preventDefault(); playRandom(); }
  });
  window.addEventListener('scroll', () => { if (sheet.classList.contains('open')) closeSheet(); }, { passive: true });

  /* ---------------- ticker ---------------- */
  function renderTicker() {
    const row = $('#tickerRow');
    const row2 = $('#tickerRow2');
    if (!row || !row2) return;
    const names = GAMES.map((g) => g.title);
    const make = (list) => list.map((n) => `<span class="ticker-item">${n}</span>`).join('');
    const doubled = names.concat(names);
    row.innerHTML = make(doubled);
    row2.innerHTML = make(names.slice().reverse().concat(names.slice().reverse()));
  }

  /* ---------------- cards ---------------- */
  function cardMarkup(game, i) {
    return `
      <article class="card" data-id="${game.id}" style="--a1:${game.a1};--a2:${game.a2};animation-delay:${Math.min(i * 45, 500)}ms">
        <button class="card-play" data-open="${game.id}" aria-label="Play ${game.title}">
          <div class="card-art">
            ${game.iconSvg}
            <span class="art-scan"></span>
            <span class="art-cat">${catLabel(game.cat)}</span>
            <span class="art-playbtn"><svg class="ui-ico"><use href="#i-play"/></svg> Play</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${game.title}${game.builtin ? '<span class="builtin-dot" title="Made in-house"></span>' : ''}</h3>
            <p class="card-desc">${game.blurb}</p>
            <div class="card-meta">
              <span>${game.author}</span><span class="sep"></span><span>${game.tags[0]}</span>
            </div>
          </div>
        </button>
        <button class="card-fav${isFav(game.id) ? ' on' : ''}" data-fav="${game.id}" aria-label="${isFav(game.id) ? 'Remove' : 'Add'} ${game.title} ${isFav(game.id) ? 'from' : 'to'} favorites" aria-pressed="${isFav(game.id)}">
          <svg class="ui-ico"><use href="#i-star"/></svg>
        </button>
      </article>`;
  }

  function featMarkup(game) {
    return `
      <article class="feat-card" data-id="${game.id}" style="--a1:${game.a1};--a2:${game.a2}">
        <div class="feat-art">
          <div class="feat-glow"></div>
          ${game.iconSvg}
        </div>
        <button class="feat-play" data-open="${game.id}" aria-label="Play ${game.title}">
          <svg class="ui-ico"><use href="#i-play"/></svg>
        </button>
        <button class="feat-fav${isFav(game.id) ? ' on' : ''}" data-fav="${game.id}" aria-label="Toggle favorite" aria-pressed="${isFav(game.id)}">
          <svg class="ui-ico"><use href="#i-star"/></svg>
        </button>
        <div class="feat-body">
          <span class="feat-tag">${catLabel(game.cat)}${game.builtin ? ' · original' : ''}</span>
          <h3 class="feat-title">${game.title}</h3>
          <p class="feat-blurb">${game.blurb}</p>
        </div>
        <button class="feat-hit" data-open="${game.id}" aria-label="Play ${game.title}" style="position:absolute;inset:0;z-index:1;border-radius:inherit"></button>
      </article>`;
  }

  function recentMarkup(game) {
    return `
      <button class="recent-card" data-open="${game.id}" style="--a1:${game.a1};--a2:${game.a2}">
        <span class="recent-art">${game.iconSvg}</span>
        <span>
          <span class="recent-name">${game.title}</span>
          <span class="recent-sub">${catLabel(game.cat)}</span>
        </span>
      </button>`;
  }

  /* ---------------- render ---------------- */
  function renderFeatured() {
    const rail = $('#featRail');
    if (!rail) return;
    const featured = GAMES.filter((g) => g.featured);
    rail.innerHTML = featured.map(featMarkup).join('');
    enableDragScroll(rail);
  }

  function renderRecent() {
    const section = $('#recentSection');
    const rail = $('#recentRail');
    if (!section || !rail) return;
    const games = recent.map(byId).filter(Boolean).slice(0, 8);
    if (!games.length) { section.hidden = true; return; }
    section.hidden = false;
    rail.innerHTML = games.map(recentMarkup).join('');
  }

  function renderCategories() {
    const row = $('#catRow');
    if (!row) return;
    row.innerHTML = CATEGORIES.map((c) => {
      const n = c.id === 'all' ? GAMES.length : GAMES.filter((g) => g.cat === c.id).length;
      return `<button class="cat-pill" role="tab" data-cat="${c.id}" aria-selected="${state.category === c.id}">
        ${c.label}<span class="cat-n">${n}</span>
      </button>`;
    }).join('');
  }

  function visibleGames() {
    const q = state.query.trim().toLowerCase();
    let list = GAMES.filter((g) => {
      if (state.favOnly && !isFav(g.id)) return false;
      if (state.category !== 'all' && g.cat !== state.category) return false;
      if (!q) return true;
      const hay = [g.title, g.blurb, g.author, g.cat, catLabel(g.cat), g.controls, g.tags.join(' ')].join(' ').toLowerCase();
      return hay.includes(q);
    });
    if (state.sort === 'az') list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    if (state.sort === 'za') list = list.slice().sort((a, b) => b.title.localeCompare(a.title));
    if (state.sort === 'random') list = shuffle(list.slice());
    return list;
  }

  function renderGrid() {
    const grid = $('#gameGrid');
    const empty = $('#emptyState');
    const count = $('#resultCount');
    if (!grid) return;
    const list = visibleGames();
    grid.innerHTML = list.map(cardMarkup).join('');
    grid.querySelectorAll('.card').forEach((el, i) => {
      if (i < 24) el.style.animationDelay = Math.min(i * 40, 420) + 'ms';
    });
    if (empty) empty.hidden = list.length > 0;
    if (count) {
      const label = list.length === 1 ? 'game' : 'games';
      count.textContent = `${list.length} ${label}${state.favOnly ? ' in favorites' : ''}${state.query ? ` for “${state.query.trim()}”` : ''}`;
    }
    const favCount = $('#favCount');
    if (favCount) {
      favCount.textContent = String(favorites.length);
      favCount.hidden = favorites.length === 0;
    }
  }

  function updateFavUI() {
    $$('[data-fav]').forEach((btn) => {
      const id = btn.dataset.fav;
      if (!id) return;
      const on = isFav(id);
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      if (on) btn.setAttribute('aria-label', 'Remove from favorites');
      else btn.setAttribute('aria-label', 'Add to favorites');
    });
    $$('.card-fav.on, .feat-fav.on').forEach((b) => b.classList.add('on'));
    const favCount = $('#favCount');
    if (favCount) {
      favCount.textContent = String(favorites.length);
      favCount.hidden = favorites.length === 0;
    }
  }

  /* ---------------- filtering ---------------- */
  function setCategory(id) {
    state.category = id;
    $$('.cat-pill').forEach((p) => p.setAttribute('aria-selected', String(p.dataset.cat === id)));
    renderGrid();
  }

  function setFavOnly(on) {
    state.favOnly = on;
    const toggle = $('#favToggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(on));
    renderGrid();
    if (on) toast(favorites.length ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'} loaded` : 'No favorites yet — tap a star to save a game', 'star');
  }

  function gotoLibrary() {
    const lib = $('#library');
    if (lib) lib.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function resetFilters() {
    state.query = '';
    state.category = 'all';
    state.favOnly = false;
    const input = $('#searchInput');
    if (input) input.value = '';
    const clear = $('#searchClear');
    if (clear) clear.hidden = true;
    const toggle = $('#favToggle');
    if (toggle) toggle.setAttribute('aria-pressed', 'false');
    $$('.cat-pill').forEach((p) => p.setAttribute('aria-selected', String(p.dataset.cat === 'all')));
    renderGrid();
  }

  /* ---------------- player ---------------- */
  const player = $('#player');
  const frame = $('#gameFrame');
  const loading = $('#playerLoading');
  const errorPanel = $('#playerError');
  let loadTimer = null;
  let lastFocus = null;
  let loadWatch = null;

  function openGame(id) {
    const game = byId(id);
    if (!game || !player || !frame) return;
    state.current = game;
    lastFocus = document.activeElement;

    $('#playerTitle').textContent = game.title;
    $('#playerMeta').textContent = `by ${game.author} · ${catLabel(game.cat)} · ${game.tags.join(' · ')}`;
    $('#playerControls').textContent = game.controls;
    $('#loadingName').textContent = game.title;
    const badge = $('#playerBadge');
    badge.innerHTML = game.iconSvg;
    badge.style.setProperty('--a1', game.a1);
    badge.style.setProperty('--a2', game.a2);
    const stage = $('#playerStage');
    stage.style.setProperty('--a1', game.a1);
    stage.style.setProperty('--a2', game.a2);

    const favBtn = player.querySelector('[data-act="fav"]');
    favBtn.classList.toggle('on', isFav(game.id));

    const errLink = $('#errorNewTab');
    if (errLink) errLink.href = game.src;

    if (loading) loading.classList.remove('hide');
    if (errorPanel) errorPanel.hidden = true;
    frame.src = game.src;

    player.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');

    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      // give slow engines more room, then surface an escape hatch
      if (loading && !loading.classList.contains('hide')) {
        if (errorPanel) errorPanel.hidden = false;
        if (loading) loading.classList.add('hide');
      }
    }, 20000);

    const shell = player.querySelector('.player-shell');
    setTimeout(() => shell && shell.focus({ preventScroll: true }), 60);

    // history of play
    recent = [game.id].concat(recent.filter((x) => x !== game.id)).slice(0, 10);
    saveRecent();
    renderRecent();
  }

  function closeGame() {
    if (!player || player.getAttribute('aria-hidden') === 'true') return;
    player.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    clearTimeout(loadTimer);
    if (frame) frame.src = 'about:blank';
    if (loading) loading.classList.remove('hide');
    if (errorPanel) errorPanel.hidden = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    state.current = null;
  }

  if (frame) {
    frame.addEventListener('load', () => {
      const src = frame.getAttribute('src') || '';
      if (!src || src === 'about:blank') return;
      clearTimeout(loadTimer);
      if (loading) loading.classList.add('hide');
      if (errorPanel) errorPanel.hidden = true;
    });
  }

  if (player) {
    player.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-act]');
      if (actionBtn) {
        const act = actionBtn.dataset.act;
        if (act === 'close') closeGame();
        if (act === 'reload' && frame) {
          if (loading) loading.classList.remove('hide');
          frame.src = frame.src;
          toast('Restarting…', 'refresh');
        }
        if (act === 'newtab' && state.current) window.open(state.current.src, '_blank', 'noopener');
        if (act === 'full') {
          const stage = $('#playerStage');
          if (!document.fullscreenElement && stage && stage.requestFullscreen) {
            stage.requestFullscreen().catch(() => toast('Fullscreen was blocked by the browser', 'close'));
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        }
        if (act === 'fav' && state.current) {
          toggleFav(state.current.id, actionBtn);
          actionBtn.classList.toggle('on', isFav(state.current.id));
        }
        return;
      }
      if (e.target.closest('[data-close]')) closeGame();
    });
  }

  /* ---------------- favorites ---------------- */
  function toggleFav(id, btn) {
    const wasFav = isFav(id);
    if (wasFav) {
      favorites = favorites.filter((x) => x !== id);
      toast(`Removed ${byId(id).title} from favorites`, 'star');
    } else {
      favorites = favorites.concat(id);
      toast(`${byId(id).title} saved to favorites`, 'star', 'good');
      if (btn) { btn.classList.add('pop'); setTimeout(() => btn.classList.remove('pop'), 500); }
      if (!reduceMotion) burstConfetti(btn);
    }
    saveFavs();
    syncFavButtons(id);
    if (state.favOnly) renderGrid();
    updateFavUI();
    if (state.current && state.current.id === id) {
      const favBtn = player.querySelector('[data-act="fav"]');
      if (favBtn) favBtn.classList.toggle('on', isFav(id));
    }
  }

  function syncFavButtons(id) {
    $$(`[data-fav="${id}"]`).forEach((b) => {
      const on = isFav(id);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Remove from favorites' : 'Add to favorites');
    });
  }

  /* ---------------- open handlers ---------------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openGame(opener.dataset.open);
      return;
    }
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn && favBtn.dataset.fav) {
      e.preventDefault();
      e.stopPropagation();
      toggleFav(favBtn.dataset.fav, favBtn);
      return;
    }
    const catBtn = e.target.closest('[data-cat].cat-pill');
    if (catBtn) { setCategory(catBtn.dataset.cat); return; }
    const catLink = e.target.closest('a[data-cat]');
    if (catLink) { e.preventDefault(); setCategory(catLink.dataset.cat); gotoLibrary(); return; }
    if (e.target.closest('[data-open-random]')) { e.preventDefault(); playRandom(); return; }
    if (e.target.closest('[data-shortcuts]')) { e.preventDefault(); openShortcuts(); return; }
  });

  /* ---------------- search ---------------- */
  const searchInput = $('#searchInput');
  const searchClear = $('#searchClear');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value;
      if (searchClear) searchClear.hidden = !state.query;
      renderGrid();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        state.query = '';
        if (searchClear) searchClear.hidden = true;
        renderGrid();
        searchInput.blur();
      }
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.query = '';
      if (searchInput) { searchInput.value = ''; searchInput.focus(); }
      searchClear.hidden = true;
      renderGrid();
    });
  }

  function focusSearch() {
    const input = $('#searchInput');
    if (!input) return;
    gotoLibrary();
    setTimeout(() => input.focus({ preventScroll: true }), reduceMotion ? 0 : 380);
  }

  const trigger = $('#searchTrigger');
  if (trigger) trigger.addEventListener('click', focusSearch);

  const favToggle = $('#favToggle');
  if (favToggle) favToggle.addEventListener('click', () => setFavOnly(!state.favOnly));

  const favNav = $('#navFav');
  if (favNav) favNav.addEventListener('click', (e) => { e.preventDefault(); setFavOnly(true); gotoLibrary(); });
  const favFooter = $('#favFooter');
  if (favFooter) favFooter.addEventListener('click', (e) => { e.preventDefault(); setFavOnly(true); gotoLibrary(); });

  const sortSelect = $('#sortSelect');
  if (sortSelect) sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; renderGrid(); });

  const resetBtn = $('#resetFilters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  const clearRecent = $('#clearRecent');
  if (clearRecent) clearRecent.addEventListener('click', () => {
    recent = [];
    saveRecent();
    renderRecent();
    toast('History cleared', 'refresh');
  });

  /* ---------------- random ---------------- */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let lastRandom = null;
  function playRandom() {
    const pool = GAMES.filter((g) => g.id !== lastRandom);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastRandom = pick.id;
    toast(`Rolled ${pick.title}`, 'dice');
    setTimeout(() => openGame(pick.id), 260);
  }

  $('#navRandom') && $('#navRandom').addEventListener('click', playRandom);
  $('#heroRandom') && $('#heroRandom').addEventListener('click', playRandom);
  $('#ctaRandom') && $('#ctaRandom').addEventListener('click', playRandom);

  /* ---------------- featured rail ---------------- */
  function enableDragScroll(rail) {
    let down = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 4) rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      rail.classList.remove('dragging');
      if (moved > 8) {
        const block = (ev) => { ev.stopPropagation(); ev.preventDefault(); rail.removeEventListener('click', block, true); };
        rail.addEventListener('click', block, true);
      }
    });
  }

  const featRail = $('#featRail');
  const scrollBy = (dir) => {
    if (!featRail) return;
    const card = featRail.querySelector('.feat-card');
    const amount = card ? card.getBoundingClientRect().width + 18 : 320;
    featRail.scrollBy({ left: dir * amount, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $('#featPrev') && $('#featPrev').addEventListener('click', () => scrollBy(-1));
  $('#featNext') && $('#featNext').addEventListener('click', () => scrollBy(1));
  if (featRail) {
    featRail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollBy(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollBy(-1); }
    });
  }

  /* ---------------- shortcuts modal ---------------- */
  const shortcuts = $('#shortcutModal');
  function openShortcuts() {
    if (!shortcuts) return;
    shortcuts.hidden = false;
    const btn = shortcuts.querySelector('[data-close-shortcuts]');
    if (btn) btn.focus();
  }
  function closeShortcuts() {
    if (shortcuts) shortcuts.hidden = true;
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-shortcuts]')) closeShortcuts();
    if (shortcuts && !shortcuts.hidden && e.target === shortcuts) closeShortcuts();
  });

  /* ---------------- keyboard ---------------- */
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    const k = e.key.toLowerCase();

    if (e.key === 'Escape') {
      if (player && player.getAttribute('aria-hidden') === 'false') { closeGame(); return; }
      if (shortcuts && !shortcuts.hidden) { closeShortcuts(); return; }
      if (sheet.classList.contains('open')) { closeSheet(); return; }
      if (document.activeElement === searchInput && searchInput.value) {
        searchInput.value = ''; state.query = ''; renderGrid(); searchClear.hidden = true;
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); focusSearch(); return; }
    if (typing) return;

    if (k === '/') { e.preventDefault(); focusSearch(); }
    if (k === 'r') { e.preventDefault(); playRandom(); }
    if (k === 'f') { e.preventDefault(); setFavOnly(!state.favOnly); gotoLibrary(); }

    // konami
    konamiPush(e.key);
  });

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiBuffer = [];
  function konamiPush(key) {
    konamiBuffer.push(key.length === 1 ? key.toLowerCase() : key);
    if (konamiBuffer.length > KONAMI.length) konamiBuffer.shift();
    if (konamiBuffer.join('|') === KONAMI.join('|') && !document.body.classList.contains('party')) {
      document.body.classList.add('party');
      toast('Konami code accepted. Party mode on 🎉', 'spark', 'good');
      burstConfetti();
      setTimeout(() => {
        document.body.classList.remove('party');
        toast('Party mode off — back to business', 'spark');
      }, 12000);
    }
  }

  /* ---------------- toasts ---------------- */
  const toastHost = $('#toasts');
  function toast(message, icon = 'spark', tone = '') {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast ' + tone;
    el.innerHTML = `<svg class="ui-ico"><use href="#i-${icon}"/></svg><span>${message}</span>`;
    toastHost.appendChild(el);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, 2600);
  }

  /* ---------------- confetti ---------------- */
  const canvas = $('#confetti');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let rafId = null;

  function sizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burstConfetti(originEl) {
    if (!ctx || reduceMotion) return;
    sizeCanvas();
    let ox = window.innerWidth / 2;
    let oy = window.innerHeight / 2;
    if (originEl && originEl.getBoundingClientRect) {
      const r = originEl.getBoundingClientRect();
      if (r.width) { ox = r.left + r.width / 2; oy = r.top + r.height / 2; }
    }
    const colors = ['#22e3ff', '#b6ff3c', '#8b5cff', '#ff3d8b', '#ffb347', '#ffffff'];
    for (let i = 0; i < 46; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1
      });
    }
    if (!rafId) rafId = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => {
      p.vy += 0.22;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.011;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
      ctx.restore();
    });
    particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    if (particles.length) {
      rafId = requestAnimationFrame(tickConfetti);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  window.addEventListener('resize', sizeCanvas);

  /* ---------------- pointer effects ---------------- */
  const glow = $('#cursorGlow');
  if (glow && finePointer && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0, active = false;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!active) { active = true; glow.classList.add('on'); }
    });
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // hero parallax
  const heroArt = $('#heroArt');
  if (heroArt && finePointer && !reduceMotion) {
    const tiles = $$('.hero-tile', heroArt);
    window.addEventListener('pointermove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      tiles.forEach((t) => {
        const depth = Number(t.dataset.depth || 20);
        t.style.translate = `${dx * depth}px ${dy * depth}px`;
      });
    });
  }

  // 3D tilt + spotlight on cards
  document.addEventListener('pointermove', (e) => {
    if (!finePointer || reduceMotion) return;
    const card = e.target.closest('.card');
    if (!card) return;
    const art = card.querySelector('.card-art');
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (art) {
      art.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      art.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    }
    card.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 6).toFixed(2)}deg) translateY(-4px)`;
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.card');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });

  /* ---------------- misc ---------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // nav link active state
  const navLinks = $$('.nav-links a[data-nav]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const sections = navLinks.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.dataset.nav === entry.target.id;
          a.style.color = on ? 'var(--ink)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------------- go ---------------- */
  renderTicker();
  renderFeatured();
  renderCategories();
  renderGrid();
  renderRecent();
  updateFavUI();
  runCounters();

  // Safety: never trap the user behind the boot screen
  setTimeout(() => {
    if (boot && !boot.classList.contains('done')) { clearInterval(bootTimer); finishBoot(); }
  }, 3200);

  // Expose a tiny API for the console-inclined
  window.Skipper = {
    games: GAMES,
    play: openGame,
    random: playRandom,
    favorites: () => favorites.slice(),
    party: () => document.body.classList.add('party')
  };
})();
