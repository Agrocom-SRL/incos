/**
 * Listado del catálogo maestro Becas y descuentos (Finanzas · FIN-BECAS ·
 * LISTAR) — ítem de menú propio, separado de "Config. de pagos" (antes vivía
 * embebido como 4to tab de esa pantalla).
 *
 * Lenguaje visual de PagosList/LicenciasListPage: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla. El fetch/orquestación viven en `BecaDescuentoProvider` +
 * `useBecaDescuentoListPage`.
 */

import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useBecaDescuentoListPage } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoListPage';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { createBecaDescuentoCatalogoColumns } from '@finanzas/becas/config/becaDescuentoCatalogoColumns';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/becas/config/becaDescuentoPermisos';
import {
  becaDescuentoNuevaPath,
  becaDescuentoDetallePath,
  becaDescuentoEditarPath,
} from '@application-finanzas/config/paths';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const BecasDescuentosPage = () => {
  const navigate = useNavigate();
  const {
    becasDescuentos,
    loading,
    error,
    refetch,
    eliminar,
    searchText,
    setSearchText,
    toggleEstado,
    breadcrumbItems,
  } = useBecaDescuentoListPage();

  const columns = createBecaDescuentoCatalogoColumns({
    onVer: (record) => navigate(becaDescuentoDetallePath(record.id)),
    onEditar: (record) => navigate(becaDescuentoEditarPath(record.id)),
    eliminarBeca: eliminar,
    refetch,
    onToggleEstado: toggleEstado,
  });

  const nuevaBecaAction = (
    <ActionButton
      permiso={BECA_DESCUENTO_PERMISO}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(becaDescuentoNuevaPath)}
    >
      Nueva beca o descuento
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Config. de becas" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Becas y descuentos" actions={nuevaBecaAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Catálogo maestro de becas y descuentos disponibles: porcentaje, reglas de
                  aplicación y asignación automática.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={becasDescuentos}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={(event) => setSearchText(event.target.value)}
                  searchPlaceholder="Buscar por nombre, código o descripción…"
                  columns={columns}
                  rowKey="id"
                  rowClassName={catalogoEstadoRowClassName}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} becas y descuentos`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  loadingTip="Cargando becas y descuentos..."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default BecasDescuentosPage;
