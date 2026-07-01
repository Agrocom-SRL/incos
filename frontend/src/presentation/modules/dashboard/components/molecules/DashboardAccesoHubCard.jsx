import { Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { allColors } from '@theme/tokens';

const { Text } = Typography;

/**
 * Molécula: tarjeta de acceso rápido del inicio del estudiante.
 *
 * Replica el lenguaje visual del hub de reportes (`ReporteHubCard`): icono en
 * badge, título, descripción y un CTA al pie, con hover translateY. El acento se
 * recibe ya resuelto desde tokens (`accent` / `accentBg`) y se inyecta como
 * custom property CSS — así cada tarjeta se diferencia sin colores hardcodeados.
 *
 * Solo presentación + navegación: recibe `onClick`, sin lógica de negocio.
 * Accesible por teclado (role button, Enter/Espacio) — los estilos viven en
 * `estudiante-home.css`.
 */
const DashboardAccesoHubCard = ({
  icon,
  title,
  description,
  accent = allColors.colorPrimary,
  accentBg = allColors.colorPrimaryBg,
  actionLabel = 'Abrir',
  onClick,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className="estudiante-acceso-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ '--acceso-accent': accent, '--acceso-accent-bg': accentBg }}
    >
      <span className="estudiante-acceso-card__icon" aria-hidden>
        {icon}
      </span>
      <span className="estudiante-acceso-card__title">{title}</span>
      <Text type="secondary" className="estudiante-acceso-card__desc">
        {description}
      </Text>
      <span className="estudiante-acceso-card__cta">
        {actionLabel} <ArrowRightOutlined />
      </span>
    </div>
  );
};

export default DashboardAccesoHubCard;
