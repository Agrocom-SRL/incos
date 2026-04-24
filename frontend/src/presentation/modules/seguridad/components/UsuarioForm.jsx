import { Form, Input, Select, Tag } from 'antd';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';

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
            label: (
              <span>
                {r.nombre}{' '}
                <Tag color={TIPO_CONFIG[r.tipo]?.color ?? 'default'}>
                  {TIPO_CONFIG[r.tipo]?.label ?? r.tipo ?? '—'}
                </Tag>
              </span>
            ),
          }))}
        />
      </Form.Item>
    </Form>
  );
}
