// src/presentation/modules/academico/historial/routes.jsx
/**
 * Historial académico (ítem de menú ACA).
 *
 * - Landing (LISTAR): selector/buscador de estudiante; ESTUDIANTE → su propio
 *   historial (rama en el connector). Etiqueta de menú "Mi historial" para ESTUDIANTE.
 * - Detalle (DETALLE): transcript FORM-SIE-ITT-04 del estudiante `:id`; incluye
 *   Exportar (EXPORTAR). Sin ítem de menú; cuelga de ACA-HIS en breadcrumbs.
 *
 * Permiso `academico.historial.academico` (seed 59, en BD). No se tocan permisos.
 *
 * Nota (2026-07-31, Fase 4 Libros de registro): las rutas `ACA-HIS-FOLIO` y
 * `ACA-HIS-VALIDAR` (folio del egresado / validación de egreso) se retiraron
 * junto con sus permisos `academico.historial.folio`/`academico.historial.validar`
 * (seed 59): el concepto de folio pasó a `academico.libro` (módulo Libros de
 * registro, `ACA-LIBROS`) y la validación de egreso queda planificada para la
 * Fase 5 (`titulacion.titulo.*`).
 */

import { lazy } from 'react';

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
      label: 'Historial académico',
      module: 'ACA',
      parent: 'ACA',
      order: 6,
      labelByRole: { ESTUDIANTE: 'Mi historial' },
    },
  },
];

export default historialRoutes;
