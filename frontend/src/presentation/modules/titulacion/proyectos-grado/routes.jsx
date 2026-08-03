// src/presentation/modules/titulacion/proyectos-grado/routes.jsx
/**
 * Titulación → Proyectos de grado (ítem de menú TIT, order 1) + reportes de
 * avance de tutoría (Requisitos 2/3, extensión 2026-07-31, sin ítem de menú:
 * se accede por botones de cabecera de ProyectosGradoList — plan Bloque N/O).
 * Sin ítem propio, los docentes-tutores (que comparten proyecto·LISTAR para
 * "Mis tutorados") no ven estos reportes institucionales en su sidebar.
 *
 * Permisos del seed 65 (`titulacion.proyecto`), acciones LISTAR (datos en
 * pantalla) / EXPORTAR (descarga) — mismo permiso que el resto del recurso
 * (§0.6 del plan de la extensión: sin RBAC nuevo). Rutas estáticas ANTES de
 * `/:id` (React Router interceptaría /registrar como id). Las rutas con
 * menú van al final del array (patrón capacitacion/cursos).
 *
 * Portal del estudiante: `/titulacion/mi-proyecto` (TIT-MI-PROYECTO, sin
 * ítem de menú, patrón ACA-MI-BOLETIN) — ESTUDIANTE solo tiene
 * proyecto·DETALLE, por lo que no ve el ítem "Proyectos de grado".
 */

import { lazy } from 'react';
import {
  REPORTE_AVANCE_CARRERA_PATH,
  PLANILLA_AVANCE_TERCER_ANIO_PATH,
} from '@application-titulacion/config/paths';

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
const ReporteAvanceTutoriaCarreraConnector = lazy(
  () => import('./connectors/ReporteAvanceTutoriaCarreraConnector.jsx'),
);
const PlanillaAvanceTercerAnioConnector = lazy(
  () => import('./connectors/PlanillaAvanceTercerAnioConnector.jsx'),
);

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
    /** Requisito 2 (extensión 2026-07-31): reporte de avance por carrera. Ruta ESTÁTICA. */
    path: REPORTE_AVANCE_CARRERA_PATH,
    element: <ReporteAvanceTutoriaCarreraConnector />,
    key: 'TIT-PROYECTOS-AVANCE-CARRERA',
    breadcrumbLabel: 'Avance de tutorías por carrera',
    permiso: 'titulacion.proyecto',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'TIT-PROYECTOS',
  },
  {
    /** Requisito 3 (extensión 2026-07-31): planilla "10 en 10" bimestral. Ruta ESTÁTICA. */
    path: PLANILLA_AVANCE_TERCER_ANIO_PATH,
    element: <PlanillaAvanceTercerAnioConnector />,
    key: 'TIT-PROYECTOS-PLANILLA-TERCER-ANIO',
    breadcrumbLabel: 'Planilla de avance (3er año)',
    permiso: 'titulacion.proyecto',
    accion: 'LISTAR',
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
