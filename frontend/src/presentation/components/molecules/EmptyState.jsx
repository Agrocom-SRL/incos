/**
 * EmptyState — molécula de estado vacío reutilizable.
 *
 * Atomic Design: MOLECULA. Generaliza matricula-v2/components/MatriculaEmptyState
 * (icono + título + hint + acciones) y lo promueve a capa compartida.
 *
 * Distingue "vacío real" de "sin resultados de filtro" vía `variant`:
 *  - 'default'    → no hay datos todavía (icono en color de marca).
 *  - 'no-results' → ningún registro coincide con el filtro (icono neutro).
 *
 * Entrada animada con FadeIn (gateado por useReducedMotion vía el átomo).
 *
 * @module presentation/components/molecules/EmptyState
 * @param {{
 *   icon?: React.ReactNode,         // glifo dentro del círculo
 *   title?: React.ReactNode,
 *   description?: React.ReactNode,  // texto de ayuda
 *   actions?: React.ReactNode,      // botones (la page los construye con permisos)
 *   variant?: 'default' | 'no-results',
 *   className?: string,
 * }} props
 */

import { InboxOutlined, SearchOutlined } from '@ant-design/icons';
import { FadeIn } from '@presentation/motion';

const DEFAULT_ICON = {
  default: <InboxOutlined />,
  'no-results': <SearchOutlined />,
};

const EmptyState = ({
  icon,
  title,
  description,
  actions,
  variant = 'default',
  className = '',
}) => {
  const variantClass = variant === 'no-results' ? ' incos-empty--no-results' : '';

  return (
    <FadeIn className={`incos-empty${variantClass} ${className}`.trim()}>
      <div className="incos-empty__icon" aria-hidden>
        {icon || DEFAULT_ICON[variant] || DEFAULT_ICON.default}
      </div>
      {title ? <div className="incos-empty__title">{title}</div> : null}
      {description ? <p className="incos-empty__hint">{description}</p> : null}
      {actions ? <div className="incos-empty__actions">{actions}</div> : null}
    </FadeIn>
  );
};

export default EmptyState;
