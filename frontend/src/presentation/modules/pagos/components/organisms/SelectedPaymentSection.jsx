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
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 * @param {Function} onCancel - Callback cuando se cancela
 * @param {boolean} disabled - Si los botones están deshabilitados
 */

import { Row, Col, Space, Form, Input, DatePicker, Select } from 'antd';
import { 
  DollarOutlined, 
  CalendarOutlined, 
  CreditCardOutlined,
  FileTextOutlined,
  BankOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Card, Button } from '@atoms';
import { SelectedPaymentInfoItem } from '../molecules';

const { TextArea } = Input;

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
  form,
  onFinish,
  onCancel,
  disabled = false
}) => {
  // Si no hay configuración o método de pago seleccionado, no mostrar
  if (!selectedConfiguracion || !selectedMetodoPago) return null;

  // Obtener valores del formulario para cálculos
  const formValues = form?.getFieldsValue() || {};
  const descuentoBeca = Number(formValues.descuentoBeca) || 0;
  const montoTotal = Number(selectedConfiguracion.montoBase) || 0;
  const montoPagado = calcularMontoPagado(montoTotal, descuentoBeca);

  // Determinar si el método de pago requiere cuenta (TRANSFERENCIA, DEPOSITO, QR, TIGO_MONEY)
  const requiereCuenta = ['TRANSFERENCIA', 'DEPOSITO', 'QR', 'TIGO_MONEY'].includes(selectedMetodoPago.codigo);

  return (
    <Card
      title="Detalles del Pago"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {/* Información del pago configurado */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <SelectedPaymentInfoItem
            icon={<DollarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Monto Base"
            value={formatMonto(selectedConfiguracion.montoBase)}
            valueColor="var(--color-primary-hover, #196b45)"
            valueFontSize="20px"
          />
        </Col>
        {descuentoBeca > 0 && (
          <Col xs={24} sm={12}>
            <SelectedPaymentInfoItem
              icon={<DollarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              label="Descuento por Beca"
              value={formatMonto(descuentoBeca)}
              valueColor="var(--color-success, #399f53)"
              valueFontSize="20px"
            />
          </Col>
        )}
        <Col xs={24} sm={12}>
          <SelectedPaymentInfoItem
            icon={<DollarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Monto a Pagar"
            value={formatMonto(montoPagado)}
            valueColor="var(--color-warning, #f59e0b)"
            valueFontSize="24px"
          />
        </Col>
        <Col xs={24} sm={12}>
          <SelectedPaymentInfoItem
            icon={<CreditCardOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Método de Pago"
            value={selectedMetodoPago.nombre}
          />
        </Col>
        {requiereCuenta && selectedCuentaPago && (
          <Col xs={24} sm={12}>
            <SelectedPaymentInfoItem
              icon={<BankOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              label="Cuenta de Pago"
              value={selectedCuentaPago.nombre || selectedCuentaPago.numeroCuenta || 'N/A'}
            />
          </Col>
        )}
      </Row>

      {/* Formulario para completar el pago */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--color-border-secondary, #e8e8e8)' 
      }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            fechaPago: dayjs(),
            descuentoBeca: 0,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fechaPago"
                label="Fecha de Pago"
                rules={[
                  { required: true, message: 'Por favor seleccione la fecha de pago' }
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccione la fecha"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            {requiereCuenta && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="cuentaPagoId"
                  label="Cuenta de Pago"
                  rules={[
                    { required: requiereCuenta, message: 'Por favor seleccione una cuenta de pago' }
                  ]}
                >
                  <Select
                    placeholder="Seleccione una cuenta de pago"
                    loading={cuentasPagoData.loading}
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="descuentoBeca"
                label="Descuento por Beca (Bs.)"
                tooltip="Si el estudiante tiene beca, ingrese el monto del descuento"
              >
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  prefix={<DollarOutlined />}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor !== '') {
                      form.setFieldsValue({ descuentoBeca: parseFloat(valor) || 0 });
                      form.validateFields(['descuentoBeca']);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="numeroTransaccion"
                label="Número de Transacción/Código"
                tooltip="Ingrese el número de transacción, código de transferencia, o código QR"
                rules={[
                  { required: requiereCuenta, message: 'Por favor ingrese el número de transacción' }
                ]}
              >
                <Input
                  placeholder="Número de transacción o código"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="concepto"
                label="Concepto"
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
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="observaciones"
                label="Observaciones"
                tooltip="Observaciones adicionales sobre el pago (opcional)"
              >
                <TextArea
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Botones de acción */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border-secondary, #e8e8e8)' }}>
        <Space size="large">
          <Button
            variant="primary"
            onClick={() => form?.submit()}
            icon={<SaveOutlined />}
            disabled={disabled}
          >
            Registrar Pago
          </Button>
          <Button
            variant="default"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default SelectedPaymentSection;
