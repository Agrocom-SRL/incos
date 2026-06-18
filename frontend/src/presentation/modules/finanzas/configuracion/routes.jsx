// src/presentation/modules/finanzas/configuracion/routes.jsx
/**
 * Finanzas → Config. de pagos (ítem de menú FIN, order 5).
 *
 * Pantalla de configuración de pagos de la gestión vigente: aporte
 * (configuracion_aportes), métodos de pago, bancos autorizados y cuentas de pago.
 * Módulo NUEVO e independiente del legacy `@pagos`.
 *
 * Permiso de la ruta: configuracion.pagos (LISTAR). El alta usa CREAR y la
 * edición/toggle usan EDITAR (vía PermisoGuard en los organismos).
 */

import { lazy } from 'react';

const ConfigPagosConnector = lazy(() => import('./connectors/ConfigPagosConnector.jsx'));

export const finanzasConfiguracionRoutes = [
  {
    path: '/finanzas/configuracion',
    element: <ConfigPagosConnector />,
    key: 'FIN-CFG',
    permiso: 'configuracion.pagos',
    accion: 'LISTAR',
    menu: {
      label: 'Config. de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 5,
    },
  },
];

export default finanzasConfiguracionRoutes;
