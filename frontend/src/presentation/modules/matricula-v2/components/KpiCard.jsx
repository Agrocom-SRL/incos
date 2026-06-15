/**
 * Tarjeta KPI del listado v2.
 * @param {{
 *   label: string,
 *   value: number|string,
 *   delta?: number,
 *   icon: React.ReactNode,
 *   accent?: string,   // token de tema (ej. 'var(--brand-600)'), nunca hex suelto
 *   sub?: string
 * }} props
 */
import { useEffect, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { animate } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Anima el número de 0 al valor real al montar (feedback de estado del dato).
 * En reduced-motion / valores no numéricos muestra el valor final sin animar
 * (sin setState en el efecto para no disparar renders en cascada).
 */
function useCountUp(value) {
  const reduce = useReducedMotion();
  const numeric = typeof value === 'number' && Number.isFinite(value);
  const animatable = numeric && !reduce;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!animatable) return undefined;
    const controls = animate(0, value, {
      duration: 0.55,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setAnimated(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, animatable]);

  return animatable ? animated : value;
}

const KpiCard = ({ label, value, delta, icon, accent = 'var(--brand-600)', sub }) => {
  const positive = delta === undefined || delta >= 0;
  const displayValue = useCountUp(value);

  return (
    <div className="matricula-v2-kpi-card" style={{ '--kpi-accent': accent }}>
      <div className="matricula-v2-kpi-card__blob--lg" aria-hidden />
      <div className="matricula-v2-kpi-card__blob" aria-hidden />
      <div className="matricula-v2-kpi-card__rail" aria-hidden />

      <div className="matricula-v2-kpi-card__head">
        <div className="matricula-v2-kpi-card__icon">{icon}</div>
        <div className="matricula-v2-kpi-card__label">{label}</div>
      </div>

      <div className="matricula-v2-kpi-card__value-row">
        <div className="matricula-v2-kpi-card__value">{displayValue}</div>
        {delta !== undefined && (
          <div className="matricula-v2-kpi-card__delta" data-positive={positive}>
            {positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      {sub ? <div className="matricula-v2-kpi-card__sub">{sub}</div> : null}
    </div>
  );
};

export default KpiCard;
