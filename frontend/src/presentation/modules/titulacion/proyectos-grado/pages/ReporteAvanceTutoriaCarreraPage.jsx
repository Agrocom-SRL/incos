/**
 * Reporte de avance de tutorías por carrera (Titulación · TIT ·
 * `proyecto·LISTAR`/`EXPORTAR`, Requisito 2 — extensión 2026-07-31).
 *
 * Lenguaje visual del módulo (mismo shell que `ProyectosGradoList` /
 * `PanelAcompanamientoPage`): selector de gestión/carrera arriba, resumen +
 * detalle abajo, botón "Exportar PDF" en el toolbar de cabecera. Página
 * "dumb": la orquestación vive en `useAvanceTutoriaCarreraPage`.
 */

import { Alert, Button, Empty, Flex, Select, Spin, Typography } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useAvanceTutoriaCarreraPage } from '@application-titulacion/proyectos-grado/hooks/state/useAvanceTutoriaCarreraPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import AvanceTutoriaCarreraResumenSection from '@titulacion/proyectos-grado/components/organisms/AvanceTutoriaCarreraResumenSection';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const ReporteAvanceTutoriaCarreraPage = () => {
  const {
    avance,
    loading,
    error,
    refetch,
    tableColumns,
    breadcrumbItems,
    handleExportar,
    exportando,
    carreraOptions,
    loadingCarreras,
    gestionOptions,
    loadingGestiones,
    gestionId,
    setGestionId,
    carreraId,
    setCarreraId,
  } = useAvanceTutoriaCarreraPage();

  const exportarAction = (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="EXPORTAR"
      variant="primary"
      icon={<FilePdfOutlined />}
      loading={exportando}
      onClick={handleExportar}
      disabled={loading || !avance}
    >
      Exportar PDF
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Avance de tutorías por carrera"
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
                  Sin gestión seleccionada se usa la gestión vigente; sin carrera se muestran
                  todas.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <Flex wrap gap="small" align="center">
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
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={carreraOptions}
                    loading={loadingCarreras}
                    value={carreraId}
                    onChange={setCarreraId}
                    placeholder="Todas las carreras"
                    style={{ minWidth: 220 }}
                    aria-label="Filtrar por carrera"
                  />
                </Flex>
              </div>
            </section>

            <Spin spinning={loading} size="large" tip="Cargando reporte…">
              <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                {!loading && error ? (
                  <Alert
                    type="error"
                    showIcon
                    title="No se pudo cargar el reporte de avance de tutorías"
                    description={error}
                    action={
                      <Button size="small" onClick={refetch}>
                        Reintentar
                      </Button>
                    }
                  />
                ) : null}

                {!loading && !error && !avance ? (
                  <Empty
                    style={{ marginTop: allSpacing.marginXL }}
                    description="Aún no hay proyectos de grado registrados para esta gestión."
                  />
                ) : null}

                {avance ? (
                  <>
                    <AvanceTutoriaCarreraResumenSection resumenPorCarrera={avance.resumenPorCarrera} />

                    <section className="cfg-academico-workspace">
                      <header className="cfg-academico-workspace__header">
                        <ListPanelHeader title="Detalle por proyecto" />
                        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                          Avance de tutoría y última observación de bitácora de cada proyecto de
                          la gestión seleccionada.
                        </Paragraph>
                      </header>
                      <div className="cfg-academico-tab-panel">
                        <TableListView
                          embedded
                          showSearch={false}
                          data={avance.detalle}
                          loading={false}
                          columns={tableColumns}
                          rowKey={(record) => record.id}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Total: ${total} proyectos`,
                          }}
                          emptyText="No hay proyectos de grado para los filtros seleccionados."
                        />
                      </div>
                    </section>
                  </>
                ) : null}
              </Flex>
            </Spin>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ReporteAvanceTutoriaCarreraPage;
