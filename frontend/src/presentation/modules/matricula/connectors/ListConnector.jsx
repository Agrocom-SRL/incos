/**
 * Conector: lista de inscripciones (role-aware).
 *
 * Patrón portal del estudiante (igual que Admisión/Aportes): un ESTUDIANTE no ve la
 * lista admin; se redirige al detalle de SU propia inscripción (`/inscripciones/:id`,
 * reutilizando InscripcionesDetail). El resto de roles ve el listado administrativo.
 */

import { InscripcionesListProvider } from '@application-inscripciones/providers';
import { useAuth, esEstudiante } from '@application-auth';
import InscripcionesList from '@inscripciones/pages/InscripcionesList';
import MatriculaRedirect from './MatriculaRedirect.jsx';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MatriculaRedirect />;
  }

  return (
    <InscripcionesListProvider>
      <InscripcionesList />
    </InscripcionesListProvider>
  );
};

export default ListConnector;
