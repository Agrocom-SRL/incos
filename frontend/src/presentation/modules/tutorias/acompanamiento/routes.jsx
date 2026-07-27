/**
 * Rutas del submódulo Acompañamiento (dominio TUT) — cada ítem de menú tiene
 * su directorio y routes.jsx (patrón `configuracion/routes.jsx`):
 *
 *   alertas/  → Alumnos en riesgo (order 2, connector role-aware docente)
 *   sesiones/ → Sesiones de refuerzo (order 3, ABM + ficha)
 *   panel/    → Panel de acompañamiento (order 4, indicadores + export PDF)
 *
 * El routes.jsx raíz del módulo Tutorías compone `acompanamientoRoutes` junto
 * a las rutas de Titulación.
 */

import { alertasRoutes } from './alertas/routes.jsx';
import { sesionesRoutes } from './sesiones/routes.jsx';
import { panelRoutes } from './panel/routes.jsx';

export const acompanamientoRoutes = [...alertasRoutes, ...sesionesRoutes, ...panelRoutes];

export default acompanamientoRoutes;
