/**
 * Acompañamiento → Panel de acompañamiento (ACA · ruta legada
 * /academico/acompanamiento/panel).
 *
 * Agrupación 2026-08-01 («Seguimiento académico», ítem ACA-SEGUIMIENTO): dejó
 * de ser entrada de sidebar (era order 10). La URL NO se elimina: queda como
 * GEMELA del contenedor con la pestaña «Panel» por defecto. La exportación a
 * PDF (panel·EXPORTAR) es una acción dentro del contenido embebido, sin ruta
 * propia. Permiso `academico.acompanamiento.panel` (seed 59, sin cambios).
 */

import { lazy } from 'react';
import { PANEL_ACOMPANAMIENTO_PATH } from '@application-academico/acompanamiento/config/paths';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import { TAB_PANEL } from '@academico/seguimiento/config/seguimientoTabs';

const SeguimientoAcademicoConnector = lazy(
  () => import('@academico/seguimiento/connectors/SeguimientoAcademicoConnector.jsx'),
);

export const panelRoutes = [
  {
    path: PANEL_ACOMPANAMIENTO_PATH,
    element: <SeguimientoAcademicoConnector defaultTab={TAB_PANEL} />,
    key: 'ACA-PANEL',
    breadcrumbLabel: 'Panel de acompañamiento',
    permiso: ACOMPANAMIENTO_PERMISOS.panel,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-SEGUIMIENTO',
  },
];

export default panelRoutes;
