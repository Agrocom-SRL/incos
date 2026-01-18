/**
 * PaymentMethodSelectionSection - Organism para la sección de selección de método de pago
 * 
 * Single Responsibility: Mostrar el formulario de selección de método de pago
 * 
 * Atomic Design: Organism
 * - Combina atoms (Card, Form, Alert, Radio) para selección de método de pago
 * 
 * @param {Object} metodosPagoData - Datos de métodos de pago
 * @param {Array} metodosPagoData.metodosPago - Lista de métodos de pago
 * @param {boolean} metodosPagoData.loading - Estado de carga
 * @param {string} metodosPagoData.error - Mensaje de error
 * @param {Object} metodosPagoData.selectedMetodoPago - Método de pago seleccionado
 * @param {Function} onSelectMetodoPago - Callback cuando se selecciona un método de pago
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 */

import { useEffect } from 'react';
import { Form, Alert, Radio, Spin, Empty, Space, Typography } from 'antd';
import { Card } from '@atoms';
import { 
  CreditCardOutlined, 
  DollarOutlined, 
  QrcodeOutlined,
  BankOutlined,
  MobileOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const PaymentMethodSelectionSection = ({
  metodosPagoData,
  onSelectMetodoPago,
  form,
  onFinish
}) => {
  // Handler para cuando cambia la selección del radio
  const handleRadioChange = (e) => {
    const metodoPagoId = e.target.value;
    const metodoPago = metodosPagoData.metodosPago?.find(mp => mp.id === metodoPagoId);
    
    // Determinar si el nuevo método requiere cuenta
    const codigoMetodo = metodoPago?.codigo?.toUpperCase() || '';
    const requiereCuenta = codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'QR', 'TIGO_MONEY'].includes(codigoMetodo);
    
    // Actualizar el formulario
    if (form) {
      form.setFieldsValue({ metodoPagoId });
      
      // Si el método no requiere cuenta (ej: EFECTIVO), limpiar campos relacionados
      if (!requiereCuenta) {
        form.setFieldsValue({ 
          cuentaPagoId: undefined,
          numeroTransaccion: undefined 
        });
      }
    }
    
    // Llamar al callback de selección
    if (metodoPago && onSelectMetodoPago) {
      onSelectMetodoPago(metodoPago);
    }
  };

  // Obtener el ID del método seleccionado para el Radio.Group (solo del contexto)
  const selectedValue = metodosPagoData.selectedMetodoPago?.id;

  // Sincronizar el valor del formulario con la selección actual del contexto
  useEffect(() => {
    if (form && metodosPagoData.selectedMetodoPago) {
      // Establecer el valor en el formulario cuando cambie la selección del contexto
      form.setFieldsValue({ metodoPagoId: metodosPagoData.selectedMetodoPago.id });
    }
  }, [form, metodosPagoData.selectedMetodoPago?.id]);

  // Función para obtener icono y color según el método
  const getMethodConfig = (codigo) => {
    const code = codigo?.toUpperCase() || '';
    switch (code) {
      case 'EFECTIVO':
        return { icon: DollarOutlined, color: '#52c41a', bgColor: '#f6ffed' };
      case 'TRANSFERENCIA':
        return { icon: BankOutlined, color: '#1890ff', bgColor: '#e6f7ff' };
      case 'DEPOSITO':
        return { icon: BankOutlined, color: '#722ed1', bgColor: '#f9f0ff' };
      case 'QR':
        return { icon: QrcodeOutlined, color: '#eb2f96', bgColor: '#fff0f6' };
      case 'TIGO_MONEY':
        return { icon: MobileOutlined, color: '#fa8c16', bgColor: '#fff7e6' };
      default:
        return { icon: CreditCardOutlined, color: '#1890ff', bgColor: '#e6f7ff' };
    }
  };

  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          Seleccionar Método de Pago
        </span>
      }
      style={{ 
        marginTop: '24px', 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      headerColor="primary"
    >
      {metodosPagoData.error && (
        <Alert
          message="Error al cargar métodos de pago"
          description={metodosPagoData.error}
          type="error"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '8px' }}
        />
      )}

      {metodosPagoData.loading ? (
        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Spin size="large">
            <div style={{ minHeight: '100px' }}>
              <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Cargando métodos de pago...</p>
            </div>
          </Spin>
        </div>
      ) : !metodosPagoData.metodosPago || metodosPagoData.metodosPago.length === 0 ? (
        <Empty
          description="No hay métodos de pago disponibles"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            metodoPagoId: selectedValue
          }}
        >
          <Form.Item
            name="metodoPagoId"
            rules={[
              { required: true, message: 'Por favor seleccione un método de pago' }
            ]}
          >
            <Radio.Group
              value={selectedValue}
              onChange={handleRadioChange}
              style={{ width: '100%' }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {metodosPagoData.metodosPago.map((metodoPago) => {
                  const isSelected = selectedValue === metodoPago.id;
                  const { icon: IconComponent, color, bgColor } = getMethodConfig(metodoPago.codigo);

                  return (
                    <Radio.Button
                      key={metodoPago.id}
                      value={metodoPago.id}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: '0',
                        margin: 0,
                        border: isSelected 
                          ? `2px solid ${color}` 
                          : '2px solid #e8e8e8',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? bgColor : '#ffffff',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: isSelected 
                          ? `0 4px 12px rgba(0,0,0,0.1)` 
                          : '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                      className="payment-method-card"
                    >
                      <div
                        style={{
                          padding: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        }}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? color : '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent 
                            style={{ 
                              fontSize: '28px', 
                              color: isSelected ? '#fff' : '#8c8c8c',
                              transition: 'all 0.3s ease',
                            }} 
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '16px',
                              color: '#262626',
                              marginBottom: '4px',
                              lineHeight: '1.4',
                            }}
                          >
                            {metodoPago.nombre}
                          </div>
                          {metodoPago.codigo && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: '13px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {metodoPago.codigo}
                            </Text>
                          )}
                        </div>
                        {isSelected && (
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ color: '#fff', fontSize: '14px' }}>✓</span>
                          </div>
                        )}
                      </div>
                    </Radio.Button>
                  );
                })}
              </div>
            </Radio.Group>
          </Form.Item>
        </Form>
      )}
      
      <style>{`
        .payment-method-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .payment-method-card .ant-radio-button-wrapper {
          border: none !important;
          box-shadow: none !important;
        }
        .payment-method-card .ant-radio-button-wrapper-checked {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </Card>
  );
};

export default PaymentMethodSelectionSection;
