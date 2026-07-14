/**
 * Rutas del módulo Configuración — cada ítem de menú tiene su directorio y routes.jsx.
 */

import { UnderConstruction } from '@components/pages';
import { academicoConfigRoutes } from './academico/routes.jsx';
import { documentacionRoutes } from './documentacion/routes.jsx';
import { complementariosRoutes } from './complementarios/routes.jsx';
import { conveniosRoutes } from './convenios/routes.jsx';
import { actividadesRoutes } from './actividades/routes.jsx';
import { recursosRoutes } from './recursos/routes.jsx';

export const configuracionRoutes = [
  {
    path: '/configuracion',
    element: <UnderConstruction />,
    key: 'CFG-ROOT',
    // Sin permiso único de menú (agrupa submódulos): exige al menos uno de sus
    // permisos de entrada, igual que el resto de rutas protegidas del sistema.
    permisoAny: [
      'configuracion.carrera',
      'configuracion.materia',
      'configuracion.plan-estudio',
      'configuracion.documentacion',
      'configuracion.complementario.discapacidad',
      'configuracion.complementario.apoderados',
      'configuracion.complementario.idiomas',
      'configuracion.complementario.estado-civil',
      'configuracion.actividad',
      'configuracion.paralelo',
      'configuracion.aula',
      'configuracion.tipo-evaluacion',
    ],
    accion: 'LISTAR',
    menu: null,
  },
  ...academicoConfigRoutes,
  ...documentacionRoutes,
  ...complementariosRoutes,
  ...conveniosRoutes,
  ...actividadesRoutes,
  ...recursosRoutes,
];

export default configuracionRoutes;
