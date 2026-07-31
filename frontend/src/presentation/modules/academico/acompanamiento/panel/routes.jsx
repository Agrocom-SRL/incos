/**
 * Acompañamiento → Panel de acompañamiento (ítem del menú Académico,
 * order 10).
 *
 * Permiso `academico.acompanamiento.panel` (seed 59). Entrada única de menú:
 * la exportación a PDF (panel·EXPORTAR) es una acción dentro de la página,
 * sin ruta propia.
 */

import { lazy } from 'react';
import { PANEL_ACOMPANAMIENTO_PATH } from '@application-academico/acompanamiento/config/paths';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';

const PanelAcompanamientoConnector = lazy(
  () => import('./connectors/PanelAcompanamientoConnector.jsx'),
);

export const panelRoutes = [
  {
    path: PANEL_ACOMPANAMIENTO_PATH,
    element: <PanelAcompanamientoConnector />,
    key: 'ACA-PANEL',
    permiso: ACOMPANAMIENTO_PERMISOS.panel,
    accion: 'LISTAR',
    menu: {
      label: 'Panel de acompañamiento',
      module: 'ACA',
      parent: 'ACA',
      order: 10,
    },
  },
];

export default panelRoutes;
