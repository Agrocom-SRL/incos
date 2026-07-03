// src/presentation/modules/academico/historial/routes.jsx
/**
 * Historial académico (ítem de menú ACA).
 *
 * - Landing (LISTAR): selector/buscador de estudiante; ESTUDIANTE → su propio
 *   historial (rama en el connector). Etiqueta de menú "Mi historial" para ESTUDIANTE.
 * - Detalle (DETALLE): transcript FORM-SIE-ITT-04 del estudiante `:id`; incluye
 *   Exportar (EXPORTAR). Sin ítem de menú; cuelga de ACA-HIS en breadcrumbs.
 * - Folio / Validar: fuera de alcance (UnderConstruction).
 *
 * Permiso `academico.historial.academico` (seed 58, en BD). No se tocan permisos.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const HistorialSelectorConnector = lazy(
  () => import('./connectors/HistorialSelectorConnector.jsx'),
);
const HistorialAcademicoConnector = lazy(
  () => import('./connectors/HistorialAcademicoConnector.jsx'),
);

export const historialRoutes = [
  {
    // Detalle (transcript) — ruta dinámica, sin ítem de menú.
    path: '/academico/historial/academico/:id',
    element: <HistorialAcademicoConnector />,
    key: 'ACA-HIS-DETALLE',
    breadcrumbLabel: 'Historial del estudiante',
    permiso: 'academico.historial.academico',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'ACA-HIS',
  },
  {
    // Landing (selector) — ítem de menú.
    path: '/academico/historial/academico',
    element: <HistorialSelectorConnector />,
    key: 'ACA-HIS',
    permiso: 'academico.historial.academico',
    accion: 'LISTAR',
    menu: {
      label: 'Historial',
      module: 'ACA',
      parent: 'ACA',
      order: 6,
      labelByRole: { ESTUDIANTE: 'Mi historial' },
    },
  },
  {
    path: '/academico/historial/folio',
    element: <UnderConstruction />,
    key: 'ACA-HIS-FOLIO',
    permiso: 'academico.historial.folio',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-HIS',
  },
  {
    path: '/academico/historial/validar',
    element: <UnderConstruction />,
    key: 'ACA-HIS-VALIDAR',
    permiso: 'academico.historial.validar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-HIS',
  },
];

export default historialRoutes;
