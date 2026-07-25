/**
 * Listado institucional de alumnos en riesgo pedagógico (TUT · TUT-ALERTAS ·
 * alerta·LISTAR). Vista 156: un registro por estudiante×materia bajo el umbral.
 *
 * Lenguaje visual de CursosCapacitacionList / LicenciasListPage: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell →
 * MainContent → section.cfg-academico-workspace (ListPanelHeader con filtros
 * carrera/materia + lede) → TableListView embedded + drawer de detalle (A3).
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla (`useAlertasRiesgoListPage`).
 */

import { Flex, Select, Typography } from 'antd';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { Text } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useAlertasRiesgoListPage } from '@application-tutorias/acompanamiento/alertas/hooks/state/useAlertasRiesgoListPage';
import AlertaEstudianteDrawer from '@tutorias/acompanamiento/alertas/components/organisms/AlertaEstudianteDrawer';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const AlertasRiesgoList = () => {
  const {
    alertas,
    loading,
    error,
    searchText,
    handleSearchChange,
    filtros,
    setFiltro,
    carreraOptions,
    materiaOptions,
    tableColumns,
    breadcrumbItems,
    tablePagination,
    drawer,
  } = useAlertasRiesgoListPage();

  const filtrosHeader = (
    <Flex gap={allSpacing.marginSM} align="center" wrap="wrap" justify="flex-end">
      <Flex gap={allSpacing.marginXS} align="center">
        <Text type="secondary">Carrera</Text>
        <Select
          value={filtros.carreraId}
          onChange={(value) => setFiltro('carreraId', value)}
          options={carreraOptions}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Todas"
          style={{ minWidth: 200 }}
        />
      </Flex>
      <Flex gap={allSpacing.marginXS} align="center">
        <Text type="secondary">Materia</Text>
        <Select
          value={filtros.materiaId}
          onChange={(value) => setFiltro('materiaId', value)}
          options={materiaOptions}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Todas"
          style={{ minWidth: 200 }}
        />
      </Flex>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Alumnos en riesgo" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Alertas de riesgo pedagógico" actions={filtrosHeader} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Estudiantes con nota por debajo del umbral de riesgo en el último bimestre
                  registrado o en el promedio de la gestión vigente. Abra el detalle de una fila
                  para revisar el cuadro completo del estudiante.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={alertas}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por estudiante, C.I. o materia…"
                  columns={tableColumns}
                  rowKey={(record) => record.matriculaMateriaId ?? `${record.estudianteId}-${record.materiaId}`}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando alertas de riesgo…"
                  emptyText="No hay alumnos en riesgo con los filtros aplicados."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>

      <AlertaEstudianteDrawer
        open={drawer.open}
        onCerrar={drawer.cerrar}
        detalle={drawer.detalle}
        loading={drawer.loading}
        error={drawer.error}
      />
    </Flex>
  );
};

export default AlertasRiesgoList;
