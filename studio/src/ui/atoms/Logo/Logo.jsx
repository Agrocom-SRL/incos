/**
 * Logo — wordmark de la marca activa. Expandido = nombre completo estilizado;
 * colapsado = badge corto. White-label: el texto sale de activeBrand (sin asset fijo).
 */
import { activeBrand } from '@config/brand';
import './Logo.css';

export function Logo({ collapsed = false }) {
  if (collapsed) {
    return <div className="ds-logo ds-logo--badge">{activeBrand.shortName}</div>;
  }
  return (
    <div className="ds-logo" title={activeBrand.name}>
      <span className="ds-logo__mark">{activeBrand.shortName}</span>
      <span className="ds-logo__sub">{activeBrand.name.replace(activeBrand.shortName, '').trim()}</span>
    </div>
  );
}

export default Logo;
