/**
 * Consolidado % de asistencia por paralelo (ACA-ASI-CONS · LISTAR/EXPORTAR).
 *
 * Reemplaza al retirado `reportes.asistencia` del módulo REP disuelto: matriz
 * estudiantes × asignaturas gemela del Centralizador, con % por curso y
 * promedio ponderado. Selector de paralelo (gestión vigente, mismo origen que
 * el Centralizador P1) + alcance temporal (acumulado anual por defecto o un
 * bimestre puntual). La orquestación vive en useConsolidadoAsistenciaPage;
 * la página solo compone.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Empty, Flex, Segmented, Select, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton, Text } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useConsolidadoAsistenciaPage } from '@application-academico/asistencia/hooks/state/useConsolidadoAsistenciaPage.js';
import { useExportConsolidadoAsistenciaExcel } from '@application-academico/asistencia/hooks/api/useExportConsolidadoAsistenciaExcel.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ASISTENCIA_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { BIMESTRES_CONSOLIDADO } from '@application-academico/asistencia/utils/asistenciaConsolidado.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import ConsolidadoAsistenciaGrid from '../components/ConsolidadoAsistenciaGrid.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/asistencia.css';

const { Paragraph } = Typography;

const ALCANCE_ANUAL = 'ANUAL';

/** La "hoja" de la matriz: card sin padding (la grilla y su leyenda lo aportan). */
const hojaCardProps = {
  ...asistenciaSectionCardProps,
  styles: { body: { padding: 0 } },
};

const ConsolidadoAsistenciaPage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const breadcrumbItems = useMemo(() => createBreadcrumbItems('ACA-ASI-CONS', 'ACA-ASI'), []);

  const {
    paraleloOptions,
    paralelosLoading,
    paralelosError,
    refetchParalelos,
    paraleloGestionId,
    setParaleloGestionId,
    paraleloSeleccionado,
    bimestre,
    setBimestre,
    asignaturas,
    estudiantes,
    gestionAnio,
    isLoading,
    error,
    refetch,
  } = useConsolidadoAsistenciaPage();

  const { exportar, loading: exportando } = useExportConsolidadoAsistenciaExcel();

  const sinDatos = estudiantes.length === 0 || asignaturas.length === 0;

  const handleExportar = useCallback(async () => {
    const result = await exportar({ paraleloGestionId, bimestre });
    if (result.success) {
      notification.success({
        title: 'Consolidado exportado',
        description:
          bimestre != null
            ? `La planilla del bimestre ${bimestre} se descargó correctamente.`
            : 'La planilla del acumulado anual se descargó correctamente.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  }, [exportar, paraleloGestionId, bimestre, notification]);

  const alcanceOptions = useMemo(
    () => [
      { value: ALCANCE_ANUAL, label: 'Anual (acumulado)' },
      ...BIMESTRES_CONSOLIDADO.map((n) => ({ value: n, label: `Bimestre ${n}` })),
    ],
    [],
  );

  const contextoLabel = useMemo(() => {
    if (!paraleloSeleccionado) return null;
    const partes = [];
    if (gestionAnio != null) partes.push(`Gestión ${gestionAnio}`);
    if (paraleloSeleccionado.carreraNombre) partes.push(paraleloSeleccionado.carreraNombre);
    if (paraleloSeleccionado.periodoNombre) partes.push(paraleloSeleccionado.periodoNombre);
    if (paraleloSeleccionado.paraleloNombre) {
      partes.push(`Paralelo ${paraleloSeleccionado.paraleloNombre}`);
    }
    partes.push(bimestre != null ? `Bimestre ${bimestre}` : 'Acumulado anual');
    return partes.join(' · ');
  }, [paraleloSeleccionado, gestionAnio, bimestre]);

  const renderCuerpo = () => {
    if (paralelosError) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los paralelos"
          description={paralelosError}
          action={
            <Button size="small" onClick={refetchParalelos}>
              Reintentar
            </Button>
          }
        />
      );
    }

    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar el consolidado"
          description={error}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      );
    }

    if (paraleloGestionId == null) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Seleccione un paralelo para generar la matriz de asistencia."
        />
      );
    }

    if (isLoading && estudiantes.length === 0) {
      return (
        <Flex
          vertical
          align="center"
          justify="center"
          gap={allSpacing.marginSM}
          style={{ minHeight: allSpacing.skeletonCardHeight }}
        >
          <Spin size="large" />
          <Text type="secondary">Cargando consolidado de asistencia...</Text>
        </Flex>
      );
    }

    if (sinDatos) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            bimestre != null
              ? 'El paralelo no tiene registros de asistencia computables para el bimestre seleccionado.'
              : 'El paralelo aún no tiene registros de asistencia computables en la gestión.'
          }
        />
      );
    }

    return (
      <Flex vertical gap={allSpacing.marginSM}>
        {contextoLabel ? <Text type="secondary">{contextoLabel}</Text> : null}
        <Card {...hojaCardProps}>
          <ConsolidadoAsistenciaGrid
            asignaturas={asignaturas}
            estudiantes={estudiantes}
            bimestre={bimestre}
          />
        </Card>
      </Flex>
    );
  };

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Consolidado de asistencia"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex gap={allSpacing.marginSM} wrap="wrap">
              <ActionButton
                permiso={ASISTENCIA_PERMISOS.consolidadoVer}
                accion="EXPORTAR"
                variant="info"
                icon={<FileExcelOutlined />}
                loading={exportando}
                disabled={isLoading || paraleloGestionId == null || sinDatos}
                onClick={handleExportar}
                title="Exporta la matriz del paralelo a Excel (mismo alcance de la pantalla)"
              >
                Exportar
              </ActionButton>
              <BackButton
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(ASISTENCIA_PATH)}
                aria-label="Volver a Asistencia"
              >
                Volver
              </BackButton>
            </Flex>
          }
        />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Consolidado de asistencia (%)" />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Porcentaje de asistencia de cada estudiante por asignatura del paralelo, con el
                promedio ponderado por sesiones. Misma regla que la actividad ASISTENCIA del
                cuaderno: ausente resta 1, retraso 0.5 y la licencia aprobada neutraliza la sesión.
              </Paragraph>
            </header>

            <div className="cfg-academico-tab-panel">
              <Flex vertical gap={allSpacing.marginLG}>
                <Flex gap={allSpacing.marginSM} align="center" wrap="wrap">
                  <Flex gap={allSpacing.marginXS} align="center">
                    <Text type="secondary">Paralelo</Text>
                    <Select
                      value={paraleloGestionId}
                      onChange={setParaleloGestionId}
                      style={{ minWidth: 320 }}
                      placeholder="Seleccione un paralelo"
                      loading={paralelosLoading}
                      showSearch
                      optionFilterProp="label"
                      options={paraleloOptions}
                      aria-label="Seleccionar paralelo"
                    />
                  </Flex>
                  <Flex gap={allSpacing.marginXS} align="center">
                    <Text type="secondary">Alcance</Text>
                    <Segmented
                      value={bimestre ?? ALCANCE_ANUAL}
                      onChange={(value) => setBimestre(value === ALCANCE_ANUAL ? null : value)}
                      options={alcanceOptions}
                      aria-label="Alcance temporal del consolidado"
                    />
                  </Flex>
                </Flex>

                {renderCuerpo()}
              </Flex>
            </div>
          </section>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ConsolidadoAsistenciaPage;
