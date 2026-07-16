/**
 * Coordinación de asistencia — elegir docente (pantalla previa del admin).
 * Wrapper delgado del organismo compartido CoordinacionDocentesView
 * (gemelo de calificaciones/CoordinacionPage). Al elegir docente navega a sus cursos.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { MedicineBoxOutlined } from '@ant-design/icons';
import { CoordinacionDocentesView } from '@organisms';
import { ActionButton } from '@atoms';
import { useVistaAdminAsistenciaDocentes } from '@application-academico/asistencia/hooks/useVistaAdminAsistenciaDocentes.js';
import {
  MIS_CURSOS_PATH,
  LICENCIAS_PATH,
} from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

const CoordinacionAsistenciaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vista = useVistaAdminAsistenciaDocentes();

  // Acceso administrativo al listado de licencias estudiantiles; se auto-oculta sin
  // permiso licencia.ver. Vive en la pantalla previa del admin (no en el calendario del curso).
  const headerActions = (
    <ActionButton
      permiso={ASISTENCIA_PERMISOS.licenciaVer}
      accion="LISTAR"
      variant="info"
      icon={<MedicineBoxOutlined />}
      onClick={() => navigate(LICENCIAS_PATH, { state: { returnPath: location.pathname } })}
    >
      Licencias
    </ActionButton>
  );

  return (
    <CoordinacionDocentesView
      title="Coordinación de asistencia"
      breadcrumbItems={vista.breadcrumbItems}
      headerActions={headerActions}
      infoTitle="Coordinación de asistencia"
      infoDescription={
        <span>
          Periodo lectivo <strong>{vista.gestionVigente ?? '—'}</strong>.
          Docentes con cursos que tienen estudiantes matriculados. Seleccione
          uno para revisar sus materias y tomar asistencia.
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
      accionPermiso={ASISTENCIA_PERMISOS.coordinacion}
      onElegirDocente={(row) =>
        navigate(MIS_CURSOS_PATH, {
          state: { docenteId: row.id, docenteNombre: row.nombre },
        })
      }
    />
  );
};

export default CoordinacionAsistenciaPage;
