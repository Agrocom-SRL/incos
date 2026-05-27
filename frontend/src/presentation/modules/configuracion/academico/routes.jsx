/**
 * Configuración → Académico
 *
 * Presentation compartida bajo academico/ (pages, connectors, config).
 * Application separa hooks por feature: carreras/, materias/, plan-estudio/.
 *
 *   /configuracion/academico              → AcademicoPage (tabs)
 *   /configuracion/academico?tab=…        → planes | carreras | materias
 *   /configuracion/academico/plan/:id     → matriz + prerrequisitos del plan
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
const PlanDetalleConnector = lazy(
  () => import('@configuracion/academico/connectors/PlanDetalleConnector.jsx'),
);

export const academicoConfigRoutes = [
  {
    path: '/configuracion/academico/plan/:planId',
    element: <PlanDetalleConnector />,
    key: 'CFG-PLAN-DETALLE',
    permiso: 'configuracion.plan-estudio',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle del plan',
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
      label: 'Académico',
      module: 'CFG',
      parent: 'CFG',
      order: 1,
    },
  },
];

export default academicoConfigRoutes;
