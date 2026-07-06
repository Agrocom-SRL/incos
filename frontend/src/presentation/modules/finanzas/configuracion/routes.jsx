// src/presentation/modules/finanzas/configuracion/routes.jsx
/**
 * Finanzas → Config. de pagos (ítem de menú FIN, order 5).
 *
 * Pantalla de configuración de pagos de la gestión vigente: métodos de pago,
 * bancos autorizados y cuentas de pago. Módulo NUEVO e independiente del
 * legacy `@pagos`. El aporte (configuracion_aportes) se promovió a página
 * propia `/finanzas/aportes` (permiso `finanzas.aporte`).
 *
 * Permiso de la ruta: finanzas.configuracion.pago (LISTAR). El alta usa CREAR
 * y la edición/toggle usan EDITAR (vía PermisoGuard en los organismos).
 */

import { lazy } from 'react';

const ConfigPagosConnector = lazy(() => import('./connectors/ConfigPagosConnector.jsx'));

export const finanzasConfiguracionRoutes = [
  {
    path: '/finanzas/configuracion',
    element: <ConfigPagosConnector />,
    key: 'FIN-CFG',
    permiso: 'finanzas.configuracion.pago',
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
