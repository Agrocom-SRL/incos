/**
 * Conector: listado de trámites de pasantía (TUT) — role-aware.
 *
 * Patrón portal del docente (`ProyectosGradoListConnector` de titulación): un
 * DOCENTE ve "Mis pasantías supervisadas" (bandeja P18, sin provider admin —
 * su hook consume el endpoint self con identidad resuelta en servidor). El
 * resto de roles con pasantia·LISTAR ve el listado administrativo (P1).
 * ESTUDIANTE no llega aquí (no tiene LISTAR; su ruta es /tutorias/mi-pasantia).
 */

import { useAuth, esDocente } from '@application-auth';
import { PasantiasListProvider } from '@application-titulacion/pasantias/providers/PasantiasListProvider';
import PasantiasList from '@titulacion/pasantias/pages/PasantiasList';
import MisPasantiasSupervisadasPage from '@titulacion/pasantias/pages/MisPasantiasSupervisadasPage';

const PasantiasListConnector = () => {
  const { usuario } = useAuth();

  // Rama docente self: sin provider admin.
  if (esDocente(usuario)) {
    return <MisPasantiasSupervisadasPage />;
  }

  return (
    <PasantiasListProvider>
      <PasantiasList />
    </PasantiasListProvider>
  );
};

export default PasantiasListConnector;
