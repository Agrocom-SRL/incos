/**
 * Rutas del módulo Configuración — cada ítem de menú tiene su directorio y routes.jsx.
 */

import { UnderConstruction } from '@components/pages';
import { academicoConfigRoutes } from './academico/routes.jsx';
import { documentacionRoutes } from './documentacion/routes.jsx';
import { complementariosRoutes } from './complementarios/routes.jsx';
import { conveniosRoutes } from './convenios/routes.jsx';
import { actividadesRoutes } from './actividades/routes.jsx';

export const configuracionRoutes = [
  {
    path: '/configuracion',
    element: <UnderConstruction />,
    key: 'CFG-ROOT',
    menu: null,
  },
  ...academicoConfigRoutes,
  ...documentacionRoutes,
  ...complementariosRoutes,
  ...conveniosRoutes,
  ...actividadesRoutes,
];

export default configuracionRoutes;
