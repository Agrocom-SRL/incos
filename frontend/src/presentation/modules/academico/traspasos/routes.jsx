// src/presentation/modules/academico/traspasos/routes.jsx
/**
 * Traspasos (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const traspasosRoutes = [
  {
    path: '/academico/traspasos/listar',
    element: <UnderConstruction />,
    key: 'ACA-TRASPASOS',
    permiso: 'academico.trazabilidad.traspaso.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Traspasos',
      module: 'ACA',
      parent: 'ACA',
      order: 4,
    },
  },
  {
    path: '/academico/traspasos/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-SOLICITAR',
    permiso: 'academico.trazabilidad.traspaso.solicitar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/academico/traspasos/recibir',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-RECIBIR',
    permiso: 'academico.trazabilidad.traspaso.recibir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/academico/traspasos/convalidar-notas',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-CONVALIDAR',
    permiso: 'academico.trazabilidad.traspaso.convalidar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
  {
    path: '/academico/traspasos/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-TRA-TRP-APROBAR',
    permiso: 'academico.trazabilidad.traspaso.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-TRASPASOS',
  },
];

export default traspasosRoutes;
