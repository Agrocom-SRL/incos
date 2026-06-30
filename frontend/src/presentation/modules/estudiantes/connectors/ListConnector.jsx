/**
 * Conector: lista de estudiantes (sin provider global pesado en la ruta de listado).
 *
 * Role-aware (patrón portal del estudiante): un ESTUDIANTE no ve la lista admin,
 * sino SU ficha de SOLO LECTURA ("Mis datos"); el resto de roles ve la lista.
 */

import { StudentListProvider } from '@application-estudiantes/providers';
import { useAuth, esEstudiante } from '@application-auth';
import EstudiantesList from '@estudiantes/pages/EstudiantesList';
import MisDatosPage from '@estudiantes/pages/MisDatosPage';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MisDatosPage />;
  }

  return (
    <StudentListProvider>
      <EstudiantesList />
    </StudentListProvider>
  );
};

export default ListConnector;
