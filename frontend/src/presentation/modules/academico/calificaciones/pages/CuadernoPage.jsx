/**
 * Pantalla B — Cuaderno del curso (grilla de notas).
 */

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
  } = useCuadernoCurso();

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
          message="No se pudo cargar el cuaderno"
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
          <CuadernoHeader materia={curso.materia} subtitulo={subtituloCurso} />

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
            />
            <CuadernoFooter />
          </div>
        </div>
      </CuadernoAutosaveProvider>
    </PageTemplate>
  );
};

export default CuadernoPage;
