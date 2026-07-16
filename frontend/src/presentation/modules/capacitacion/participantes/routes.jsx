// src/presentation/modules/capacitacion/participantes/routes.jsx
/**
 * Capacitación → Participantes (ítem de menú CAP, order 2).
 *
 * Permiso `capacitacion.participante` (seed 65). Una sola pantalla: el alta y
 * la edición viven en un modal del listado (el recurso no tiene ficha propia).
 */

import { lazy } from 'react';

const ParticipantesListConnector = lazy(
  () => import('./connectors/ParticipantesListConnector.jsx'),
);

export const capacitacionParticipantesRoutes = [
  {
    path: '/capacitacion/participantes',
    element: <ParticipantesListConnector />,
    key: 'CAP-PARTICIPANTES',
    permiso: 'capacitacion.participante',
    accion: 'LISTAR',
    menu: {
      label: 'Participantes',
      module: 'CAP',
      parent: 'CAP',
      order: 2,
    },
  },
];

export default capacitacionParticipantesRoutes;
