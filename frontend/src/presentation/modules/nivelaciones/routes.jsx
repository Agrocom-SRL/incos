// src/presentation/modules/nivelaciones/routes.jsx
/**
 * Rutas del módulo de Nivelaciones (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const nivelacionesRoutes = [
  {
    path: '/nivelaciones/listar',
    element: <UnderConstruction />,
    key: 'ACA-NIV',
    permiso: 'academico.nivelacion.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Nivelaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 2,
      labelByRole: { ESTUDIANTE: 'Mi nivelación' },
    },
  },
  {
    path: '/nivelaciones/inscribir',
    element: <UnderConstruction />,
    key: 'ACA-NIV-INSCRIBIR',
    permiso: 'academico.nivelacion.inscribir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
  {
    path: '/nivelaciones/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-NIV-APROBAR',
    permiso: 'academico.nivelacion.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
];

export default nivelacionesRoutes;
