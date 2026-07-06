// src/presentation/modules/finanzas/aportes/routes.jsx
/**
 * Finanzas → Aportes (ítem de menú FIN, order 4).
 *
 * Página del aporte de la gestión vigente (monto base, vigencia y estado).
 * Antes era el tab "Aporte" de "Config. de pagos"; se separó en su propia
 * página con permiso propio para no compartir código de permiso con
 * bancos/cuentas/métodos (`finanzas.configuracion.pago`).
 *
 * Permiso de la ruta: finanzas.aporte (LISTAR). La edición usa EDITAR (vía
 * PermisoGuard en el formulario). Sin ELIMINAR.
 */

import { lazy } from 'react';

const AporteConnector = lazy(() => import('./connectors/AporteConnector.jsx'));

export const finanzasAportesRoutes = [
  {
    path: '/finanzas/aportes',
    element: <AporteConnector />,
    key: 'FIN-APORTES',
    permiso: 'finanzas.aporte',
    accion: 'LISTAR',
    menu: {
      label: 'Aportes',
      module: 'FIN',
      parent: 'FIN',
      order: 4,
    },
  },
];

export default finanzasAportesRoutes;
