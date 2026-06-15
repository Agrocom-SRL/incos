/**
 * Documentación — menú CFG (subrutas en construcción).
 */

import { UnderConstruction } from '@components/pages';

const CFG_DOCUMENTACION_PERMISOS = [
  'configuracion.documentacion.inscripcion',
  'configuracion.documentacion.becas',
  'configuracion.documentacion.pasantias',
  'configuracion.documentacion.traslado',
];

export const documentacionRoutes = [
  {
    path: '/configuracion/documentacion/inscripcion',
    element: <UnderConstruction />,
    key: 'CFG-DOCUMENTACION-INSCRIPCION',
    permiso: 'configuracion.documentacion.inscripcion',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
  },
  {
    path: '/configuracion/documentacion/becas',
    element: <UnderConstruction />,
    key: 'CFG-DOCUMENTACION-BECAS',
    permiso: 'configuracion.documentacion.becas',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
  },
  {
    path: '/configuracion/documentacion/pasantias',
    element: <UnderConstruction />,
    key: 'CFG-DOCUMENTACION-PASANTIAS',
    permiso: 'configuracion.documentacion.pasantias',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
  },
  {
    path: '/configuracion/documentacion/traslado',
    element: <UnderConstruction />,
    key: 'CFG-DOCUMENTACION-TRASLADO',
    permiso: 'configuracion.documentacion.traslado',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
  },
  {
    path: '/configuracion/documentacion',
    element: <UnderConstruction />,
    key: 'CFG-DOCUMENTACION',
    permiso: null,
    permisoAny: CFG_DOCUMENTACION_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Documentación',
      module: 'CFG',
      parent: 'CFG',
      order: 2,
    },
  },
];

export default documentacionRoutes;
