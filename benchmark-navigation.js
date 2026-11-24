(() => {
  const nav = document.querySelector('.mast > .section-nav');
  const toggle = document.querySelector('.mast > .site-menu-toggle');
  if (!nav || !toggle) return;

  const header = nav.parentElement;
  const mobile = window.matchMedia('(max-width: 805px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') === 'false'));
  let dismissTarget = null;
  document.addEventListener('pointerdown', event => {
    dismissTarget = null;
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) {
      dismissTarget = event.target;
      setOpen(false);
    }
  });
  document.addEventListener('click', event => {
    // A tap on the page background dismisses the menu without also resetting the country.
    if (event.target === dismissTarget && !event.target.closest('a, button, input, select, textarea, label, summary, [role="button"], [data-keep-market]')) {
      event.preventDefault();
    }
    dismissTarget = null;
  }, true);
  document.addEventListener('focusin', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus({preventScroll:true});
    }
  });
  nav.addEventListener('click', event => {
    if (!event.target.closest('a[aria-current="page"]') || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus({preventScroll:true});
    }
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches && nav.contains(document.activeElement)) toggle.focus({preventScroll:true});
    setOpen(false);
  });
  window.addEventListener('pagehide', () => setOpen(false));

  // Near the page end, closing a long disclosure can make the browser clamp the
  // scroll position. Reserve just the visible space and release it as the reader moves up.
  const page = header.parentElement;
  const footer = page.querySelector('.foot');
  const visibleEnd = () => Math.ceil(document.documentElement.clientHeight - page.getBoundingClientRect().top);
  function releaseSpace() {
    if (!page.style.minHeight) return;
    page.style.minHeight = footer.getBoundingClientRect().bottom >= document.documentElement.clientHeight
      ? '' : visibleEnd() + 'px';
  }
  page.addEventListener('click', event => {
    const disclosure = event.target.closest('.board-toggle, .method-fold > summary, .board-reason > summary');
    if (!disclosure) return;
    if (disclosure.matches('[aria-expanded="true"], details[open] > summary')) {
      page.style.minHeight = visibleEnd() + 'px';
    }
    if (page.style.minHeight) requestAnimationFrame(releaseSpace);
  }, true);
  window.addEventListener('scroll', releaseSpace, {passive:true});
  window.addEventListener('resize', releaseSpace);
})();
