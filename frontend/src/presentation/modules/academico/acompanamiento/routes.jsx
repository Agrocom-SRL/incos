/**
 * Rutas del submódulo Acompañamiento pedagógico (dominio ACADÉMICO, módulo
 * ACA) — cada ítem de menú tiene su directorio y routes.jsx (patrón
 * `configuracion/routes.jsx`).
 *
 * Reclasificación 2026-07-31 (`tutorias.acompanamiento.*` → `academico.acompanamiento.*`,
 * carpeta `tutorias/acompanamiento/` → `academico/acompanamiento/`): alertas
 * de riesgo, sesiones de refuerzo y panel se derivan de
 * `asignaciones_docentes`/centralizador, sin relación con proyectos de grado
 * — decisión 2026-07-29, ver docs/plan/titulacion-y-dominios-pendientes.md.
 *
 * Los 3 ítems cuelgan del menú ACADÉMICO (parent 'ACA'):
 *
 *   alertas/  → Alumnos en riesgo (order 8, connector role-aware docente)
 *   sesiones/ → Sesiones de refuerzo (order 9, ABM + ficha)
 *   panel/    → Panel de acompañamiento (order 10, indicadores + export PDF)
 *
 * Paths `/academico/acompanamiento/*` y permisos `academico.acompanamiento.*`.
 * El `academico/routes.jsx` raíz del dominio compone `acompanamientoRoutes`
 * junto al resto de ítems del menú Académico.
 */

import { alertasRoutes } from './alertas/routes.jsx';
import { sesionesRoutes } from './sesiones/routes.jsx';
import { panelRoutes } from './panel/routes.jsx';

export const acompanamientoRoutes = [...alertasRoutes, ...sesionesRoutes, ...panelRoutes];

export default acompanamientoRoutes;
