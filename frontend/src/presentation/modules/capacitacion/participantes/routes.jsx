// src/presentation/modules/capacitacion/participantes/routes.jsx
/**
 * Capacitación → Participantes (ítem de menú CAP, order 2).
 *
 * Permiso `capacitacion.participante` (seed 65). Rutas estáticas ANTES de
 * `/:id/editar` (React Router interceptaría /nuevo como id). La ruta con
 * menú va al final del array (patrón cursos/finanzas).
 */

import { lazy } from 'react';

const ParticipantesListConnector = lazy(
  () => import('./connectors/ParticipantesListConnector.jsx'),
);
const ParticipanteFormCreateConnector = lazy(
  () => import('./connectors/ParticipanteFormCreateConnector.jsx'),
);
const ParticipanteFormEditConnector = lazy(
  () => import('./connectors/ParticipanteFormEditConnector.jsx'),
);

export const capacitacionParticipantesRoutes = [
  {
    path: '/capacitacion/participantes/nuevo',
    element: <ParticipanteFormCreateConnector />,
    key: 'CAP-PARTICIPANTES-NUEVO',
    breadcrumbLabel: 'Nuevo participante',
    permiso: 'capacitacion.participante',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CAP-PARTICIPANTES',
  },
  {
    path: '/capacitacion/participantes/:id/editar',
    element: <ParticipanteFormEditConnector />,
    key: 'CAP-PARTICIPANTES-EDITAR',
    breadcrumbLabel: 'Editar participante',
    permiso: 'capacitacion.participante',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CAP-PARTICIPANTES',
  },
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
