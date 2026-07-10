/**
 * Molécula: alta/edición de periodo (año) del plan de estudio.
 * Gemelo de `CambiarEstadoModal` (seguridad/usuarios) en estructura de modal + Form.
 */

import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';

const PeriodoFormModal = ({
  open,
  mode = 'create',
  loading = false,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        nombre: initialValues?.nombre ?? '',
        numero: initialValues?.numero ?? undefined,
      });
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onSubmit({
      nombre: values.nombre?.trim(),
      numero: Number(values.numero),
    });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title={isEdit ? 'Editar periodo' : 'Agregar periodo'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? 'Guardar' : 'Agregar'}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="numero"
          label="Número de periodo"
          rules={[{ required: true, message: 'El número de periodo es requerido' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
        </Form.Item>
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[{ required: true, message: 'El nombre del periodo es requerido' }]}
        >
          <Input placeholder="Primer año" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PeriodoFormModal;
