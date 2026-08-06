/**
 * P3 del Centralizador — matriz estudiantes × asignaturas de un bimestre.
 *
 * Columna Observaciones editable (bimestres_matricula.observaciones).
 * Boletín por estudiante: CentralizadorAnualPage.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCentralizadorParalelo } from '@application-academico/centralizador/hooks/useCentralizadorParalelo.js';
import { useCentralizadorObservacionesBimestre } from '@application-academico/centralizador/hooks/useCentralizadorObservacionesBimestre.js';
import { useExportCentralizadorExcel } from '@application-academico/centralizador/hooks/api/useExportCentralizadorExcel.js';
import { CENTRALIZADOR_PERMISOS } from '@application-academico/centralizador/utils/centralizadorPermisos.js';
import { centralizadorParaleloPath } from '@application-academico/centralizador/utils/centralizadorPaths.js';
import { LIBROS_LIST_PATH } from '@application-academico/libros/utils/librosPaths.js';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import CentralizadorContextoHeader from '../components/CentralizadorContextoHeader.jsx';
import CentralizadorGrid from '../components/CentralizadorGrid.jsx';
import CentralizadorLibroBadge from '../components/CentralizadorLibroBadge.jsx';
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
    libro,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  } = useCentralizadorParalelo('ACA-CENTRALIZADOR-MATRIZ');

  const [observacionesLocal, setObservacionesLocal] = useState({});

  const { exportar, loading: exportando } = useExportCentralizadorExcel();

  const abrirLibrosDeRegistro = () => navigate(LIBROS_LIST_PATH);

  const {
    puedeEditar: puedeEditarObservaciones,
    programarGuardado,
    registrarValorInicial,
    flushPendientes,
  } = useCentralizadorObservacionesBimestre({
    paraleloGestionId,
    bimestre: bimestreActivo,
  });

  /** Observaciones del bimestre activo tal como llegan del servidor (por estudiante). */
  const observacionesSeed = useMemo(() => {
    if (bimestreActivo == null) return null;
    const next = {};
    estudiantes.forEach((est) => {
      const obs = est.observacionesBimestre;
      const texto = obs?.[bimestreActivo] ?? obs?.[String(bimestreActivo)] ?? '';
      next[est.estudianteId] = texto;
    });
    return next;
  }, [estudiantes, bimestreActivo]);

  // El estado editable se resiembra al cambiar el seed (ajuste durante render,
  // sin setState en effect)…
  const [prevObservacionesSeed, setPrevObservacionesSeed] = useState(null);
  if (observacionesSeed !== prevObservacionesSeed) {
    setPrevObservacionesSeed(observacionesSeed);
    if (observacionesSeed) setObservacionesLocal(observacionesSeed);
  }

  // …y el registro del "último guardado" (refs del hook de autoguardado) se
  // sincroniza tras el commit.
  useEffect(() => {
    if (!observacionesSeed) return;
    Object.entries(observacionesSeed).forEach(([estudianteId, texto]) => {
      registrarValorInicial(estudianteId, texto);
    });
  }, [observacionesSeed, registrarValorInicial]);

  const estudiantesConObs = useMemo(
    () =>
      estudiantes.map((est) => ({
        ...est,
        observacionBimestre: observacionesLocal[est.estudianteId] ?? '',
      })),
    [estudiantes, observacionesLocal],
  );

  const handleObservacionChange = useCallback((estudianteId, valor) => {
    setObservacionesLocal((prev) => ({ ...prev, [estudianteId]: valor }));
  }, []);

  const handleObservacionBlur = useCallback(
    (estudianteId, valor) => {
      programarGuardado(estudianteId, valor);
    },
    [programarGuardado],
  );

  const sinDatos = estudiantes.length === 0 || asignaturas.length === 0;

  const handleExportar = useCallback(async () => {
    const flush = await flushPendientes(
      estudiantesConObs.map((est) => ({
        estudianteId: est.estudianteId,
        observacion: est.observacionBimestre,
      })),
    );
    if (!flush?.success) {
      notification.warning({
        title: 'Observaciones no guardadas',
        description:
          flush?.error ||
          'No se pudieron guardar todas las observaciones; el Excel puede quedar desactualizado.',
      });
    }

    const result = await exportar(paraleloGestionId, bimestreActivo);
    if (result.success) {
      notification.success({
        title: 'Centralizador exportado',
        description:
          'La descarga del Excel incluye notas del bimestre y la columna Observaciones.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  }, [
    exportar,
    flushPendientes,
    estudiantesConObs,
    paraleloGestionId,
    bimestreActivo,
    notification,
  ]);

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
            title="Exporta este paralelo y bimestre a Excel (notas + observaciones)"
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

        <Flex wrap="wrap" gap={allSpacing.marginSM} align="center">
          <span className="cal-centralizador-bim__selector-label">Libro de registro:</span>
          <CentralizadorLibroBadge libro={libro} onAbrirLibros={abrirLibrosDeRegistro} />
        </Flex>

        <Card className="cal-centralizador-hoja-card" {...hojaCardProps}>
          <CentralizadorGrid
            asignaturas={asignaturas}
            estudiantes={estudiantesConObs}
            bimestre={bimestreActivo}
            notaMinimaAprobacion={notaMinimaAprobacion}
            puedeEditarObservaciones={puedeEditarObservaciones}
            onObservacionChange={handleObservacionChange}
            onObservacionBlur={handleObservacionBlur}
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
