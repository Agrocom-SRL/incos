// src/presentation/modules/finanzas/pagos/routes.jsx
/**
 * Finanzas → Pagos (ítem de menú FIN, order 1).
 *
 * Módulo NUEVO e independiente: NO importa connectors del legacy `@pagos`.
 * El LISTADO (FIN-PAG) ya está implementado con páginas/arquitectura propias
 * (espejo de Docentes) sobre la infraestructura compartida /api/v1/pagos-aportes.
 * Registro, compromiso y detalle siguen como placeholders hasta sus fases.
 *
 * Permisos del seed 60-FIN:
 *   - finanzas.pago.{ver,registrar,editar} → listado, ficha, registro y cuotas.
 *   - finanzas.compromiso.gestionar → página de compromiso de pago (LISTAR para
 *     entrar; CREAR/EDITAR/ELIMINAR en sus controles). Sembrado en paralelo.
 */

import { lazy } from 'react';

const PagosListConnector = lazy(() => import('./connectors/PagosListConnector.jsx'));
const PagosDetailConnector = lazy(() => import('./connectors/PagosDetailConnector.jsx'));
const PagosRegistrarConnector = lazy(() => import('./connectors/PagosRegistrarConnector.jsx'));
const CompromisoConnector = lazy(() => import('./connectors/CompromisoConnector.jsx'));

export const finanzasPagosRoutes = [
  {
    path: '/finanzas/pagos/registrar',
    element: <PagosRegistrarConnector />,
    key: 'FIN-PAG-REGISTRAR',
    breadcrumbLabel: 'Registrar pago',
    permiso: 'finanzas.pago.registrar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    // Página de GESTIÓN del compromiso (alta/edición/anulación): permiso propio.
    // LISTAR para entrar; los botones internos validan CREAR/EDITAR/ELIMINAR.
    path: '/finanzas/pagos/compromiso',
    element: <CompromisoConnector />,
    key: 'FIN-PAG-COMPROMISO',
    breadcrumbLabel: 'Compromiso de pago',
    permiso: 'finanzas.compromiso.gestionar',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    path: '/finanzas/pagos/:id',
    element: <PagosDetailConnector />,
    key: 'FIN-PAG-DETALLE',
    breadcrumbLabel: 'Detalle de pago',
    permiso: 'finanzas.pago.ver',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-PAG',
  },
  {
    path: '/finanzas/pagos',
    element: <PagosListConnector />,
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
