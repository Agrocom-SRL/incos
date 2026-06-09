/**
 * Institucional → Gestión actual (gestión vigente + activación del cursado).
 */

import { lazy } from 'react';

const GestionActualConnector = lazy(
  () => import('@institucional/actual/connectors/GestionActualConnector'),
);

export const actualRoutes = [
  {
    path: '/institucional/actual',
    element: <GestionActualConnector />,
    key: 'INST-GESTION-ACTUAL',
    permiso: 'institucional.gestion.actual',
    accion: 'LISTAR',
    menu: {
      label: 'Gestión Actual',
      module: 'INST',
      parent: 'INST',
      order: 1,
    },
  },
];

export default actualRoutes;
