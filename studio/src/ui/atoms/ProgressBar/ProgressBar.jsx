/**
 * ProgressBar — barra de progreso con llenado animado (0 → valor).
 * Átomo puro reutilizable. Encapsula su animación; la neutraliza en reduced-motion.
 * `tone` permite teñir el relleno con un color de marca/categoría.
 */
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import './ProgressBar.css';

export function ProgressBar({ value = 0, tone = 'var(--brand-600)' }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [reduce]);

  const width = reduce || mounted ? pct : 0;

  return (
    <div className="ds-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="ds-progress__fill" style={{ width: `${width}%`, '--progress-tone': tone }} />
    </div>
  );
}

export default ProgressBar;
