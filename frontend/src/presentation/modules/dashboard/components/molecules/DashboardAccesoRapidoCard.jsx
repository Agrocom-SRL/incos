import { Card, Flex, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { allSpacing, allColors, componentConfig, typography, shadows } from '@theme/tokens';

const { Text } = Typography;

/**
 * Molécula: tarjeta de acceso rápido del portal del estudiante.
 *
 * Tarjeta navegable (AntD `Card hoverable`) con ícono en badge, título, una línea
 * de detalle (p. ej. saldo pendiente) y un affordance de "ir a la página".
 * Solo presentación + navegación: recibe `onClick` y no contiene lógica de negocio.
 */
const DashboardAccesoRapidoCard = ({
  icon,
  iconColor = allColors.colorPrimary,
  iconBg = allColors.colorPrimaryBg,
  title,
  detail,
  actionLabel = 'Ir',
  onClick,
}) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        height: '100%',
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
        cursor: 'pointer',
        transition: `transform ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}, box-shadow ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}`,
      }}
      styles={{ body: { padding: `${componentConfig.Card.paddingLG}px`, height: '100%' } }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shadows.shadowElevation3;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadows.shadowElevation2;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Flex vertical gap={allSpacing.margin} style={{ height: '100%' }}>
        <Flex align="center" gap={allSpacing.margin}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: allSpacing.controlHeightLG,
              height: allSpacing.controlHeightLG,
              borderRadius: `${allSpacing.borderRadiusMD}px`,
              backgroundColor: iconBg,
              color: iconColor,
              fontSize: `${typography.fontSizeXL}px`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Flex>
          <Text
            strong
            style={{
              color: allColors.colorText,
              fontSize: `${typography.fontSizeLG}px`,
              fontWeight: typography.fontWeightStrong,
            }}
          >
            {title}
          </Text>
        </Flex>

        {detail ? (
          <div style={{ flex: 1 }}>{detail}</div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <Flex align="center" gap={allSpacing.marginXS} style={{ color: allColors.colorPrimary }}>
          <Text
            style={{
              color: allColors.colorPrimary,
              fontSize: `${typography.fontSizeSM}px`,
              fontWeight: typography.fontWeightStrong,
            }}
          >
            {actionLabel}
          </Text>
          <RightOutlined style={{ fontSize: `${typography.fontSizeXS}px` }} />
        </Flex>
      </Flex>
    </Card>
  );
};

export default DashboardAccesoRapidoCard;
