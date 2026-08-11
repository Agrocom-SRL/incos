// src/presentation/modules/titulacion/proyectos-grado/routes.jsx
/**
 * Titulación → Proyectos de grado (ítem de menú TIT, order 1) + reporte de
 * seguimiento de tutorías a docentes (extensión 2026-08-10, sin ítem de
 * menú: se accede por botón de cabecera de ProyectosGradoList). Reemplaza la
 * "planilla de avance 10 en 10" de 3er año (Requisito 3 retirado: dependía de
 * Matrícula/periodo_numero=3, sin datos en desarrollo, sin documento físico
 * real). El avance por carrera (Requisito 2) sigue sin ser página propia: es
 * el botón "Exportar avance por carrera" (PDF directo) de ProyectosGradoList
 * — el detalle en pantalla duplicaba columnas del listado sin aportar valor
 * nuevo salvo el PDF, así que se retiró la página/ruta/provider dedicados.
 * Sin ítem propio, los docentes-tutores (que comparten proyecto·LISTAR para
 * "Mis tutorados") no ven este reporte institucional en su sidebar.
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
import { SEGUIMIENTO_TUTORIA_DOCENTES_PATH } from '@application-titulacion/config/paths';

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
const RegistrarActaDefensaConnector = lazy(
  () => import('./connectors/RegistrarActaDefensaConnector.jsx'),
);
const MiProyectoGradoConnector = lazy(() => import('./connectors/MiProyectoGradoConnector.jsx'));
const SeguimientoTutoriaDocentesConnector = lazy(
  () => import('./connectors/SeguimientoTutoriaDocentesConnector.jsx'),
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
    /** Seguimiento de tutorías a docentes (extensión 2026-08-10). Ruta ESTÁTICA. */
    path: SEGUIMIENTO_TUTORIA_DOCENTES_PATH,
    element: <SeguimientoTutoriaDocentesConnector />,
    key: 'TIT-PROYECTOS-SEGUIMIENTO-TUTORIA-DOCENTES',
    breadcrumbLabel: 'Seguimiento de tutorías a docentes',
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
    /** Registrar acta de defensa (extensión 2026-08-11): antes modal, ahora página propia. */
    path: '/titulacion/proyectos-grado/:id/acta-defensa',
    element: <RegistrarActaDefensaConnector />,
    key: 'TIT-PROYECTOS-ACTA-DEFENSA',
    breadcrumbLabel: 'Registrar acta de defensa',
    permiso: 'titulacion.proyecto',
    accion: 'APROBAR',
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
