/**
 * Organismo: tab "Usuarios con este rol" — detalle de rol.
 * Tabla paginada server-side (usa `TableListView embedded`, patrón CFG Académico).
 * La identidad reusa `UsuarioIdentidadCell` (mismo diseño que el listado de usuarios).
 * Estado de error explícito (Alert + reintentar, mismo patrón que
 * `PlanesTabPanel`/fichas de Finanzas) y estado vacío localizado en español
 * (vía `TableListView emptyText`, no el `Empty` genérico en inglés).
 */

import { useMemo } from 'react';
import { Alert, Button } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { DetailInfoCard, TableActions } from '@molecules';
import { TableListView } from '@organisms';
import UsuarioIdentidadCell from '@modules/seguridad/usuarios/components/atoms/UsuarioIdentidadCell.jsx';
import UsuarioEstadoTag from '@modules/seguridad/usuarios/components/atoms/UsuarioEstadoTag.jsx';

const RolUsuariosSection = ({
  usuarios = [],
  loading = false,
  error = null,
  onRetry,
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
        render: (_, record) => <UsuarioEstadoTag estado={record.estado} />,
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

  const emptyText = searchText.trim()
    ? 'No se encontraron usuarios que coincidan con la búsqueda.'
    : 'Ningún usuario tiene este rol.';

  return (
    <DetailInfoCard title="Usuarios con este rol" icon={<TeamOutlined />} cols={1}>
      {!loading && error ? (
        <Alert
          type="error"
          showIcon
          title={typeof error === 'string' ? error : 'No se pudo cargar la lista de usuarios'}
          action={
            onRetry ? (
              <Button size="small" onClick={onRetry}>
                Reintentar
              </Button>
            ) : null
          }
        />
      ) : (
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
          emptyText={emptyText}
        />
      )}
    </DetailInfoCard>
  );
};

export default RolUsuariosSection;
