/**
 * Coordinación de asistencia — elegir docente (pantalla previa del admin).
 * Wrapper delgado del organismo compartido CoordinacionDocentesView
 * (gemelo de calificaciones/CoordinacionPage). Al elegir docente navega a sus cursos.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { MedicineBoxOutlined, TableOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { CoordinacionDocentesView } from '@organisms';
import { ActionButton } from '@atoms';
import { useVistaAdminAsistenciaDocentes } from '@application-academico/asistencia/hooks/useVistaAdminAsistenciaDocentes.js';
import {
  MIS_CURSOS_PATH,
  LICENCIAS_PATH,
  CONSOLIDADO_PATH,
} from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { allSpacing } from '@theme/tokens';

const CoordinacionAsistenciaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vista = useVistaAdminAsistenciaDocentes();

  // Accesos administrativos hermanos del registro (se auto-ocultan sin permiso):
  // Consolidado % por paralelo y listado de licencias estudiantiles. Viven en la
  // pantalla previa del admin (no en el calendario del curso).
  const headerActions = (
    <Flex gap={allSpacing.marginSM} wrap="wrap">
      <ActionButton
        permiso={ASISTENCIA_PERMISOS.consolidadoVer}
        accion="LISTAR"
        variant="info"
        icon={<TableOutlined />}
        onClick={() => navigate(CONSOLIDADO_PATH)}
      >
        Consolidado %
      </ActionButton>
      <ActionButton
        permiso={ASISTENCIA_PERMISOS.licenciaVer}
        accion="LISTAR"
        variant="info"
        icon={<MedicineBoxOutlined />}
        onClick={() => navigate(LICENCIAS_PATH, { state: { returnPath: location.pathname } })}
      >
        Licencias
      </ActionButton>
    </Flex>
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
