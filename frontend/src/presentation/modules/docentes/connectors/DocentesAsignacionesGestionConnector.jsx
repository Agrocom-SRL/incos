/**
 * Conector: gestión de asignaciones docente (Provider + página).
 */

import { useParams } from 'react-router-dom';
import { DocentesDetailProvider } from '@application-docentes/providers';
import DocentesAsignacionesGestion from '@docentes/pages/DocentesAsignacionesGestion';

const DocentesAsignacionesGestionConnector = () => {
  const { id } = useParams();
  return (
    <DocentesDetailProvider docenteId={id}>
      <DocentesAsignacionesGestion />
    </DocentesDetailProvider>
  );
};

export default DocentesAsignacionesGestionConnector;

