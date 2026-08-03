/**
 * Acompañamiento → Alumnos en riesgo (ACA · ruta legada
 * /academico/acompanamiento/alertas).
 *
 * Agrupación 2026-08-01 («Seguimiento académico», ítem ACA-SEGUIMIENTO): dejó
 * de ser entrada de sidebar (era order 8). La URL NO se elimina: queda como
 * GEMELA del contenedor con la pestaña «Alumnos en riesgo» por defecto. La
 * pestaña embebe el connector role-aware existente (DOCENTE → «Mis alumnos en
 * riesgo»; el drawer de detalle alerta·DETALLE vive dentro del listado).
 * Permiso `academico.acompanamiento.alerta` (seed 59, sin cambios).
 */

import { lazy } from 'react';
import { ALERTAS_RIESGO_LIST_PATH } from '@application-academico/acompanamiento/config/paths';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import { TAB_ALERTAS } from '@academico/seguimiento/config/seguimientoTabs';

const SeguimientoAcademicoConnector = lazy(
  () => import('@academico/seguimiento/connectors/SeguimientoAcademicoConnector.jsx'),
);

export const alertasRoutes = [
  {
    path: ALERTAS_RIESGO_LIST_PATH,
    element: <SeguimientoAcademicoConnector defaultTab={TAB_ALERTAS} />,
    key: 'ACA-ALERTAS',
    breadcrumbLabel: 'Alumnos en riesgo',
    permiso: ACOMPANAMIENTO_PERMISOS.alerta,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-SEGUIMIENTO',
  },
];

export default alertasRoutes;
