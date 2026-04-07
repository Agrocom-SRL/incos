import { Form, Input, Modal, Select } from 'antd';

export default function EditarUsuarioModal({
  open,
  loading,
  roles = [],
  initialValues,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title="Editar datos del usuario"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
      afterOpenChange={(opened) => {
        if (opened) form.setFieldsValue(initialValues || {});
      }}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item name="username" label="Usuario" rules={[{ required: true, max: 50 }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
          <Select
            options={roles.map((r) => ({
              value: r.id,
              label: `${r.nombre} (${r.codigo})`,
            }))}
          />
        </Form.Item>
        <Form.Item name="foto_url" label="Foto URL">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
