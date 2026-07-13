/**
 * Molécula: edición de horas semanales/modalidad de una asignatura ya
 * colocada en un periodo. La materia queda fija (mismo límite que
 * `UpdateAsignaturaPlanUseCase`, que no permite reasignar materia); las horas
 * ya son editables en línea desde la fila del builder — este modal cubre el
 * ajuste de `modalidad` y sirve de respaldo para las horas.
 */

import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';

const AsignaturaPlanFormModal = ({ open, loading = false, initialValues, materiaLabel, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        horasSemanales: initialValues?.horasSemanales ?? undefined,
        modalidad: initialValues?.modalidad ?? '',
      });
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onSubmit({
      horas_semanales: Number(values.horasSemanales),
      modalidad: values.modalidad?.trim() || undefined,
    });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title="Editar asignatura del periodo"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Materia">
          <Input value={materiaLabel} disabled />
        </Form.Item>
        <Form.Item
          name="horasSemanales"
          label="Horas semanales"
          rules={[{ required: true, message: 'Las horas semanales son requeridas' }]}
        >
          <InputNumber min={1} max={60} style={{ width: '100%' }} placeholder="4" />
        </Form.Item>
        <Form.Item name="modalidad" label="Modalidad (opcional)">
          <Input placeholder="REGULAR" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AsignaturaPlanFormModal;
