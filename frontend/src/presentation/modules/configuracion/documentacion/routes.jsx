/**
 * Configuración → Documentación (catálogo único de los 9 tipos de documento
 * del ENUM `tipo_documento`). Patrón ABM clásico (como Actividades), sin tabs:
 *
 *   /configuracion/documentacion              → listado (entrada de menú directa)
 *   /configuracion/documentacion/nueva        → crear
 *   /configuracion/documentacion/:id/editar   → editar
 *   /configuracion/documentacion/:id          → detalle
 *
 * Permiso único `configuracion.documentacion` (reemplaza los permisos
 * segmentados `configuracion.documentacion.{inscripcion,becas,pasantias,traslado}`,
 * ya retirados del backend). Las 4 URLs por tipo quedan como redirects legacy
 * al listado unificado.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { DOCUMENTACION_BASE } from '@application-configuracion/documentacion/config/paths';

const DocumentacionListConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionListConnector.jsx'),
);
const DocumentacionFormCreateConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionFormCreateConnector.jsx'),
);
const DocumentacionFormEditConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionFormEditConnector.jsx'),
);
const DocumentacionDetailConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionDetailConnector.jsx'),
);

/** URLs de las 4 pantallas por tipo retiradas (redirect al listado unificado). */
const TIPO_PATHS_LEGACY = ['inscripcion', 'becas', 'pasantias', 'traslado'];

export const documentacionRoutes = [
  ...TIPO_PATHS_LEGACY.map((tipoKey) => ({
    path: `${DOCUMENTACION_BASE}/${tipoKey}`,
    element: <Navigate to={DOCUMENTACION_BASE} replace />,
    key: `CFG-DOCUMENTACION-${tipoKey.toUpperCase()}-LEGACY`,
    permiso: 'configuracion.documentacion',
    accion: 'LISTAR',
    menu: null,
  })),
  {
    path: `${DOCUMENTACION_BASE}/nueva`,
    element: <DocumentacionFormCreateConnector />,
    key: 'CFG-DOCUMENTACION-NUEVA',
    permiso: 'configuracion.documentacion',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
    breadcrumbLabel: 'Nuevo documento',
  },
  {
    path: `${DOCUMENTACION_BASE}/:id/editar`,
    element: <DocumentacionFormEditConnector />,
    key: 'CFG-DOCUMENTACION-EDITAR',
    permiso: 'configuracion.documentacion',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
    breadcrumbLabel: 'Editar documento',
  },
  {
    path: `${DOCUMENTACION_BASE}/:id`,
    element: <DocumentacionDetailConnector />,
    key: 'CFG-DOCUMENTACION-DETALLE',
    permiso: 'configuracion.documentacion',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-DOCUMENTACION',
    breadcrumbLabel: 'Detalle de documento',
  },
  {
    path: DOCUMENTACION_BASE,
    element: <DocumentacionListConnector />,
    key: 'CFG-DOCUMENTACION',
    permiso: 'configuracion.documentacion',
    accion: 'LISTAR',
    menu: {
      label: 'Documentación',
      module: 'CFG',
      parent: 'CFG',
      order: 4,
    },
  },
];

export default documentacionRoutes;
