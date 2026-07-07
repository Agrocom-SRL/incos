// src/presentation/modules/finanzas/configuracion/routes.jsx
/**
 * Finanzas → Config. de pagos (ítem de menú FIN, order 5).
 *
 * Pantalla de configuración de pagos de la gestión vigente: métodos de pago,
 * bancos autorizados y cuentas de pago. Módulo NUEVO e independiente del
 * legacy `@pagos`. El aporte (configuracion_aportes) vive aquí como página
 * hija sin ítem de menú propio (`/finanzas/configuracion/aportes`, permiso
 * `finanzas.aporte`), accesible desde el botón "Configuración de aportes" de
 * `ConfigPagosPage` (mismo patrón `menu: null` + `breadcrumbParent` de
 * `finanzas/reportes/routes.jsx`).
 *
 * Permiso de la ruta: finanzas.configuracion.pago (LISTAR). El alta usa CREAR
 * y la edición/toggle usan EDITAR (vía PermisoGuard en los organismos).
 */

import { lazy } from 'react';

const ConfigPagosConnector = lazy(() => import('./connectors/ConfigPagosConnector.jsx'));
const AporteConfigConnector = lazy(() => import('./connectors/AporteConfigConnector.jsx'));

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
  {
    path: '/finanzas/configuracion/aportes',
    element: <AporteConfigConnector />,
    key: 'FIN-CFG-APORTES',
    breadcrumbLabel: 'Aportes',
    permiso: 'finanzas.aporte',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
];

export default finanzasConfiguracionRoutes;
