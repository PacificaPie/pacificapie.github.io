/* Native links remain useful without JS; previews are a progressive enhancement. */
(() => {
  'use strict';
  const map = document.querySelector('.work-showcase');
  if (!map) return;
  const cards = Array.from(map.querySelectorAll('.work-card'));
  const panels = new Map(Array.from(map.querySelectorAll('.work-stratum')).map(row => {
    const panel = row.querySelector('.work-evaluation-content');
    return [row, { panel, initial: panel.innerHTML }];
  }));
  const announcement = map.querySelector('#work-announcement');
  let active = null;
  let armed = null;
  let pointerType = '';
  const returnKey = 'pz-work-return';

  function preview(card, announce = false) {
    if (active === card) return;
    active = card;
    cards.forEach(item => item.classList.toggle('is-preview', item === card));
    panels.forEach(({panel, initial}, row) => {
      if (card && row.contains(card)) {
        panel.replaceChildren(card.querySelector('.work-summary').content.cloneNode(true));
      } else panel.innerHTML = initial;
    });
    if (announce && card) {
      const lang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
      announcement.textContent = card.querySelector(`.work-sr .lang-${lang}`).textContent;
    }
  }

  cards.forEach(card => {
    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') preview(card);
    });
    card.addEventListener('pointerdown', event => { pointerType = event.pointerType; });
    card.addEventListener('focus', () => preview(card, true));
    card.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const touch = event.detail !== 0 && (pointerType === 'touch' || matchMedia('(hover: none)').matches || matchMedia('(max-width: 700px)').matches);
      if (touch && armed !== card) {
        event.preventDefault();
        armed = card;
        preview(card, true);
        return;
      }
      try { sessionStorage.setItem(returnKey, card.id); } catch (_) { /* Optional navigation memory. */ }
    });
  });
  map.querySelector('.work-strata').addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !map.querySelector(':focus-visible')) preview(null);
  });
  map.addEventListener('focusout', event => {
    if (!map.contains(event.relatedTarget)) { armed = null; preview(null); }
  });
  document.addEventListener('pointerdown', event => {
    if (!map.contains(event.target)) { armed = null; preview(null); }
  });
  map.addEventListener('keydown', event => {
    if (event.key === 'Escape') { armed = null; preview(null); }
  });
  map.addEventListener('click', event => {
    if (!event.target.closest('.work-detail-link') || !active) return;
    try { sessionStorage.setItem(returnKey, active.id); } catch (_) { /* Links still work. */ }
  });
  window.addEventListener('pageshow', () => {
    armed = null;
    try {
      const id = sessionStorage.getItem(returnKey);
      const card = cards.find(item => item.id === id);
      if (!card) return;
      sessionStorage.removeItem(returnKey);
      card.focus({ preventScroll: true });
    } catch (_) { /* Browsers may disable session storage. */ }
  });
})();
