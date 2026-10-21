// src/presentation/modules/capacitacion/grupos/routes.jsx
/**
 * Capacitación → Grupos (ítem de menú CAP, order 4): pantalla con tabs
 * «Horarios» y «Grupos» (`?tab=`). El ABM de horarios cuelga de ella.
 *
 * Permiso `capacitacion.grupo` (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR). Rutas
 * estáticas ANTES de `/horarios/:id/editar` (React Router interceptaría /nuevo
 * como id). La ruta con menú va al final del array (patrón cursos/participantes).
 */

import { lazy } from 'react';

const GruposConnector = lazy(() => import('./connectors/GruposConnector.jsx'));
const HorarioFormCreateConnector = lazy(
  () => import('./connectors/HorarioFormCreateConnector.jsx'),
);
const HorarioFormEditConnector = lazy(() => import('./connectors/HorarioFormEditConnector.jsx'));

export const capacitacionGruposRoutes = [
  {
    path: '/capacitacion/grupos/horarios/nuevo',
    element: <HorarioFormCreateConnector />,
    key: 'CAP-GRUPOS-HORARIOS-NUEVO',
    breadcrumbLabel: 'Nuevo horario',
    permiso: 'capacitacion.grupo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CAP-GRUPOS',
  },
  {
    path: '/capacitacion/grupos/horarios/:id/editar',
    element: <HorarioFormEditConnector />,
    key: 'CAP-GRUPOS-HORARIOS-EDITAR',
    breadcrumbLabel: 'Editar horario',
    permiso: 'capacitacion.grupo',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CAP-GRUPOS',
  },
  {
    path: '/capacitacion/grupos',
    element: <GruposConnector />,
    key: 'CAP-GRUPOS',
    permiso: 'capacitacion.grupo',
    accion: 'LISTAR',
    menu: {
      label: 'Grupos',
      module: 'CAP',
      parent: 'CAP',
      order: 4,
    },
  },
];

export default capacitacionGruposRoutes;
