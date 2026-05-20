// src/presentation/modules/academico/licencias/routes.jsx
/**
 * Licencias estudiantiles (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const licenciasRoutes = [
  {
    path: '/academico/licencias/listar',
    element: <UnderConstruction />,
    key: 'ACA-LIC-EST',
    permiso: 'academico.licencia.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Licencias estudiantiles',
      module: 'ACA',
      parent: 'ACA',
      order: 6,
    },
  },
  {
    path: '/academico/licencias/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-LIC-EST-SOLICITAR',
    permiso: 'academico.licencia.crear',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-LIC-EST',
  },
  {
    path: '/academico/licencias/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-LIC-EST-APROBAR',
    permiso: 'academico.licencia.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-LIC-EST',
  },
];

export default licenciasRoutes;
