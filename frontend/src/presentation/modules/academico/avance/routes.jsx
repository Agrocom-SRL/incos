// src/presentation/modules/academico/avance/routes.jsx
/**
 * Avance académico (ACA · ruta legada /academico/avance).
 *
 * Agrupación 2026-08-01 («Seguimiento académico», ítem ACA-SEGUIMIENTO): este
 * ítem dejó de ser entrada de sidebar y su página (tabs Avance/Deserción,
 * disolución REP) se extendió al contenedor de seguimiento. La URL NO se
 * elimina (deep links, landing de roles y navegación interna): queda como
 * GEMELA del contenedor — renderiza el mismo connector con la pestaña
 * «Avance» por defecto y `?tab=avance|desercion` sigue funcionando con las
 * mismas keys. El rol ESTUDIANTE conserva su experiencia «Mi avance»
 * (labelByRole vive ahora en seguimiento/routes.jsx; alcance PROPIO en servidor).
 */

import { lazy } from 'react';
import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';

const SeguimientoAcademicoConnector = lazy(
  () => import('@academico/seguimiento/connectors/SeguimientoAcademicoConnector.jsx'),
);

export const avanceRoutes = [
  {
    path: '/academico/avance',
    element: <SeguimientoAcademicoConnector />,
    key: 'ACA-AVANCE',
    breadcrumbLabel: 'Avance académico',
    permiso: AVANCE_PERMISOS.avance,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-SEGUIMIENTO',
  },
];

export default avanceRoutes;
