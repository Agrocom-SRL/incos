// src/presentation/modules/academico/avance/routes.jsx
/**
 * Avance académico (ítem de menú ACA · ACA-AVANCE).
 *
 * Una página con pestañas gateadas por permiso (disolución del módulo REP):
 * «Avance» (`academico.avance`) y «Deserción» (`academico.desercion`).
 * El rol ESTUDIANTE entra con labelByRole "Mi avance" y el backend acota el
 * listado a su propia fila (alcance PROPIO resuelto en servidor).
 */

import { lazy } from 'react';
import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';

const AvanceAcademicoConnector = lazy(
  () => import('./connectors/AvanceAcademicoConnector.jsx'),
);

export const avanceRoutes = [
  {
    path: '/academico/avance',
    element: <AvanceAcademicoConnector />,
    key: 'ACA-AVANCE',
    permiso: AVANCE_PERMISOS.avance,
    accion: 'LISTAR',
    menu: {
      label: 'Avance académico',
      module: 'ACA',
      parent: 'ACA',
      order: 7,
      labelByRole: { ESTUDIANTE: 'Mi avance' },
    },
  },
];

export default avanceRoutes;
