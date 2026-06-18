// src/presentation/modules/finanzas/pagos/routes.jsx
/**
 * Finanzas → Pagos (ítem de menú FIN, order 1).
 *
 * Módulo NUEVO e independiente: NO importa connectors del legacy `@pagos`.
 * En Fase 1 las páginas son placeholders propios; la implementación real
 * (lista/registro/detalle de aportes sobre /api/v1/pagos-aportes y la página
 * de Compromiso de pago) se construye en fases posteriores.
 *
 * Permisos reutilizados del seed 60-FIN: finanzas.pago.{ver,registrar}.
 */

import { UnderConstruction } from '@components/pages';

export const finanzasPagosRoutes = [
  {
    path: '/finanzas/pagos/registrar',
    element: <UnderConstruction />,
    key: 'FIN-PAG-REGISTRAR',
    breadcrumbLabel: 'Registrar pago',
    permiso: 'finanzas.pago.registrar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    path: '/finanzas/pagos/compromiso',
    element: <UnderConstruction />,
    key: 'FIN-PAG-COMPROMISO',
    breadcrumbLabel: 'Compromiso de pago',
    permiso: 'finanzas.pago.ver',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    path: '/finanzas/pagos/:id',
    element: <UnderConstruction />,
    key: 'FIN-PAG-DETALLE',
    breadcrumbLabel: 'Detalle de pago',
    permiso: 'finanzas.pago.ver',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    path: '/finanzas/pagos',
    element: <UnderConstruction />,
    key: 'FIN-PAG',
    permiso: 'finanzas.pago.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 1,
    },
  },
];

export default finanzasPagosRoutes;
