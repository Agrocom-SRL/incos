/**
 * Planilla de avance de tutorías "10 en 10" (Titulación · TIT ·
 * `proyecto·LISTAR`/`EXPORTAR`, Requisito 3 — extensión 2026-07-31).
 *
 * Filtros carrera (requerido) / gestión (opcional, vigente por defecto) /
 * bimestre (requerido) arriba, vista previa del folio abajo (mismo shell de
 * sección `cfg-academico-workspace` del módulo), botón "Exportar Excel" en
 * el toolbar. Página "dumb": la orquestación vive en
 * `usePlanillaAvanceTercerAnioPage`.
 */

import { Alert, Empty, Flex, Select, Spin, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePlanillaAvanceTercerAnioPage } from '@application-titulacion/proyectos-grado/hooks/state/usePlanillaAvanceTercerAnioPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import PlanillaAvanceFolioPreview from '@titulacion/proyectos-grado/components/organisms/PlanillaAvanceFolioPreview';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/planilla-avance.css';

const { Paragraph } = Typography;

const PlanillaAvanceTercerAnioPage = () => {
  const {
    planilla,
    loading,
    error,
    filtrosCompletos,
    handleExportar,
    exportando,
    breadcrumbItems,
    carreraOptions,
    loadingCarreras,
    gestionOptions,
    loadingGestiones,
    bimestreOptions,
    carreraId,
    setCarreraId,
    gestionId,
    setGestionId,
    bimestre,
    setBimestre,
  } = usePlanillaAvanceTercerAnioPage();

  const exportarAction = (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="EXPORTAR"
      variant="primary"
      icon={<FileExcelOutlined />}
      loading={exportando}
      onClick={handleExportar}
      disabled={!filtrosCompletos || loading || !planilla}
    >
      Exportar Excel
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Planilla de avance de tutorías (3er año)"
          breadcrumbItems={breadcrumbItems}
          actions={exportarAction}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Filtros" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Carrera y bimestre son obligatorios para generar la planilla. Sin gestión
                  seleccionada se usa la gestión vigente.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <Flex wrap gap="small" align="center">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={carreraOptions}
                    loading={loadingCarreras}
                    value={carreraId}
                    onChange={setCarreraId}
                    placeholder="Seleccione la carrera"
                    style={{ minWidth: 220 }}
                    aria-label="Filtrar por carrera"
                  />
                  <Select
                    allowClear
                    options={gestionOptions}
                    loading={loadingGestiones}
                    value={gestionId}
                    onChange={setGestionId}
                    placeholder="Gestión vigente"
                    style={{ minWidth: 200 }}
                    aria-label="Filtrar por gestión"
                  />
                  <Select
                    options={bimestreOptions}
                    value={bimestre}
                    onChange={setBimestre}
                    placeholder="Seleccione el bimestre"
                    style={{ minWidth: 180 }}
                    aria-label="Filtrar por bimestre"
                  />
                </Flex>
              </div>
            </section>

            {!filtrosCompletos ? (
              <Empty
                style={{ marginTop: allSpacing.marginXL }}
                description="Seleccione carrera y bimestre para generar la planilla de avance de tutorías."
              />
            ) : (
              <Spin spinning={loading} size="large" tip="Cargando planilla…">
                <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                  {!loading && error ? (
                    <Alert
                      type="error"
                      showIcon
                      title="No se pudo cargar la planilla de avance de tutorías"
                      description={error}
                    />
                  ) : null}

                  {!loading && !error && (!planilla || planilla.folios.length === 0) ? (
                    <Empty
                      style={{ marginTop: allSpacing.marginXL }}
                      description="No hay estudiantes de 3er año con proyecto vigente para esta carrera y bimestre."
                    />
                  ) : null}

                  {planilla && planilla.folios.length > 0 ? (
                    <PlanillaAvanceFolioPreview
                      cabecera={planilla.cabecera}
                      folios={planilla.folios}
                      resumenTutores={planilla.resumenTutores}
                      tally={planilla.tally}
                    />
                  ) : null}
                </Flex>
              </Spin>
            )}
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PlanillaAvanceTercerAnioPage;
