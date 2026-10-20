/**
 * Conector: lista de inscripciones (role-aware).
 *
 * Patrón portal del estudiante (igual que Admisión/Aportes): un ESTUDIANTE no ve la
 * lista admin; se redirige al detalle de SU propia inscripción (`/inscripciones/:id`,
 * reutilizando InscripcionesDetail). Un DOCENTE ve "Mis estudiantes" (roster por
 * curso de SUS cursos, página gemela solo lectura). El resto de roles ve el
 * listado administrativo.
 */

import { InscripcionesListProvider } from '@application-matricula/registro/providers';
import { useAuth, esEstudiante, esDocente } from '@application-auth';
import InscripcionesList from '@matricula/registro/pages/InscripcionesList';
import MisEstudiantesDocentePage from '@matricula/registro/pages/MisEstudiantesDocentePage';
import MatriculaRedirect from './MatriculaRedirect.jsx';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MatriculaRedirect />;
  }

  // Rama docente self: sin provider admin — su hook consume /docentes/mis-estudiantes.
  if (esDocente(usuario)) {
    return <MisEstudiantesDocentePage />;
  }

  return (
    <InscripcionesListProvider>
      <InscripcionesList />
    </InscripcionesListProvider>
  );
};

export default ListConnector;
