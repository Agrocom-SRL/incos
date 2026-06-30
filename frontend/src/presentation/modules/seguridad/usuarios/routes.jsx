// src/presentation/modules/seguridad/usuarios/routes.jsx
/**
 * Rutas del ítem de menú SEG → Administración de Usuarios.
 * Reúne toda la lógica de manejo de usuarios, privilegios (permisos) y credenciales.
 * Paths bajo `/seguridad/usuarios/...`. Orden: rutas estáticas (`nuevo`) y subpaths
 * (`.../permisos`) antes que `:id`.
 */

import {
  UsuarioCreateConnector,
  UsuarioDetailConnector,
  UsuariosListConnector,
} from '@modules/seguridad/usuarios/connectors';

export const usuariosRoutes = [
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
    path: '/seguridad/usuarios/:id/editar',
    element: <UsuarioCreateConnector />,
    key: 'SEG-USUARIO-EDITAR',
    permiso: 'seguridad.usuario.administrar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'SEG-USUARIOS',
  },
  {
    path: '/seguridad/usuarios/:id/permisos',
    element: <UsuarioDetailConnector initialTab="permisos" />,
    key: 'SEG-USUARIO-PERMISOS',
    permiso: 'seguridad.usuario.administrar',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'SEG-USUARIOS',
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
      label: 'Admin. de Usuarios',
      module: 'SEG',
      parent: 'SEG',
      order: 1,
    },
  },
];

export default usuariosRoutes;
