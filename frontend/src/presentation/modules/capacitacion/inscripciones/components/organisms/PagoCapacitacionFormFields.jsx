/**
 * Organismo: campos del pago de capacitación (CAP) — clon acotado de
 * `AbonoForm` (Finanzas), con el shape del backend CAP
 * (`registerPagoCapacitacionValidator`): monto, fechaPago, metodoPagoId,
 * cuentaPagoId (visible/requerida según método, reglas compartidas de
 * Finanzas) y observaciones. Sin comprobante/upload (no existen en CAP).
 *
 * Se monta DENTRO de un <Form layout="vertical"> del consumidor: lo usan el
 * modal "Registrar pago" de la ficha y el paso "pago inicial" de inscribir.
 */

import { Alert, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import { formatBs } from '@application/utils/formatters';
import { allSpacing } from '@theme/tokens';

const { TextArea } = Input;

const PagoCapacitacionFormFields = ({
  metodosPago = [],
  cuentasPago = [],
  loadingCatalogos = false,
  metodoPagoId,
  reglasMetodo,
  saldo = 0,
  onMetodoPagoChange,
  disabled = false,
}) => {
  const metodoOptions = metodosPago.map((metodo) => ({ value: metodo.id, label: metodo.nombre }));
  const cuentaOptions = cuentasPago.map((cuenta) => ({ value: cuenta.id, label: cuenta.label }));

  return (
    <>
      <Row gutter={[24, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="monto"
            label="Monto del pago"
            extra={saldo > 0 ? `Saldo pendiente: Bs ${formatBs(saldo)}` : undefined}
            rules={[
              { required: true, message: 'Ingrese el monto del pago' },
              {
                validator: (_, value) => {
                  const monto = Number(value);
                  if (!Number.isFinite(monto) || monto <= 0) {
                    return Promise.reject(new Error('El monto debe ser mayor a 0'));
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
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaPago"
            label="Fecha de pago"
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
      </Row>

      {!metodoPagoId ? (
        <Alert
          type="info"
          showIcon
          title="Seleccione un método de pago"
          description="La cuenta de pago se habilita según el método elegido."
          style={{ marginBottom: allSpacing.marginSM }}
        />
      ) : null}
    </>
  );
};

export default PagoCapacitacionFormFields;
