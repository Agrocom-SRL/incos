// src/presentation/modules/academico/nivelaciones/routes.jsx
/**
 * Nivelaciones (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const nivelacionesRoutes = [
  {
    path: '/academico/nivelaciones/listar',
    element: <UnderConstruction />,
    key: 'ACA-NIV',
    permiso: 'academico.nivelacion.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Nivelaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 3,
      labelByRole: { ESTUDIANTE: 'Mi nivelación' },
    },
  },
  {
    path: '/academico/nivelaciones/inscribir',
    element: <UnderConstruction />,
    key: 'ACA-NIV-INSCRIBIR',
    permiso: 'academico.nivelacion.inscribir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
  {
    path: '/academico/nivelaciones/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-NIV-APROBAR',
    permiso: 'academico.nivelacion.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
];

export default nivelacionesRoutes;
