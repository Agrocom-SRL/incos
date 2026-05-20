/**
 * Mensajes contextuales compactos (sustituye varios Alert sueltos).
 */

import { CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';

const ICONS = {
  info: InfoCircleOutlined,
  warning: WarningOutlined,
  success: CheckCircleOutlined,
};

const CalificacionesAlertStrip = ({ items = [] }) => {
  const visibles = items.filter(Boolean);
  if (!visibles.length) return null;

  return (
    <div className="cal-alert-strip" role="status">
      {visibles.map((item) => {
        const Icon = ICONS[item.type] || InfoCircleOutlined;
        return (
          <div key={item.key} className={`cal-alert-strip__item cal-alert-strip__item--${item.type}`}>
            <Icon className="cal-alert-strip__icon" aria-hidden />
            <div className="cal-alert-strip__content">
              <strong>{item.title}</strong>
              {item.description ? <p>{item.description}</p> : null}
              {item.action ? <div className="cal-alert-strip__action">{item.action}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalificacionesAlertStrip;
