import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function UsuarioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const api = useUsuarios();
  const rolesApi = useRoles();
  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'VER');

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basicForm] = Form.useForm();
  const [estadoForm] = Form.useForm();
  const [passForm] = Form.useForm();

  const uid = parseInt(id, 10);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    const w = await api.getUser(uid);
    setLoading(false);
    if (!w) return;
    const { res, json } = w;
    if (!res.ok) {
      message.error(errMsg(json));
      return;
    }
    const u = json.data;
    setUser(u);
    basicForm.setFieldsValue({
      username: u.username,
      email: u.email,
      rol_id: u.rol?.id,
    });
    estadoForm.setFieldsValue({
      estado: u.estado ?? null,
      motivo: u.motivo_cambio_estado ?? '',
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const run = async () => {
      const w = await rolesApi.listRoles();
      if (!w) return;
      const { res, json } = w;
      if (res.ok) setRoles(json.data?.roles || []);
    };
    run();
  }, [rolesApi]);

  const saveBasic = async () => {
    const v = await basicForm.validateFields();
    const w = await api.updateUser(uid, v);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Actualizado');
      load();
    } else message.error(errMsg(json));
  };

  const saveEstado = async () => {
    const v = await estadoForm.validateFields();
    const w = await api.changeEstado(uid, {
      estado: v.estado,
      motivo: v.motivo || null,
    });
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Estado actualizado');
      load();
    } else message.error(errMsg(json));
  };

  const savePass = async () => {
    const v = await passForm.validateFields();
    const w = await api.changePassword(uid, { password_nuevo: v.password_nuevo });
    passForm.resetFields();
    if (!w) return;
    const { res, json } = w;
    if (res.ok) message.success('Contraseña actualizada');
    else message.error(errMsg(json));
  };

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button onClick={() => navigate('/usuarios/administrar')}>← Volver al listado</Button>
        {user ? (
          <Descriptions title="Usuario" bordered column={1} size="small">
            <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Usuario">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Rol">{user.rol?.nombre}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              {user.estado == null ? 'Activo' : String(user.estado)}
            </Descriptions.Item>
            <Descriptions.Item label="Activo">{user.activo ? 'Sí' : 'No'}</Descriptions.Item>
          </Descriptions>
        ) : null}

        {puedeEditar ? (
          <Card title="Editar datos básicos">
            <Form form={basicForm} layout="vertical">
              <Form.Item name="username" label="Usuario" rules={[{ required: true }]}>
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
            </Form>
            <Button type="primary" onClick={saveBasic} loading={loading}>
              Guardar datos
            </Button>
          </Card>
        ) : null}

        {puedeEditar ? (
          <Card title="Cambiar estado">
            <Form form={estadoForm} layout="vertical">
              <Form.Item name="estado" label="Estado">
                <Select
                  allowClear
                  placeholder="null = reactivar"
                  options={[
                    { value: 'BLOQUEADO', label: 'BLOQUEADO' },
                    { value: 'SUSPENDIDO', label: 'SUSPENDIDO' },
                    { value: 'RETIRADO', label: 'RETIRADO' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="motivo" label="Motivo">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Form>
            <Button onClick={saveEstado}>Aplicar estado</Button>
          </Card>
        ) : null}

        {puedeEditar ? (
          <Card title="Cambiar contraseña">
            <Form form={passForm} layout="vertical">
              <Form.Item
                name="password_nuevo"
                label="Nueva contraseña"
                rules={[{ required: true }, { min: 8 }]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
            <Button onClick={savePass}>Actualizar contraseña</Button>
          </Card>
        ) : null}

        {puedeVerPermisos ? (
          <Button type="link" onClick={() => navigate(`/usuarios/${uid}/permisos`)}>
            Ver / editar permisos
          </Button>
        ) : null}
      </Space>
    </PermisoGuard>
  );
}
