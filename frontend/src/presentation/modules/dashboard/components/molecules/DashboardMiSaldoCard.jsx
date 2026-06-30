import { Card, Flex, Typography } from 'antd';
import { WalletOutlined, RightOutlined } from '@ant-design/icons';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import { formatBs } from '@application/utils/formatters';

const { Text } = Typography;

/**
 * Molécula: "Mis aportes" (saldo pendiente) para el InfoSidebar del estudiante.
 *
 * Muestra el saldo pendiente con semántica de estado: ámbar (warning) si hay
 * deuda, verde (success) si está al día. Tarjeta navegable hacia el listado de
 * aportes (accesible por teclado). Solo presentación + navegación.
 */
const DashboardMiSaldoCard = ({ saldoPendiente = 0, onVerAportes }) => {
  const tieneDeuda = saldoPendiente > 0;
  const accent = tieneDeuda ? allColors.colorWarning : allColors.colorSuccess;
  const accentBg = tieneDeuda ? allColors.colorWarningBg : allColors.colorSuccessBg;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onVerAportes?.();
    }
  };

  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      onClick={onVerAportes}
      onKeyDown={handleKeyDown}
      style={{
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
        cursor: 'pointer',
      }}
      styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
    >
      <Flex vertical gap={allSpacing.marginMD}>
        <Flex align="center" gap={allSpacing.margin}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: allSpacing.controlHeight,
              height: allSpacing.controlHeight,
              borderRadius: `${allSpacing.borderRadiusMD}px`,
              backgroundColor: accentBg,
              color: accent,
              fontSize: `${typography.fontSizeLG}px`,
              flexShrink: 0,
            }}
          >
            <WalletOutlined />
          </Flex>
          <Text
            strong
            style={{
              color: allColors.colorText,
              fontSize: `${typography.fontSizeLG}px`,
              fontWeight: typography.fontWeightStrong,
            }}
          >
            Mis aportes
          </Text>
        </Flex>

        <Flex vertical gap={allSpacing.marginXS}>
          <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
            Saldo pendiente
          </Text>
          <Text
            strong
            style={{
              color: accent,
              fontSize: `${typography.fontSizeHeading3}px`,
              fontWeight: typography.fontWeightStrong,
              lineHeight: 1.2,
            }}
          >
            Bs {formatBs(saldoPendiente)}
          </Text>
          <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
            {tieneDeuda ? 'Tienes un saldo por cubrir.' : 'Estás al día con tus aportes.'}
          </Text>
        </Flex>

        <Flex align="center" gap={allSpacing.marginXS} style={{ color: allColors.colorPrimary }}>
          <Text
            style={{
              color: allColors.colorPrimary,
              fontSize: `${typography.fontSizeSM}px`,
              fontWeight: typography.fontWeightStrong,
            }}
          >
            Ver mis aportes
          </Text>
          <RightOutlined style={{ fontSize: `${typography.fontSizeXS}px` }} />
        </Flex>
      </Flex>
    </Card>
  );
};

export default DashboardMiSaldoCard;
