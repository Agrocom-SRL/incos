/**
 * Listado de fichas de seguimiento en clase (DOC · DOC-SUPERVISION ·
 * docentes.supervision.ficha·LISTAR).
 *
 * Lenguaje visual de SesionesList (TUT): shell Flex.page-container →
 * PageHeaderArea(PageHeader) → DashboardPageShell → MainContent →
 * section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla (`useFichasSeguimientoListPage`).
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useFichasSeguimientoListPage } from '@application-docentes/supervision/hooks/state/useFichasSeguimientoListPage';
import { SUPERVISION_FICHA_PERMISO } from '@application-docentes/supervision/config/paths';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const FichasSeguimientoList = () => {
  const {
    fichas,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    tablePagination,
  } = useFichasSeguimientoListPage();

  const headerActions = (
    <ActionButton
      permiso={SUPERVISION_FICHA_PERMISO}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Registrar ficha
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Supervisión docente" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Fichas de seguimiento" actions={headerActions} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Fichas de seguimiento en la clase presencial registradas por la Dirección
                  Académica: documentación presentada, cantidad de estudiantes y observaciones por
                  curso.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={fichas}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por docente, asignatura o evaluador…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando fichas de seguimiento…"
                  emptyText="Aún no hay fichas de seguimiento registradas."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default FichasSeguimientoList;
