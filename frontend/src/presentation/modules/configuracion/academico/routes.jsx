/**
 * Configuración → Académico
 *
 *   /configuracion/academico                    → tabs (planes | carreras | materias)
 *   /configuracion/academico/carrera/nueva      → crear carrera
 *   /configuracion/academico/carrera/:id/editar → editar carrera
 *   /configuracion/academico/carrera/:id        → detalle carrera
 *   /configuracion/academico/materia/...        → análogo materia
 *   /configuracion/academico/plan/nuevo         → crear plan de estudio (datos generales)
 *   /configuracion/academico/plan/:id/editar    → editar datos generales del plan
 *   /configuracion/academico/plan/:id           → ficha-hub del plan (documento; publicar)
 *   /configuracion/academico/plan/:id/periodo/:periodoId/asignaturas
 *                                                → builder drag & drop de asignaturas/prerrequisitos
 *
 * El tab «Paralelos» se movió a `configuracion/recursos` (catálogo de referencia,
 * ver `docs/plan/CONFIGURACION-UNIFICACION-UX.md` §5); las rutas legacy
 * `/configuracion/academico/paralelo/...` viven ahora en `recursos/routes.jsx`.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ACADEMICO_BASE, academicoTabPath } from '@application-configuracion/academico/config/paths';
import { TAB_CARRERAS, TAB_MATERIAS } from '@configuracion/academico/config/academicoTabs';

const CFG_ACADEMICO_PERMISOS = [
  'configuracion.plan-estudio',
  'configuracion.carrera',
  'configuracion.materia',
];

const AcademicoConnector = lazy(
  () => import('@configuracion/academico/connectors/AcademicoConnector.jsx'),
);
const CarreraFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraFormCreateConnector.jsx'),
);
const CarreraFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraFormEditConnector.jsx'),
);
const CarreraDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraDetailConnector.jsx'),
);
const MateriaFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaFormCreateConnector.jsx'),
);
const MateriaFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaFormEditConnector.jsx'),
);
const MateriaDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaDetailConnector.jsx'),
);
const PlanFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/PlanFormCreateConnector.jsx'),
);
const PlanFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/PlanFormEditConnector.jsx'),
);
const PlanDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/PlanDetailConnector.jsx'),
);
const PlanPeriodoAsignaturasConnector = lazy(
  () => import('@configuracion/academico/connectors/PlanPeriodoAsignaturasConnector.jsx'),
);
export const academicoConfigRoutes = [
  {
    path: '/configuracion/academico/carrera/nueva',
    element: <CarreraFormCreateConnector />,
    key: 'CFG-CARRERA-NUEVA',
    permiso: 'configuracion.carrera',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nueva carrera',
  },
  {
    path: '/configuracion/academico/materia/nueva',
    element: <MateriaFormCreateConnector />,
    key: 'CFG-MATERIA-NUEVA',
    permiso: 'configuracion.materia',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nueva materia',
  },
  {
    path: '/configuracion/academico/plan/nuevo',
    element: <PlanFormCreateConnector />,
    key: 'CFG-PLAN-NUEVA',
    permiso: 'configuracion.plan-estudio',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nuevo plan de estudio',
  },
  {
    path: '/configuracion/academico/carrera/:id/editar',
    element: <CarreraFormEditConnector />,
    key: 'CFG-CARRERA-EDITAR',
    permiso: 'configuracion.carrera',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar carrera',
  },
  {
    path: '/configuracion/academico/materia/:id/editar',
    element: <MateriaFormEditConnector />,
    key: 'CFG-MATERIA-EDITAR',
    permiso: 'configuracion.materia',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar materia',
  },
  {
    path: '/configuracion/academico/plan/:id/editar',
    element: <PlanFormEditConnector />,
    key: 'CFG-PLAN-EDITAR',
    permiso: 'configuracion.plan-estudio',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar plan',
  },
  {
    path: '/configuracion/academico/carrera/:id',
    element: <CarreraDetailConnector />,
    key: 'CFG-CARRERA-DETALLE',
    permiso: 'configuracion.carrera',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de carrera',
  },
  {
    path: '/configuracion/academico/materia/:id',
    element: <MateriaDetailConnector />,
    key: 'CFG-MATERIA-DETALLE',
    permiso: 'configuracion.materia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de materia',
  },
  {
    path: '/configuracion/academico/plan/:id/periodo/:periodoId/asignaturas',
    element: <PlanPeriodoAsignaturasConnector />,
    key: 'CFG-PLAN-PERIODO-ASIGNATURAS',
    permiso: 'configuracion.plan-estudio.asignaturas',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Asignaturas del periodo',
  },
  {
    path: '/configuracion/academico/plan/:id',
    element: <PlanDetailConnector />,
    key: 'CFG-PLAN-DETALLE',
    permiso: 'configuracion.plan-estudio',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de plan',
  },
  {
    path: '/configuracion/academico/carreras',
    element: <Navigate to={academicoTabPath(TAB_CARRERAS)} replace />,
    key: 'CFG-CARRERAS-LEGACY',
    permiso: 'configuracion.carrera',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/configuracion/academico/materias',
    element: <Navigate to={academicoTabPath(TAB_MATERIAS)} replace />,
    key: 'CFG-MATERIAS-LEGACY',
    permiso: 'configuracion.materia',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: ACADEMICO_BASE,
    element: <AcademicoConnector />,
    key: 'CFG-ACADEMICO',
    permiso: null,
    permisoAny: CFG_ACADEMICO_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Malla curricular',
      module: 'CFG',
      parent: 'CFG',
      order: 1,
    },
  },
];

export default academicoConfigRoutes;
