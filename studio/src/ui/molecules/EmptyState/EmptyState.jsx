/**
 * EmptyState — estado vacío reutilizable (icono + título + ayuda + acción opcional).
 * Molécula: presentación pura; la acción se inyecta por children.
 */
import { InboxOutlined } from '@ant-design/icons';
import './EmptyState.css';

export function EmptyState({ icon = <InboxOutlined />, title, hint, children }) {
  return (
    <div className="ds-empty">
      <div className="ds-empty__icon">{icon}</div>
      {title ? <div className="ds-empty__title">{title}</div> : null}
      {hint ? <div className="ds-empty__hint">{hint}</div> : null}
      {children ? <div className="ds-empty__actions">{children}</div> : null}
    </div>
  );
}

export default EmptyState;
