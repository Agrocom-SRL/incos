/**
 * Listado institucional de alumnos en riesgo pedagógico (ACA · alerta·LISTAR).
 * Vista 156: un registro por estudiante×materia bajo el umbral.
 *
 * Modo `embedded` (pestaña «Alumnos en riesgo» de Seguimiento académico,
 * patrón CarrerasList de CFG): solo filtros + tabla + drawer — el título y el
 * lede los pone la cabecera del workspace contenedor (`seguimientoTabs`).
 * Modo página completa (legado, hoy sin ruta propia): shell
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
import { useAlertasRiesgoListPage } from '@application-academico/acompanamiento/alertas/hooks/state/useAlertasRiesgoListPage';
import AlertaEstudianteDrawer from '@academico/acompanamiento/alertas/components/organisms/AlertaEstudianteDrawer';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const AlertasRiesgoList = ({ embedded = false }) => {
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

  const tabla = (
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
  );

  const drawerDetalle = (
    <AlertaEstudianteDrawer
      open={drawer.open}
      onCerrar={drawer.cerrar}
      detalle={drawer.detalle}
      loading={drawer.loading}
      error={drawer.error}
    />
  );

  // Pestaña de Seguimiento académico: filtros + tabla + drawer, sin shell.
  if (embedded) {
    return (
      <Flex
        vertical
        gap={allSpacing.marginLG}
        className="cfg-academico-tab-content"
        style={{ width: '100%', minWidth: 0 }}
      >
        {filtrosHeader}
        {tabla}
        {drawerDetalle}
      </Flex>
    );
  }

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
              <div className="cfg-academico-tab-panel">{tabla}</div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>

      {drawerDetalle}
    </Flex>
  );
};

export default AlertasRiesgoList;
