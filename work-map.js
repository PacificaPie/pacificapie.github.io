/* Native details and links also work without JavaScript. */
(() => {
  'use strict';
  const map = document.querySelector('.work-showcase');
  if (!map) return;
  const returnKey = 'pz-work-return';
  const states = new Map();
  const hoverLayout = matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)');

  map.querySelectorAll('.work-stratum').forEach(row => {
    const cards = Array.from(row.querySelectorAll('details.work-card'));
    const state = { pinned: null, suppressFocus: false };
    const select = card => cards.forEach(item => { item.open = item === card; });
    states.set(row, { state, select });

    cards.forEach(card => {
      const trigger = card.querySelector('summary');
      card.addEventListener('pointerenter', event => {
        // Touch uses the explicit disclosure; hover is only an enhancement.
        if (event.pointerType === 'mouse' && hoverLayout.matches) select(card);
      });
      trigger.addEventListener('focus', () => {
        if (!state.suppressFocus && trigger.matches(':focus-visible')) select(card);
      });
      trigger.addEventListener('click', event => {
        event.preventDefault();
        state.pinned = state.pinned === card ? null : card;
        select(state.pinned);
      });
    });
    row.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && !row.querySelector(':focus-visible')) select(state.pinned);
    });
    row.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!row.contains(document.activeElement)) select(state.pinned);
      });
    });
    row.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const card = event.target.closest('details.work-card');
      if (card) {
        state.suppressFocus = true;
        card.querySelector('summary').focus({ preventScroll: true });
        state.suppressFocus = false;
      }
      state.pinned = null;
      select(null);
    });
  });

  map.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    const card = link?.closest('.work-card');
    if (!card || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try { sessionStorage.setItem(returnKey, card.id); } catch (_) { /* Links still work. */ }
  });
  window.addEventListener('pageshow', () => {
    try {
      const id = sessionStorage.getItem(returnKey);
      const card = id && document.getElementById(id);
      if (!card || !map.contains(card)) return;
      sessionStorage.removeItem(returnKey);
      if (card.matches('details')) {
        const { state, select } = states.get(card.closest('.work-stratum'));
        state.pinned = card;
        select(card);
      }
      card.querySelector('.work-card-top').focus({ preventScroll: true });
    } catch (_) { /* Navigation also works when session storage is unavailable. */ }
  });
})();
