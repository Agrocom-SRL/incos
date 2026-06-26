/**
 * P3 del Centralizador — matriz estudiantes × asignaturas de un bimestre.
 *
 * La celda muestra la nota del bimestre activo (`bim{n}`); cabeceras rotadas con
 * sigla + nombre + docente; gancho de Boletín por estudiante ("Próximamente").
 * Reusa el endpoint centralizador y la cabecera tipo documento.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCentralizadorParalelo } from '@application-academico/centralizador/hooks/useCentralizadorParalelo.js';
import { useExportCentralizadorExcel } from '@application-academico/centralizador/hooks/api/useExportCentralizadorExcel.js';
import { CENTRALIZADOR_PERMISOS } from '@application-academico/centralizador/utils/centralizadorPermisos.js';
import { centralizadorParaleloPath } from '@application-academico/centralizador/utils/centralizadorPaths.js';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import CentralizadorContextoHeader from '../components/CentralizadorContextoHeader.jsx';
import CentralizadorGrid from '../components/CentralizadorGrid.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/centralizador.css';

const hojaCardProps = {
  ...sectionCardProps,
  styles: { body: { padding: 0 } },
};

const CentralizadorMatrizPage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const {
    paraleloGestionId,
    bimestreActivo,
    paraleloSeleccionado,
    asignaturas,
    estudiantes,
    gestionAnio,
    gestionNombre,
    notaMinimaAprobacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  } = useCentralizadorParalelo('ACA-CENTRALIZADOR-MATRIZ');

  const { exportar, loading: exportando } = useExportCentralizadorExcel();

  const sinDatos = estudiantes.length === 0 || asignaturas.length === 0;

  const handleExportar = useCallback(async () => {
    const result = await exportar(paraleloGestionId, bimestreActivo);
    if (result.success) {
      notification.success({
        title: 'Centralizador exportado',
        description: 'La descarga del archivo Excel del paralelo se inició correctamente.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintentá en unos segundos.',
      });
    }
  }, [exportar, paraleloGestionId, bimestreActivo, notification]);

  const pageHeader = (
    <PageHeader
      title="Centralizador · matriz por bimestre"
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginSM} wrap="wrap">
          <ActionButton
            permiso={CENTRALIZADOR_PERMISOS.centralizador}
            accion="EXPORTAR"
            variant="info"
            icon={<FileExcelOutlined />}
            loading={exportando}
            disabled={isLoading || sinDatos}
            onClick={handleExportar}
            title="Exporta solo este paralelo (una hoja) para el bimestre actual"
          >
            Exportar
          </ActionButton>
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(centralizadorParaleloPath(paraleloGestionId))}
            aria-label="Volver a los bimestres del paralelo"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  const renderCuerpo = () => {
    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar el centralizador"
          description={typeof error === 'string' ? error : String(error)}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      );
    }

    if (isLoading && estudiantes.length === 0) {
      return (
        <Spin tip="Cargando centralizador…" spinning>
          <div className="cal-centralizador__spin-nest" aria-hidden />
        </Spin>
      );
    }

    if (estudiantes.length === 0 || asignaturas.length === 0) {
      return (
        <Alert
          type="warning"
          showIcon
          title={<strong>Sin datos para este paralelo</strong>}
          description="El paralelo no tiene estudiantes matriculados o asignaturas con calificaciones registradas."
        />
      );
    }

    return (
      <Flex vertical gap={allSpacing.marginLG}>
        <CentralizadorContextoHeader
          paralelo={paraleloSeleccionado}
          gestionAnio={gestionAnio}
          gestionNombre={gestionNombre}
          bimestre={bimestreActivo}
        />
        <Card className="cal-centralizador-hoja-card" {...hojaCardProps}>
          <CentralizadorGrid
            asignaturas={asignaturas}
            estudiantes={estudiantes}
            bimestre={bimestreActivo}
            notaMinimaAprobacion={notaMinimaAprobacion}
          />
        </Card>
      </Flex>
    );
  };

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>
      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} className="sd cal-centralizador">
          {renderCuerpo()}
        </Flex>
      </MainContent>
    </Flex>
  );
};

export default CentralizadorMatrizPage;
