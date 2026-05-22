/**
 * Pantalla B — Cuaderno del curso (grilla de notas del bimestre activo).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Modal, Spin, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCuadernoCurso } from '@application-academico/calificaciones/hooks/useCuadernoCurso.js';
import { contarNotasCargadas } from '@application-academico/calificaciones/utils/pesoEvaluaciones.js';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { useCalificacionesVistaContext } from '@application-academico/calificaciones/hooks/useCalificacionesVistaContext.js';
import {
  CuadernoAutosaveProvider,
  useCuadernoAutosaveRegistry,
} from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';
import CuadernoBimestrePager from '../components/CuadernoBimestrePager.jsx';
import CuadernoContextoPanel from '../components/CuadernoContextoPanel.jsx';
import CuadernoGrillaSeparador from '../components/CuadernoGrillaSeparador.jsx';
import NotasGrid from '../components/NotasGrid.jsx';
import CuadernoFooter from '../components/CuadernoFooter.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
import EvaluacionDrawer from '../components/EvaluacionDrawer.jsx';
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
  modoEdicion,
  onAbrirCrear,
  onAbrirEditar,
  resetearNotasEvaluacion,
  onEliminadoColumna,
  onRefetchCuaderno,
  enteringColumnIds,
  removingColumnId,
}) => {
  const {
    collectNotasParaGuardar,
    marcarNotasGuardadasEnLote,
    setGuardandoBimestre,
    guardandoBimestre,
    resetEvaluacionRegistro,
  } = useCuadernoAutosaveRegistry();
  const soloLectura = !modoEdicion;

  const handleReset = useCallback(
    (ev) => {
      const notasCount = contarNotasCargadas(estudiantes, ev.id);
      Modal.confirm({
        title: 'Restablecer notas',
        okText: 'Restablecer',
        okType: 'danger',
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
        title: 'Eliminar evaluación',
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        content:
          notasCount > 0 ? (
            <span>
              ¿Eliminar <strong>{ev.nombre}</strong>? Se borrarán <strong>{notasCount}</strong>{' '}
              notas y se recalcularán los componentes del bimestre. Esta acción no se puede deshacer.
            </span>
          ) : (
            <span>
              ¿Eliminar la evaluación <strong>{ev.nombre}</strong>? Esta acción no se puede
              deshacer.
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
        message: 'Notas guardadas',
        description:
          notas.length > 0
            ? `Se guardaron ${res.data?.notasGuardadas ?? notas.length} nota(s) y se recalculó el bimestre y la nota final.`
            : 'Se recalculó el bimestre y la nota final del curso.',
      });
      await onRefetchCuaderno?.();
    } catch (err) {
      notification.error({
        message: 'Error al guardar',
        description: typeof err?.message === 'string' ? err.message : 'Reintentá en unos segundos.',
      });
    } finally {
      setGuardandoBimestre(false);
    }
  }, [
    bimestreActivo,
    collectNotasParaGuardar,
    cursoId,
    marcarNotasGuardadasEnLote,
    onRefetchCuaderno,
    setGuardandoBimestre,
  ]);

  return (
    <NotasGrid
      cursoId={cursoId}
      bimestre={bimestreActivo}
      bimestreTitulo={bimestreTitulo}
      estudiantes={estudiantes}
      evaluaciones={evaluaciones}
      soloLectura={soloLectura}
      onAgregarEvaluacion={onAbrirCrear}
      onEditarEvaluacion={modoEdicion ? onAbrirEditar : undefined}
      onResetEvaluacion={modoEdicion ? handleReset : undefined}
      onEliminarEvaluacion={modoEdicion ? handleEliminar : undefined}
      onGuardarBimestre={modoEdicion ? handleGuardarBimestre : undefined}
      guardandoBimestre={guardandoBimestre}
      enteringColumnIds={enteringColumnIds}
      removingColumnId={removingColumnId}
    />
  );
};

const CuadernoPage = () => {
  const navigate = useNavigate();
  const { docenteNombreCoordinacion } = useCalificacionesVistaContext();
  const {
    curso,
    docente,
    evaluaciones,
    estudiantes,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    modoEdicion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    tituloPagina,
    cursoId,
    volverPath,
    esVistaCoordinacion,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
    resetearNotasEvaluacion,
  } = useCuadernoCurso();

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

  const handleGuardado = useCallback((evaluacion) => {
    setEnteringColumnIds((prev) => [...prev, evaluacion.id]);
    window.setTimeout(() => {
      setEnteringColumnIds((prev) => prev.filter((id) => id !== evaluacion.id));
    }, 300);
  }, []);

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
      />
      <span>{tituloPagina}</span>
    </Flex>
  );

  const pageHeader = (
    <PageHeader
      title={tituloHeader}
      breadcrumbItems={breadcrumbItems}
      actions={
        <BackButton
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(volverPath)}
          aria-label="Volver al registro académico"
        >
          Volver
        </BackButton>
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
          modoEdicion={modoEdicion}
          onAbrirCrear={abrirCrear}
          onAbrirEditar={modoEdicion ? abrirEditar : undefined}
          resetearNotasEvaluacion={resetearNotasEvaluacion}
          onEliminadoColumna={handleEliminado}
          onRefetchCuaderno={refetch}
          enteringColumnIds={enteringColumnIds}
          removingColumnId={removingColumnId}
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
        <Spin spinning={isLoading} tip="Cargando cuaderno…">
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

      <EvaluacionDrawer
        abierto={drawerAbierto}
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
      />
    </Flex>
  );
};

export default CuadernoPage;
