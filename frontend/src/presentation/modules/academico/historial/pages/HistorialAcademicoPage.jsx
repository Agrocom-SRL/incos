/**
 * HistorialAcademicoPage — detalle del Historial académico (permiso DETALLE).
 *
 * Documento FORM-SIE-ITT-04 del estudiante `:id`: cabecera (datos del estudiante)
 * + tabla transcript (todas las gestiones) + pie resumen (escala de valoración,
 * carga horaria, aprobadas, promedio). Botón Exportar (Excel) con ActionButton
 * (permiso academico.historial.academico · acción EXPORTAR).
 *
 * Página "dumb": compone template + organismos y consume el contexto que publica
 * `HistorialAcademicoProvider` (estado en hooks/state). Cubre carga/vacío/error.
 */

import { useNavigate } from 'react-router-dom';
import { App, Empty, Flex } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { DetailPageShell } from '@organisms';
import { allSpacing } from '@theme/tokens';
import { useHistorialAcademicoContext } from '@application-academico/historial/hooks/context/useHistorialAcademicoContext.js';
import { HISTORIAL_SELECTOR_PATH } from '@application-academico/historial/utils/historialPaths.js';
import HistorialCabecera from '../components/HistorialCabecera.jsx';
import HistorialTranscriptTable from '../components/HistorialTranscriptTable.jsx';
import HistorialResumen from '../components/HistorialResumen.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/historial.css';

const HistorialAcademicoPage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const {
    estudiante,
    filas,
    resumen,
    loading,
    error,
    sinFilas,
    descargando,
    exportarExcel,
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

  const actions = (
    <Flex gap={allSpacing.marginSM} wrap="wrap">
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
        Exportar
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(HISTORIAL_SELECTOR_PATH)}>
        Volver
      </BackButton>
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
            {sinFilas ? (
              <div className="historial-doc__empty">
                <Empty description="Aún no hay asignaturas registradas en el historial." />
              </div>
            ) : (
              <HistorialTranscriptTable filas={filas} />
            )}
            <HistorialResumen resumen={resumen} />
          </Flex>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default HistorialAcademicoPage;
