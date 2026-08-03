/**
 * Conector: listado de proyectos de grado (TIT) — role-aware.
 *
 * Patrón portal del docente (`matricula/connectors/ListConnector.jsx`): un
 * DOCENTE ve "Mis tutorados" (bandeja del tutor, T3, sin provider admin — su
 * hook consume el endpoint self con identidad resuelta en servidor). El resto
 * de roles con proyecto·LISTAR ve el listado administrativo. ESTUDIANTE no
 * llega aquí (no tiene LISTAR; su ruta es /titulacion/mi-proyecto).
 */

import { useAuth, esDocente } from '@application-auth';
import { ProyectosGradoListProvider } from '@application-titulacion/proyectos-grado/providers/ProyectosGradoListProvider';
import ProyectosGradoList from '@titulacion/proyectos-grado/pages/ProyectosGradoList';
import MisTutoradosPage from '@titulacion/proyectos-grado/pages/MisTutoradosPage';

const ProyectosGradoListConnector = () => {
  const { usuario } = useAuth();

  // Rama docente self: sin provider admin.
  if (esDocente(usuario)) {
    return <MisTutoradosPage />;
  }

  return (
    <ProyectosGradoListProvider>
      <ProyectosGradoList />
    </ProyectosGradoListProvider>
  );
};

export default ProyectosGradoListConnector;
