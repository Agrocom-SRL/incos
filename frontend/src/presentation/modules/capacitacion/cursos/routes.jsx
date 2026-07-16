// src/presentation/modules/capacitacion/cursos/routes.jsx
/**
 * Capacitación → Cursos (ítem de menú CAP, order 1).
 *
 * Permiso `capacitacion.curso` (seed 65). Rutas estáticas ANTES de `/:id`
 * (React Router interceptaría /registrar como id). La ruta con menú va al
 * final del array (patrón finanzas/pagos).
 */

import { lazy } from 'react';

const CursosCapacitacionListConnector = lazy(
  () => import('./connectors/CursosCapacitacionListConnector.jsx'),
);
const CursoCapacitacionDetailConnector = lazy(
  () => import('./connectors/CursoCapacitacionDetailConnector.jsx'),
);
const CursoCapacitacionFormCreateConnector = lazy(
  () => import('./connectors/CursoCapacitacionFormCreateConnector.jsx'),
);
const CursoCapacitacionFormEditConnector = lazy(
  () => import('./connectors/CursoCapacitacionFormEditConnector.jsx'),
);

export const capacitacionCursosRoutes = [
  {
    path: '/capacitacion/cursos/registrar',
    element: <CursoCapacitacionFormCreateConnector />,
    key: 'CAP-CURSOS-REGISTRAR',
    breadcrumbLabel: 'Nuevo curso',
    permiso: 'capacitacion.curso',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CAP-CURSOS',
  },
  {
    path: '/capacitacion/cursos/:id/editar',
    element: <CursoCapacitacionFormEditConnector />,
    key: 'CAP-CURSOS-EDITAR',
    breadcrumbLabel: 'Editar curso',
    permiso: 'capacitacion.curso',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CAP-CURSOS',
  },
  {
    path: '/capacitacion/cursos/:id',
    element: <CursoCapacitacionDetailConnector />,
    key: 'CAP-CURSOS-DETALLE',
    breadcrumbLabel: 'Detalle de curso',
    permiso: 'capacitacion.curso',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CAP-CURSOS',
  },
  {
    path: '/capacitacion/cursos',
    element: <CursosCapacitacionListConnector />,
    key: 'CAP-CURSOS',
    permiso: 'capacitacion.curso',
    accion: 'LISTAR',
    menu: {
      label: 'Cursos',
      module: 'CAP',
      parent: 'CAP',
      order: 1,
    },
  },
];

export default capacitacionCursosRoutes;
