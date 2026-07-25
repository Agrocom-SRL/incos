/**
 * Rutas del módulo Tutorías (TUT) — cada ítem de menú tiene su directorio y
 * routes.jsx (patrón configuracion/routes.jsx). Raíz de menú: dominios/routes.jsx
 * → key TUT (order 9).
 *
 * Submódulos: Titulación (proyectos de grado, bitácora, avances, dictámenes)
 * y Acompañamiento (alertas de riesgo, sesiones de reforzamiento, panel).
 * Permisos del seed 66 (`tutorias.*`).
 */

import { UnderConstruction } from '@components/pages';
import { titulacionRoutes } from './titulacion/routes.jsx';
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
      'tutorias.acompanamiento.alerta',
      'tutorias.acompanamiento.sesion',
      'tutorias.acompanamiento.panel',
    ],
    accion: 'LISTAR',
    menu: null,
  },
  ...titulacionRoutes,
  ...acompanamientoRoutes,
];

export default tutoriasRoutes;
