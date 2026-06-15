/**
 * Conector: lista de estudiantes (sin provider global pesado en la ruta de listado).
 */

import { StudentListProvider } from '@application-estudiantes/providers';
import EstudiantesList from '@estudiantes/pages/EstudiantesList';

const ListConnector = () => (
  <StudentListProvider>
    <EstudiantesList />
  </StudentListProvider>
);

export default ListConnector;
