/**
 * Badge - Componente atómico para badges/etiquetas
 * 
 * Single Responsibility: Renderizar un badge con estilos consistentes
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente atómico de UI
 * 
 * Atomic Design: Átomo
 * - Componente básico e indivisible
 * - Usa Typography.Text de Ant Design internamente
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza un badge
 * - Open/Closed: Extensible mediante props y variantes
 */

import { Flex, Typography } from 'antd';

const { Text: AntText } = Typography;

/**
 * Componente Badge para mostrar etiquetas/badges
 * 
 * @param {Object} props
 * @param {ReactNode} props.icon - Icono a mostrar en el badge (opcional)
 * @param {string} props.text - Texto a mostrar en el badge (opcional)
 * @param {ReactNode} props.children - Contenido alternativo del badge (si no se usan icon/text)
 * @param {string} props.variant - Variante del badge ('error' | 'success' | 'default')
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props...props - Props adicionales para Container
 */
const Badge = ({
  icon,
  text,
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const badgeClassName = `badge badge--${variant} ${className}`.trim();

  // Si se proporcionan icon y/o text, usarlos
  // Si no, usar children (para mantener compatibilidad)
  const content = icon || text ? (
    <>
      {icon && (
        <Flex className="badge-icon" gap={0} align="center">
          {icon}
        </Flex>
      )}
      {text && <AntText className="badge-text">{text}</AntText>}
    </>
  ) : children;

  return (
    <Flex
      className={badgeClassName}
      align="center"
      gap="small"
      {...props}
    >
      {content}
    </Flex>
  );
};

export default Badge;

