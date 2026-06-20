/**
 * Conector: registro de abono de aporte (Finanzas) — provider + página.
 * Punto de entrada lazy de la ruta FIN-PAG-REGISTRAR (/finanzas/pagos/registrar).
 * Espejo de `PagosDetailConnector`: ensambla el provider y la página "dumb".
 */

import { PagosRegistrarProvider } from '@application-finanzas/providers/PagosRegistrarProvider';
import PagosRegistrar from '@finanzas/pagos/pages/PagosRegistrar';

const PagosRegistrarConnector = () => (
  <PagosRegistrarProvider>
    <PagosRegistrar />
  </PagosRegistrarProvider>
);

export default PagosRegistrarConnector;
