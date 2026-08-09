// src/presentation/modules/pagos/routes.jsx
/**
 * Rutas de pagos (dominio Finanzas en sidebar).
 * Orden: rutas estáticas antes de /pagos/:id.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const PagosRegistrarConnector = lazy(() => import('./connectors/PagosRegistrarConnector'));
const PagosRegistrarSeleccionConnector = lazy(() => import('./connectors/PagosRegistrarSeleccionConnector'));
const PagosListConnector = lazy(() => import('./connectors/ListConnector'));
const PagosDetailConnector = lazy(() => import('./connectors/DetailConnector'));
const PagosEditarCuotaConnector = lazy(() => import('./connectors/PagosEditarCuotaConnector'));

export const pagosRoutes = [
  {
    path: '/pagos/listar',
    element: <PagosListConnector />,
    key: 'PAG-LIST',
    permiso: 'finanzas.pago.ver',
    accion: 'LISTAR',
    // Menú FIN servido por el nuevo módulo finanzas/. URL legacy operativa.
    menu: null,
  },
  {
    path: '/matricula/aportes/listar',
    element: <PagosListConnector />,
    key: 'MAT-APO-LISTA',
    permiso: 'matricula.pago.aporte.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Aportes de matrícula',
      module: 'MAT',
      parent: 'MAT',
      order: 4,
      labelByRole: { ESTUDIANTE: 'Mis aportes' },
    },
  },
  {
    path: '/pagos/registrar/seleccionar-estudiante',
    element: <PagosRegistrarSeleccionConnector />,
    key: 'PAG-REG-SEL',
    permiso: 'finanzas.pago.registrar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'PAG-LIST',
  },
  {
    path: '/pagos/registrar',
    element: <PagosRegistrarConnector />,
    key: 'PAG-REGISTRAR',
    permiso: 'finanzas.pago.registrar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'PAG-LIST',
  },
  {
    path: '/pagos/:id/editar',
    element: <PagosEditarCuotaConnector />,
    key: 'PAG-EDITAR',
    // Staff (finanzas.pago.editar) o SEC_ACADEMICA/DIR_ACADEMICO vía matricula.pago.aporte.ver
    // (mismo par que ya aceptan UI y backend; antes solo exigía finanzas.pago.editar y
    // producía 403 con botón visible para esos roles).
    permisoAny: ['finanzas.pago.editar', 'matricula.pago.aporte.ver'],
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'PAG-LIST',
  },
  {
    path: '/pagos/:id',
    element: <PagosDetailConnector />,
    key: 'PAG-DETALLE',
    // Staff (finanzas.pago.ver) o estudiante viendo SU aporte (matricula.pago.aporte.ver).
    // El backend blinda /pagos-aportes/:id a la propia cabecera del estudiante (anti-IDOR).
    permisoAny: ['finanzas.pago.ver', 'matricula.pago.aporte.ver'],
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'PAG-LIST',
  },
  {
    path: '/pagos',
    element: <PagosListConnector />,
    key: 'PAG',
    permiso: 'finanzas.pago.ver',
    accion: 'LISTAR',
    menu: null,
  },
];

export default pagosRoutes;
