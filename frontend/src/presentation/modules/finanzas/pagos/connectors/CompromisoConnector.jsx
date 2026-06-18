/**
 * Conector: compromiso de pago (Finanzas) — provider + página.
 * Punto de entrada lazy de la ruta FIN-PAG-COMPROMISO (/finanzas/pagos/compromiso).
 * Espejo de `PagosRegistrarConnector`: ensambla el provider y la página "dumb".
 */

import { CompromisoProvider } from '@application-finanzas/providers/CompromisoProvider';
import CompromisoPage from '@finanzas/pagos/pages/CompromisoPage';

const CompromisoConnector = () => (
  <CompromisoProvider>
    <CompromisoPage />
  </CompromisoProvider>
);

export default CompromisoConnector;
