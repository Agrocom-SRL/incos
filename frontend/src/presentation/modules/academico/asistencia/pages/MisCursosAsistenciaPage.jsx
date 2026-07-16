/**
 * Mis cursos de Asistencia — cursos del docente (propio o vista coordinación).
 * Wrapper delgado del organismo compartido CursosDocenteView; cada curso lleva a
 * su planilla diaria. Acción "Tomar asistencia" (sin progreso por bimestre).
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ActionButton, BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useAuth } from '@application-auth';
import CursosDocenteView, {
  CursoDocenteCard,
} from '@organisms/CursosDocenteView';
import { useMisCursosAsistencia } from '@application-academico/asistencia/hooks/useMisCursosAsistencia.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ASISTENCIA_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';

const MisCursosAsistenciaPage = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuth();
  const puedeVolverCoordinacion = hasPermiso(ASISTENCIA_PERMISOS.coordinacion, 'LISTAR');

  const {
    titulo,
    cursos,
    docente,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cursoPath,
  } = useMisCursosAsistencia();

  // Volver a la entrada del módulo (Coordinación de asistencia: elegir docente).
  const handleVolver = useCallback(() => navigate(ASISTENCIA_PATH), [navigate]);

  const infoDescription = !isLoading ? (
    <span>
      Periodo lectivo <strong>{docente?.gestionVigente ?? '—'}</strong>. Elija
      un curso para tomar la asistencia diaria de sus estudiantes.
    </span>
  ) : null;

  // Solo el admin/coordinador (o quien ya está en vista coordinación) puede volver
  // a elegir docente; un docente sin ese permiso no tiene a dónde volver.
  const headerActions =
    esVistaCoordinacion || puedeVolverCoordinacion ? (
      <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end" align="center">
        <BackButton
          icon={<ArrowLeftOutlined />}
          onClick={handleVolver}
          aria-label="Volver a coordinación de asistencia"
        />
      </Flex>
    ) : null;

  return (
    <CursosDocenteView
      title={titulo}
      breadcrumbItems={breadcrumbItems}
      cursos={cursos}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      headerActions={headerActions}
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
