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
 * @param {Object} bancosAutorizadosData - Datos de bancos autorizados (opcional)
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 * @param {Function} onCancel - Callback cuando se cancela
 * @param {boolean} disabled - Si los botones están deshabilitados
 */

import { useEffect } from 'react';
import { Row, Col, Space, Form, Divider, Typography, Input, Tag } from 'antd';
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
  bancosAutorizadosData,
  becaActiva,
  montoCuota,
  form,
  onFinish,
  onCancel,
  disabled = false
}) => {
  // Si no hay configuración, no mostrar
  if (!selectedConfiguracion) return null;

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

  // Determinar si es pago gratuito real: solo cuando el monto obligatorio quedó en 0
  // (caso típico: el aporte quedó totalmente cubierto por beca/condonación)
  const esPagoGratuito = montoPagado === 0;

  // Siempre computar características del método (con valores por defecto si no hay método)
  // para poder llamar los hooks incondicionalmente y evitar "Expected static flag was missing"
  const codigoMetodo = selectedMetodoPago?.codigo?.toUpperCase() || '';
  const esEfectivo = codigoMetodo === 'EFECTIVO';
  const esTransferencia = codigoMetodo === 'TRANSFERENCIA';
  const esQR = codigoMetodo === 'QR';
  const esDeposito = codigoMetodo === 'DEPOSITO';
  const esTigoMoney = codigoMetodo === 'TIGO_MONEY';

  const requiereCuenta = !esPagoGratuito && codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'TIGO_MONEY'].includes(codigoMetodo);
  const requiereFechaPago = !esPagoGratuito;
  const mostrarDocumentoRespaldo = !esPagoGratuito && !esEfectivo;
  const mostrarNumeroTransaccion = !esPagoGratuito && (esTransferencia || esDeposito);
  const requiereCodigoComprobante = !esPagoGratuito && (esQR || esTransferencia || esDeposito);

  // Hooks siempre en el mismo orden (nunca después de un return condicional)
  useEffect(() => {
    if (form) {
      form.setFieldsValue({ descuentoBeca: descuentoBeca });
    }
  }, [descuentoBeca, form]);

  useEffect(() => {
    if (form && !esPagoGratuito && selectedMetodoPago) {
      if (esEfectivo) {
        form.setFieldsValue({
          fechaPago: undefined,
          numeroTransaccion: undefined,
          codigoComprobante: undefined,
          documentoRespaldo: undefined,
        });
      } else {
        if (!form.getFieldValue('fechaPago')) {
          form.setFieldsValue({ fechaPago: dayjs() });
        }
      }
    }
  }, [codigoMetodo, form, esEfectivo, esPagoGratuito, selectedMetodoPago]);

  useEffect(() => {
    if (form && requiereFechaPago) {
      const actual = form.getFieldValue('fechaPago');
      if (!actual) {
        form.setFieldsValue({ fechaPago: dayjs() });
      }
    }
  }, [form, requiereFechaPago]);

  // El padre solo renderiza este componente cuando esPagoGratuito || selectedMetodoPago
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
      {montoPagado === 0 ? (
        <div>
          {/* Label de Pago Gratuito */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag
              color="success"
              style={{
                fontSize: '20px',
                padding: '4px 12px',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              Pago Gratuito
            </Tag>
          </div>

          {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
          <Form.Item
            name="descripcion"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                Observación
              </span>
            }
            tooltip="Observación del pago: plazo, datos adicionales (opcional)"
            required={false}
            rules={[
              // Validar longitud solo si se proporciona un valor
              {
                validator: (_, value) => {
                  if (!value || value.trim().length === 0) {
                    return Promise.resolve(); // Permitir vacío
                  }
                  if (value.trim().length > 500) {
                    return Promise.reject('La observación no puede exceder 500 caracteres');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ej: Plazo de entrega, datos adicionales... (opcional)"
              maxLength={500}
              showCount
              style={{
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </Form.Item>

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
              loading={disabled}
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
              {disabled ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Saldo a Pagar y Método de Pago lado a lado */}
          <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
            {/* Saldo a Pagar: monto de esta cuota (el que ingresó el usuario en Detalle del Aporte) */}
            <Col xs={24} md={12}>
              <PaymentAmountDisplay
                montoPagado={montoCuota != null && montoCuota !== '' ? Number(montoCuota) : montoPagado}
              />
            </Col>

            {/* Método de Pago */}
            <Col xs={24} md={12}>
              <PaymentMethodInfo
                selectedMetodoPago={selectedMetodoPago}
                selectedCuentaPago={selectedCuentaPago}
                requiereCuenta={requiereCuenta}
                esTransferencia={esTransferencia}
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
            {/* No usar Form aquí: ya estamos dentro del Form del padre; solo contenido para no anidar <form> */}
            <PaymentFormFields
              form={form}
              cuentasPagoData={cuentasPagoData}
              bancosAutorizadosData={bancosAutorizadosData}
              requiereFechaPago={requiereFechaPago}
              requiereCuenta={requiereCuenta}
              requiereNumeroTransaccion={mostrarNumeroTransaccion}
              requiereCodigoComprobante={requiereCodigoComprobante}
              requiereDocumentoRespaldo={mostrarDocumentoRespaldo}
              esQR={esQR}
            />
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
              loading={disabled}
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
              {disabled ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default SelectedPaymentSection;
