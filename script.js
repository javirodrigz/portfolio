const header = document.querySelector('[data-header]');
const year = document.querySelector('[data-year]');

year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
