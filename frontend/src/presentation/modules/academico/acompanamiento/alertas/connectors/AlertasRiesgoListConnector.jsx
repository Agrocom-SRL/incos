/**
 * Conector: alumnos en riesgo (role-aware, patrón portal del docente de
 * `matricula/connectors/ListConnector.jsx`).
 *
 * Un DOCENTE ve "Mis alumnos en riesgo" (A2, identidad resuelta en servidor,
 * SIN provider admin: su hook consume la API directamente). El resto de roles
 * ve la lista institucional (A1) con el drawer de detalle por estudiante (A3).
 */

import { useAuth, esDocente } from '@application-auth';
import { AlertasRiesgoListProvider } from '@application-tutorias/acompanamiento/alertas/providers/AlertasRiesgoListProvider';
import AlertasRiesgoList from '@tutorias/acompanamiento/alertas/pages/AlertasRiesgoList';
import MisAlumnosEnRiesgoPage from '@tutorias/acompanamiento/alertas/pages/MisAlumnosEnRiesgoPage';

const AlertasRiesgoListConnector = () => {
  const { usuario } = useAuth();

  // Rama docente self: sin provider admin — su hook consume /acompanamiento/alertas/mis-alumnos.
  if (esDocente(usuario)) {
    return <MisAlumnosEnRiesgoPage />;
  }

  return (
    <AlertasRiesgoListProvider>
      <AlertasRiesgoList />
    </AlertasRiesgoListProvider>
  );
};

export default AlertasRiesgoListConnector;
