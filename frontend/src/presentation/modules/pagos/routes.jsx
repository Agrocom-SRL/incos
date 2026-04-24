// src/presentation/modules/pagos/routes.jsx
/**
 * Rutas de pagos (dominio Finanzas en sidebar).
 * Orden: rutas estáticas antes de /pagos/:id.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const PagosRegistrarConnector = lazy(() => import('./connectors/PagosRegistrarConnector'));
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
    menu: {
      label: 'Pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 1,
    },
  },
  {
    path: '/matricula/aportes/listar',
    element: <PagosListConnector />,
    key: 'MAT-APO-LISTA',
    permiso: 'matricula.pago.aporte.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Aportes',
      module: 'MAT',
      parent: 'MAT',
      order: 4,
      labelByRole: { ESTUDIANTE: 'Mis aportes' },
    },
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
    path: '/pagos/adicionales',
    element: <UnderConstruction />,
    key: 'PAG-ADICIONALES',
    permiso: 'finanzas.pago.adicionales',
    accion: 'LISTAR',
    menu: {
      label: 'Pagos adicionales',
      module: 'FIN',
      parent: 'FIN',
      order: 2,
    },
  },
  {
    path: '/pagos/reportes',
    element: <UnderConstruction />,
    key: 'PAG-REPORTES',
    permiso: 'finanzas.pago.reporte.carrera',
    accion: 'LISTAR',
    menu: {
      label: 'Reportes de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 3,
    },
  },
  {
    path: '/pagos/reportes/carrera',
    element: <UnderConstruction />,
    key: 'PAG-REPORTES-CARRERA',
    permiso: 'finanzas.pago.reporte.carrera',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'PAG-REPORTES',
  },
  {
    path: '/pagos/reportes/estudiante',
    element: <UnderConstruction />,
    key: 'PAG-REPORTES-ESTUDIANTE',
    permiso: 'finanzas.pago.reporte.estudiante',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'PAG-REPORTES',
  },
  {
    path: '/pagos/reportes/gestion',
    element: <UnderConstruction />,
    key: 'PAG-REPORTES-GESTION',
    permiso: 'finanzas.pago.reporte.gestion',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'PAG-REPORTES',
  },
  {
    path: '/pagos/configuracion',
    element: <UnderConstruction />,
    key: 'CFG-PAGOS',
    permiso: 'cfg.pagos.gestionar',
    accion: 'LISTAR',
    menu: {
      label: 'Config. de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 5,
    },
  },
  {
    path: '/pagos/:id/editar',
    element: <PagosEditarCuotaConnector />,
    key: 'PAG-EDITAR',
    permiso: 'finanzas.pago.editar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'PAG-LIST',
  },
  {
    path: '/pagos/:id',
    element: <PagosDetailConnector />,
    key: 'PAG-DETALLE',
    permiso: 'finanzas.pago.ver',
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
