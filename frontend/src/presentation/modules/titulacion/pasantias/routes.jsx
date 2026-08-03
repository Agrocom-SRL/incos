// src/presentation/modules/titulacion/pasantias/routes.jsx
/**
 * Titulación → Pasantías (ítem de menú TIT, order 2).
 *
 * Permisos del seed 65 (`titulacion.pasantia[.empresa]`). Rutas estáticas
 * ANTES de `/:id` (React Router interceptaría /registrar y /empresas como
 * id). La ruta con menú va al final del array (patrón proyectos-grado/routes.jsx).
 *
 * Portal del estudiante: `/titulacion/mi-pasantia` (TIT-MI-PASANTIA, sin ítem
 * de menú, patrón TIT-MI-PROYECTO) — ESTUDIANTE solo tiene pasantia·DETALLE,
 * por lo que no ve el ítem "Pasantías". Portal del docente: mismo ítem
 * TIT-PASANTIAS con `labelByRole` ("Mis pasantías supervisadas", P18 vía
 * bifurcación del connector).
 */

import { lazy } from 'react';

const PasantiasListConnector = lazy(() => import('./connectors/PasantiasListConnector.jsx'));
const PasantiaDetailConnector = lazy(() => import('./connectors/PasantiaDetailConnector.jsx'));
const PasantiaFormCreateConnector = lazy(
  () => import('./connectors/PasantiaFormCreateConnector.jsx'),
);
const PasantiaFormEditConnector = lazy(() => import('./connectors/PasantiaFormEditConnector.jsx'));
const PasantiasEmpresasListConnector = lazy(
  () => import('./connectors/PasantiasEmpresasListConnector.jsx'),
);
const PasantiaEmpresaFormCreateConnector = lazy(
  () => import('./connectors/PasantiaEmpresaFormCreateConnector.jsx'),
);
const PasantiaEmpresaFormEditConnector = lazy(
  () => import('./connectors/PasantiaEmpresaFormEditConnector.jsx'),
);
const MiPasantiaConnector = lazy(() => import('./connectors/MiPasantiaConnector.jsx'));

export const pasantiasRoutes = [
  {
    /** Portal del estudiante: su propio trámite (rama ESTUDIANTE de TIT). Sin ítem de menú. */
    path: '/titulacion/mi-pasantia',
    element: <MiPasantiaConnector />,
    key: 'TIT-MI-PASANTIA',
    breadcrumbLabel: 'Mi pasantía',
    permiso: 'titulacion.pasantia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/empresas/registrar',
    element: <PasantiaEmpresaFormCreateConnector />,
    key: 'TIT-PASANTIAS-EMPRESA-REGISTRAR',
    breadcrumbLabel: 'Nueva empresa',
    permiso: 'titulacion.pasantia.empresa',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/empresas/:empresaId/editar',
    element: <PasantiaEmpresaFormEditConnector />,
    key: 'TIT-PASANTIAS-EMPRESA-EDITAR',
    breadcrumbLabel: 'Editar empresa',
    permiso: 'titulacion.pasantia.empresa',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/empresas',
    element: <PasantiasEmpresasListConnector />,
    key: 'TIT-PASANTIAS-EMPRESAS',
    breadcrumbLabel: 'Empresas de pasantía',
    permiso: 'titulacion.pasantia.empresa',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/registrar',
    element: <PasantiaFormCreateConnector />,
    key: 'TIT-PASANTIAS-REGISTRAR',
    breadcrumbLabel: 'Nuevo trámite',
    permiso: 'titulacion.pasantia',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/:id/editar',
    element: <PasantiaFormEditConnector />,
    key: 'TIT-PASANTIAS-EDITAR',
    breadcrumbLabel: 'Editar trámite',
    permiso: 'titulacion.pasantia',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias/:id',
    element: <PasantiaDetailConnector />,
    key: 'TIT-PASANTIAS-DETALLE',
    breadcrumbLabel: 'Detalle del trámite',
    permiso: 'titulacion.pasantia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TIT-PASANTIAS',
  },
  {
    path: '/titulacion/pasantias',
    element: <PasantiasListConnector />,
    key: 'TIT-PASANTIAS',
    permiso: 'titulacion.pasantia',
    accion: 'LISTAR',
    menu: {
      label: 'Pasantías',
      module: 'TIT',
      parent: 'TIT',
      order: 2,
      labelByRole: { DOCENTE: 'Mis pasantías supervisadas' },
    },
  },
];

export default pasantiasRoutes;
