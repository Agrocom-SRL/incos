import { Form, Input, Modal, Select } from 'antd';

const ESTADOS = [
  { value: null, label: 'Activo' },
  { value: 'BLOQUEADO', label: 'BLOQUEADO' },
  { value: 'SUSPENDIDO', label: 'SUSPENDIDO' },
  { value: 'RETIRADO', label: 'RETIRADO' },
];

export default function CambiarEstadoModal({ open, loading, initialValues, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      estado: values.estado ?? null,
      motivo: values.motivo || null,
    });
  };

  return (
    <Modal
      title="Cambiar estado"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Aplicar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
      afterOpenChange={(opened) => {
        if (opened) form.setFieldsValue(initialValues || {});
      }}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item name="estado" label="Estado">
          <Select allowClear placeholder="Activo" options={ESTADOS} />
        </Form.Item>
        <Form.Item
          shouldUpdate
          noStyle
        >
          {() => {
            const estado = form.getFieldValue('estado');
            return (
              <Form.Item
                name="motivo"
                label="Motivo"
                rules={estado ? [{ required: true, message: 'Motivo requerido' }] : []}
              >
                <Input.TextArea rows={3} placeholder="Motivo del cambio de estado" />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
