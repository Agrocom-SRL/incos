// src/presentation/modules/tutorias/titulacion/routes.jsx
/**
 * Tutorías → Titulación (ítem de menú TUT, order 1).
 *
 * Permisos del seed 66 (`tutorias.titulacion.proyecto`). Rutas estáticas
 * ANTES de `/:id` (React Router interceptaría /registrar como id). La ruta
 * con menú va al final del array (patrón capacitacion/cursos).
 *
 * Portal del estudiante: `/tutorias/mi-proyecto` (TUT-MI-PROYECTO, sin ítem
 * de menú, patrón ACA-MI-BOLETIN) — ESTUDIANTE solo tiene proyecto·DETALLE,
 * por lo que no ve el ítem "Proyectos de grado".
 */

import { lazy } from 'react';

const ProyectosGradoListConnector = lazy(
  () => import('./connectors/ProyectosGradoListConnector.jsx'),
);
const ProyectoGradoDetailConnector = lazy(
  () => import('./connectors/ProyectoGradoDetailConnector.jsx'),
);
const ProyectoGradoFormCreateConnector = lazy(
  () => import('./connectors/ProyectoGradoFormCreateConnector.jsx'),
);
const ProyectoGradoFormEditConnector = lazy(
  () => import('./connectors/ProyectoGradoFormEditConnector.jsx'),
);
const MiProyectoGradoConnector = lazy(() => import('./connectors/MiProyectoGradoConnector.jsx'));

export const titulacionRoutes = [
  {
    /** Portal del estudiante: su propio proyecto (rama ESTUDIANTE de TUT). Sin ítem de menú. */
    path: '/tutorias/mi-proyecto',
    element: <MiProyectoGradoConnector />,
    key: 'TUT-MI-PROYECTO',
    breadcrumbLabel: 'Mi proyecto de grado',
    permiso: 'tutorias.titulacion.proyecto',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TUT-TITULACION',
  },
  {
    path: '/tutorias/titulacion/registrar',
    element: <ProyectoGradoFormCreateConnector />,
    key: 'TUT-TITULACION-REGISTRAR',
    breadcrumbLabel: 'Nuevo proyecto',
    permiso: 'tutorias.titulacion.proyecto',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TUT-TITULACION',
  },
  {
    path: '/tutorias/titulacion/:id/editar',
    element: <ProyectoGradoFormEditConnector />,
    key: 'TUT-TITULACION-EDITAR',
    breadcrumbLabel: 'Editar proyecto',
    permiso: 'tutorias.titulacion.proyecto',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TUT-TITULACION',
  },
  {
    path: '/tutorias/titulacion/:id',
    element: <ProyectoGradoDetailConnector />,
    key: 'TUT-TITULACION-DETALLE',
    breadcrumbLabel: 'Detalle de proyecto',
    permiso: 'tutorias.titulacion.proyecto',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TUT-TITULACION',
  },
  {
    path: '/tutorias/titulacion',
    element: <ProyectosGradoListConnector />,
    key: 'TUT-TITULACION',
    permiso: 'tutorias.titulacion.proyecto',
    accion: 'LISTAR',
    menu: {
      label: 'Proyectos de grado',
      module: 'TUT',
      parent: 'TUT',
      order: 1,
      labelByRole: { DOCENTE: 'Mis tutorados' },
    },
  },
];

export default titulacionRoutes;
