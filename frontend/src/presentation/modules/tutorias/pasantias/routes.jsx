// src/presentation/modules/tutorias/pasantias/routes.jsx
/**
 * Titulación → Pasantías (ítem de menú TUT, order 2).
 *
 * Permisos del seed TUT (`tutorias.pasantia[.empresa]`). Rutas estáticas
 * ANTES de `/:id` (React Router interceptaría /registrar y /empresas como
 * id). La ruta con menú va al final del array (patrón titulacion/routes.jsx).
 *
 * Portal del estudiante: `/tutorias/mi-pasantia` (TUT-MI-PASANTIA, sin ítem
 * de menú, patrón TUT-MI-PROYECTO) — ESTUDIANTE solo tiene pasantia·DETALLE,
 * por lo que no ve el ítem "Pasantías". Portal del docente: mismo ítem
 * TUT-PASANTIAS con `labelByRole` ("Mis pasantías supervisadas", P18 vía
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
    /** Portal del estudiante: su propio trámite (rama ESTUDIANTE de TUT). Sin ítem de menú. */
    path: '/tutorias/mi-pasantia',
    element: <MiPasantiaConnector />,
    key: 'TUT-MI-PASANTIA',
    breadcrumbLabel: 'Mi pasantía',
    permiso: 'tutorias.pasantia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/empresas/registrar',
    element: <PasantiaEmpresaFormCreateConnector />,
    key: 'TUT-PASANTIAS-EMPRESA-REGISTRAR',
    breadcrumbLabel: 'Nueva empresa',
    permiso: 'tutorias.pasantia.empresa',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/empresas/:empresaId/editar',
    element: <PasantiaEmpresaFormEditConnector />,
    key: 'TUT-PASANTIAS-EMPRESA-EDITAR',
    breadcrumbLabel: 'Editar empresa',
    permiso: 'tutorias.pasantia.empresa',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/empresas',
    element: <PasantiasEmpresasListConnector />,
    key: 'TUT-PASANTIAS-EMPRESAS',
    breadcrumbLabel: 'Empresas de pasantía',
    permiso: 'tutorias.pasantia.empresa',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/registrar',
    element: <PasantiaFormCreateConnector />,
    key: 'TUT-PASANTIAS-REGISTRAR',
    breadcrumbLabel: 'Nuevo trámite',
    permiso: 'tutorias.pasantia',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/:id/editar',
    element: <PasantiaFormEditConnector />,
    key: 'TUT-PASANTIAS-EDITAR',
    breadcrumbLabel: 'Editar trámite',
    permiso: 'tutorias.pasantia',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias/:id',
    element: <PasantiaDetailConnector />,
    key: 'TUT-PASANTIAS-DETALLE',
    breadcrumbLabel: 'Detalle del trámite',
    permiso: 'tutorias.pasantia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TUT-PASANTIAS',
  },
  {
    path: '/tutorias/pasantias',
    element: <PasantiasListConnector />,
    key: 'TUT-PASANTIAS',
    permiso: 'tutorias.pasantia',
    accion: 'LISTAR',
    menu: {
      label: 'Pasantías',
      module: 'TUT',
      parent: 'TUT',
      order: 2,
      labelByRole: { DOCENTE: 'Mis pasantías supervisadas' },
    },
  },
];

export default pasantiasRoutes;
