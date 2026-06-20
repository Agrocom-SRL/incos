/**
 * Skeleton — placeholder de carga con shimmer (gateado por reduced-motion vía CSS).
 * Átomo puro: dimensiones y radio por props.
 */
import './Skeleton.css';

export function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)' }) {
  return <span className="ds-skeleton" style={{ width, height, borderRadius: radius }} aria-hidden />;
}

export default Skeleton;
