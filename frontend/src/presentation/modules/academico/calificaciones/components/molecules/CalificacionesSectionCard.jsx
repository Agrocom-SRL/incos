/**
 * Bloque de contenido con cabecera institucional (.sd-card).
 */

const CalificacionesSectionCard = ({
  title,
  icon = null,
  variant = 'cabecera',
  extra = null,
  bodyClassName = '',
  children,
}) => (
  <section className="sd-card cal-section">
    <div className={`sd-card__head sd-card__head--${variant}`}>
      <span className="sd-card__title">
        {icon ? <span className="sd-card__title-icon">{icon}</span> : null}
        {title}
      </span>
      {extra ? <div className="sd-card__extra">{extra}</div> : null}
    </div>
    <div className={`sd-card__body cal-section__body ${bodyClassName}`.trim()}>{children}</div>
  </section>
);

export default CalificacionesSectionCard;
