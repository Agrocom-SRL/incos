import { Form, Input, Modal } from 'antd';

export default function CambiarPasswordModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    // Validación fallida: los errores ya se muestran en el formulario; no propagar el rechazo.
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    await onSubmit(values.password_nuevo);
    form.resetFields();
  };

  return (
    <Modal
      title="Cambiar contraseña"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Actualizar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="password_nuevo"
          label="Nueva contraseña"
          rules={[{ required: true }, { min: 8, message: 'Mínimo 8 caracteres' }]}
        >
          <Input.Password placeholder="Mínimo 8 caracteres" />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="Confirmar contraseña"
          dependencies={['password_nuevo']}
          rules={[
            { required: true, message: 'Confirme la contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password_nuevo') === value) return Promise.resolve();
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Repita la contraseña" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
