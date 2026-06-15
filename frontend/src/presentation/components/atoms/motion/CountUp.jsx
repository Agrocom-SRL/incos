/**
 * CountUp — átomo de número animado de 0 al valor.
 *
 * Wrapper render-only para useCountUp. Emite un <span> con el valor animado.
 * En reduced-motion muestra el valor final inmediatamente.
 *
 * @module presentation/components/atoms/motion/CountUp
 * @param {{
 *   value: number|string,
 *   duration?: number,       // override de DUR.count
 *   className?: string,
 *   style?: object,
 * }} props
 */
import { useCountUp } from '@presentation/hooks/useCountUp';
import { DUR } from '../../../motion/presets';

const CountUp = ({ value, duration = DUR.count, className, style }) => {
  const display = useCountUp(value, { duration });
  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
};

export default CountUp;
