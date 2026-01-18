/**
 * SelectedPaymentSection - Organism para la sección de pago seleccionado
 * 
 * Single Responsibility: Mostrar información del pago configurado y formulario completo
 * 
 * Atomic Design: Organism
 * - Combina molecules (PaymentAmountDisplay, PaymentMethodInfo, PaymentFormFields) y atoms (Card, Row, Col, Button, Space, Form, Divider)
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
import { Row, Col, Space, Form, Divider, Typography, Input } from 'antd';
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Card, Button } from '@atoms';
import { 
  PaymentAmountDisplay, 
  PaymentMethodInfo, 
  PaymentFormFields 
} from '../molecules';

const { Title } = Typography;

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
  
  // Verificar si hay beca aplicable (ACTIVA o PENDIENTE con porcentaje)
  // Para mostrar el descuento, aceptamos becas ACTIVA o PENDIENTE que tengan porcentaje
  const tieneBeca = becaActiva && (() => {
    const stateValue = becaActiva.state || becaActiva.estado;
    if (!stateValue) return false;
    
    const normalizedState = String(stateValue).toUpperCase();
    const tieneEstadoValido = normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
    const tienePorcentaje = becaActiva.scholarshipPercentage || becaActiva.porcentaje || becaActiva.scholarshipType?.percentage;
    
    return tieneEstadoValido && tienePorcentaje;
  })();
  
  // Obtener porcentaje de descuento (puede venir de diferentes campos)
  const porcentajeDescuento = tieneBeca ? (
    becaActiva.scholarshipPercentage || 
    becaActiva.porcentaje || 
    (becaActiva.scholarshipType?.percentage) ||
    0
  ) : 0;
  
  const descuentoBeca = tieneBeca ? (montoTotal * porcentajeDescuento / 100) : 0;
  const montoPagado = calcularMontoPagado(montoTotal, descuentoBeca);

  // Determinar características del método de pago
  const codigoMetodo = selectedMetodoPago?.codigo?.toUpperCase() || '';
  const esEfectivo = codigoMetodo === 'EFECTIVO';
  const esTransferencia = codigoMetodo === 'TRANSFERENCIA';
  const esQR = codigoMetodo === 'QR';
  const esDeposito = codigoMetodo === 'DEPOSITO';
  const esTigoMoney = codigoMetodo === 'TIGO_MONEY';
  
  // Métodos que requieren cuenta bancaria
  const requiereCuenta = codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'QR', 'TIGO_MONEY'].includes(codigoMetodo);
  
  // Métodos que requieren fecha de pago (todos excepto EFECTIVO)
  const requiereFechaPago = !esEfectivo;
  
  // Métodos que requieren documento de respaldo (todos excepto EFECTIVO)
  const requiereDocumentoRespaldo = !esEfectivo;
  
  // Métodos que requieren número de transacción (solo TRANSFERENCIA)
  const requiereNumeroTransaccion = esTransferencia;
  
  // Métodos que requieren código de comprobante (QR, TRANSFERENCIA)
  const requiereCodigoComprobante = esQR || esTransferencia;

  // Sincronizar descuento en el formulario cuando cambie la beca o configuración
  useEffect(() => {
    if (form) {
      form.setFieldsValue({ descuentoBeca: descuentoBeca });
    }
  }, [descuentoBeca, form]);

  // Limpiar campos cuando cambie el método de pago
  useEffect(() => {
    if (form) {
      // Limpiar campos específicos según el método
      if (esEfectivo) {
        form.setFieldsValue({ 
          fechaPago: undefined,
          numeroTransaccion: undefined,
          codigoComprobante: undefined,
          documentoRespaldo: undefined,
        });
      } else {
        // Para métodos que no son efectivo, establecer fecha por defecto
        if (!form.getFieldValue('fechaPago')) {
          form.setFieldsValue({ fechaPago: dayjs() });
        }
      }
    }
  }, [codigoMetodo, form, esEfectivo]);

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
      {/* Si el monto es 0 (gratis), solo mostrar el concepto */}
      {montoPagado === 0 ? (
        <div>
          <Title level={5} style={{ 
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#262626'
          }}>
            Concepto del Pago
          </Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              descuentoBeca: descuentoBeca,
            }}
          >
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
              <Input.TextArea
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
          </Form>
          
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
        </div>
      ) : (
        <>
          {/* Saldo a Pagar y Método de Pago lado a lado */}
          <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
            {/* Saldo a Pagar */}
            <Col xs={24} md={12}>
              <PaymentAmountDisplay
                montoPagado={montoPagado}
              />
            </Col>
            
            {/* Método de Pago */}
            <Col xs={24} md={12}>
              <PaymentMethodInfo
                selectedMetodoPago={selectedMetodoPago}
                selectedCuentaPago={selectedCuentaPago}
                requiereCuenta={requiereCuenta}
              />
            </Col>
          </Row>

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
                fechaPago: requiereFechaPago ? dayjs() : undefined,
                descuentoBeca: descuentoBeca,
              }}
            >
              <PaymentFormFields
                form={form}
                cuentasPagoData={cuentasPagoData}
                requiereFechaPago={requiereFechaPago}
                requiereCuenta={requiereCuenta}
                requiereNumeroTransaccion={requiereNumeroTransaccion}
                requiereCodigoComprobante={requiereCodigoComprobante}
                requiereDocumentoRespaldo={requiereDocumentoRespaldo}
                esQR={esQR}
              />
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
        </>
      )}
    </Card>
  );
};

export default SelectedPaymentSection;
