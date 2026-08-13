/**
 * SelectedPaymentSection - Organism para la sección de pago seleccionado
 *
 * Single Responsibility: Mostrar información del pago configurado y formulario completo
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro del workspace de formulario (`CfgFormWorkspace`):
 *   la tarjeta, el título y la descripción los pone la sección del workspace
 *   en la página — aquí no va ninguna `Card` anidada.
 * - Los botones Cancelar / Registrar pago viven en el footer del workspace (página), no aquí.
 * - Combina molecules (PaymentAmountDisplay, PaymentMethodInfo, PaymentFormFields).
 *
 * @param {Object} selectedConfiguracion - Configuración de aporte seleccionada
 * @param {Object} selectedMetodoPago - Método de pago seleccionado
 * @param {Object} selectedCuentaPago - Cuenta de pago seleccionada (opcional, según método)
 * @param {Object} cuentasPagoData - Datos de cuentas de pago para el select
 * @param {Object} bancosAutorizadosData - Datos de bancos autorizados (opcional)
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {number|string} montoCuota - Monto de esta cuota (lo que ingresó el usuario en Detalle del Aporte)
 * @param {Object} form - Instancia del formulario de Ant Design
 */

import { useEffect } from 'react';
import { Row, Col, Flex, Form, Divider, Typography, Input, Tag } from 'antd';
import dayjs from 'dayjs';
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
  form
}) => {
  // Calcular descuento automáticamente basado en beca activa
  const montoTotal = Number(selectedConfiguracion?.montoBase) || 0;

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
        // EFECTIVO no usa cuenta/comprobante/transacción, pero sí requiere fecha de pago.
        form.setFieldsValue({
          numeroTransaccion: undefined,
          codigoComprobante: undefined,
          documentoRespaldo: undefined,
        });
      }
      if (!form.getFieldValue('fechaPago')) {
        form.setFieldsValue({ fechaPago: dayjs() });
      }
    }
  }, [codigoMetodo, form, esEfectivo, esPagoGratuito, selectedMetodoPago]);

  // Si no hay configuración, no mostrar (el early return va DESPUÉS de los hooks:
  // deben llamarse siempre en el mismo orden en cada render)
  if (!selectedConfiguracion) return null;

  // El padre solo renderiza este componente cuando esPagoGratuito || selectedMetodoPago
  if (montoPagado === 0) {
    return (
      <Flex vertical gap="middle">
        {/* Etiqueta de pago gratuito (aporte cubierto por beca/condonación) */}
        <div>
          <Tag color="success">Pago gratuito</Tag>
        </div>

        {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
        <Form.Item
          name="descripcion"
          label="Observación"
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
          />
        </Form.Item>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="middle">
      {/* Saldo a Pagar y Método de Pago lado a lado */}
      <Row gutter={[24, 16]}>
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

      <Divider style={{ margin: 0 }} />

      {/* Formulario para completar el pago */}
      <div>
        <Title level={5}>Completar información del pago</Title>
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
    </Flex>
  );
};

export default SelectedPaymentSection;
