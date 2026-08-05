// src/presentation/modules/finanzas/pagos/routes.jsx
/**
 * Finanzas → Registro de ingresos (ítem de menú FIN, order 1, key FIN-PAG).
 *
 * Módulo NUEVO e independiente: NO importa connectors del legacy `@pagos`.
 * El LISTADO (FIN-PAG) muestra el registro UNIFICADO de transacciones de
 * ingreso (GET /api/v1/ingresos: aportes académicos + pagos de capacitación),
 * de SOLO LECTURA — Finanzas no registra pagos; cada módulo de origen
 * (Matrícula/Capacitación) conserva su propia alta. La ficha de cabecera de
 * aporte (`/finanzas/pagos/:id`, con su `AbonoForm` para agregar cuotas) y el
 * compromiso de pago mantienen sus rutas/paths históricos (`FIN-PAG-*`).
 *
 * Permisos del seed 60-FIN:
 *   - finanzas.pago.{ver,registrar,editar} → listado, ficha y cuotas. `registrar`
 *     sigue vivo (lo usa `AbonoForm` de la ficha), aunque ya no hay ruta/botón de
 *     alta a nivel Finanzas.
 *   - finanzas.compromiso.gestionar → página de compromiso de pago (LISTAR para
 *     entrar; CREAR/EDITAR/ELIMINAR en sus controles). Sembrado en paralelo.
 */

import { lazy } from 'react';

const PagosListConnector = lazy(() => import('./connectors/PagosListConnector.jsx'));
const PagosDetailConnector = lazy(() => import('./connectors/PagosDetailConnector.jsx'));
const CompromisoConnector = lazy(() => import('./connectors/CompromisoConnector.jsx'));

export const finanzasPagosRoutes = [
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
      label: 'Registro de ingresos',
      module: 'FIN',
      parent: 'FIN',
      order: 1,
    },
  },
];

export default finanzasPagosRoutes;
