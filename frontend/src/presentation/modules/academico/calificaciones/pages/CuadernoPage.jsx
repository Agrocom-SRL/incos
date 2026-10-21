/**
 * Pantalla B — Cuaderno del curso (grilla de notas del bimestre activo).
 */

import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Modal, Spin } from 'antd';
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useAcciones } from '@application-shared/hooks';
import { useCuadernoCurso } from '@application-academico/calificaciones/hooks/useCuadernoCurso.js';
import { useBimestrePagerTeclado } from '@application-academico/calificaciones/hooks/useBimestrePagerTeclado.js';
import { useNavegacionBimestres } from '@application-academico/calificaciones/hooks/useNavegacionBimestres.js';
import { contarNotasCargadas } from '@application-academico/calificaciones/utils/puntosEvaluaciones.js';
import { usePoliticaInstitucional } from '@application-academico/calificaciones/hooks/usePoliticaInstitucional.js';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import { CALIFICACIONES_VIEW_ROUTE_KEY } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CuadernoAutosaveProvider } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';
import { useCuadernoAutosaveRegistry } from '@application-academico/calificaciones/context/cuadernoAutosaveContexts';
import CuadernoBimestrePager from '../components/CuadernoBimestrePager.jsx';
import CuadernoContextoPanel from '../components/CuadernoContextoPanel.jsx';
import CuadernoGrillaSeparador from '../components/CuadernoGrillaSeparador.jsx';
import NotasGrid from '../components/NotasGrid.jsx';
import CuadernoFooter from '../components/CuadernoFooter.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
const EvaluacionDrawer = lazy(() => import('../components/EvaluacionDrawer.jsx'));
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const hojaCardProps = {
  ...calificacionesSectionCardProps,
  styles: {
    body: { padding: 0 },
  },
};

const CuadernoGrilla = ({
  cursoId,
  bimestreActivo,
  bimestreTitulo,
  evaluaciones,
  estudiantes,
  puedeCrearEvaluacion,
  puedeEditarEvaluacion,
  puedeEliminarEvaluacion,
  puedeEditarNotas,
  puedeGuardarBimestre,
  onAbrirCrear,
  onAbrirEditar,
  resetearNotasEvaluacion,
  onEliminadoColumna,
  onRefetchCuaderno,
  enteringColumnIds,
  removingColumnId,
  cuotaTeorico,
  cuotaPractico,
}) => {
  const { notification } = App.useApp();
  const sumaComponente = (comp) =>
    evaluaciones
      .filter((ev) => ev.componente === comp)
      .reduce((acc, ev) => acc + (Number(ev.puntos) || 0), 0);
  const cuotaCompleta =
    sumaComponente('TEORICO') >= cuotaTeorico && sumaComponente('PRACTICO') >= cuotaPractico;
  const {
    collectNotasParaGuardar,
    marcarNotasGuardadasEnLote,
    setGuardandoBimestre,
    guardandoBimestre,
    resetEvaluacionRegistro,
    hayCambiosPendientes,
  } = useCuadernoAutosaveRegistry();
  const handleReset = useCallback(
    (ev) => {
      const notasCount = contarNotasCargadas(estudiantes, ev.id);
      Modal.confirm({
        title: 'Restablecer notas',
        okText: 'Restablecer',
        okType: 'warning',
        cancelText: 'Cancelar',
        content:
          notasCount > 0 ? (
            <span>
              ¿Borrar las <strong>{notasCount}</strong> notas cargadas en{' '}
              <strong>{ev.nombre}</strong>? Se recalcularán los componentes del bimestre.
            </span>
          ) : (
            <span>
              No hay notas cargadas en <strong>{ev.nombre}</strong>. ¿Continuar igualmente?
            </span>
          ),
        onOk: async () => {
          await resetearNotasEvaluacion(ev.id);
          resetEvaluacionRegistro(ev.id);
        },
      });
    },
    [estudiantes, resetEvaluacionRegistro, resetearNotasEvaluacion],
  );

  const handleEliminar = useCallback(
    (ev) => {
      const notasCount = contarNotasCargadas(estudiantes, ev.id);
      Modal.confirm({
        title: 'Eliminar actividad',
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        content:
          notasCount > 0 ? (
            <span>
              ¿Eliminar la actividad <strong>{ev.nombre}</strong>? Se borrarán{' '}
              <strong>{notasCount}</strong> notas y se recalcularán los componentes del bimestre.
              Esta acción no se puede deshacer.
            </span>
          ) : (
            <span>
              ¿Eliminar la actividad <strong>{ev.nombre}</strong>? Esta acción no se puede deshacer.
            </span>
          ),
        onOk: async () => {
          resetEvaluacionRegistro(ev.id);
          await onEliminadoColumna(ev.id);
        },
      });
    },
    [estudiantes, resetEvaluacionRegistro, onEliminadoColumna],
  );

  const handleGuardarBimestre = useCallback(async () => {
    const notas = collectNotasParaGuardar();
    const maxPorEvaluacion = new Map(
      evaluaciones.map((ev) => [ev.id, Math.round(Number(ev.puntos) || 100)]),
    );
    const hayNotasFueraDeRango = notas.some((n) => {
      if (n.nota == null || n.nota === '') return false;
      const max = maxPorEvaluacion.get(n.evaluacionId) ?? 100;
      return Math.round(Number(n.nota)) > max;
    });

    if (hayNotasFueraDeRango) {
      notification.error({
        title: 'Notas fuera de rango',
        description:
          'Hay puntos que superan la calificación asignada a una actividad. Corrija las celdas en rojo antes de guardar.',
      });
      return;
    }

    setGuardandoBimestre(true);
    try {
      const res = await CalificacionRepository.guardarNotasCuadernoBimestre(
        cursoId,
        bimestreActivo,
        notas,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudieron guardar las notas');
      }
      marcarNotasGuardadasEnLote(res.data?.notas ?? []);
      notification.success({
        title: 'Notas guardadas',
        description:
          notas.length > 0
            ? `Se guardaron ${res.data?.notasGuardadas ?? notas.length} nota(s) y se recalculó el bimestre y la nota final.`
            : 'Se recalculó el bimestre y la nota final del curso.',
      });
      await onRefetchCuaderno?.();
    } catch (err) {
      notification.error({
        title: 'Error al guardar',
        description: typeof err?.message === 'string' ? err.message : 'Reintente en unos segundos.',
      });
    } finally {
      setGuardandoBimestre(false);
    }
  }, [
    bimestreActivo,
    collectNotasParaGuardar,
    cursoId,
    evaluaciones,
    marcarNotasGuardadasEnLote,
    onRefetchCuaderno,
    setGuardandoBimestre,
    notification,
  ]);

  return (
    <NotasGrid
      cursoId={cursoId}
      bimestre={bimestreActivo}
      bimestreTitulo={bimestreTitulo}
      estudiantes={estudiantes}
      evaluaciones={evaluaciones}
      soloLecturaNotas={!puedeEditarNotas}
      onAgregarEvaluacion={puedeCrearEvaluacion ? onAbrirCrear : undefined}
      onEditarEvaluacion={puedeEditarEvaluacion ? onAbrirEditar : undefined}
      onResetEvaluacion={puedeEditarEvaluacion ? handleReset : undefined}
      onEliminarEvaluacion={puedeEliminarEvaluacion ? handleEliminar : undefined}
      onGuardarBimestre={puedeGuardarBimestre ? handleGuardarBimestre : undefined}
      guardandoBimestre={guardandoBimestre}
      mostrarGuardar={puedeGuardarBimestre && hayCambiosPendientes}
      ocultarHintAgregar={cuotaCompleta}
      enteringColumnIds={enteringColumnIds}
      removingColumnId={removingColumnId}
    />
  );
};

const CuadernoPage = () => {
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { contextName: docenteNombreCoordinacion } = useRouteViewMode(CALIFICACIONES_VIEW_ROUTE_KEY);
  const { politica } = usePoliticaInstitucional();
  const cuotaTeorico = Number(politica?.cuotaTeorico) || 30;
  const cuotaPractico = Number(politica?.cuotaPractico) || 70;
  const ajusteAdmin = useAcciones(CALIFICACIONES_PERMISOS.bimestreAjusteAdmin);
  const {
    curso,
    docente,
    evaluaciones,
    estudiantes,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    periodoBimestreActivo,
    gestionFechaFin,
    reabierto,
    modoEdicion,
    puedeCrearEvaluacion,
    puedeEditarEvaluacion,
    puedeEliminarEvaluacion,
    puedeEditarNotas,
    puedeGuardarBimestre,
    isLoading,
    isRefetching,
    error,
    refetch,
    breadcrumbItems,
    tituloPagina,
    cursoId,
    volverPath,
    esVistaCoordinacion,
    bimestresCalendario,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
    resetearNotasEvaluacion,
  } = useCuadernoCurso();

  const [cerrandoBimestre, setCerrandoBimestre] = useState(false);
  const puedeCerrarBimestre = reabierto && ajusteAdmin.puedeEditar;

  const handleCerrarConsolidar = useCallback(() => {
    modal.confirm({
      title: 'Cerrar y consolidar bimestre',
      okText: 'Cerrar bimestre',
      okType: 'danger',
      cancelText: 'Cancelar',
      content: (
        <span>
          Se cerrará nuevamente el <strong>{bimestreTitulo}</strong> y se consolidarán las notas del
          cuaderno. El docente ya no podrá editarlo hasta una nueva reapertura.
        </span>
      ),
      onOk: async () => {
        setCerrandoBimestre(true);
        try {
          const res = await CalificacionRepository.cerrarBimestreCurso(cursoId, bimestreActivo);
          if (!res?.success) {
            throw new Error(res?.error || 'No se pudo cerrar el bimestre');
          }
          notification.success({
            title: 'Bimestre cerrado',
            description: 'Se consolidaron las notas del bimestre.',
          });
          navigate(volverPath);
        } catch (err) {
          notification.error({
            title: 'No se pudo cerrar el bimestre',
            description:
              typeof err?.message === 'string' ? err.message : 'Reintente en unos segundos.',
          });
          setCerrandoBimestre(false);
        }
      },
    });
  }, [modal, notification, navigate, bimestreTitulo, cursoId, bimestreActivo, volverPath]);

  const navegacionBimestres = useNavegacionBimestres(
    cursoId,
    bimestreActivo,
    bimestreVigente,
    { bimestresCalendario },
  );
  useBimestrePagerTeclado({
    habilitado: Boolean(cursoId) && !isLoading && !isRefetching,
    puedeAnterior: navegacionBimestres.puedeAnterior,
    puedeSiguiente: navegacionBimestres.puedeSiguiente,
    onAnterior: navegacionBimestres.irAnterior,
    onSiguiente: navegacionBimestres.irSiguiente,
  });

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [drawerModo, setDrawerModo] = useState('crear');
  const [evaluacionEditar, setEvaluacionEditar] = useState(null);
  const [enteringColumnIds, setEnteringColumnIds] = useState([]);
  const [removingColumnId, setRemovingColumnId] = useState(null);

  const abrirCrear = useCallback(() => {
    setDrawerModo('crear');
    setEvaluacionEditar(null);
    setDrawerAbierto(true);
  }, []);

  const abrirEditar = useCallback((ev) => {
    setDrawerModo('editar');
    setEvaluacionEditar(ev);
    setDrawerAbierto(true);
  }, []);

  const cerrarDrawer = useCallback(() => {
    setDrawerAbierto(false);
    setEvaluacionEditar(null);
  }, []);

  const handleGuardado = useCallback(
    (evaluacion, opts) => {
      setEnteringColumnIds((prev) => [...prev, evaluacion.id]);
      window.setTimeout(() => {
        setEnteringColumnIds((prev) => prev.filter((id) => id !== evaluacion.id));
      }, 300);
      // Actividad de asistencia: su nota la recalcula el backend a partir de los puntos.
      // Tras crear/editar la ponderación recargamos el cuaderno para reflejar las notas
      // recalculadas sin necesidad de refrescar la pantalla a mano.
      if (opts?.recalcular) {
        refetch();
      }
    },
    [refetch],
  );

  const estudiantesFiltrados = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((e) => {
      const nombre = (e.nombre ?? '').toLowerCase();
      const codigo = (e.codigo ?? '').toLowerCase();
      const nro = String(e.nro ?? '');
      return nombre.includes(q) || codigo.includes(q) || nro.includes(q);
    });
  }, [estudiantes, busquedaEstudiante]);

  const handleEliminado = useCallback(
    async (evaluacionId) => {
      setRemovingColumnId(evaluacionId);
      await new Promise((resolve) => {
        window.setTimeout(resolve, 250);
      });
      await eliminarEvaluacion(evaluacionId);
      setRemovingColumnId(null);
    },
    [eliminarEvaluacion],
  );

  const tituloHeader = (
    <Flex align="center" wrap="wrap" gap={8} className="cal-cuaderno-page-title">
      <CuadernoBimestrePager
        asignacionId={cursoId}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
        bimestresCalendario={bimestresCalendario}
      />
      <span>{tituloPagina}</span>
    </Flex>
  );

  const pageHeader = (
    <PageHeader
      title={tituloHeader}
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={8} wrap="wrap">
          {puedeCerrarBimestre ? (
            <ActionButton
              permiso={CALIFICACIONES_PERMISOS.bimestreAjusteAdmin}
              accion="EDITAR"
              variant="danger"
              icon={<LockOutlined />}
              loading={cerrandoBimestre}
              onClick={handleCerrarConsolidar}
            >
              Cerrar y consolidar bimestre
            </ActionButton>
          ) : null}
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(volverPath)}
            aria-label="Volver al registro académico"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  const cardContexto = (
    <Card className="cal-cuaderno-contexto-card" {...calificacionesSectionCardProps}>
      <CuadernoContextoPanel
        curso={curso}
        docente={docente}
        bimestreTitulo={bimestreTitulo}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
        reabierto={reabierto}
        modoEdicion={modoEdicion}
        esVistaCoordinacion={esVistaCoordinacion}
        docenteNombre={docenteNombreCoordinacion}
      />
    </Card>
  );

  const cardGrilla = (
    <Card className="cal-cuaderno-hoja-card" {...hojaCardProps}>
      <div className="cal-cuaderno-hoja">
        <CuadernoGrillaSeparador
          bimestreTitulo={bimestreTitulo}
          bimestreNum={bimestreActivo}
          fechaInicio={periodoBimestreActivo?.fechaInicio ?? periodoBimestreActivo?.fecha_inicio}
          fechaFin={periodoBimestreActivo?.fechaFin ?? periodoBimestreActivo?.fecha_fin}
          gestionFechaFin={gestionFechaFin}
          mostrarPlazo={bimestreActivo === bimestreVigente}
          busqueda={busquedaEstudiante}
          onBusquedaChange={setBusquedaEstudiante}
          totalEstudiantes={estudiantes.length}
          filtrados={estudiantesFiltrados.length}
        />
        <CuadernoGrilla
          cursoId={cursoId}
          bimestreActivo={bimestreActivo}
          bimestreTitulo={bimestreTitulo}
          evaluaciones={evaluaciones}
          estudiantes={estudiantesFiltrados}
          puedeCrearEvaluacion={puedeCrearEvaluacion}
          puedeEditarEvaluacion={puedeEditarEvaluacion}
          puedeEliminarEvaluacion={puedeEliminarEvaluacion}
          puedeEditarNotas={puedeEditarNotas}
          puedeGuardarBimestre={puedeGuardarBimestre}
          onAbrirCrear={abrirCrear}
          onAbrirEditar={abrirEditar}
          resetearNotasEvaluacion={resetearNotasEvaluacion}
          onEliminadoColumna={handleEliminado}
          onRefetchCuaderno={refetch}
          enteringColumnIds={enteringColumnIds}
          removingColumnId={removingColumnId}
          cuotaTeorico={cuotaTeorico}
          cuotaPractico={cuotaPractico}
        />
        <CuadernoFooter />
      </div>
    </Card>
  );

  if (isLoading && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <CuadernoSkeleton />
        </MainContent>
      </Flex>
    );
  }

  if (error && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el cuaderno"
            description={typeof error === 'string' ? error : String(error)}
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
          />
        </MainContent>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>

      <MainContent>
        <Spin spinning={isRefetching} tip="Actualizando cuaderno…">
          <CuadernoAutosaveProvider>
            <Flex vertical gap={allSpacing.marginLG} className="sd cal-cuaderno">
              {error ? (
                <Alert
                  type="error"
                  showIcon
                  title="Error al actualizar el cuaderno"
                  description={typeof error === 'string' ? error : String(error)}
                />
              ) : null}

              {cardContexto}
              {cardGrilla}
            </Flex>
          </CuadernoAutosaveProvider>
        </Spin>
      </MainContent>

      {drawerAbierto ? (
        <Suspense fallback={null}>
          <EvaluacionDrawer
            abierto
            modo={drawerModo}
            evaluacion={evaluacionEditar}
            cursoId={cursoId}
            bimestre={bimestreActivo}
            evaluacionesActuales={evaluaciones}
            estudiantes={estudiantes}
            onCerrar={cerrarDrawer}
            onGuardado={handleGuardado}
            onEliminado={handleEliminado}
            crearEvaluacion={crearEvaluacion}
            editarEvaluacion={editarEvaluacion}
            cuotaTeorico={cuotaTeorico}
            cuotaPractico={cuotaPractico}
          />
        </Suspense>
      ) : null}
    </Flex>
  );
};

export default CuadernoPage;
