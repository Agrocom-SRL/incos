/**
 * HistorialAcademicoPage — detalle del Historial académico (permiso DETALLE).
 *
 * Documento FORM-SIE-ITT-04 del estudiante `:id`, con el mismo lenguaje visual
 * que el Centralizador: ficha de contexto (sd-profile con datos del estudiante)
 * + tiles del resumen (carga horaria, aprobadas, promedio) ARRIBA de la tabla
 * transcript, que vive dentro de la "hoja" (Card sin padding). Botones Exportar
 * con ActionButton (permiso academico.historial.academico · EXPORTAR).
 *
 * Rama ESTUDIANTE (portal, "Mi historial"): solo la descarga en PDF — sin Excel
 * ni Volver (llega directo desde el menú, sin selector). Espejo del criterio de
 * Mi boletín (única descarga permitida al estudiante, en PDF).
 *
 * Página "dumb": compone template + organismos y consume el contexto que publica
 * `HistorialAcademicoProvider` (estado en hooks/state). Cubre carga/vacío/error.
 */

import { useNavigate } from 'react-router-dom';
import { App, Card, Empty, Flex } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { DetailPageShell } from '@organisms';
import { allSpacing } from '@theme/tokens';
import { useAuth, esEstudiante } from '@application-auth';
import { useHistorialAcademicoContext } from '@application-academico/historial/hooks/context/useHistorialAcademicoContext.js';
import { HISTORIAL_SELECTOR_PATH } from '@application-academico/historial/utils/historialPaths.js';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import HistorialCabecera from '../components/HistorialCabecera.jsx';
import HistorialResumen from '../components/HistorialResumen.jsx';
import HistorialTranscriptTable from '../components/HistorialTranscriptTable.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/historial.css';

/** "Hoja" de planilla: card sin padding, gemela de cal-centralizador-hoja-card. */
const hojaCardProps = {
  ...sectionCardProps,
  styles: { body: { padding: 0 } },
};

const HistorialAcademicoPage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { usuario } = useAuth();
  // Portal del estudiante ("Mi historial"): solo PDF, sin Excel ni Volver.
  const esPortalEstudiante = esEstudiante(usuario);
  const {
    estudiante,
    filas,
    resumen,
    loading,
    error,
    sinFilas,
    descargando,
    descargandoPdf,
    exportarExcel,
    exportarPdf,
    breadcrumbItems,
    refetch,
  } = useHistorialAcademicoContext();

  const handleExportar = async () => {
    const result = await exportarExcel();
    if (result.success) {
      notification.success({
        title: 'Historial exportado',
        description: 'La descarga del Excel del historial académico comenzará en unos segundos.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintentá en unos segundos.',
      });
    }
  };

  const handleExportarPdf = async () => {
    const result = await exportarPdf();
    if (result.success) {
      notification.success({
        title: 'Historial exportado',
        description:
          'La descarga del PDF del historial académico (FORM-SIE-ITT-04) comenzará en unos segundos.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintentá en unos segundos.',
      });
    }
  };

  const actions = (
    <Flex gap={allSpacing.marginSM} wrap="wrap">
      <ActionButton
        permiso="academico.historial.academico"
        accion="EXPORTAR"
        variant="primary"
        icon={<FilePdfOutlined />}
        loading={descargandoPdf}
        disabled={loading || !!error || sinFilas}
        onClick={handleExportarPdf}
        title="Exporta el historial académico oficial (FORM-SIE-ITT-04) en PDF"
      >
        Descargar PDF
      </ActionButton>
      {!esPortalEstudiante && (
        <ActionButton
          permiso="academico.historial.academico"
          accion="EXPORTAR"
          variant="info"
          icon={<FileExcelOutlined />}
          loading={descargando}
          disabled={loading || !!error || sinFilas}
          onClick={handleExportar}
          title="Exporta el historial académico del estudiante a Excel"
        >
          Descargar Excel
        </ActionButton>
      )}
      {!esPortalEstudiante && (
        <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(HISTORIAL_SELECTOR_PATH)}>
          Volver
        </BackButton>
      )}
    </Flex>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Historial académico"
          breadcrumbItems={breadcrumbItems}
          actions={actions}
        />
      }
      sidebar={null}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando historial académico…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !estudiante}
        emptyDescription="No se encontró el historial de este estudiante."
      >
        {estudiante ? (
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <HistorialCabecera estudiante={estudiante} />
            <HistorialResumen resumen={resumen} />
            {sinFilas ? (
              <div className="historial-doc__empty">
                <Empty description="Aún no hay asignaturas registradas en el historial." />
              </div>
            ) : (
              <Card className="historial-hoja-card" {...hojaCardProps}>
                <HistorialTranscriptTable filas={filas} />
              </Card>
            )}
          </Flex>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default HistorialAcademicoPage;
