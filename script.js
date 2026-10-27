document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const year = document.querySelector('[data-year]');

if (year) year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

const navToggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('[data-navigation]');

function closeNavigation({ returnFocus = false } = {}) {
  if (!navToggle || !navigation) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) navToggle.focus();
}

if (navToggle && navigation) {
  navToggle.addEventListener('click', () => {
    const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(willOpen));
    navigation.classList.toggle('is-open', willOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNavigation({ returnFocus: true });
    }
  });

  window.matchMedia('(min-width: 721px)').addEventListener('change', (event) => {
    if (event.matches) closeNavigation();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const href = link.getAttribute('href');
    if (link.classList.contains('skip-link')) {
      target.focus({ preventScroll: true });
    }
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (window.location.hash !== href) history.pushState(null, '', href);
  });
});

const valueCards = document.querySelectorAll('.value-grid article');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (valueCards.length && !reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-reveal');

  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  valueCards.forEach((card) => cardObserver.observe(card));
}

// Assemble once on the first actual downward scroll, including touch and keyboard.
// The illustration stays assembled when animation is unavailable or motion is reduced.
const heroPuzzle = document.querySelector('[data-hero-puzzle]');

if (heroPuzzle) {
  const pieces = Array.from(heroPuzzle.querySelectorAll('.puzzle-piece'));
  const hero = heroPuzzle.closest('.hero');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Offset copies in the isometric plane make a solid, outlined 18px edge.
  pieces.forEach((piece) => {
    const face = piece.querySelector('.puzzle-face');
    const depth = document.createDocumentFragment();
    for (let layer = 18; layer > 0; layer--) {
      const slice = face.cloneNode(false);
      slice.classList.add('puzzle-face--depth');
      slice.style.transform = `translate(${layer}px, ${layer}px)`;
      depth.appendChild(slice);
    }
    piece.insertBefore(depth, face);
  });

  heroPuzzle.dataset.state = 'complete';

  if (window.gsap && !motionPreference.matches && hero.getBoundingClientRect().bottom > 0) {
    const starts = [
      { x: -65, y: -60, rotation: -9, transformOrigin: '75px 75px' },
      { x: 45, y: -65, rotation: 8, transformOrigin: '225px 75px' },
      { x: -65, y: 45, rotation: 7, transformOrigin: '75px 225px' },
      { x: 38, y: 40, rotation: -8, transformOrigin: '225px 225px' },
    ];
    let lastScrollY = window.scrollY;
    let started = false;
    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        heroPuzzle.dataset.state = 'complete';
        gsap.set(pieces, { clearProps: 'transform,transformOrigin' });
        motionPreference.removeEventListener('change', onMotionChange);
      },
    });

    pieces.forEach((piece, index) => {
      gsap.set(piece, starts[index]);
      const start = .2 + index * .56;
      timeline.to(piece, { x: -18, y: -18, rotation: 0, duration: .8, ease: 'power2.out' }, start);
      timeline.to(piece, { x: 0, y: 0, duration: .38, ease: 'back.out(.55)' }, start + .8);
    });
    timeline.duration(3.6);
    heroPuzzle.dataset.state = 'waiting';

    function finish() {
      started = true;
      window.removeEventListener('scroll', onFirstDownwardScroll);
      timeline.progress(1).pause();
    }

    function onMotionChange(event) {
      if (event.matches) finish();
    }

    function onFirstDownwardScroll() {
      const nextScrollY = window.scrollY;
      const isDownward = nextScrollY > lastScrollY && nextScrollY > 0;
      lastScrollY = nextScrollY;
      if (started || !isDownward) return;
      started = true;
      window.removeEventListener('scroll', onFirstDownwardScroll);
      if (hero.getBoundingClientRect().bottom <= 0 || motionPreference.matches) {
        finish();
        return;
      }
      heroPuzzle.dataset.state = 'assembling';
      timeline.play();
    }

    motionPreference.addEventListener('change', onMotionChange);
    window.addEventListener('scroll', onFirstDownwardScroll, { passive: true });
  }
}
