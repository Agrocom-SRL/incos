/**
 * Modal: transición de etapa del proyecto de grado (TUT · T11, proyecto·APROBAR).
 *
 * El select solo ofrece los estados destino válidos desde el estado actual
 * (TRANSICIONES_PROYECTO — el backend valida igual). Cuando corresponde
 * (aprobación final), el backend emite el informe de viabilidad técnica.
 */

import { useEffect, useMemo } from 'react';
import { Empty, Form, Input, Modal, Select } from 'antd';
import {
  formatEstadoProyecto,
} from '@application-titulacion/utils/titulacionPills';

const AprobarEtapaModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  transiciones = [],
  estadoActual = null,
}) => {
  const [form] = Form.useForm();

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

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      estado: values.estado,
      observaciones: (values.observaciones || '').trim() || undefined,
    });
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
      okButtonProps={{ disabled: sinTransiciones }}
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
