/**
 * Institucional → Gestión actual.
 *
 * - `/institucional/actual`            Panel (solo lectura): KPIs + línea de tiempo de bimestres.
 * - `/institucional/actual/bimestres`  Control de bimestres (acciones: iniciar gestión, cerrar bimestre).
 */

import { lazy } from 'react';

const GestionActualConnector = lazy(
  () => import('@institucional/actual/connectors/GestionActualConnector'),
);
const ControlBimestresConnector = lazy(
  () => import('@institucional/actual/connectors/ControlBimestresConnector'),
);

export const actualRoutes = [
  {
    path: '/institucional/actual',
    element: <GestionActualConnector />,
    key: 'INST-GESTION-ACTUAL',
    permiso: 'institucional.gestion.actual',
    accion: 'LISTAR',
    menu: {
      label: 'Gestión Actual',
      module: 'INST',
      parent: 'INST',
      order: 1,
    },
  },
  {
    // Página de acciones (EDITAR). No es ítem del sidebar: se accede desde el
    // botón "Control de bimestres" del panel de Gestión actual.
    path: '/institucional/actual/bimestres',
    element: <ControlBimestresConnector />,
    key: 'INST-GESTION-BIMESTRES',
    permiso: 'institucional.gestion.actual',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-GESTION-ACTUAL',
  },
];

export default actualRoutes;
