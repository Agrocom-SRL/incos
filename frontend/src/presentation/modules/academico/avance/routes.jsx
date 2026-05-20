// src/presentation/modules/academico/avance/routes.jsx
/**
 * Avance académico (ítem de menú ACA).
 */

import { UnderConstruction } from '@components/pages';

export const avanceRoutes = [
  {
    path: '/academico/avance',
    element: <UnderConstruction />,
    key: 'ACA-AVANCE',
    permiso: 'academico.avance',
    accion: 'LISTAR',
    menu: {
      label: 'Avance académico',
      module: 'ACA',
      parent: 'ACA',
      order: 7,
      labelByRole: { ESTUDIANTE: 'Mi avance' },
    },
  },
];

export default avanceRoutes;
