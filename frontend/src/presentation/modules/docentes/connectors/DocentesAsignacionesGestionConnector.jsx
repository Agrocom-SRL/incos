/**
 * Conector: gestión de asignaciones docente (Provider + página).
 */

import { useParams } from 'react-router-dom';
import { DocentesAsignacionesGestionProvider } from '@application-docentes/providers';
import DocentesAsignacionesGestion from '@docentes/pages/DocentesAsignacionesGestion';

const DocentesAsignacionesGestionConnector = () => {
  const { id } = useParams();
  return (
    <DocentesAsignacionesGestionProvider docenteId={id}>
      <DocentesAsignacionesGestion />
    </DocentesAsignacionesGestionProvider>
  );
};

export default DocentesAsignacionesGestionConnector;

