import { PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuariosListPageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import '@modules/seguridad/styles/seguridad.css';

export default function UsuariosListPage() {
  const {
    usuarios,
    loading,
    searchText,
    columns,
    breadcrumbItems,
    tablePagination,
    handleCreateUsuario,
    handleSearchChange,
  } = useSeguridadUsuariosListPageContext();

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="LISTAR"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <PageTemplate
        header={
          <PageHeader
            title="Administración de Usuarios"
            breadcrumbItems={breadcrumbItems}
            actions={
              <ActionButton
                permiso="seguridad.usuario.crear"
                accion="CREAR"
                variant="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUsuario}
              >
                Nuevo Usuario
              </ActionButton>
            }
          />
        }
      >
        <TableListView
          data={usuarios}
          loading={loading}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar por usuario o correo de ficha..."
          columns={columns}
          rowKey={(record) => record.id}
          pagination={tablePagination}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
