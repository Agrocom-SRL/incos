/**
 * Ficha de seguimiento en clase (DOC · DOC-SUPERVISION-DETALLE ·
 * docentes.supervision.ficha·DETALLE) — lectura campo a campo con
 * `FichaSeguimientoFichaView` (organismo compartido con la tab "Supervisión"
 * del portal del docente) y exportación a PDF (EXPORTAR).
 *
 * Página "dumb": compone template + organismo y consume el hook de pantalla
 * (`useFichaSeguimientoDetailPage`); espejo de `SesionRefuerzoDetail`.
 */

import { Alert, Empty, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useFichaSeguimientoDetailPage } from '@application-docentes/supervision/hooks/state/useFichaSeguimientoDetailPage';
import { SUPERVISION_FICHA_PERMISO } from '@application-docentes/supervision/config/paths';
import FichaSeguimientoFichaView from '@docentes/supervision/components/organisms/FichaSeguimientoFichaView';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const FichaSeguimientoDetail = () => {
  const {
    ficha,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    descargandoPdf,
    handleExportarPdf,
  } = useFichaSeguimientoDetailPage();

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={SUPERVISION_FICHA_PERMISO}
        accion="EXPORTAR"
        icon={<FilePdfOutlined />}
        loading={descargandoPdf}
        onClick={handleExportarPdf}
      >
        Exportar PDF
      </ActionButton>
      <ActionButton
        permiso={SUPERVISION_FICHA_PERMISO}
        accion="EDITAR"
        variant="primary"
        icon={<EditOutlined />}
        onClick={handleEditar}
      >
        Editar ficha
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Ficha de seguimiento"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading} size="large" tip="Cargando ficha…">
            <div className="sd sd-spin-body">
              {!loading && error && (
                <Alert
                  type="error"
                  title="No se pudo cargar la ficha"
                  description={error}
                  showIcon
                  style={{ marginBottom: allSpacing.margin }}
                />
              )}
              {!loading && !error && !ficha && (
                <Empty
                  description="No se encontró la ficha solicitada."
                  style={{ marginTop: allSpacing.marginXL }}
                />
              )}
              {!loading && !error && ficha && <FichaSeguimientoFichaView ficha={ficha} />}
            </div>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default FichaSeguimientoDetail;
