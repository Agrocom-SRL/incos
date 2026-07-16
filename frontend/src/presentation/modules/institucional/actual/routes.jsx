/**
 * Institucional → Gestión actual.
 *
 * - `/institucional/actual`            Panel (solo lectura): KPIs + cronograma + línea de tiempo de bimestres.
 * - `/institucional/actual/bimestres`  Control de bimestres (acciones: iniciar gestión, cerrar bimestre).
 * - `/institucional/actual/cronograma` Administración del cronograma (CRUD de actividades del calendario).
 */

import { lazy } from 'react';

const GestionActualConnector = lazy(
  () => import('@institucional/actual/connectors/GestionActualConnector'),
);
const ControlBimestresConnector = lazy(
  () => import('@institucional/actual/connectors/ControlBimestresConnector'),
);
const CronogramaAdminConnector = lazy(
  () => import('@institucional/actual/connectors/CronogramaAdminConnector'),
);
const CronogramaActividadCreateConnector = lazy(() =>
  import('@institucional/actual/connectors/CronogramaActividadFormConnector').then((m) => ({
    default: m.CronogramaActividadCreateConnector,
  })),
);
const CronogramaActividadEditConnector = lazy(() =>
  import('@institucional/actual/connectors/CronogramaActividadFormConnector').then((m) => ({
    default: m.CronogramaActividadEditConnector,
  })),
);
const CronogramaActividadDetailConnector = lazy(
  () => import('@institucional/actual/connectors/CronogramaActividadDetailConnector'),
);

export const actualRoutes = [
  {
    path: '/institucional/actual',
    element: <GestionActualConnector />,
    key: 'INST-GESTION-ACTUAL',
    permiso: 'institucional.gestion.actual',
    accion: 'LISTAR',
    menu: {
      label: 'Gestión actual',
      module: 'INST',
      parent: 'INST',
      order: 1,
    },
  },
  {
    // Página de acciones (EDITAR) para abrir/cerrar bimestres según su fecha.
    // No es ítem del sidebar: se accede desde el botón "Control de bimestres"
    // del panel de Gestión actual.
    path: '/institucional/actual/bimestres',
    element: <ControlBimestresConnector />,
    key: 'INST-GESTION-BIMESTRES',
    permiso: 'institucional.gestion.actual',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-GESTION-ACTUAL',
  },
  {
    // Administración del cronograma (CRUD). No es ítem del sidebar: se accede
    // desde el botón "Gestionar" de la tarjeta Cronograma del panel.
    path: '/institucional/actual/cronograma',
    element: <CronogramaAdminConnector />,
    key: 'INST-GESTION-CRONOGRAMA',
    permiso: 'institucional.gestion.cronograma',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-GESTION-ACTUAL',
  },
  {
    path: '/institucional/actual/cronograma/nueva',
    element: <CronogramaActividadCreateConnector />,
    key: 'INST-GESTION-CRONOGRAMA-NUEVA',
    permiso: 'institucional.gestion.cronograma',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'INST-GESTION-CRONOGRAMA',
  },
  {
    // Ficha de detalle de una actividad del calendario (DETALLE). Acceso por el
    // botón "ver" de la tabla. Ruta dinámica DESPUÉS de las estáticas (`nueva`).
    path: '/institucional/actual/cronograma/:id',
    element: <CronogramaActividadDetailConnector />,
    key: 'INST-GESTION-CRONOGRAMA-DETALLE',
    permiso: 'institucional.gestion.cronograma',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'INST-GESTION-CRONOGRAMA',
  },
  {
    path: '/institucional/actual/cronograma/:id/editar',
    element: <CronogramaActividadEditConnector />,
    key: 'INST-GESTION-CRONOGRAMA-EDITAR',
    permiso: 'institucional.gestion.cronograma',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-GESTION-CRONOGRAMA',
  },
];

export default actualRoutes;
