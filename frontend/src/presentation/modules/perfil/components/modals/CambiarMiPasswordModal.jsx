import { Form, Input, Modal } from 'antd';

/**
 * Modal self-service de cambio de contraseña: exige la contraseña actual.
 * (El modal admin de seguridad no la pide; por eso es un componente aparte.)
 */
export default function CambiarMiPasswordModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onSubmit({
      password_actual: values.password_actual,
      password_nuevo: values.password_nuevo,
    });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title="Cambiar mi contraseña"
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
          name="password_actual"
          label="Contraseña actual"
          rules={[{ required: true, message: 'Ingrese su contraseña actual' }]}
        >
          <Input.Password placeholder="Su contraseña actual" autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          name="password_nuevo"
          label="Nueva contraseña"
          rules={[{ required: true }, { min: 8, message: 'Mínimo 8 caracteres' }]}
        >
          <Input.Password placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
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
          <Input.Password placeholder="Repita la contraseña" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
