/**
 * Conector: listado del catálogo maestro Becas y descuentos (Finanzas) —
 * provider + página. Punto de entrada lazy del ítem de menú FIN-BECAS.
 */

import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import BecasDescuentosPage from '@finanzas/becas/pages/BecasDescuentosPage.jsx';

const BecasDescuentosConnector = () => (
  <BecaDescuentoProvider>
    <BecasDescuentosPage />
  </BecaDescuentoProvider>
);

export default BecasDescuentosConnector;
