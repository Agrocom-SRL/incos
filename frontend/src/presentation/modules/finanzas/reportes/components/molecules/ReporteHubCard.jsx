/**
 * Tarjeta de acceso a un reporte (hub de "Reportes de pagos", Finanzas).
 *
 * Molécula de navegación: icono + título + descripción y un pie que indica si el
 * reporte está disponible (flecha) o "En construcción" (deshabilitado). Solo
 * presentación; la visibilidad por permiso la decide la página con PermisoGuard.
 */

import { Typography } from 'antd';
import { ArrowRightOutlined, ToolOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ReporteHubCard = ({ icon, title, description, disponible = false, onClick }) => {
  const clickable = disponible && typeof onClick === 'function';

  const handleKeyDown = (event) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`reporte-hub-card${clickable ? ' reporte-hub-card--clickable' : ' reporte-hub-card--disabled'}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={clickable ? undefined : true}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
    >
      <span className="reporte-hub-card__icon" aria-hidden>
        {icon}
      </span>
      <span className="reporte-hub-card__title">{title}</span>
      <Text type="secondary" className="reporte-hub-card__desc">
        {description}
      </Text>
      <span className="reporte-hub-card__footer">
        {disponible ? (
          <span className="reporte-hub-card__cta">
            Abrir reporte <ArrowRightOutlined />
          </span>
        ) : (
          <span className="reporte-hub-card__soon">
            <ToolOutlined /> En construcción
          </span>
        )}
      </span>
    </div>
  );
};

export default ReporteHubCard;
