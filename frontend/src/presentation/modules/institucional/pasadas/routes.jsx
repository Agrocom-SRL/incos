/**
 * Institucional → Gestiones pasadas (histórico y consulta de oferta).
 */

import { lazy } from 'react';

const GestionesPasadasConnector = lazy(
  () => import('@institucional/pasadas/connectors/GestionesPasadasConnector'),
);

export const pasadasRoutes = [
  {
    path: '/institucional/pasadas',
    element: <GestionesPasadasConnector />,
    key: 'INST-GESTIONES-PASADAS',
    permiso: 'institucional.gestion.pasadas',
    accion: 'LISTAR',
    menu: {
      label: 'Gestiones Pasadas',
      module: 'INST',
      parent: 'INST',
      order: 5,
    },
  },
];

export default pasadasRoutes;
