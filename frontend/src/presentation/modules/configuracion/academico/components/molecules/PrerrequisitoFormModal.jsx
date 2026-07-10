/**
 * Molécula: alta de prerrequisito — "<asignatura> requiere haber cursado <prerrequisito>".
 * La asignatura de origen llega fija desde la fila seleccionada; solo se elige
 * el prerrequisito entre el resto de asignaturas del plan (ya excluidas las
 * que generarían un par duplicado). Fallback sin drag del Flujo B del builder
 * (`PlanPeriodoAsignaturasPage`, `PlanBuilderPrerrequisitoSlot`).
 */

import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';

const PrerrequisitoFormModal = ({
  open,
  loading = false,
  asignaturaLabel,
  opcionesPrerrequisito = [],
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ prerrequisitoId: undefined });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onSubmit({ prerrequisitoId: Number(values.prerrequisitoId) });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title="Agregar prerrequisito"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Agregar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Asignatura">
          <Input value={asignaturaLabel} disabled />
        </Form.Item>
        <Form.Item
          name="prerrequisitoId"
          label="Requiere haber cursado"
          rules={[{ required: true, message: 'Seleccione la asignatura prerrequisito' }]}
        >
          <Select
            showSearch
            placeholder="Seleccione la asignatura prerrequisito"
            optionFilterProp="label"
            options={opcionesPrerrequisito.map((a) => ({
              value: a.id,
              label: a.sigla ? `${a.sigla} — ${a.nombre} (${a.periodoNombre})` : a.nombre,
            }))}
            notFoundContent="No hay asignaturas disponibles"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PrerrequisitoFormModal;
