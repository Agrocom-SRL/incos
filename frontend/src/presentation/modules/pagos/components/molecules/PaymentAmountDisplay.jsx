/**
 * PaymentAmountDisplay - Molecule para mostrar el monto a pagar
 * 
 * Single Responsibility: Mostrar el saldo a pagar (ya con descuento aplicado)
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Typography, iconos) para mostrar monto final
 * 
 * @param {number} montoPagado - Monto final a pagar (ya con descuento aplicado)
 */

import { Typography } from 'antd';
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
  // Si el monto es 0 (gratis), no mostrar nada
  if (montoPagado === 0 || (!montoPagado && montoPagado !== 0)) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
      border: 'none',
      transition: 'all 0.3s ease',
      width: '100%',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '12px',
        gap: '10px'
      }}>
        <DollarOutlined style={{ fontSize: '24px', color: '#fff' }} />
        <Text style={{ 
          fontSize: '14px', 
          fontWeight: 600,
          color: '#fff',
          opacity: 0.95
        }}>
          Saldo a pagar
        </Text>
      </div>
      <Title level={3} style={{ 
        margin: 0, 
        color: '#fff',
        fontSize: '32px',
        fontWeight: 700
      }}>
        {formatMonto(montoPagado)}
      </Title>
    </div>
  );
};

export default PaymentAmountDisplay;
