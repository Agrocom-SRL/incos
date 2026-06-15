/**
 * Mis cursos de Asistencia — cursos del docente (propio o vista coordinación).
 * Wrapper delgado del organismo compartido CursosDocenteView; cada curso lleva a
 * su planilla diaria. Acción "Tomar asistencia" (sin progreso por bimestre).
 */

import { useNavigate } from 'react-router-dom';
import { ActionButton } from '@atoms';
import CursosDocenteView, {
  CursoDocenteCard,
} from '@organisms/CursosDocenteView';
import { useMisCursosAsistencia } from '@application-academico/asistencia/hooks/useMisCursosAsistencia.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

const MisCursosAsistenciaPage = () => {
  const navigate = useNavigate();
  const {
    titulo,
    cursos,
    docente,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cursoPath,
  } = useMisCursosAsistencia();

  const infoDescription = !isLoading ? (
    <span>
      Periodo lectivo <strong>{docente?.gestionVigente ?? '—'}</strong>. Elegí
      un curso para tomar la asistencia diaria de sus estudiantes.
    </span>
  ) : null;

  return (
    <CursosDocenteView
      title={titulo}
      breadcrumbItems={breadcrumbItems}
      cursos={cursos}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      infoTitle="Registro de asistencia"
      infoDescription={infoDescription}
      emptyTitle="Sin cursos asignados en el periodo vigente."
      renderCard={(curso) => (
        <CursoDocenteCard
          key={curso.id}
          curso={curso}
          renderAction={
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroVer}
              accion="LISTAR"
              variant="primary"
              onClick={() => navigate(cursoPath(curso.id))}
            >
              Tomar asistencia
            </ActionButton>
          }
        />
      )}
    />
  );
};

export default MisCursosAsistenciaPage;
