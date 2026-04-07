import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Card, Form, Space, Typography } from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import UsuarioForm from '@modules/seguridad/components/UsuarioForm.jsx';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function UsuarioCreatePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const usuariosApi = useUsuarios();
  const rolesApi = useRoles();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      const w = await rolesApi.listRoles();
      if (!w) return;
      const { res, json } = w;
      if (res.ok) {
        setRoles(json.data?.roles || []);
      }
    };
    run();
  }, [rolesApi]);

  const onFinish = async (values) => {
    setLoading(true);
    const w = await usuariosApi.createUser(values);
    setLoading(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Usuario creado');
      navigate(`/usuarios/${json.data?.id || ''}`);
    } else {
      message.error(errMsg(json));
    }
  };

  return (
    <PermisoGuard
      codigo="seguridad.usuario.crear"
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">No tiene permiso para crear usuarios.</Typography.Text>
      }
    >
      <Card title="Crear usuario">
        <UsuarioForm
          form={form}
          roles={roles}
          showPassword
          onFinish={onFinish}
        />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            Guardar
          </Button>
          <Button onClick={() => navigate('/usuarios/administrar')}>Cancelar</Button>
        </Space>
      </Card>
    </PermisoGuard>
  );
}
