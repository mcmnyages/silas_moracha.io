/**
 * Subtle 3D tilt that follows the pointer. Apply `.tilt` + `data-tilt` to an element;
 * children with `.tilt-pop` float above it in z. Disabled for touch and reduced motion.
 */
export function initTilt(maxDeg = 6) {
  if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const strength = Number(el.dataset.tilt) || maxDeg;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${x * strength}deg`);
      el.style.setProperty('--rx', `${-y * strength}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    });
  });
}
