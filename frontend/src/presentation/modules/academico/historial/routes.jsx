// src/presentation/modules/academico/historial/routes.jsx
/**
 * Historial académico (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const historialRoutes = [
  {
    path: '/academico/historial/academico',
    element: <UnderConstruction />,
    key: 'ACA-HIS',
    permiso: 'academico.historial.academico',
    accion: 'LISTAR',
    menu: {
      label: 'Historial',
      module: 'ACA',
      parent: 'ACA',
      order: 5,
      labelByRole: { ESTUDIANTE: 'Mi historial' },
    },
  },
  {
    path: '/academico/historial/folio',
    element: <UnderConstruction />,
    key: 'ACA-HIS-FOLIO',
    permiso: 'academico.historial.folio',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-HIS',
  },
  {
    path: '/academico/historial/validar',
    element: <UnderConstruction />,
    key: 'ACA-HIS-VALIDAR',
    permiso: 'academico.historial.validar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-HIS',
  },
];

export default historialRoutes;
