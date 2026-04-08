// src/presentation/modules/calificaciones/routes.jsx
/**
 * Rutas del módulo de Calificaciones (dominio Académico).
 * Sidebar: un solo ítem ACA-CAL bajo ACA (sin agrupador intermedio).
 */

import { UnderConstruction } from '@components/pages';

export const calificacionesRoutes = [
  {
    path: '/calificaciones',
    element: <UnderConstruction />,
    key: 'ACA-CAL',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: {
      label: 'Calificaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 1,
      labelByRole: { ESTUDIANTE: 'Mis calificaciones' },
    },
  },
  {
    path: '/calificaciones/registrar',
    element: null,
    key: 'ACA-CAL-REGISTRAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/registrar/parcial',
    element: <UnderConstruction />,
    key: 'ACA-CAL-REG-PARCIAL',
    permiso: 'academico.calificacion.registrar.parcial',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/registrar/practico',
    element: <UnderConstruction />,
    key: 'ACA-CAL-REG-PRACTICO',
    permiso: 'academico.calificacion.registrar.practico',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/registrar/recuperatorio',
    element: <UnderConstruction />,
    key: 'ACA-CAL-REG-RECUP',
    permiso: 'academico.calificacion.registrar.recuperatorio',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/curso',
    element: <UnderConstruction />,
    key: 'ACA-CAL-CURSO',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/periodo',
    element: <UnderConstruction />,
    key: 'ACA-CAL-PERIODO',
    permiso: 'academico.calificacion.periodo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/calificaciones/modificar',
    element: <UnderConstruction />,
    key: 'ACA-CAL-MODIFICAR',
    permiso: 'academico.calificacion.modificar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
];

export default calificacionesRoutes;
