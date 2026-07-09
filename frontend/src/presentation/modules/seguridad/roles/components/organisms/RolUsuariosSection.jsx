/**
 * Organismo: tab "Usuarios con este rol" — detalle de rol.
 * Tabla paginada server-side (usa `TableListView embedded`, patrón CFG Académico).
 * La identidad reusa `UsuarioIdentidadCell` (mismo diseño que el listado de usuarios).
 */

import { useMemo } from 'react';
import { Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { DetailInfoCard, TableActions } from '@molecules';
import { TableListView } from '@organisms';
import UsuarioIdentidadCell from '@modules/seguridad/usuarios/components/atoms/UsuarioIdentidadCell.jsx';

function estadoTag(estado) {
  if (!estado) return <Tag color="success">Activo</Tag>;
  if (estado === 'BLOQUEADO') return <Tag color="error">BLOQUEADO</Tag>;
  if (estado === 'SUSPENDIDO') return <Tag color="warning">SUSPENDIDO</Tag>;
  if (estado === 'RETIRADO') return <Tag>RETIRADO</Tag>;
  return <Tag>{estado}</Tag>;
}

const RolUsuariosSection = ({
  usuarios = [],
  loading = false,
  searchText = '',
  onSearchChange,
  tablePagination,
  navigate,
}) => {
  const columns = useMemo(
    () => [
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
        title: 'Estado',
        key: 'estado',
        width: 140,
        render: (_, record) => estadoTag(record.estado),
      },
      {
        title: 'Acciones',
        key: 'acciones',
        align: 'right',
        render: (_, record) => (
          <TableActions
            record={record}
            navigate={navigate}
            viewPath="/seguridad/usuarios/:id"
            permisos={{ ver: { codigo: 'seguridad.usuario.administrar', accion: 'DETALLE' } }}
          />
        ),
      },
    ],
    [navigate]
  );

  return (
    <DetailInfoCard title="Usuarios con este rol" icon={<TeamOutlined />} cols={1}>
      <TableListView
        embedded
        data={usuarios}
        loading={loading}
        searchText={searchText}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por usuario o correo..."
        searchColSpan={10}
        searchStyle={{ maxWidth: 420 }}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{
          ...tablePagination,
          showTotal: (total) => `Total: ${total} usuarios`,
        }}
        loadingTip="Cargando usuarios..."
      />
    </DetailInfoCard>
  );
};

export default RolUsuariosSection;
