/**
 * Coordinación de calificaciones — elegir docente.
 * Wrapper delgado del organismo compartido CoordinacionDocentesView.
 */

import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { CoordinacionDocentesView } from '@organisms';
import { useVistaAdminDocentes } from '@application-academico/calificaciones/hooks/useVistaAdminDocentes.js';
import {
  MIS_CURSOS_PATH,
  POLITICA_INSTITUCIONAL_PATH,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';

const CoordinacionPage = () => {
  const navigate = useNavigate();
  const vista = useVistaAdminDocentes();
  const periodoLabel = vista.gestionVigente ?? '—';

  return (
    <CoordinacionDocentesView
      title="Coordinación de calificaciones"
      breadcrumbItems={vista.breadcrumbItems}
      headerActions={
        <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end">
          <ActionButton
            permiso={CALIFICACIONES_PERMISOS.politica}
            accion="LISTAR"
            variant="primary"
            onClick={() => navigate(POLITICA_INSTITUCIONAL_PATH)}
          >
            Configuración de notas
          </ActionButton>
        </Flex>
      }
      infoTitle="Coordinación de calificaciones"
      infoDescription={
        <span>
          Periodo lectivo <strong>{periodoLabel}</strong>. Docentes con cursos
          que tienen estudiantes matriculados. Seleccione uno para revisar sus
          materias y el cuaderno de notas; el avance por bimestre lo define cada
          docente en su curso.
        </span>
      }
      docentes={vista.docentes}
      isLoading={vista.isLoading}
      error={vista.error}
      refetch={vista.refetch}
      busquedaInput={vista.busquedaInput}
      setBusquedaInput={vista.setBusquedaInput}
      esBusquedaActiva={vista.esBusquedaActiva}
      busquedaMinChars={vista.busquedaMinChars}
      prelimLimit={vista.prelimLimit}
      accionPermiso={CALIFICACIONES_PERMISOS.coordinacion}
      onElegirDocente={(row) =>
        navigate(MIS_CURSOS_PATH, {
          state: { docenteId: row.id, docenteNombre: row.nombre },
        })
      }
    />
  );
};

export default CoordinacionPage;
