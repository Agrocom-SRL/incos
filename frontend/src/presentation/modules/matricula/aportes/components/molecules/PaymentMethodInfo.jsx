/**
 * PaymentMethodInfo - Molecule para mostrar información del método de pago seleccionado
 *
 * Single Responsibility: Mostrar método de pago y cuenta (si aplica)
 *
 * Atomic Design: Molecule
 * - Combina atoms (Typography, iconos) para mostrar método y cuenta
 * - Colores desde el theme de AntD (`theme.useToken`): tarjetas neutras con
 *   ícono en el primario institucional, sin gradientes hex hardcodeados
 *   (visibles en ambos temas).
 *
 * @param {Object} selectedMetodoPago - Método de pago seleccionado
 * @param {Object} selectedCuentaPago - Cuenta de pago seleccionada (opcional)
 * @param {boolean} requiereCuenta - Si el método requiere cuenta bancaria
 * @param {boolean} esTransferencia - Si es método de transferencia bancaria
 */

import { Flex, Typography, theme } from 'antd';
import { CreditCardOutlined, BankOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentMethodInfo = ({
  selectedMetodoPago,
  selectedCuentaPago,
  requiereCuenta = false,
  esTransferencia = false
}) => {
  const { token } = theme.useToken();

  // Obtener información del banco para transferencia
  const bancoNombre = selectedCuentaPago?.banco?.nombre || selectedCuentaPago?.bancoNombre || '';
  const bancoCodigo = selectedCuentaPago?.banco?.codigo || selectedCuentaPago?.bancoCodigo || '';
  const nombreTitular = selectedCuentaPago?.accountHolderName || selectedCuentaPago?.nombreTitular || selectedCuentaPago?.nombre || '';
  const numeroCuenta = selectedCuentaPago?.accountNumber || selectedCuentaPago?.numeroCuenta || '';

  // Tarjeta neutra reutilizada por método y cuenta
  const cardStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
  };

  // Contenedor del ícono (primario institucional)
  const iconBoxStyle = {
    width: token.controlHeightLG,
    height: token.controlHeightLG,
    borderRadius: token.borderRadiusLG,
    background: token.colorPrimary,
    flexShrink: 0,
  };

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      {/* Método de Pago */}
      <Flex align="center" gap="middle" style={cardStyle}>
        <Flex align="center" justify="center" style={iconBoxStyle}>
          <CreditCardOutlined style={{ fontSize: token.fontSizeHeading4, color: token.colorTextLightSolid }} />
        </Flex>
        <div>
          <Text type="secondary" style={{ display: 'block', fontSize: token.fontSizeSM }}>
            Método de pago
          </Text>
          <Text strong style={{ fontSize: token.fontSizeLG }}>
            {selectedMetodoPago?.nombre || 'N/A'}
          </Text>
        </div>
      </Flex>

      {/* Cuenta de Pago - Solo si requiere cuenta y hay cuenta seleccionada */}
      {requiereCuenta && selectedCuentaPago && (
        <Flex vertical gap="middle" style={cardStyle}>
          <Flex align="center" gap="middle">
            <Flex align="center" justify="center" style={iconBoxStyle}>
              <BankOutlined style={{ fontSize: token.fontSizeHeading4, color: token.colorTextLightSolid }} />
            </Flex>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ display: 'block', fontSize: token.fontSizeSM }}>
                Cuenta de pago
              </Text>
              <Text strong style={{ display: 'block', fontSize: token.fontSizeLG }}>
                {nombreTitular || 'N/A'}
              </Text>
              {numeroCuenta && (
                <Text type="secondary" style={{ display: 'block' }}>
                  Cuenta: {numeroCuenta}
                </Text>
              )}
            </div>
          </Flex>

          {/* Detalles del banco - Solo para TRANSFERENCIA */}
          {esTransferencia && bancoNombre && (
            <div
              style={{
                paddingTop: token.paddingSM,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Text type="secondary" style={{ display: 'block', fontSize: token.fontSizeSM }}>
                Banco
              </Text>
              <Text strong style={{ display: 'block' }}>
                {bancoNombre}
                {bancoCodigo && ` (${bancoCodigo})`}
              </Text>
            </div>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default PaymentMethodInfo;
