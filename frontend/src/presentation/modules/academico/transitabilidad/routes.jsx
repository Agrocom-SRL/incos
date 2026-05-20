// src/presentation/modules/academico/transitabilidad/routes.jsx
/**
 * Transitabilidad (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const transitabilidadRoutes = [
  {
    path: '/academico/transitabilidad/listar',
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
    path: '/academico/transitabilidad/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-SOLICITAR',
    permiso: 'academico.trazabilidad.transitabilidad.solicitar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/academico/transitabilidad/recibir',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-RECIBIR',
    permiso: 'academico.trazabilidad.transitabilidad.recibir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/academico/transitabilidad/convalidar-notas',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-CONVALIDAR',
    permiso: 'academico.trazabilidad.transitabilidad.convalidar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
  {
    path: '/academico/transitabilidad/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TNS-APROBAR',
    permiso: 'academico.trazabilidad.transitabilidad.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-TRANSIT',
  },
];

export default transitabilidadRoutes;
