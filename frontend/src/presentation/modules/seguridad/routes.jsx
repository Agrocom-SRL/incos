// src/presentation/modules/seguridad/routes.jsx
/**
 * Rutas del dominio Seguridad (SEG): usuarios, roles, permisos.
 * El menú sigue usando `parent: 'SEG'` y claves USR-* como antes.
 */

import { lazy } from 'react';

const UsuariosListPage = lazy(() =>
  import('@modules/seguridad/pages/UsuariosListPage.jsx')
);
const UsuarioCreatePage = lazy(() =>
  import('@modules/seguridad/pages/UsuarioCreatePage.jsx')
);
const UsuarioDetailPage = lazy(() =>
  import('@modules/seguridad/pages/UsuarioDetailPage.jsx')
);
const UsuarioPermisosPage = lazy(() =>
  import('@modules/seguridad/pages/UsuarioPermisosPage.jsx')
);
const RolesListPage = lazy(() =>
  import('@modules/seguridad/pages/RolesListPage.jsx')
);
const RolPermisosPage = lazy(() =>
  import('@modules/seguridad/pages/RolPermisosPage.jsx')
);

export const seguridadRoutes = [
  {
    path: '/usuarios',
    element: null,
    key: 'USR',
    menu: null,
  },
  {
    path: '/usuarios/crear',
    element: <UsuarioCreatePage />,
    key: 'USR-CREATE',
    permiso: 'seguridad.usuario.crear',
    menu: {
      label: 'Crear Nuevo Usuario',
      module: 'SEG',
      parent: 'SEG',
      order: 1,
    },
  },
  {
    path: '/usuarios/administrar',
    element: <UsuariosListPage />,
    key: 'USR-LIST',
    permiso: 'seguridad.usuario.administrar',
    menu: {
      label: 'Administrar Usuarios',
      module: 'SEG',
      parent: 'SEG',
      order: 2,
    },
  },
  {
    path: '/usuarios/roles/:id/permisos',
    element: <RolPermisosPage />,
    key: 'USR-ROL-PERM',
    permiso: 'seguridad.rol.gestionar',
    menu: null,
  },
  {
    path: '/usuarios/roles',
    element: <RolesListPage />,
    key: 'USR-ROLES',
    permiso: 'seguridad.rol.gestionar',
    menu: {
      label: 'Roles y Permisos',
      module: 'SEG',
      parent: 'SEG',
      order: 3,
    },
  },
  {
    path: '/usuarios/:id/permisos',
    element: <UsuarioPermisosPage />,
    key: 'USR-PERM',
    permiso: 'seguridad.rol.gestionar',
    menu: null,
  },
  {
    path: '/usuarios/:id',
    element: <UsuarioDetailPage />,
    key: 'USR-DET',
    permiso: 'seguridad.usuario.administrar',
    menu: null,
  },
];

export default seguridadRoutes;
