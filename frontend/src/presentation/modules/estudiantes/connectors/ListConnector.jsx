/**
 * Conector: lista de estudiantes (sin provider global pesado en la ruta de listado).
 *
 * Role-aware (patrón portal del estudiante): un ESTUDIANTE no ve la lista admin;
 * se redirige al detalle de SU propia ficha (`/estudiantes/:id`, id de la sesión)
 * reutilizando la pantalla EstudiantesDetail. El resto de roles ve la lista.
 */

import { StudentListProvider } from '@application-estudiantes/providers';
import { useAuth, esEstudiante } from '@application-auth';
import EstudiantesList from '@estudiantes/pages/EstudiantesList';
import EstudianteAdmisionRedirect from './EstudianteAdmisionRedirect.jsx';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <EstudianteAdmisionRedirect />;
  }

  return (
    <StudentListProvider>
      <EstudiantesList />
    </StudentListProvider>
  );
};

export default ListConnector;
