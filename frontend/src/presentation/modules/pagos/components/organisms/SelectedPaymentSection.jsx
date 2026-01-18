/**
 * SelectedPaymentSection - Organism para la sección de pago seleccionado
 * 
 * Single Responsibility: Mostrar información del pago configurado y formulario completo
 * 
 * Atomic Design: Organism
 * - Combina molecules (SelectedPaymentInfoItem) y atoms (Card, Row, Col, Button, Space, Form, Input, DatePicker, Select)
 * 
 * @param {Object} selectedConfiguracion - Configuración de aporte seleccionada
 * @param {Object} selectedMetodoPago - Método de pago seleccionado
 * @param {Object} selectedCuentaPago - Cuenta de pago seleccionada (opcional, según método)
 * @param {Object} cuentasPagoData - Datos de cuentas de pago para el select
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 * @param {Function} onCancel - Callback cuando se cancela
 * @param {boolean} disabled - Si los botones están deshabilitados
 */

import { useEffect } from 'react';
import { Row, Col, Space, Form, Input, DatePicker, Select, Divider, Typography } from 'antd';
import { 
  DollarOutlined, 
  CalendarOutlined, 
  CreditCardOutlined,
  FileTextOutlined,
  BankOutlined,
  SaveOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Card, Button } from '@atoms';
import { SelectedPaymentInfoItem } from '../molecules';

const { TextArea } = Input;
const { Title, Text } = Typography;

// Helper para formatear monto
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper para calcular monto pagado (monto_total - descuento_beca)
const calcularMontoPagado = (montoTotal = 0, descuentoBeca = 0) => {
  const total = Number(montoTotal) || 0;
  const descuento = Number(descuentoBeca) || 0;
  return Math.max(0, total - descuento);
};

const SelectedPaymentSection = ({
  selectedConfiguracion,
  selectedMetodoPago,
  selectedCuentaPago,
  cuentasPagoData,
  becaActiva,
  form,
  onFinish,
  onCancel,
  disabled = false
}) => {
  // Si no hay configuración o método de pago seleccionado, no mostrar
  if (!selectedConfiguracion || !selectedMetodoPago) return null;

  // Calcular descuento automáticamente basado en beca activa
  const montoTotal = Number(selectedConfiguracion.montoBase) || 0;
  const tieneBeca = becaActiva && (becaActiva.estado === 'ACTIVA' || becaActiva.state === 'ACTIVA');
  const porcentajeDescuento = tieneBeca ? (becaActiva.scholarshipPercentage || becaActiva.porcentaje || 0) : 0;
  const descuentoBeca = tieneBeca ? (montoTotal * porcentajeDescuento / 100) : 0;
  const montoPagado = calcularMontoPagado(montoTotal, descuentoBeca);

  // Sincronizar descuento en el formulario cuando cambie la beca o configuración
  useEffect(() => {
    if (form) {
      form.setFieldsValue({ descuentoBeca: descuentoBeca });
    }
  }, [descuentoBeca, form]);

  // Determinar si el método de pago requiere cuenta (TRANSFERENCIA, DEPOSITO, QR, TIGO_MONEY)
  // EFECTIVO NO requiere cuenta bancaria
  const codigoMetodo = selectedMetodoPago?.codigo?.toUpperCase() || '';
  const requiereCuenta = codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'QR', 'TIGO_MONEY'].includes(codigoMetodo);

  return (
    <Card
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Detalles del Pago</span>
        </Space>
      }
      style={{ 
        marginTop: '24px', 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      headerColor="primary"
    >
      {/* Información del pago configurado - Diseño moderno */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #1890ff',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px',
                gap: '10px'
              }}>
                <DollarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Monto Base
                </Text>
              </div>
              <Title level={4} style={{ 
                margin: 0, 
                color: '#1890ff',
                fontSize: '24px',
                fontWeight: 600
              }}>
                {formatMonto(selectedConfiguracion.montoBase)}
              </Title>
            </div>
          </Col>
          
          {descuentoBeca > 0 && (
            <Col xs={24} sm={12} md={8}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: '4px solid #52c41a',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '12px',
                  gap: '10px'
                }}>
                  <DollarOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Descuento por Beca
                  </Text>
                </div>
                <Title level={4} style={{ 
                  margin: 0, 
                  color: '#52c41a',
                  fontSize: '24px',
                  fontWeight: 600
                }}>
                  {formatMonto(descuentoBeca)}
                </Title>
              </div>
            </Col>
          )}
          
          <Col xs={24} sm={12} md={descuentoBeca > 0 ? 8 : 16}>
            <div style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
              border: 'none',
              transition: 'all 0.3s ease',
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
                  Monto a Pagar
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
          </Col>
        </Row>
      </div>

      {/* Información del método de pago */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: '10px',
          padding: '16px 20px',
          flex: 1,
          minWidth: '200px',
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
              {selectedMetodoPago.nombre}
            </Text>
          </div>
        </div>
        
        {requiereCuenta && selectedCuentaPago && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8e8e8',
            borderRadius: '10px',
            padding: '16px 20px',
            flex: 1,
            minWidth: '200px',
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

      <Divider style={{ margin: '24px 0' }} />

      {/* Formulario para completar el pago */}
      <div>
        <Title level={5} style={{ 
          marginBottom: '20px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#262626'
        }}>
          Completar Información del Pago
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            fechaPago: dayjs(),
            descuentoBeca: 0,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fechaPago"
                label={
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    <CalendarOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    Fecha de Pago
                  </span>
                }
                rules={[
                  { required: true, message: 'Por favor seleccione la fecha de pago' }
                ]}
              >
                <DatePicker
                  style={{ 
                    width: '100%',
                    borderRadius: '8px',
                    height: '42px',
                  }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccione la fecha"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  size="large"
                />
              </Form.Item>
            </Col>
            {requiereCuenta && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="cuentaPagoId"
                  label={
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>
                      <BankOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                      Cuenta de Pago
                    </span>
                  }
                  rules={[
                    { required: requiereCuenta, message: 'Por favor seleccione una cuenta de pago' }
                  ]}
                >
                  <Select
                    placeholder="Seleccione una cuenta de pago"
                    loading={cuentasPagoData.loading}
                    size="large"
                    style={{
                      borderRadius: '8px',
                    }}
                    options={
                      (cuentasPagoData.cuentasPago || []).map(cuenta => ({
                        label: `${cuenta.nombre}${cuenta.numeroCuenta ? ` - ${cuenta.numeroCuenta}` : ''}`,
                        value: cuenta.id,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
            )}
            {/* Descuento por beca (solo mostrar si hay beca activa) */}
            {tieneBeca && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="descuentoBeca"
                  label={
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>
                      <DollarOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
                      Descuento por Beca (Bs.)
                    </span>
                  }
                  tooltip={`Beca activa: ${becaActiva.scholarshipName || `Beca ${porcentajeDescuento}%`}. El descuento se calcula automáticamente.`}
                >
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                    disabled={true}
                    size="large"
                    style={{ 
                      backgroundColor: '#f6ffed',
                      borderRadius: '8px',
                      borderColor: '#b7eb8f',
                    }}
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} sm={12}>
              <Form.Item
                name="numeroTransaccion"
                label={
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    <FileTextOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    Número de Transacción/Código
                  </span>
                }
                tooltip={
                  requiereCuenta 
                    ? "Ingrese el número de transacción, código de transferencia, o código QR" 
                    : "Opcional: Ingrese un número de referencia o comprobante (ej: recibo de caja)"
                }
                rules={[
                  { required: requiereCuenta, message: 'Por favor ingrese el número de transacción' }
                ]}
              >
                <Input
                  placeholder={requiereCuenta ? "Número de transacción o código" : "Número de referencia (opcional)"}
                  prefix={<FileTextOutlined style={{ color: '#8c8c8c' }} />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="concepto"
                label={
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Concepto
                  </span>
                }
                tooltip="Descripción del concepto del pago"
                rules={[
                  { required: true, message: 'Por favor ingrese el concepto del pago' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Ej: Pago de aporte académico gestión 2025..."
                  maxLength={500}
                  showCount
                  style={{ 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="observaciones"
                label={
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Observaciones
                  </span>
                }
                tooltip="Observaciones adicionales sobre el pago (opcional)"
              >
                <TextArea
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  maxLength={500}
                  showCount
                  style={{ 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Botones de acción */}
      <Divider style={{ margin: '32px 0 24px 0' }} />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '8px',
      }}>
        <Button
          variant="default"
          onClick={onCancel}
          size="large"
          style={{
            borderRadius: '8px',
            paddingLeft: '24px',
            paddingRight: '24px',
            height: '42px',
            fontWeight: 500,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => form?.submit()}
          icon={<SaveOutlined />}
          disabled={disabled}
          size="large"
          style={{
            borderRadius: '8px',
            paddingLeft: '32px',
            paddingRight: '32px',
            height: '42px',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
          }}
        >
          Registrar Pago
        </Button>
      </div>
    </Card>
  );
};

export default SelectedPaymentSection;
