/**
 * useCountUp(target) — anima un entero de 0 al objetivo (percepción de "vida").
 * Respeta reduced-motion (muestra el valor final sin animar). SRP: solo el número.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { DUR } from './presets';

// EASE.out como función aproximada para el progreso (easeOutCubic).
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target = 0, durationS = DUR.pop * 3) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return undefined;
    }
    const durationMs = durationS * 1000;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationS, reduced]);

  return value;
}

export default useCountUp;
