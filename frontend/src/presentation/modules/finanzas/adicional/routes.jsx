// src/presentation/modules/finanzas/adicional/routes.jsx
/**
 * Finanzas → Pagos adicionales (ítem de menú FIN, order 2).
 * Placeholder en Fase 1. Permiso reutilizado: finanzas.pago.adicionales.
 */

import { UnderConstruction } from '@components/pages';

export const finanzasPagosAdicionalesRoutes = [
  {
    path: '/finanzas/adicional',
    element: <UnderConstruction />,
    key: 'FIN-ADI',
    permiso: 'finanzas.pago.adicionales',
    accion: 'LISTAR',
    menu: {
      label: 'Pagos adicionales',
      module: 'FIN',
      parent: 'FIN',
      order: 2,
    },
  },
];

export default finanzasPagosAdicionalesRoutes;
