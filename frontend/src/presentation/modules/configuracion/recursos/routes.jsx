/**
 * Configuración → Recursos académicos — catálogos de referencia usados por Oferta académica
 * (Paralelos maestro, Aulas y Tipos de evaluación).
 *
 *   /configuracion/recursos                              → tabs (paralelos | aulas | tipos-evaluacion)
 *   /configuracion/recursos/paralelo/nueva                → crear paralelo maestro
 *   /configuracion/recursos/paralelo/:id/editar           → editar paralelo maestro
 *   /configuracion/recursos/paralelo/:id                  → detalle paralelo maestro
 *   /configuracion/recursos/aula/nueva                    → crear aula
 *   /configuracion/recursos/aula/:id/editar                → editar aula
 *   /configuracion/recursos/aula/:id                      → detalle aula
 *   /configuracion/recursos/tipo-evaluacion/nueva          → crear tipo de evaluación
 *   /configuracion/recursos/tipo-evaluacion/:id/editar     → editar tipo de evaluación
 *   /configuracion/recursos/tipo-evaluacion/:id            → detalle tipo de evaluación
 *
 * Paralelo movido desde `configuracion/academico` (refactor puro, sin cambio de lógica ni de
 * permiso RBAC — `configuracion.paralelo` conserva su código). Se dejan redirects de
 * compatibilidad en las rutas legacy `/configuracion/academico/paralelo/...`.
 */

import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { RECURSOS_BASE, recursoTabPath } from '@application-configuracion/recursos/config/paths';
import { TAB_PARALELOS } from '@configuracion/recursos/config/recursosTabs';

const CFG_RECURSOS_PERMISOS = [
  'configuracion.paralelo',
  'configuracion.aula',
  'configuracion.tipo-evaluacion',
];

const RecursosConnector = lazy(
  () => import('@configuracion/recursos/connectors/RecursosConnector.jsx'),
);
const ParaleloFormCreateConnector = lazy(
  () => import('@configuracion/recursos/connectors/ParaleloFormCreateConnector.jsx'),
);
const ParaleloFormEditConnector = lazy(
  () => import('@configuracion/recursos/connectors/ParaleloFormEditConnector.jsx'),
);
const ParaleloDetailConnector = lazy(
  () => import('@configuracion/recursos/connectors/ParaleloDetailConnector.jsx'),
);
const AulaFormCreateConnector = lazy(
  () => import('@configuracion/recursos/connectors/AulaFormCreateConnector.jsx'),
);
const AulaFormEditConnector = lazy(
  () => import('@configuracion/recursos/connectors/AulaFormEditConnector.jsx'),
);
const AulaDetailConnector = lazy(
  () => import('@configuracion/recursos/connectors/AulaDetailConnector.jsx'),
);
const TipoEvaluacionFormCreateConnector = lazy(
  () => import('@configuracion/recursos/connectors/TipoEvaluacionFormCreateConnector.jsx'),
);
const TipoEvaluacionFormEditConnector = lazy(
  () => import('@configuracion/recursos/connectors/TipoEvaluacionFormEditConnector.jsx'),
);
const TipoEvaluacionDetailConnector = lazy(
  () => import('@configuracion/recursos/connectors/TipoEvaluacionDetailConnector.jsx'),
);

const ParaleloEditarLegacyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`${RECURSOS_BASE}/paralelo/${id}/editar`} replace />;
};

const ParaleloDetalleLegacyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`${RECURSOS_BASE}/paralelo/${id}`} replace />;
};

export const recursosRoutes = [
  {
    path: '/configuracion/recursos/paralelo/nueva',
    element: <ParaleloFormCreateConnector />,
    key: 'CFG-PARALELO-NUEVA',
    permiso: 'configuracion.paralelo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Nuevo paralelo',
  },
  {
    path: '/configuracion/recursos/paralelo/:id/editar',
    element: <ParaleloFormEditConnector />,
    key: 'CFG-PARALELO-EDITAR',
    permiso: 'configuracion.paralelo',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Editar paralelo',
  },
  {
    path: '/configuracion/recursos/paralelo/:id',
    element: <ParaleloDetailConnector />,
    key: 'CFG-PARALELO-DETALLE',
    permiso: 'configuracion.paralelo',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Detalle de paralelo',
  },

  // Aula
  {
    path: '/configuracion/recursos/aula/nueva',
    element: <AulaFormCreateConnector />,
    key: 'CFG-AULA-NUEVA',
    permiso: 'configuracion.aula',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Nueva aula',
  },
  {
    path: '/configuracion/recursos/aula/:id/editar',
    element: <AulaFormEditConnector />,
    key: 'CFG-AULA-EDITAR',
    permiso: 'configuracion.aula',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Editar aula',
  },
  {
    path: '/configuracion/recursos/aula/:id',
    element: <AulaDetailConnector />,
    key: 'CFG-AULA-DETALLE',
    permiso: 'configuracion.aula',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Detalle de aula',
  },

  // Tipo de evaluación
  {
    path: '/configuracion/recursos/tipo-evaluacion/nueva',
    element: <TipoEvaluacionFormCreateConnector />,
    key: 'CFG-TIPO-EVALUACION-NUEVA',
    permiso: 'configuracion.tipo-evaluacion',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Nuevo tipo de evaluación',
  },
  {
    path: '/configuracion/recursos/tipo-evaluacion/:id/editar',
    element: <TipoEvaluacionFormEditConnector />,
    key: 'CFG-TIPO-EVALUACION-EDITAR',
    permiso: 'configuracion.tipo-evaluacion',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Editar tipo de evaluación',
  },
  {
    path: '/configuracion/recursos/tipo-evaluacion/:id',
    element: <TipoEvaluacionDetailConnector />,
    key: 'CFG-TIPO-EVALUACION-DETALLE',
    permiso: 'configuracion.tipo-evaluacion',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-RECURSOS',
    breadcrumbLabel: 'Detalle de tipo de evaluación',
  },

  // Legacy — compatibilidad con enlaces/bookmarks de `configuracion/academico`
  {
    path: '/configuracion/academico/paralelo/nueva',
    element: <Navigate to={`${RECURSOS_BASE}/paralelo/nueva`} replace />,
    key: 'CFG-PARALELO-NUEVA-LEGACY',
    permiso: 'configuracion.paralelo',
    accion: 'CREAR',
    menu: null,
  },
  {
    path: '/configuracion/academico/paralelo/:id/editar',
    element: <ParaleloEditarLegacyRedirect />,
    key: 'CFG-PARALELO-EDITAR-LEGACY',
    permiso: 'configuracion.paralelo',
    accion: 'EDITAR',
    menu: null,
  },
  {
    path: '/configuracion/academico/paralelo/:id',
    element: <ParaleloDetalleLegacyRedirect />,
    key: 'CFG-PARALELO-DETALLE-LEGACY',
    permiso: 'configuracion.paralelo',
    accion: 'DETALLE',
    menu: null,
  },
  {
    path: '/configuracion/academico/paralelos',
    element: <Navigate to={recursoTabPath(TAB_PARALELOS)} replace />,
    key: 'CFG-PARALELOS-LEGACY',
    permiso: 'configuracion.paralelo',
    accion: 'LISTAR',
    menu: null,
  },

  // Entrada de menú (tabs)
  {
    path: RECURSOS_BASE,
    element: <RecursosConnector />,
    key: 'CFG-RECURSOS',
    permiso: null,
    permisoAny: CFG_RECURSOS_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Recursos académicos',
      module: 'CFG',
      parent: 'CFG',
      order: 2,
    },
  },
];

export default recursosRoutes;
