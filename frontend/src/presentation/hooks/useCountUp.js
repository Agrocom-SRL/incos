/**
 * useCountUp — anima un número de 0 al valor al montar.
 *
 * SRP: lógica pura sin render. Consume presets de motion (DUR/EASE) para
 * garantizar cero literales de duración/easing en los consumidores.
 *
 * En reduced-motion / valores no numéricos devuelve el valor final inmediatamente.
 *
 * @module presentation/hooks/useCountUp
 * @param {number|string} value - Valor final a animar.
 * @param {{ duration?: number }} [options]
 * @returns {number|string} Valor animado (o el original si no es numérico/reducido).
 */
import { useEffect, useState } from 'react';
import { animate } from 'motion/react';
import { useReducedMotion } from './useReducedMotion';
import { DUR, EASE } from '../motion/presets';

export function useCountUp(value, { duration = DUR.count } = {}) {
  const reduce = useReducedMotion();
  const numeric = typeof value === 'number' && Number.isFinite(value);
  const animatable = numeric && !reduce;
  // Inicializar en 0 solo cuando va a animar (evita setState en efecto para el caso !animatable).
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!animatable) return undefined;
    const controls = animate(0, value, {
      duration,
      ease: EASE.out,
      onUpdate: (v) => setAnimated(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, animatable, duration]);

  // En modo no animable devolver el valor directamente (sin pasar por estado)
  return animatable ? animated : value;
}
