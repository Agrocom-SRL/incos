/**
 * Conector: lista de pagos/aportes (role-aware).
 *
 * Patrón portal del estudiante (igual que Admisión → su detalle): un ESTUDIANTE
 * no ve la lista admin; se redirige al detalle de SU propio aporte
 * (`/pagos/:id`, reutilizando PagosDetail). El resto de roles ve el listado.
 */

import { PagosListProvider } from '@application-pagos/providers';
import { useAuth, esEstudiante } from '@application-auth';
import PagosList from '@pagos/pages/PagosList';
import AportesRedirect from './AportesRedirect.jsx';

const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <AportesRedirect />;
  }

  return (
    <PagosListProvider>
      <PagosList />
    </PagosListProvider>
  );
};

export default ListConnector;
