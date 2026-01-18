/**
 * PaymentMethodInfo - Molecule para mostrar información del método de pago seleccionado
 * 
 * Single Responsibility: Mostrar método de pago y cuenta (si aplica)
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Typography, iconos) para mostrar método y cuenta
 * 
 * @param {Object} selectedMetodoPago - Método de pago seleccionado
 * @param {Object} selectedCuentaPago - Cuenta de pago seleccionada (opcional)
 * @param {boolean} requiereCuenta - Si el método requiere cuenta bancaria
 */

import { Typography } from 'antd';
import { CreditCardOutlined, BankOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentMethodInfo = ({
  selectedMetodoPago,
  selectedCuentaPago,
  requiereCuenta = false
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
    }}>
      {/* Método de Pago */}
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CreditCardOutlined style={{ fontSize: '22px', color: '#fff' }} />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
            Método de Pago
          </Text>
          <Text strong style={{ fontSize: '16px' }}>
            {selectedMetodoPago?.nombre || 'N/A'}
          </Text>
        </div>
      </div>
      
      {/* Cuenta de Pago - Solo si requiere cuenta y hay cuenta seleccionada */}
      {requiereCuenta && selectedCuentaPago && (
        <div style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BankOutlined style={{ fontSize: '22px', color: '#fff' }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
              Cuenta de Pago
            </Text>
            <Text strong style={{ fontSize: '16px' }}>
              {selectedCuentaPago.nombre || selectedCuentaPago.numeroCuenta || 'N/A'}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodInfo;
