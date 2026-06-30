/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 *
 * Role-aware (patrón portal del estudiante): un ESTUDIANTE no ve la lista admin de
 * inscripciones, sino "Mi matrícula" (sus materias + horario semanal, solo lectura);
 * el resto de roles ve el listado administrativo.
 */

import { InscripcionesListProvider } from '@application-inscripciones/providers';
import { useAuth, esEstudiante } from '@application-auth';
import InscripcionesList from '@inscripciones/pages/InscripcionesList';
import MiMatriculaPage from '@matricula/pages/MiMatriculaPage';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MiMatriculaPage />;
  }

  return (
    <InscripcionesListProvider>
      <InscripcionesList />
    </InscripcionesListProvider>
  );
};

export default ListConnector;
