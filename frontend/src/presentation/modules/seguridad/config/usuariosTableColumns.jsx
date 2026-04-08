import { Avatar, Space, Tag } from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { TableCell, TableActions } from '@molecules';

const estadoTag = (estado) => {
  if (!estado) return { color: 'success', text: 'Activo' };
  if (estado === 'BLOQUEADO') return { color: 'error', text: 'BLOQUEADO' };
  if (estado === 'SUSPENDIDO') return { color: 'warning', text: 'SUSPENDIDO' };
  if (estado === 'RETIRADO') return { color: 'default', text: 'RETIRADO' };
  return { color: 'default', text: String(estado) };
};

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-BO');
};

export const createUsuariosTableColumns = (navigate) => [
  {
    title: 'Usuario',
    key: 'usuario',
    render: (_, record) => (
      <Space orientation="vertical" size={2}>
        <Space size={8}>
          <Avatar size={28}>{String(record.username || '?').slice(0, 2).toUpperCase()}</Avatar>
          <strong>{record.username || '—'}</strong>
        </Space>
        <TableCell icon={<MailOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          {record.email || '—'}
        </TableCell>
        <TableCell icon={<TagOutlined />} size="small">
          <Tag color={record.rol?.is_system ? 'purple' : 'blue'} style={{ marginInlineEnd: 0 }}>
            {record.rol?.nombre || 'Sin rol'}
            {record.rol
              ? ` · ${record.rol.is_system ? 'Sistema' : 'Personalizado'}`
              : ''}
          </Tag>
        </TableCell>
      </Space>
    ),
  },
  {
    title: 'Estado',
    key: 'estado',
    render: (_, record) => {
      const st = estadoTag(record.estado);
      return (
        <Space orientation="vertical" size={2}>
          <Tag color={st.color} style={{ marginInlineEnd: 0 }}>{st.text}</Tag>
          {record.motivo_cambio_estado ? (
            <span style={{ color: 'var(--color-text-secondary, #666666)', fontSize: '12px' }}>
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
    render: (_, record) => (
      <Space orientation="vertical" size={2}>
        <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          Creado: {fmtDate(record.created_at || record.createdAt)}
        </TableCell>
        <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          Actualizado: {fmtDate(record.updated_at || record.updatedAt)}
        </TableCell>
      </Space>
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
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
            onClick: () => navigate(`/seguridad/usuarios/${record.id}`, { state: { quickAction: 'edit' } }),
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
