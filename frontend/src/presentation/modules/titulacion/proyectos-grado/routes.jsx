// src/presentation/modules/titulacion/proyectos-grado/routes.jsx
/**
 * Titulación → Proyectos de grado (ítem de menú TIT, order 1).
 *
 * Permisos del seed 65 (`titulacion.proyecto`). Rutas estáticas ANTES de
 * `/:id` (React Router interceptaría /registrar como id). La ruta con menú
 * va al final del array (patrón capacitacion/cursos).
 *
 * Portal del estudiante: `/titulacion/mi-proyecto` (TIT-MI-PROYECTO, sin
 * ítem de menú, patrón ACA-MI-BOLETIN) — ESTUDIANTE solo tiene
 * proyecto·DETALLE, por lo que no ve el ítem "Proyectos de grado".
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

export const proyectosGradoRoutes = [
  {
    /** Portal del estudiante: su propio proyecto (rama ESTUDIANTE de TIT). Sin ítem de menú. */
    path: '/titulacion/mi-proyecto',
    element: <MiProyectoGradoConnector />,
    key: 'TIT-MI-PROYECTO',
    breadcrumbLabel: 'Mi proyecto de grado',
    permiso: 'titulacion.proyecto',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TIT-PROYECTOS',
  },
  {
    path: '/titulacion/proyectos-grado/registrar',
    element: <ProyectoGradoFormCreateConnector />,
    key: 'TIT-PROYECTOS-REGISTRAR',
    breadcrumbLabel: 'Nuevo proyecto',
    permiso: 'titulacion.proyecto',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TIT-PROYECTOS',
  },
  {
    path: '/titulacion/proyectos-grado/:id/editar',
    element: <ProyectoGradoFormEditConnector />,
    key: 'TIT-PROYECTOS-EDITAR',
    breadcrumbLabel: 'Editar proyecto',
    permiso: 'titulacion.proyecto',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TIT-PROYECTOS',
  },
  {
    path: '/titulacion/proyectos-grado/:id',
    element: <ProyectoGradoDetailConnector />,
    key: 'TIT-PROYECTOS-DETALLE',
    breadcrumbLabel: 'Detalle de proyecto',
    permiso: 'titulacion.proyecto',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TIT-PROYECTOS',
  },
  {
    path: '/titulacion/proyectos-grado',
    element: <ProyectosGradoListConnector />,
    key: 'TIT-PROYECTOS',
    permiso: 'titulacion.proyecto',
    accion: 'LISTAR',
    menu: {
      label: 'Proyectos de grado',
      module: 'TIT',
      parent: 'TIT',
      order: 1,
      labelByRole: { DOCENTE: 'Mis tutorados' },
    },
  },
];

export default proyectosGradoRoutes;
