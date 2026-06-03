/**
 * Rutas del módulo Institucional — cada ítem de menú tiene su directorio y routes.jsx.
 *
 * Flujo operativo por gestión: oferta → asignación docente (detalle paralelo) → horarios.
 */

import { UnderConstruction } from '@components/pages';
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
  {
    path: '/institucional/actual',
    element: <UnderConstruction />,
    key: 'INST-GESTION-ACTUAL',
    permiso: 'institucional.gestion.actual',
    accion: 'LISTAR',
    menu: {
      label: 'Gestión Actual',
      module: 'INST',
      parent: 'INST',
      order: 1,
    },
  },
  {
    path: '/institucional/cronogramas',
    element: <UnderConstruction />,
    key: 'INST-CRONOGRAMAS',
    permiso: 'institucional.gestion.cronograma',
    accion: 'LISTAR',
    menu: {
      label: 'Cronogramas',
      module: 'INST',
      parent: 'INST',
      order: 2,
    },
  },
  ...ofertaRoutes,
  ...horariosRoutes,
  ...pasadasRoutes,
];

export default institucionalRoutes;
