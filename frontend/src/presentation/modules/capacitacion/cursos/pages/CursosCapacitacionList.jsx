/**
 * Listado de cursos de capacitación (Capacitación · CAP-CURSOS · LISTAR).
 *
 * Lenguaje visual de PagosList / CarrerasList: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 * Filas inactivas atenuadas (catalogoEstadoRowClassName) con toggle EstadoTogglePill.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { useCursosCapacitacionListPage } from '@application-capacitacion/cursos/hooks/state/useCursosCapacitacionListPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const CursosCapacitacionList = () => {
  const {
    cursos,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  } = useCursosCapacitacionListPage();

  const registrarAction = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.curso}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Nuevo curso
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Cursos de capacitación" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de cursos" actions={registrarAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Oferta de cursos cortos a público externo: costo, fechas, bloques de horario y
                  cupo (informativo). Desactivar un curso lo retira de la inscripción sin borrar
                  su historial.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={cursos}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por título o descripción…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  rowClassName={catalogoEstadoRowClassName}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando cursos…"
                  emptyText="Aún no hay cursos de capacitación registrados."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CursosCapacitacionList;
