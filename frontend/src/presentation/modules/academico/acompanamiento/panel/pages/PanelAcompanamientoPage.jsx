/**
 * Panel de acompañamiento pedagógico (ACA · ACA-PANEL · panel·LISTAR).
 *
 * Decisión cerrada del plan: SIN librería de gráficos nueva — stat-cards
 * (`PanelKpiStrip`), `Progress` AntD por carrera y tablas de lectura (casos
 * críticos de la 156 y reprobación por materia de la 158). Exportación a PDF
 * (A11, panel·EXPORTAR) desde la cabecera.
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla
 * (`usePanelAcompanamientoPage`).
 *
 * Modo `embedded` (pestaña «Panel» de Seguimiento académico): export PDF +
 * indicadores sin shell de página — el título y el lede los pone la cabecera
 * del workspace contenedor (`seguimientoTabs`).
 */

import { useMemo } from 'react';
import { Alert, Button, Empty, Flex, Spin, Typography } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePanelAcompanamientoPage } from '@application-academico/acompanamiento/panel/hooks/state/usePanelAcompanamientoPage';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import PanelKpiStrip from '@academico/acompanamiento/panel/components/organisms/PanelKpiStrip';
import PanelRiesgoCarreraSection from '@academico/acompanamiento/panel/components/organisms/PanelRiesgoCarreraSection';
import { createPanelCasosCriticosColumns } from '@academico/acompanamiento/panel/config/panelCasosCriticosTableColumns';
import { createPanelReprobacionColumns } from '@academico/acompanamiento/panel/config/panelReprobacionTableColumns';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const PanelAcompanamientoPage = ({ embedded = false }) => {
  const { panel, totales, loading, error, refetch, breadcrumbItems, handleExportar, exportando } =
    usePanelAcompanamientoPage();

  const casosCriticosColumns = useMemo(() => createPanelCasosCriticosColumns(), []);
  const reprobacionColumns = useMemo(() => createPanelReprobacionColumns(), []);

  const exportarAction = (
    <ActionButton
      permiso={ACOMPANAMIENTO_PERMISOS.panel}
      accion="EXPORTAR"
      variant="primary"
      icon={<FilePdfOutlined />}
      loading={exportando}
      onClick={handleExportar}
      disabled={loading || !panel}
    >
      Exportar PDF
    </ActionButton>
  );

  const cuerpo = (
    <Spin spinning={loading} size="large" tip="Cargando indicadores…">
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {!loading && error ? (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el panel de acompañamiento"
            description={error}
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
          />
        ) : null}

        {!loading && !error && !panel ? (
          <Empty
            style={{ marginTop: allSpacing.marginXL }}
            description="Aún no hay datos de acompañamiento para la gestión vigente."
          />
        ) : null}

        {panel ? (
          <>
            <PanelKpiStrip totales={totales} />

            <PanelRiesgoCarreraSection porCarrera={panel.porCarrera} />

            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Casos críticos" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Estudiantes con las notas más bajas de la gestión. El seguimiento y la
                  convocatoria a sesiones se realizan desde «Alumnos en riesgo».
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  showSearch={false}
                  data={panel.casosCriticos}
                  loading={false}
                  columns={casosCriticosColumns}
                  rowKey={(record) =>
                    record.matriculaMateriaId ?? `${record.estudianteId}-${record.materiaId}`
                  }
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Total: ${total} casos`,
                  }}
                  emptyText="No hay casos críticos en la gestión vigente."
                />
              </div>
            </section>

            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Reprobación por materia" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Cursos con mayor porcentaje de riesgo y reprobación, insumo para priorizar
                  las sesiones de refuerzo.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  showSearch={false}
                  data={panel.porMateria}
                  loading={false}
                  columns={reprobacionColumns}
                  rowKey={(record) =>
                    record.ofertaCursoId ?? `${record.carreraCodigo}-${record.materiaNombre}`
                  }
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Total: ${total} cursos`,
                  }}
                  emptyText="Aún no hay indicadores de reprobación por materia."
                />
              </div>
            </section>
          </>
        ) : null}
      </Flex>
    </Spin>
  );

  // Pestaña de Seguimiento académico: export + indicadores, sin shell.
  if (embedded) {
    return (
      <Flex
        vertical
        gap={allSpacing.marginLG}
        className="cfg-academico-tab-content"
        style={{ width: '100%', minWidth: 0 }}
      >
        <Flex justify="flex-end">{exportarAction}</Flex>
        {cuerpo}
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Panel de acompañamiento"
          breadcrumbItems={breadcrumbItems}
          actions={exportarAction}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>{cuerpo}</MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PanelAcompanamientoPage;
