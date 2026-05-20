/**
 * Calificaciones — cursos del docente (propio o elegido por coordinación).
 */

import { Alert, Button } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useMisCursosCalificaciones } from '@application-academico/calificaciones/hooks/useMisCursosCalificaciones.js';
import {
  CALIFICACIONES_PATH,
  CALIFICACIONES_TABLERO_PATH,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CalificacionesAcciones, {
  AccionTableroGestion,
  AccionVolverCoordinacion,
} from '../components/CalificacionesAcciones.jsx';
import ImpersonacionBanner from '../components/ImpersonacionBanner.jsx';
import CursoCard from '../components/CursoCard.jsx';
import CalificacionesCursosSkeleton from '../components/CalificacionesCursosSkeleton.jsx';
import '../styles/calificaciones.css';

const MisCursosPage = () => {
  const {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    impersonacion,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cuadernoPath,
  } = useMisCursosCalificaciones();

  const header = <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} />;

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-calificaciones-inicio sd">
        <CalificacionesAcciones className="cal-acciones--end">
          {esVistaCoordinacion ? <AccionVolverCoordinacion to={CALIFICACIONES_PATH} /> : null}
          <AccionTableroGestion to={CALIFICACIONES_TABLERO_PATH} />
        </CalificacionesAcciones>

        <ImpersonacionBanner impersonacion={impersonacion} />

        {!isLoading && subtitulo ? (
          <p className="cal-calificaciones-inicio__subtitulo">{subtitulo}</p>
        ) : null}
        {!isLoading && contextoLinea ? (
          <p className="cal-calificaciones-inicio__contexto">{contextoLinea}</p>
        ) : null}

        {isLoading ? <CalificacionesCursosSkeleton count={esVistaCoordinacion ? 3 : 4} /> : null}

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

        {!isLoading && !error && cursos?.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message={
              esVistaCoordinacion
                ? 'Este docente no tiene cursos asignados en la gestión.'
                : 'No tenés cursos asignados en la gestión vigente.'
            }
          />
        ) : null}
      </div>
    </PageTemplate>
  );
};

export default MisCursosPage;
