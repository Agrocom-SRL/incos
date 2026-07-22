/**
 * Organismo: campos del pago de capacitación (CAP) — clon acotado de
 * `AbonoForm` (Finanzas), con el shape del backend CAP
 * (`registerPagoCapacitacionValidator`): monto, fechaPago, metodoPagoId,
 * cuentaPagoId (visible/requerida según método, reglas compartidas de
 * Finanzas) y observaciones. Sin comprobante/upload (no existen en CAP).
 *
 * Se monta DENTRO de un <Form layout="vertical"> del consumidor: lo usan la
 * página "Registrar pago" de la ficha (cuota adicional, `permiteCompromiso`
 * queda en `false`) y el paso "Pago inicial" del wizard de inscribir
 * (`permiteCompromiso` en `true`).
 *
 * Campo "Fecha de compromiso" (solo si `permiteCompromiso`): el pago inicial
 * de un curso con costo es OBLIGATORIO y ya no admite omitirse; si el monto
 * ingresado queda por debajo de `costoCurso` (pago parcial), aparece este
 * `DatePicker` — SIN selector de días ni cálculo automático de plazo (a
 * diferencia del compromiso de Aportes/Finanzas): la fecha la elige
 * directamente el usuario. Reactivo al valor de `monto` vía `shouldUpdate`.
 */

import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { formatBs } from '@application/utils/formatters';

const { TextArea } = Input;

const PagoCapacitacionFormFields = ({
  metodosPago = [],
  cuentasPago = [],
  loadingCatalogos = false,
  reglasMetodo,
  saldo = 0,
  onMetodoPagoChange,
  disabled = false,
  permiteCompromiso = false,
  costoCurso = null,
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
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Ingrese el monto del pago' },
              {
                validator: (_, value) => {
                  const monto = Number(value);
                  if (!Number.isFinite(monto) || monto <= 0) {
                    return Promise.reject(new Error('El monto debe ser mayor a 0'));
                  }
                  if (saldo > 0 && monto > Number(saldo)) {
                    return Promise.reject(
                      new Error(`El monto no puede superar el saldo pendiente (Bs ${formatBs(saldo)})`),
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
      </Row>

      {permiteCompromiso ? (
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.monto !== curr.monto}>
          {({ getFieldValue }) => {
            const monto = Number(getFieldValue('monto'));
            const quedaParcial =
              Number.isFinite(monto) && monto > 0 && costoCurso != null && monto < Number(costoCurso);
            if (!quedaParcial) return null;
            return (
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fechaCompromiso"
                    label="Fecha de compromiso de pago"
                    extra="El pago inicial no cubre el costo total del curso: elija hasta cuándo se compromete el participante a cancelar el saldo."
                    rules={[
                      { required: true, message: 'Seleccione la fecha de compromiso de pago' },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                      disabled={disabled}
                      disabledDate={(date) => !!date && date.isBefore(dayjs().startOf('day'))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            );
          }}
        </Form.Item>
      ) : null}
    </>
  );
};

export default PagoCapacitacionFormFields;
