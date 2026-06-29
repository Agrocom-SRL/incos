/**
 * Menú SEG → Roles y permisos: catálogo de roles + alta de rol.
 * URL: /seguridad/roles
 */

import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadRolesListPageContext } from '@/application/modules/seguridad/hooks';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import CrearRolModal from '@modules/seguridad/components/modals/CrearRolModal.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@modules/seguridad/styles/seguridad.css';

export default function RolesListPage() {
  const {
    loading,
    columns,
    search,
    filteredRoles,
    breadcrumbItems,
    onSearchChange,
    crearOpen,
    crearSaving,
    openCrearRol,
    closeCrearRol,
    onCreateRol,
  } = useSeguridadRolesListPageContext();

  const panelActions = (
    <ActionButton
      permiso="seguridad.rol.gestionar"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={openCrearRol}
    >
      Nuevo rol
    </ActionButton>
  );

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="LISTAR"
      fallback={<div className="sd-empty">Sin permiso.</div>}
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Roles y Permisos" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Roles del sistema" actions={panelActions} />
              </header>

              <div className="cfg-academico-tab-content">
                <TableListView
                  embedded
                  data={filteredRoles}
                  loading={loading}
                  columns={columns}
                  searchText={search}
                  onSearchChange={onSearchChange}
                  searchPlaceholder="Buscar rol..."
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} roles`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  rowKey={(r) => r.id}
                  loadingTip="Cargando roles..."
                />
              </div>
            </section>
          </MainContent>
        </DashboardPageShell>
      </Flex>

      <CrearRolModal
        open={crearOpen}
        loading={crearSaving}
        onCancel={closeCrearRol}
        onSubmit={onCreateRol}
      />
    </PermisoGuard>
  );
}
