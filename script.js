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
