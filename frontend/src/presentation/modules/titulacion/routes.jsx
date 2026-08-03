// src/presentation/modules/titulacion/routes.jsx
/**
 * Rutas del módulo Titulación (TIT) — cada ítem de menú tiene su directorio y
 * routes.jsx (patrón configuracion/routes.jsx). Raíz de menú: dominios/routes.jsx
 * → key TIT, label "Titulación" (order 9).
 *
 * Submódulos: Proyectos de grado (bitácora, avances, dictámenes; menú TIT) y
 * Pasantías (trámites de práctica laboral + catálogo de empresas; menú TIT,
 * order 2). Acompañamiento (alertas de riesgo, sesiones de refuerzo, panel)
 * se reclasificó por completo al dominio ACADÉMICO — decisión 2026-07-29,
 * ver docs/plan/titulacion-y-dominios-pendientes.md; sus rutas ahora viven en
 * `academico/acompanamiento/routes.jsx` y se sirven vía `academicoRoutes`.
 * Rename `tutorias` → `titulacion` 2026-07-31: identificadores estables
 * `titulacion.*` (proyecto/bitácora/avance/pasantia).
 */

import { UnderConstruction } from '@components/pages';
import { proyectosGradoRoutes } from './proyectos-grado/routes.jsx';
import { pasantiasRoutes } from './pasantias/routes.jsx';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

export const titulacionRoutes = [
  {
    path: '/titulacion',
    element: <UnderConstruction />,
    key: 'TIT-ROOT',
    // Sin permiso único de menú (agrupa submódulos): exige al menos uno de sus
    // permisos de entrada, igual que el resto de rutas protegidas del sistema.
    permisoAny: [TITULACION_PERMISOS.proyecto, TITULACION_PERMISOS.pasantia],
    accion: 'LISTAR',
    menu: null,
  },
  ...proyectosGradoRoutes,
  ...pasantiasRoutes,
];

export default titulacionRoutes;
