import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadRolesListPageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { TableListView } from '@organisms';

export default function RolesListPage() {
  const { loading, columns, search, filteredRoles, breadcrumbItems, onSearchChange } = useSeguridadRolesListPageContext();

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="LISTAR"
      fallback={
        <div className="sd-empty">Sin permiso.</div>
      }
    >
      <PageTemplate header={<PageHeader title="Roles y Permisos" breadcrumbItems={breadcrumbItems} />}>
        <TableListView
          data={filteredRoles}
          loading={loading}
          columns={columns}
          searchText={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar rol..."
          pagination={false}
          rowKey={(r) => r.id}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
