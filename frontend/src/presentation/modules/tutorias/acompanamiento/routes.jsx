/**
 * Rutas del submódulo Acompañamiento (módulo TUT) — cada ítem de menú tiene
 * su directorio y routes.jsx (patrón `configuracion/routes.jsx`).
 *
 * Los 3 ítems cuelgan del menú ACADÉMICO (parent 'ACA', decisión 2026-07-29:
 * operan sobre la vida académica regular, no sobre el camino al título;
 * ver docs/plan/titulacion-y-dominios-pendientes.md):
 *
 *   alertas/  → Alumnos en riesgo (order 8, connector role-aware docente)
 *   sesiones/ → Sesiones de refuerzo (order 9, ABM + ficha)
 *   panel/    → Panel de acompañamiento (order 10, indicadores + export PDF)
 *
 * Paths /tutorias/acompanamiento/* y permisos tutorias.acompanamiento.* se
 * mantienen como identificadores estables. El routes.jsx raíz del módulo
 * compone `acompanamientoRoutes` junto a las rutas de Titulación.
 */

import { alertasRoutes } from './alertas/routes.jsx';
import { sesionesRoutes } from './sesiones/routes.jsx';
import { panelRoutes } from './panel/routes.jsx';

export const acompanamientoRoutes = [...alertasRoutes, ...sesionesRoutes, ...panelRoutes];

export default acompanamientoRoutes;
