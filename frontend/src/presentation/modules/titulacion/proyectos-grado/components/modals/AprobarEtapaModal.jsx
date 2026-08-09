/**
 * Modal: transición de etapa del proyecto de grado (TIT · T11, proyecto·APROBAR).
 *
 * El select solo ofrece los estados destino válidos desde el estado actual
 * (TRANSICIONES_PROYECTO — el backend valida igual). A diferencia del diseño
 * original, ahora muestra bajo el select QUÉ va a pasar al confirmar cada
 * opción (patrón ya usado por `RegistrarActaDefensaModal` — antes solo vivía
 * ahí, se generalizó a este modal por pedido explícito del usuario: "entrar
 * a un modal sin saber qué hace al cambiar la etapa es confuso"). El destino
 * `CANCELADO` es irreversible (sin transiciones de salida) — exige una
 * confirmación adicional antes de registrar (regla A5: `Modal.confirm` solo
 * para cancelar/anular).
 */

import { useEffect, useMemo } from 'react';
import { App, Empty, Form, Input, Modal, Select, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  formatEstadoProyecto,
  formatExplicacionTransicionProyecto,
  ESTADOS_TRANSICION_PROYECTO_IRREVERSIBLES,
} from '@application-titulacion/utils/titulacionPills';

const { Paragraph } = Typography;

const AprobarEtapaModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  transiciones = [],
  estadoActual = null,
}) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const estadoSeleccionado = Form.useWatch('estado', form);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const opciones = useMemo(
    () => transiciones.map((estado) => ({ value: estado, label: formatEstadoProyecto(estado) })),
    [transiciones],
  );

  const sinTransiciones = opciones.length === 0;
  const explicacion = formatExplicacionTransicionProyecto(estadoSeleccionado);
  const esIrreversible = ESTADOS_TRANSICION_PROYECTO_IRREVERSIBLES.includes(estadoSeleccionado);

  const registrar = async (values) => {
    await onSubmit({
      estado: values.estado,
      observaciones: (values.observaciones || '').trim() || undefined,
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (ESTADOS_TRANSICION_PROYECTO_IRREVERSIBLES.includes(values.estado)) {
      modal.confirm({
        title: `¿Confirma cancelar el proyecto?`,
        icon: <ExclamationCircleOutlined />,
        content: formatExplicacionTransicionProyecto(values.estado),
        okText: 'Sí, cancelar proyecto',
        okButtonProps: { danger: true },
        cancelText: 'Volver',
        onOk: () => registrar(values),
      });
      return;
    }
    await registrar(values);
  };

  return (
    <Modal
      title="Aprobar etapa del proyecto"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Registrar transición"
      cancelText="Volver"
      confirmLoading={saving}
      okButtonProps={{ disabled: sinTransiciones, danger: esIrreversible }}
      destroyOnHidden
    >
      {sinTransiciones ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`El proyecto se encuentra en estado «${formatEstadoProyecto(estadoActual)}» y no admite más transiciones.`}
        />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item label="Estado actual">
            <Input value={formatEstadoProyecto(estadoActual)} disabled />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Nuevo estado"
            rules={[{ required: true, message: 'Seleccione el estado destino' }]}
          >
            <Select options={opciones} placeholder="Seleccione el estado destino" />
          </Form.Item>
          {explicacion ? (
            <Paragraph type={esIrreversible ? 'danger' : 'secondary'} style={{ marginTop: -8 }}>
              {explicacion}
            </Paragraph>
          ) : null}
          <Form.Item name="observaciones" label="Observaciones (opcional)">
            <Input.TextArea
              rows={3}
              maxLength={2000}
              placeholder="Registre observaciones de la transición si corresponde"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default AprobarEtapaModal;
