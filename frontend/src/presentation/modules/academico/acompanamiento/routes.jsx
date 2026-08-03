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
 * Agrupación 2026-08-01: los 3 dejaron de ser ítems de sidebar (eran orders
 * 8-10 del menú ACA) y viven como pestañas del ítem «Seguimiento académico»
 * (ACA-SEGUIMIENTO, ver `academico/seguimiento/routes.jsx`). Sus URLs NO se
 * eliminan — los listados quedan como rutas gemelas del contenedor y las
 * subrutas del ABM de sesiones conservan sus páginas:
 *
 *   alertas/  → pestaña Alumnos en riesgo (connector role-aware docente)
 *   sesiones/ → pestaña Sesiones de refuerzo + subrutas ABM/ficha propias
 *   panel/    → pestaña Panel de acompañamiento (indicadores + export PDF)
 *
 * Paths `/academico/acompanamiento/*` y permisos `academico.acompanamiento.*`
 * (seed 59, sin cambios). El `academico/routes.jsx` raíz del dominio compone
 * `acompanamientoRoutes` junto al resto de ítems del menú Académico.
 */

import { alertasRoutes } from './alertas/routes.jsx';
import { sesionesRoutes } from './sesiones/routes.jsx';
import { panelRoutes } from './panel/routes.jsx';

export const acompanamientoRoutes = [...alertasRoutes, ...sesionesRoutes, ...panelRoutes];

export default acompanamientoRoutes;
