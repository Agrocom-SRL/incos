// src/presentation/modules/finanzas/becas/routes.jsx
/**
 * Finanzas → Configuración de becas (ítem de menú FIN, order 3).
 *
 * Catálogo maestro de becas y descuentos (porcentaje, reglas de aplicación,
 * asignación automática) — antes vivía embebido como 4to tab de "Config. de
 * pagos" (`FIN-CFG`); ahora es su propio ítem de menú, separado del concepto
 * de parámetros de pago (bancos/cuentas/métodos). Directorio reutilizado del
 * antiguo placeholder "Pagos adicionales" (`finanzas/adicional/`, Fase 1, sin
 * funcionalidad real — permiso `finanzas.pago.adicionales` queda sin ruta que
 * lo consuma; reintroducir en otro directorio si se retoma esa idea).
 *
 * Mismo permiso ya sembrado en el módulo (seed 61-FIN):
 *   finanzas.beca-descuento → LISTAR/CREAR/EDITAR/DETALLE/ELIMINAR/ACTIVAR.
 */

import { lazy } from 'react';

const BecasDescuentosConnector = lazy(() => import('./connectors/BecasDescuentosConnector.jsx'));
const BecaDescuentoFormCreateConnector = lazy(
  () => import('./connectors/BecaDescuentoFormCreateConnector.jsx'),
);
const BecaDescuentoFormEditConnector = lazy(
  () => import('./connectors/BecaDescuentoFormEditConnector.jsx'),
);
const BecaDescuentoDetailConnector = lazy(
  () => import('./connectors/BecaDescuentoDetailConnector.jsx'),
);

export const finanzasBecasRoutes = [
  {
    path: '/finanzas/becas',
    element: <BecasDescuentosConnector />,
    key: 'FIN-BECAS',
    permiso: 'finanzas.beca-descuento',
    accion: 'LISTAR',
    menu: {
      label: 'Config. de becas',
      module: 'FIN',
      parent: 'FIN',
      order: 3,
    },
  },
  {
    path: '/finanzas/becas/nueva',
    element: <BecaDescuentoFormCreateConnector />,
    key: 'FIN-BECAS-NUEVA',
    breadcrumbLabel: 'Nueva beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-BECAS',
  },
  {
    path: '/finanzas/becas/:id/editar',
    element: <BecaDescuentoFormEditConnector />,
    key: 'FIN-BECAS-EDITAR',
    breadcrumbLabel: 'Editar beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'FIN-BECAS',
  },
  {
    path: '/finanzas/becas/:id',
    element: <BecaDescuentoDetailConnector />,
    key: 'FIN-BECAS-DETALLE',
    breadcrumbLabel: 'Detalle de beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-BECAS',
  },
];

export default finanzasBecasRoutes;
