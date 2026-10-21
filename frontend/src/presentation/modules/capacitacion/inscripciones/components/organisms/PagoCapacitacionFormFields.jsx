/**
 * Organismo: campos del pago de capacitación (CAP) — clon acotado de
 * `AbonoForm` (Finanzas), con el shape del backend CAP
 * (`registerPagoCapacitacionValidator`): concepto (MATRICULA | CURSO), monto,
 * fechaPago, metodoPagoId, cuentaPagoId (visible/requerida según método,
 * reglas compartidas de Finanzas), observaciones y comprobante OPCIONAL.
 *
 * Se monta DENTRO de un <Form layout="vertical"> del consumidor: lo usan la
 * página "Registrar pago" de la ficha (con comprobante) y el paso "Pago
 * inicial" del wizard de inscribir (`permiteComprobante` en `false`: el
 * comprobante se adjunta después desde la ficha).
 *
 * `conceptoOptions` limita los conceptos ofrecidos a los que se cobran.
 * El sobrepago se valida contra el saldo DEL CONCEPTO elegido
 * (`saldosPorConcepto`); matrícula (instituto) y curso (entidad certificadora)
 * se saldan por separado.
 */

import { Col, DatePicker, Form, Input, InputNumber, Row, Select, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatBs } from '@application/utils/formatters';
import {
  COMPROBANTE_ACCEPT,
  COMPROBANTE_MAX_MB,
  normFileFromUpload,
} from '@finanzas/pagos/config/registrarFormConfig';
import { CONCEPTO_PAGO_OPTIONS } from '@application-capacitacion/utils/capacitacionCatalogos';

const { TextArea } = Input;
const { Dragger } = Upload;

/** El archivo no se sube hasta enviar el formulario (lo gestiona el repositorio). */
const beforeUpload = () => false;

const PagoCapacitacionFormFields = ({
  metodosPago = [],
  cuentasPago = [],
  loadingCatalogos = false,
  reglasMetodo,
  saldosPorConcepto = {},
  conceptoOptions = CONCEPTO_PAGO_OPTIONS,
  onMetodoPagoChange,
  disabled = false,
  permiteComprobante = false,
}) => {
  const metodoOptions = metodosPago.map((metodo) => ({ value: metodo.id, label: metodo.nombre }));
  const cuentaOptions = cuentasPago.map((cuenta) => ({ value: cuenta.id, label: cuenta.label }));

  return (
    <>
      <Row gutter={[24, 0]}>
        <Col xs={24}>
          <Form.Item
            name="concepto"
            label="Concepto del pago"
            rules={[{ required: true, message: 'Seleccione el concepto del pago' }]}
          >
            <Select options={conceptoOptions} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.concepto !== curr.concepto}>
            {({ getFieldValue }) => {
              const saldo = Number(saldosPorConcepto[getFieldValue('concepto')] ?? 0);
              return (
                <Form.Item
                  name="monto"
                  label="Monto del pago"
                  extra={saldo > 0 ? `Saldo pendiente del concepto: Bs ${formatBs(saldo)}` : undefined}
                  dependencies={['concepto']}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Ingrese el monto del pago' },
                    {
                      validator: (_, value) => {
                        const monto = Number(value);
                        if (!Number.isFinite(monto) || monto <= 0) {
                          return Promise.reject(new Error('El monto debe ser mayor a 0'));
                        }
                        if (saldo > 0 && monto > saldo) {
                          return Promise.reject(
                            new Error(
                              `El monto no puede superar el saldo pendiente (Bs ${formatBs(saldo)})`,
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={1}
                    prefix="Bs"
                    style={{ width: '100%' }}
                    placeholder="0"
                    disabled={disabled}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaPago"
            label="Fecha de pago"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Seleccione la fecha del pago' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="metodoPagoId"
            label="Método de pago"
            rules={[{ required: true, message: 'Seleccione un método de pago' }]}
          >
            <Select
              loading={loadingCatalogos}
              placeholder="Seleccione un método de pago"
              options={metodoOptions}
              onChange={onMetodoPagoChange}
              disabled={disabled}
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
                loading={loadingCatalogos}
                placeholder="Seleccione una cuenta de pago"
                options={cuentaOptions}
                allowClear={!reglasMetodo.cuentaRequerida}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        ) : null}

        <Col xs={24}>
          <Form.Item name="observaciones" label="Observaciones (opcional)">
            <TextArea
              rows={2}
              maxLength={2000}
              showCount
              placeholder="Detalle adicional del pago"
              disabled={disabled}
            />
          </Form.Item>
        </Col>

        {permiteComprobante ? (
          <Col xs={24}>
            <Form.Item
              name="comprobante"
              label="Comprobante de depósito (opcional)"
              valuePropName="fileList"
              getValueFromEvent={normFileFromUpload}
            >
              <Dragger
                accept={COMPROBANTE_ACCEPT}
                multiple={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                disabled={disabled}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Haga clic o arrastre el comprobante aquí</p>
                <p className="ant-upload-hint">
                  PDF o imagen (JPG/PNG), hasta {COMPROBANTE_MAX_MB} MB. También puede adjuntarlo después.
                </p>
              </Dragger>
            </Form.Item>
          </Col>
        ) : null}
      </Row>
    </>
  );
};

export default PagoCapacitacionFormFields;
