/**
 * Tarjeta de sección (patrón sd-card compartido con admisión / pagos).
 */

const DetailInfoCard = ({ title, icon, extra, children, cols = 2, headVariant }) => (
  <div className="sd-card">
    <div className={`sd-card__head${headVariant ? ` sd-card__head--${headVariant}` : ''}`}>
      <span className="sd-card__title">
        {icon && <span className="sd-card__title-icon">{icon}</span>}
        {title}
      </span>
      {extra && <div className="sd-card__extra">{extra}</div>}
    </div>
    <div className={`sd-card__body sd-card__body--cols-${cols}`}>{children}</div>
  </div>
);

export default DetailInfoCard;
