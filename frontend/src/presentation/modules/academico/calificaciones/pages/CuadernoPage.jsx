/**
 * Pantalla B — Cuaderno del curso (grilla de notas).
 */

import { useCallback, useState } from 'react';
import { Alert, Button } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useCuadernoCurso } from '@application-academico/calificaciones/hooks/useCuadernoCurso.js';
import { CuadernoAutosaveProvider } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';
import CuadernoHeader from '../components/CuadernoHeader.jsx';
import BimestreTabs from '../components/BimestreTabs.jsx';
import NotasGrid from '../components/NotasGrid.jsx';
import CuadernoFooter from '../components/CuadernoFooter.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
import EvaluacionDrawer from '../components/EvaluacionDrawer.jsx';
import AjustesCursoDrawer from '../components/AjustesCursoDrawer.jsx';
import VistaPreviaDrawer from '../components/VistaPreviaDrawer.jsx';
import ImpersonacionBanner from '../components/ImpersonacionBanner.jsx';
import '../styles/calificaciones.css';

const CuadernoPage = () => {
  const {
    curso,
    evaluaciones,
    estudiantes,
    bimestres,
    bimestreActivo,
    modoEdicion,
    setBimestreActivo,
    isLoading,
    isRefetching,
    error,
    refetch,
    breadcrumbItems,
    subtituloCurso,
    cursoId,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
    impersonacion,
  } = useCuadernoCurso();

  const [ajustesAbierto, setAjustesAbierto] = useState(false);
  const [vistaPreviaAbierta, setVistaPreviaAbierta] = useState(false);
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

  const header = (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      className="cal-cuaderno-page-header"
    />
  );

  if (isLoading && !curso) {
    return (
      <PageTemplate header={header} sidebar={null}>
        <CuadernoSkeleton />
      </PageTemplate>
    );
  }

  if (error && !curso) {
    return (
      <PageTemplate header={header} sidebar={null}>
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar el cuaderno"
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate header={header} sidebar={null}>
      <CuadernoAutosaveProvider>
        <div className="cal-cuaderno sd">
          <ImpersonacionBanner impersonacion={impersonacion} />

          <CuadernoHeader
            materia={curso.materia}
            subtitulo={subtituloCurso}
            onAjustes={() => setAjustesAbierto(true)}
            onVistaPrevia={() => setVistaPreviaAbierta(true)}
          />

          <BimestreTabs
            bimestres={bimestres}
            bimestreActivo={bimestreActivo}
            onChange={setBimestreActivo}
          />

          <div className="cal-cuaderno-hoja">
            <NotasGrid
              cursoId={cursoId}
              estudiantes={estudiantes}
              evaluaciones={evaluaciones}
              soloLectura={!modoEdicion}
              isRefetching={isRefetching}
              onAgregarEvaluacion={modoEdicion ? abrirCrear : undefined}
              onEditarEvaluacion={modoEdicion ? abrirEditar : undefined}
              enteringColumnIds={enteringColumnIds}
              removingColumnId={removingColumnId}
            />
            <CuadernoFooter />
          </div>

          <AjustesCursoDrawer
            abierto={ajustesAbierto}
            cursoId={cursoId}
            onCerrar={() => setAjustesAbierto(false)}
          />

          <VistaPreviaDrawer
            abierto={vistaPreviaAbierta}
            cursoId={cursoId}
            bimestre={bimestreActivo}
            estudiantes={estudiantes}
            evaluaciones={evaluaciones}
            onCerrar={() => setVistaPreviaAbierta(false)}
          />

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
        </div>
      </CuadernoAutosaveProvider>
    </PageTemplate>
  );
};

export default CuadernoPage;
