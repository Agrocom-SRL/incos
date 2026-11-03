/**
 * PaymentMethodCardContent - Molecule para mostrar el contenido de una card de método de pago
 * 
 * Single Responsibility: Renderizar el contenido visual de una card de método de pago
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Text, Title) para mostrar información de método de pago
 * 
 * @param {Object} metodoPago - Objeto con información del método de pago
 * @param {string} metodoPago.codigo - Código del método de pago
 * @param {string} metodoPago.nombre - Nombre del método de pago
 */

import { Typography } from 'antd';

const { Title, Text } = Typography;

const PaymentMethodCardContent = ({ metodoPago }) => {
  return (
    <>
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <Text strong style={{ color: 'var(--color-primary)', fontSize: '24px', fontWeight: 'bold', display: 'block' }}>
          {metodoPago.codigo || 'N/A'}
        </Text>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
          {metodoPago.nombre}
        </Title>
      </div>
    </>
  );
};

export default PaymentMethodCardContent;
