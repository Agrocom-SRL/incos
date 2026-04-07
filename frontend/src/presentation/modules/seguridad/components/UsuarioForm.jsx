import { Form, Input, Select } from 'antd';

export default function UsuarioForm({
  form,
  roles = [],
  showPassword = true,
  disabled = false,
  onFinish,
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      disabled={disabled}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label="Usuario"
        rules={[{ required: true, message: 'Requerido' }]}
      >
        <Input maxLength={50} />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email', message: 'Email válido' }]}
      >
        <Input type="email" />
      </Form.Item>
      {showPassword ? (
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[
            { required: true, message: 'Requerido' },
            { min: 8, message: 'Mínimo 8 caracteres' },
          ]}
        >
          <Input.Password />
        </Form.Item>
      ) : null}
      <Form.Item
        name="rol_id"
        label="Rol"
        rules={[{ required: true, message: 'Seleccione un rol' }]}
      >
        <Select
          placeholder="Rol"
          options={roles.map((r) => ({
            value: r.id,
            label: `${r.nombre} (${r.codigo})`,
          }))}
        />
      </Form.Item>
    </Form>
  );
}
