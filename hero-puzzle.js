// The approved isometric illustration: one continuous approach per piece,
// then a brief gold-and-scale accent on the last piece only.
(() => {
  const canvas = document.querySelector('[data-hero-puzzle]');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context || typeof Path2D === 'undefined') return;

  const hero = canvas.closest('.hero');
  const anchor = canvas.closest('.puzzle-anchor');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shapes = [
    'M36 0H150V50C175 35 180 88 150 85V150H100C115 175 62 180 65 150H0V36Q0 0 36 0Z',
    'M150 0H264Q300 0 300 36V150H250C265 125 212 120 215 150H150V85C180 88 175 35 150 50Z',
    'M0 150H65C62 180 115 175 100 150H150V215C125 200 120 253 150 250V300H36Q0 300 0 264Z',
    'M150 150H215C212 120 265 125 250 150H300V264Q300 300 264 300H150V250C120 253 125 200 150 215Z',
  ];
  const pieces = shapes.map((shape, index) => ({
    path: new Path2D(shape),
    x: index % 2 ? 62 : -62,
    y: index < 2 ? -62 : 62,
    centerX: index % 2 ? 225 : 75,
    centerY: index < 2 ? 75 : 225,
    progress: 1,
    highlight: 0,
    scale: 1,
  }));
  let width = 680;
  let height = 440;
  let ratio = 1;
  let timeline;
  let lastScrollY = window.scrollY;
  let started = false;

  function render() {
    const styles = getComputedStyle(hero);
    const gold = styles.getPropertyValue('--gold').trim();
    const goldValue = parseInt(gold.slice(1), 16);
    const channels = [goldValue >> 16, (goldValue >> 8) & 255, goldValue & 255];
    const blueValue = parseInt(styles.getPropertyValue('--ink').trim().slice(1), 16);
    const blueChannels = [blueValue >> 16, (blueValue >> 8) & 255, blueValue & 255];
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const scale = Math.min((width - 18) / 680, .85);
    context.translate(width / 2, height * .54);
    context.transform(.8660254 * scale, .5 * scale, -.8660254 * scale, .5 * scale, 0, 0);
    context.translate(-150, -150);
    context.strokeStyle = gold;
    context.lineWidth = 3.9;
    context.lineJoin = 'round';

    pieces.forEach((piece) => {
      context.save();
      const mixed = channels.map((channel) => Math.round(255 + (channel - 255) * piece.highlight));
      context.fillStyle = `rgba(${mixed.join(',')},${.8 + .2 * piece.highlight})`;
      const stroke = channels.map((channel, index) =>
        Math.round(channel + (blueChannels[index] - channel) * piece.highlight));
      context.strokeStyle = `rgb(${stroke.join(',')})`;
      context.translate(piece.x * (1 - piece.progress), piece.y * (1 - piece.progress));
      context.translate(piece.centerX, piece.centerY);
      context.scale(piece.scale, piece.scale);
      context.translate(-piece.centerX, -piece.centerY);

      // Exclude the face from the underside to retain exactly 80% face opacity.
      context.save();
      const outside = new Path2D();
      outside.rect(-500, -500, 1300, 1300);
      outside.addPath(piece.path);
      context.clip(outside, 'evenodd');
      context.translate(14, 14);
      context.fill(piece.path);
      context.stroke(piece.path);
      context.restore();
      context.fill(piece.path);
      context.stroke(piece.path);
      context.restore();
    });
  }

  function resize() {
    // Use layout dimensions so the existing responsive anchor scale is applied once.
    width = canvas.clientWidth || 680;
    height = canvas.clientHeight || 440;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    render();
  }

  function finish() {
    started = true;
    window.removeEventListener('scroll', onFirstDownwardScroll);
    motionPreference.removeEventListener('change', onMotionChange);
    if (timeline) timeline.kill();
    anchor.style.setProperty('--puzzle-zoom', '1.2');
    pieces.forEach((piece) => {
      piece.progress = 1;
      piece.highlight = 0;
      piece.scale = 1;
    });
    canvas.dataset.state = 'complete';
    render();
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
    canvas.dataset.state = 'assembling';
    timeline.play();
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  resize();
  canvas.dataset.state = 'complete';
  anchor.style.setProperty('--puzzle-zoom', '1.2');

  if (!window.gsap || motionPreference.matches || hero.getBoundingClientRect().bottom <= 0) return;

  anchor.style.setProperty('--puzzle-zoom', '1');
  pieces.forEach((piece) => { piece.progress = 0; });
  timeline = gsap.timeline({ paused: true, onUpdate: render, onComplete: finish });
  // Grow the absolute-positioned artwork as pieces approach, without reflowing the Hero.
  timeline.to(anchor, { '--puzzle-zoom': 1.2, duration: 1.4, ease: 'sine.inOut' }, .25);
  pieces.forEach((piece, index) => {
    const isLast = index === pieces.length - 1;
    const start = index * .25 + (isLast ? .25 : 0);
    timeline.to(piece, {
      progress: 1,
      duration: 1.15 * (isLast ? 1.45 : 1),
      ease: 'sine.in',
    }, start);
  });
  const lastPiece = pieces[pieces.length - 1];
  timeline.to(lastPiece, { highlight: 1, scale: 1.08, duration: .32, ease: 'sine.inOut' }, '+=.08');
  timeline.to(lastPiece, { highlight: 0, scale: 1, duration: .65, ease: 'sine.inOut' }, '+=.28');
  canvas.dataset.state = 'waiting';
  render();
  motionPreference.addEventListener('change', onMotionChange);
  window.addEventListener('scroll', onFirstDownwardScroll, { passive: true });
})();
