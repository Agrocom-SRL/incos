/**
 * PaymentInfoItem - Molecule para mostrar un item de información de pago
 * 
 * Single Responsibility: Mostrar un campo de información de pago con icono
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Text, iconos) para crear un item de información
 * 
 * @param {ReactNode} icon - Icono a mostrar
 * @param {string} label - Etiqueta del campo
 * @param {string|number} value - Valor del campo
 */

import { Typography } from 'antd';

const { Text } = Typography;

const PaymentInfoItem = ({ icon, label, value }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '16px',
      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
      borderRadius: '8px',
      border: '1px solid var(--color-border-secondary, #e8e8e8)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary, #1890ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          {label}
        </Text>
        <Text strong style={{ fontSize: '16px', display: 'block' }}>
          {value || 'N/A'}
        </Text>
      </div>
    </div>
  );
};

export default PaymentInfoItem;
