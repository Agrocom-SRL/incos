import { Space, Tag } from 'antd';
import {
  EditOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { TableActions } from '@molecules';
import UsuarioIdentidadCell from '@modules/seguridad/components/atoms/UsuarioIdentidadCell.jsx';
import RolDotCell from '@modules/seguridad/components/atoms/RolDotCell.jsx';
import RegistroMetricasCell from '@modules/seguridad/components/atoms/RegistroMetricasCell.jsx';

const estadoTag = (estado) => {
  if (!estado) return { color: 'success', text: 'Activo' };
  if (estado === 'BLOQUEADO') return { color: 'error', text: 'BLOQUEADO' };
  if (estado === 'SUSPENDIDO') return { color: 'warning', text: 'SUSPENDIDO' };
  if (estado === 'RETIRADO') return { color: 'default', text: 'RETIRADO' };
  return { color: 'default', text: String(estado) };
};

export const createUsuariosTableColumns = (navigate) => [
  {
    title: 'Usuario',
    key: 'usuario',
    fixed: 'left',
    render: (_, record) => (
      <UsuarioIdentidadCell
        username={record.username}
        email={record.email}
        rolTipo={record.rol?.tipo}
        rolIsSystem={record.rol?.is_system}
      />
    ),
  },
  {
    title: 'Rol',
    key: 'rol',
    width: 220,
    render: (_, record) => (
      <RolDotCell
        nombre={record.rol?.nombre}
        tipo={record.rol?.tipo}
        isSystem={record.rol?.is_system}
        sub={record.rol ? (record.rol.is_system ? 'Sistema' : 'Personalizado') : null}
      />
    ),
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 180,
    render: (_, record) => {
      const st = estadoTag(record.estado);
      return (
        <Space orientation="vertical" size={2}>
          <Tag color={st.color} style={{ marginInlineEnd: 0 }}>
            {st.text}
          </Tag>
          {record.motivo_cambio_estado ? (
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {record.motivo_cambio_estado}
            </span>
          ) : null}
        </Space>
      );
    },
  },
  {
    title: 'Registro',
    key: 'registro',
    width: 200,
    render: (_, record) => (
      <RegistroMetricasCell
        creado={record.created_at || record.createdAt}
        actualizado={record.updated_at || record.updatedAt}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    align: 'right',
    width: 120,
    render: (_, record) => (
      <TableActions
        record={record}
        navigate={navigate}
        viewPath="/seguridad/usuarios/:id"
        permisos={{
          ver: { codigo: 'seguridad.usuario.administrar', accion: 'DETALLE' },
          editar: { codigo: 'seguridad.usuario.administrar', accion: 'EDITAR' },
        }}
        extraActions={[
          {
            icon: <EditOutlined />,
            variant: 'primary',
            tooltip: 'Editar datos',
            onClick: () =>
              navigate(`/seguridad/usuarios/${record.id}/editar`, {
                state:
                  record?.rol?.codigo === 'ADMIN_SISTEMA'
                    ? { editInitialStep: 1 }
                    : undefined,
              }),
            permiso: 'seguridad.usuario.administrar',
            accion: 'EDITAR',
          },
          {
            icon: <InfoCircleOutlined />,
            variant: 'warning',
            tooltip: 'Cambiar estado',
            onClick: () => navigate(`/seguridad/usuarios/${record.id}`, { state: { quickAction: 'estado' } }),
            permiso: 'seguridad.usuario.administrar',
            accion: 'EDITAR',
          },
          {
            icon: <LockOutlined />,
            variant: 'default',
            tooltip: 'Cambiar contraseña',
            onClick: () => navigate(`/seguridad/usuarios/${record.id}`, { state: { quickAction: 'password' } }),
            permiso: 'seguridad.usuario.administrar',
            accion: 'EDITAR',
          },
          {
            icon: <KeyOutlined />,
            variant: 'info',
            tooltip: 'Permisos',
            onClick: () => navigate(`/seguridad/usuarios/${record.id}/permisos`),
            permiso: 'seguridad.rol.gestionar',
            accion: 'LISTAR',
          },
        ]}
      />
    ),
  },
];
