/**
 * Rutas del módulo Titulación (TUT) — cada ítem de menú tiene su directorio y
 * routes.jsx (patrón configuracion/routes.jsx). Raíz de menú: dominios/routes.jsx
 * → key TUT, label "Titulación" (order 9).
 *
 * Submódulos: Titulación (proyectos de grado, bitácora, avances, dictámenes;
 * menú TUT), Pasantías (trámites de práctica laboral + catálogo de empresas;
 * menú TUT, order 2) y Acompañamiento (alertas de riesgo, sesiones de
 * refuerzo, panel; sus ítems cuelgan del menú ACADÉMICO — decisión 2026-07-29,
 * ver docs/plan/titulacion-y-dominios-pendientes.md). Permisos del seed TUT
 * (`tutorias.*`, identificadores estables).
 */

import { UnderConstruction } from '@components/pages';
import { titulacionRoutes } from './titulacion/routes.jsx';
import { pasantiasRoutes } from './pasantias/routes.jsx';
import { acompanamientoRoutes } from './acompanamiento/routes.jsx';

export const tutoriasRoutes = [
  {
    path: '/tutorias',
    element: <UnderConstruction />,
    key: 'TUT-ROOT',
    // Sin permiso único de menú (agrupa submódulos): exige al menos uno de sus
    // permisos de entrada, igual que el resto de rutas protegidas del sistema.
    permisoAny: [
      'tutorias.titulacion.proyecto',
      'tutorias.pasantia',
      'tutorias.acompanamiento.alerta',
      'tutorias.acompanamiento.sesion',
      'tutorias.acompanamiento.panel',
    ],
    accion: 'LISTAR',
    menu: null,
  },
  ...titulacionRoutes,
  ...pasantiasRoutes,
  ...acompanamientoRoutes,
];

export default tutoriasRoutes;
