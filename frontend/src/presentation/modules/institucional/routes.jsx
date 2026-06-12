/**
 * Rutas del módulo Institucional — cada ítem de menú tiene su directorio y routes.jsx.
 *
 * Flujo operativo por gestión: oferta → asignación docente (detalle paralelo) → horarios.
 */

import { UnderConstruction } from '@components/pages';
import { actualRoutes } from './actual/routes.jsx';
import { ofertaRoutes } from './oferta/routes.jsx';
import { horariosRoutes } from './horarios/routes.jsx';
import { pasadasRoutes } from './pasadas/routes.jsx';

export const institucionalRoutes = [
  {
    path: '/institucional',
    element: <UnderConstruction />,
    key: 'INST-ROOT',
    menu: null,
  },
  ...actualRoutes,
  ...ofertaRoutes,
  ...horariosRoutes,
  ...pasadasRoutes,
];

export default institucionalRoutes;
