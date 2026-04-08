// src/presentation/modules/trazabilidad/routes.jsx
/**
 * Rutas de traspasos y transitabilidad (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const trazabilidad = [
  {
    path: '/transitabilidad/traspasos/listar',
    element: <UnderConstruction />,
    key: 'ACA-TRASPASOS',
    permiso: 'academico.trazabilidad.traspaso.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Traspasos',
      module: 'ACA',
      parent: 'ACA',
      order: 3,
    },
  },
  {
    path: '/transitabilidad/traspasos/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-SOLICITAR',
    permiso: 'academico.trazabilidad.traspaso.solicitar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/transitabilidad/traspasos/recibir',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-RECIBIR',
    permiso: 'academico.trazabilidad.traspaso.recibir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/transitabilidad/traspasos/convalidar-notas',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-CONVALIDAR',
    permiso: 'academico.trazabilidad.traspaso.convalidar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/transitabilidad/traspasos/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-APROBAR',
    permiso: 'academico.trazabilidad.traspaso.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/transitabilidad/transitabilidad/listar',
    element: <UnderConstruction />,
    key: 'ACA-TRANSIT',
    permiso: 'academico.trazabilidad.transitabilidad.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Transitabilidad',
      module: 'ACA',
      parent: 'ACA',
      order: 4,
    },
  },
  {
    path: '/transitabilidad/transitabilidad/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-SOLICITAR',
    permiso: 'academico.trazabilidad.transitabilidad.solicitar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/transitabilidad/transitabilidad/recibir',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-RECIBIR',
    permiso: 'academico.trazabilidad.transitabilidad.recibir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/transitabilidad/transitabilidad/convalidar-notas',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-CONVALIDAR',
    permiso: 'academico.trazabilidad.transitabilidad.convalidar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/transitabilidad/transitabilidad/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-APROBAR',
    permiso: 'academico.trazabilidad.transitabilidad.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
];

export default trazabilidad;
