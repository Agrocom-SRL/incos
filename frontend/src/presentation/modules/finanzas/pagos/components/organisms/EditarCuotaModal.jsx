/**
 * Organismo: modal de edición de una cuota de pago (ficha — módulo Finanzas).
 *
 * Modal AntD6 (`open`) con un Form precargado con los valores de la cuota. Los campos
 * condicionales por método (cuenta, código de comprobante, número de transacción)
 * reutilizan las MISMAS reglas que el formulario de registro (`buildReglasMetodo` de
 * `registrarFormConfig`), por lo que ambos formularios derivan visibilidad/obligatoriedad
 * de una sola fuente. Espeja FUNCIONALMENTE el validator del backend
 * (`updatePaymentCuotaValidator`).
 *
 * Recibe props ya mapeadas (catálogos, cuota seleccionada, handlers); no llama hooks de
 * fetch. La orquestación (refetch de la ficha, feedback) vive en `usePagosDetailPage`.
 */

import { useEffect, useMemo } from 'react';
import { Alert, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { modalWidths } from '@theme/tokens/spacing';
import { buildReglasMetodo, findMetodoCodigo } from '@finanzas/pagos/config/registrarFormConfig';

const { TextArea } = Input;

/** Reglas (Form rules) del monto en edición: requerido y mayor o igual a 0. */
const MONTO_RULES = [
  { required: true, message: 'Ingrese el monto de la cuota' },
  {
    validator: (_, value) => {
      const monto = Number(value);
      if (!Number.isFinite(monto) || monto < 0) {
        return Promise.reject(new Error('El monto debe ser mayor o igual a 0'));
      }
      return Promise.resolve();
    },
  },
];

const EditarCuotaModal = ({
  open,
  cuota,
  metodosPago = [],
  cuentasPago = [],
  loadingCatalogos = false,
  guardando = false,
  onGuardar,
  onCancelar,
}) => {
  const [form] = Form.useForm();
  // El método seleccionado se observa del propio formulario (sin estado duplicado):
  // así la visibilidad/obligatoriedad de los campos condicionales es reactiva.
  const metodoPagoId = Form.useWatch('metodoPagoId', form);

  const metodoOptions = useMemo(
    () => metodosPago.map((metodo) => ({ value: metodo.id, label: metodo.nombre })),
    [metodosPago],
  );
  const cuentaOptions = useMemo(
    () => cuentasPago.map((cuenta) => ({ value: cuenta.id, label: cuenta.label })),
    [cuentasPago],
  );

  // Precarga el formulario con los valores de la cuota cada vez que se abre el modal.
  useEffect(() => {
    if (!open || !cuota) return;
    const valores = {
      monto: Number(cuota.monto) || 0,
      fechaPago: cuota.fechaPago ? dayjs(cuota.fechaPago) : null,
      metodoPagoId: cuota.metodoPagoId ?? null,
      cuentaPagoId: cuota.cuentaPagoId ?? undefined,
      codigoComprobante: cuota.codigoComprobante ?? undefined,
      numeroTransaccion: cuota.numeroTransaccion ?? undefined,
      descripcion: cuota.descripcion ?? undefined,
    };
    form.setFieldsValue(valores);
  }, [open, cuota, form]);

  const metodoCodigo = useMemo(
    () => findMetodoCodigo(metodosPago, metodoPagoId),
    [metodosPago, metodoPagoId],
  );
  const reglasMetodo = useMemo(() => buildReglasMetodo(metodoCodigo), [metodoCodigo]);

  /** Al cambiar de método, limpia campos que dejan de aplicar (espejo del registro). */
  const handleMetodoPagoChange = () => {
    form.setFieldsValue({
      cuentaPagoId: undefined,
      codigoComprobante: undefined,
      numeroTransaccion: undefined,
    });
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      open={open}
      title={`Editar cuota${cuota?.numeroRecibo ? ` · Recibo ${cuota.numeroRecibo}` : ''}`}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={guardando}
      destroyOnHidden
      maskClosable={!guardando}
      width={modalWidths.modalWidthLG}
    >
      <Form form={form} layout="vertical" onFinish={onGuardar}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="monto" label="Monto de la cuota" rules={MONTO_RULES}>
              <InputNumber
                size="large"
                min={0}
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
                onChange={handleMetodoPagoChange}
              />
            </Form.Item>
          </Col>

          {reglasMetodo.cuentaVisible ? (
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

          {reglasMetodo.comprobanteVisible ? (
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

          {metodoPagoId && !reglasMetodo.esEfectivo ? (
            <Col xs={24} sm={12}>
              <Form.Item name="numeroTransaccion" label="Número de transacción (opcional)">
                <Input size="large" placeholder="N.° de transacción" />
              </Form.Item>
            </Col>
          ) : null}

          <Col xs={24}>
            <Form.Item name="descripcion" label="Observación (opcional)">
              <TextArea
                rows={2}
                maxLength={500}
                showCount
                placeholder="Detalle adicional del pago"
              />
            </Form.Item>
          </Col>
        </Row>

        {!metodoPagoId ? (
          <Alert
            type="info"
            showIcon
            title="Seleccione un método de pago"
            description="Los campos del comprobante se ajustan según el método elegido."
          />
        ) : null}
      </Form>
    </Modal>
  );
};

export default EditarCuotaModal;
