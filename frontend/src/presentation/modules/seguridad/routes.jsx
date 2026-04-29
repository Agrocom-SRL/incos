// src/presentation/modules/seguridad/routes.jsx
/**
 * Rutas del dominio Seguridad (SEG): usuarios, roles, permisos.
 * Paths bajo `/seguridad/...`; menú con `parent: 'SEG'` (dominio en dominios/routes.jsx).
 * Orden: rutas estáticas (`nuevo`) y subpaths (`.../permisos`) antes que `:id`.
 */

import {
  UsuarioCreateConnector,
  UsuarioDetailConnector,
  UsuarioPermisosConnector,
  RolPermisosConnector,
  RolesListConnector,
  UsuariosListConnector,
} from '@modules/seguridad/connectors';

export const seguridadRoutes = [
  {
    path: '/seguridad/usuarios/nuevo',
    element: <UsuarioCreateConnector />,
    key: 'SEG-USUARIO-CREAR',
    permiso: 'seguridad.usuario.crear',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'SEG-USUARIOS',
  },
  {
    path: '/seguridad/usuarios/:id/permisos',
    element: <UsuarioPermisosConnector />,
    key: 'SEG-USUARIO-PERMISOS',
    permiso: 'seguridad.rol.gestionar',
    accion: 'EDITAR',
    menu: null,
  },
  {
    path: '/seguridad/roles/:id/permisos',
    element: <RolPermisosConnector />,
    key: 'SEG-ROL-PERMISOS',
    permiso: 'seguridad.rol.gestionar',
    accion: 'EDITAR',
    menu: null,
  },
  {
    path: '/seguridad/usuarios/:id',
    element: <UsuarioDetailConnector />,
    key: 'SEG-USUARIO-DETALLE',
    permiso: 'seguridad.usuario.administrar',
    accion: 'DETALLE',
    menu: null,
  },
  {
    path: '/seguridad/usuarios',
    element: <UsuariosListConnector />,
    key: 'SEG-USUARIOS',
    permiso: 'seguridad.usuario.administrar',
    accion: 'LISTAR',
    menu: {
      label: 'Usuarios',
      module: 'SEG',
      parent: 'SEG',
      order: 1,
    },
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

export default seguridadRoutes;
