/**
 * PaymentAmountDisplay - Molecule para mostrar el monto a pagar
 *
 * Single Responsibility: Mostrar el saldo a pagar (ya con descuento aplicado)
 *
 * Atomic Design: Molecule
 * - Combina atoms (Typography, iconos) para mostrar monto final
 * - Colores desde el theme de AntD (`theme.useToken`): tarjeta destacada en el
 *   verde primario institucional, sin gradientes ni sombras hex hardcodeadas.
 *
 * @param {number} montoPagado - Monto final a pagar (ya con descuento aplicado)
 */

import { Flex, Typography, theme } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Helper para formatear monto
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PaymentAmountDisplay = ({
  montoPagado
}) => {
  const { token } = theme.useToken();

  // Si el monto es 0 (gratis), no mostrar nada
  if (montoPagado === 0 || (!montoPagado && montoPagado !== 0)) {
    return null;
  }

  return (
    <Flex
      vertical
      gap="small"
      style={{
        background: token.colorPrimary,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingLG,
        width: '100%',
        height: '100%',
      }}
    >
      <Flex align="center" gap="small">
        <DollarOutlined style={{ fontSize: token.fontSizeHeading4, color: token.colorTextLightSolid }} />
        <Text strong style={{ color: token.colorTextLightSolid }}>
          Saldo a pagar
        </Text>
      </Flex>
      <Title level={3} style={{ margin: 0, color: token.colorTextLightSolid }}>
        {formatMonto(montoPagado)}
      </Title>
    </Flex>
  );
};

export default PaymentAmountDisplay;
