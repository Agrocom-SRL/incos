/**
 * Calificaciones — pantalla de inicio: cursos del docente (título visible: "Mis cursos").
 */

import { Alert, Button } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useCalificacionesCursos } from '@application-academico/calificaciones/hooks/useCalificacionesCursos.js';
import CursoCard from '../components/CursoCard.jsx';
import CalificacionesCursosSkeleton from '../components/CalificacionesCursosSkeleton.jsx';
import '../styles/calificaciones.css';

const CalificacionesCursosPage = () => {
  const {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cuadernoPath,
  } = useCalificacionesCursos();

  const header = <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} />;

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-calificaciones-inicio sd">
        {!isLoading && subtitulo ? (
          <p className="cal-calificaciones-inicio__subtitulo">{subtitulo}</p>
        ) : null}
        {!isLoading && contextoLinea ? (
          <p className="cal-calificaciones-inicio__contexto">{contextoLinea}</p>
        ) : null}

        {isLoading ? <CalificacionesCursosSkeleton count={4} /> : null}

        {error ? (
          <Alert
            type="error"
            showIcon
            message="No se pudieron cargar los cursos"
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {!isLoading && cursos?.length ? (
          <div className="cal-calificaciones-inicio__grid">
            {cursos.map((curso) => (
              <CursoCard key={curso.id} curso={curso} cuadernoPath={cuadernoPath} />
            ))}
          </div>
        ) : null}
      </div>
    </PageTemplate>
  );
};

export default CalificacionesCursosPage;
