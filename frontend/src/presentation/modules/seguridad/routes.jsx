// src/presentation/modules/seguridad/routes.jsx
/**
 * Rutas del dominio Seguridad (SEG). Compone:
 * - `usuariosRoutes` (ítem de menú "Admin. de Usuarios", subdir `usuarios/`).
 * - rutas de Roles y permisos (este nivel).
 * Paths bajo `/seguridad/...`; menú con `parent: 'SEG'` (dominio en dominios/routes.jsx).
 */

import { RolPermisosConnector, RolesListConnector } from '@modules/seguridad/connectors';
import { usuariosRoutes } from '@modules/seguridad/usuarios/routes.jsx';

const rolesRoutes = [
  {
    path: '/seguridad/roles/:id/permisos',
    element: <RolPermisosConnector />,
    key: 'SEG-ROL-PERMISOS',
    permiso: 'seguridad.rol.gestionar',
    accion: 'EDITAR',
    menu: null,
  },
  {
    path: '/seguridad/roles',
    element: <RolesListConnector />,
    key: 'SEG-ROLES',
    permiso: 'seguridad.rol.gestionar',
    accion: 'LISTAR',
    menu: {
      label: 'Roles y permisos',
      module: 'SEG',
      parent: 'SEG',
      order: 2,
    },
  },
];

export const seguridadRoutes = [...usuariosRoutes, ...rolesRoutes];

export default seguridadRoutes;
