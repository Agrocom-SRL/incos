/**
 * Tutorías → Acompañamiento → Alumnos en riesgo (ítem de menú TUT, order 2).
 *
 * Permiso `tutorias.acompanamiento.alerta` (seed 66). Entrada única de menú:
 * el connector bifurca por rol (docente → "Mis alumnos en riesgo"); el drawer
 * de detalle por estudiante (alerta·DETALLE) vive dentro del listado, sin
 * ruta propia.
 */

import { lazy } from 'react';
import { ALERTAS_RIESGO_LIST_PATH } from '@application-tutorias/config/paths';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';

const AlertasRiesgoListConnector = lazy(
  () => import('./connectors/AlertasRiesgoListConnector.jsx'),
);

export const alertasRoutes = [
  {
    path: ALERTAS_RIESGO_LIST_PATH,
    element: <AlertasRiesgoListConnector />,
    key: 'TUT-ALERTAS',
    permiso: TUTORIAS_PERMISOS.alerta,
    accion: 'LISTAR',
    menu: {
      label: 'Alumnos en riesgo',
      module: 'TUT',
      parent: 'TUT',
      order: 2,
      labelByRole: { DOCENTE: 'Mis alumnos en riesgo' },
    },
  },
];

export default alertasRoutes;
