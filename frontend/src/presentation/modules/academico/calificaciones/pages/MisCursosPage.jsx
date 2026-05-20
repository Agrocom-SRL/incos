/**
 * Pantalla A — Mis cursos del docente.
 */

import { Alert, Button } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useMisCursos } from '@application-academico/calificaciones/hooks/useMisCursos.js';
import CursoCard from '../components/CursoCard.jsx';
import MisCursosSkeleton from '../components/MisCursosSkeleton.jsx';
import '../styles/calificaciones.css';

const MisCursosPage = () => {
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
  } = useMisCursos();

  const header = <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} />;

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-mis-cursos sd">
        {!isLoading && subtitulo ? (
          <p className="cal-mis-cursos__subtitulo">{subtitulo}</p>
        ) : null}
        {!isLoading && contextoLinea ? (
          <p className="cal-mis-cursos__contexto">{contextoLinea}</p>
        ) : null}

        {isLoading ? <MisCursosSkeleton count={4} /> : null}

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
          <div className="cal-mis-cursos__grid">
            {cursos.map((curso) => (
              <CursoCard key={curso.id} curso={curso} cuadernoPath={cuadernoPath} />
            ))}
          </div>
        ) : null}
      </div>
    </PageTemplate>
  );
};

export default MisCursosPage;
