/**
 * Calificaciones — cursos del docente (propio o elegido por coordinación).
 * Wrapper delgado del organismo compartido CursosDocenteView; inyecta el
 * progreso por bimestre (extra) y la acción "Abrir curso".
 */

import { useCallback } from 'react';
import { useAuth } from '@application-auth';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import CursosDocenteView, {
  CursoDocenteCard,
} from '@organisms/CursosDocenteView';
import { useMisCursosCalificaciones } from '@application-academico/calificaciones/hooks/useMisCursosCalificaciones.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CursoBimestres from '../components/CursoBimestres.jsx';

const MisCursosPage = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuth();
  const puedeVolverCoordinacion = hasPermiso(
    CALIFICACIONES_PERMISOS.coordinacion,
    'LISTAR'
  );

  const {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    docente,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cursoPath,
    periodoLectivoLabel,
  } = useMisCursosCalificaciones();

  const handleVolver = useCallback(() => {
    navigate(CALIFICACIONES_PATH);
  }, [navigate]);

  const headerActions =
    esVistaCoordinacion || puedeVolverCoordinacion ? (
      <Flex
        wrap="wrap"
        gap={allSpacing.marginSM}
        justify="flex-end"
        align="center"
      >
        <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />
      </Flex>
    ) : null;

  const infoDescription =
    !isLoading && periodoLectivoLabel ? (
      <span>
        {subtitulo ? (
          <>
            {subtitulo}
            <br />
          </>
        ) : null}
        Periodo lectivo según calendario académico:{' '}
        <strong>{periodoLectivoLabel}</strong>
        {contextoLinea ? (
          <>
            <br />
            {contextoLinea}
          </>
        ) : null}
      </span>
    ) : null;

  return (
    <CursosDocenteView
      title={titulo}
      breadcrumbItems={breadcrumbItems}
      headerActions={headerActions}
      cursos={cursos}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      infoTitle={esVistaCoordinacion ? 'Cursos del docente' : 'Sus cursos'}
      infoDescription={infoDescription}
      emptyTitle={
        esVistaCoordinacion
          ? 'Este docente no tiene cursos asignados en la gestión.'
          : 'No tiene cursos asignados en la gestión vigente.'
      }
      skeletonCount={esVistaCoordinacion ? 3 : 4}
      renderCard={(curso) => (
        <CursoDocenteCard
          key={curso.id}
          curso={curso}
          renderExtra={
            <CursoBimestres
              bimestres={curso.bimestres}
              bimestreVigente={docente?.bimestreVigente}
            />
          }
          renderAction={
            <Button
              variant="success"
              onClick={() => navigate(cursoPath(curso.id))}
            >
              Abrir curso
            </Button>
          }
        />
      )}
    />
  );
};

export default MisCursosPage;
