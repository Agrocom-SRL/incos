/**
 * Organismo: formulario de abono de aporte (Finanzas) — campos condicionales por método.
 *
 * Recibe props ya mapeadas y reglas derivadas (no llama hooks de fetch). El método de
 * pago gobierna la visibilidad/obligatoriedad de cuenta, código de comprobante, número
 * de transacción y comprobante de respaldo, replicando funcionalmente el validator del
 * backend (`registerPagoAporteValidator`).
 *
 * Si el abono deja SALDO PENDIENTE, el formulario ofrece capturar una "Fecha de
 * compromiso de pago" (opcional) que se persiste en el compromiso del aporte (no en
 * observaciones). El hook de pantalla decide si la envía según el saldo resultante.
 *
 * Validación con AntD6 (Form rules), Alert `title`, Upload AntD6 para el comprobante.
 */

import { Alert, Col, DatePicker, Form, Input, InputNumber, Row, Select, Upload } from 'antd';
import { InboxOutlined, SaveOutlined } from '@ant-design/icons';
import { ActionButton, Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import {
  COMPROBANTE_ACCEPT,
  COMPROBANTE_MAX_MB,
  buildMontoRules,
  formatBolivianos,
  normFileFromUpload,
} from '@finanzas/pagos/config/registrarFormConfig';

const { Dragger } = Upload;
const { TextArea } = Input;

const AbonoForm = ({
  form,
  metodosPago = [],
  cuentasPago = [],
  loadingCatalogos = false,
  metodoPagoId,
  reglasMetodo,
  saldoPendiente = 0,
  onMetodoPagoChange,
  onFinish,
  onCancel,
  submitting = false,
}) => {
  const metodoOptions = metodosPago.map((metodo) => ({ value: metodo.id, label: metodo.nombre }));
  const cuentaOptions = cuentasPago.map((cuenta) => ({ value: cuenta.id, label: cuenta.label }));

  /** El comprobante no se sube hasta enviar el formulario (lo gestiona el repositorio). */
  const beforeUpload = () => false;

  // Saldo que quedaría tras el abono: si > 0, la fecha de compromiso es relevante.
  const montoAbono = Form.useWatch('monto', form);
  const montoNumerico = Number(montoAbono);
  const saldoResultante =
    saldoPendiente > 0 && Number.isFinite(montoNumerico)
      ? Math.max(saldoPendiente - montoNumerico, 0)
      : saldoPendiente;
  const dejaSaldoPendiente = saldoResultante > 0;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={[24, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="monto"
            label="Monto del abono"
            extra={
              saldoPendiente > 0
                ? `Saldo pendiente: ${formatBolivianos(saldoPendiente)}`
                : 'El aporte no tiene saldo pendiente'
            }
            rules={buildMontoRules(saldoPendiente)}
          >
            <InputNumber
              size="large"
              min={0}
              max={saldoPendiente > 0 ? saldoPendiente : undefined}
              step={1}
              prefix="Bs"
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaPago"
            label="Fecha de pago"
            rules={[{ required: true, message: 'Seleccione la fecha del pago' }]}
          >
            <DatePicker size="large" format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="metodoPagoId"
            label="Método de pago"
            rules={[{ required: true, message: 'Seleccione un método de pago' }]}
          >
            <Select
              size="large"
              loading={loadingCatalogos}
              placeholder="Seleccione un método de pago"
              options={metodoOptions}
              onChange={onMetodoPagoChange}
            />
          </Form.Item>
        </Col>

        {reglasMetodo?.cuentaVisible ? (
          <Col xs={24} sm={12}>
            <Form.Item
              name="cuentaPagoId"
              label="Cuenta de pago"
              rules={[
                {
                  required: reglasMetodo.cuentaRequerida,
                  message: 'Seleccione la cuenta de pago',
                },
              ]}
            >
              <Select
                size="large"
                loading={loadingCatalogos}
                placeholder="Seleccione una cuenta de pago"
                options={cuentaOptions}
                allowClear={!reglasMetodo.cuentaRequerida}
              />
            </Form.Item>
          </Col>
        ) : null}

        {reglasMetodo?.comprobanteVisible ? (
          <Col xs={24} sm={12}>
            <Form.Item
              name="codigoComprobante"
              label="Código de comprobante"
              rules={[
                {
                  required: reglasMetodo.comprobanteRequerido,
                  message: 'Ingrese el código del comprobante',
                },
              ]}
            >
              <Input size="large" placeholder="Código del comprobante" />
            </Form.Item>
          </Col>
        ) : null}

        {metodoPagoId && !reglasMetodo?.esEfectivo ? (
          <Col xs={24} sm={12}>
            <Form.Item name="numeroTransaccion" label="Número de transacción (opcional)">
              <Input size="large" placeholder="N.° de transacción" />
            </Form.Item>
          </Col>
        ) : null}

        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaCompromiso"
            label="Fecha de compromiso de pago (opcional)"
            extra={
              dejaSaldoPendiente
                ? `Quedará un saldo de ${formatBolivianos(saldoResultante)}. Indique la fecha en que se regularizará.`
                : 'Solo aplica si el abono deja saldo pendiente.'
            }
          >
            <DatePicker
              size="large"
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Fecha de regularización"
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item name="descripcion" label="Observación (opcional)">
            <TextArea rows={2} maxLength={500} showCount placeholder="Detalle adicional del pago" />
          </Form.Item>
        </Col>

        {metodoPagoId && !reglasMetodo?.esEfectivo ? (
          <Col xs={24}>
            <Form.Item
              name="documentoRespaldo"
              label="Comprobante de respaldo (opcional)"
              valuePropName="fileList"
              getValueFromEvent={normFileFromUpload}
            >
              <Dragger
                accept={COMPROBANTE_ACCEPT}
                multiple={false}
                maxCount={1}
                beforeUpload={beforeUpload}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Haga clic o arrastre el comprobante aquí</p>
                <p className="ant-upload-hint">
                  PDF o imagen (JPG/PNG), hasta {COMPROBANTE_MAX_MB} MB.
                </p>
              </Dragger>
            </Form.Item>
          </Col>
        ) : null}
      </Row>

      {!metodoPagoId ? (
        <Alert
          type="info"
          showIcon
          title="Seleccione un método de pago"
          description="Los campos del comprobante se ajustan según el método elegido."
          style={{ marginTop: allSpacing.marginSM }}
        />
      ) : null}

      <div className="cfg-academico-form-workspace__footer">
        <Row gutter={[12, 12]} justify="end">
          <Col>
            <Button variant="back" onClick={onCancel}>
              Cancelar
            </Button>
          </Col>
          <Col>
            <ActionButton
              permiso={FINANZAS_PERMISOS.pagoRegistrar}
              accion="CREAR"
              variant="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={submitting}
            >
              Registrar pago
            </ActionButton>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default AbonoForm;
