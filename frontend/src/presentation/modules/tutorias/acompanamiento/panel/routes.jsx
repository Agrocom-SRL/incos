/**
 * Tutorías → Acompañamiento → Panel de acompañamiento (ítem de menú TUT,
 * order 4).
 *
 * Permiso `tutorias.acompanamiento.panel` (seed 66). Entrada única de menú:
 * la exportación a PDF (panel·EXPORTAR) es una acción dentro de la página,
 * sin ruta propia.
 */

import { lazy } from 'react';
import { PANEL_ACOMPANAMIENTO_PATH } from '@application-tutorias/config/paths';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';

const PanelAcompanamientoConnector = lazy(
  () => import('./connectors/PanelAcompanamientoConnector.jsx'),
);

export const panelRoutes = [
  {
    path: PANEL_ACOMPANAMIENTO_PATH,
    element: <PanelAcompanamientoConnector />,
    key: 'TUT-PANEL',
    permiso: TUTORIAS_PERMISOS.panel,
    accion: 'LISTAR',
    menu: {
      label: 'Panel de acompañamiento',
      module: 'TUT',
      parent: 'ACA',
      order: 10,
    },
  },
];

export default panelRoutes;
