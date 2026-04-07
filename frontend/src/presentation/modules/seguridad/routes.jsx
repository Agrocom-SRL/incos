// src/presentation/modules/seguridad/routes.jsx
/**
 * Rutas del dominio Seguridad (SEG): usuarios, roles, permisos.
 * Paths bajo `/seguridad/...`; menú con `parent: 'SEG'` (dominio en dominios/routes.jsx).
 * Orden: rutas estáticas (`nuevo`) y subpaths (`.../permisos`) antes que `:id`.
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
    path: '/seguridad/usuarios/nuevo',
    element: <UsuarioCreatePage />,
    key: 'SEG-USUARIO-CREAR',
    permiso: 'seguridad.usuario.crear',
    menu: {
      label: 'Crear Usuario',
      module: 'SEG',
      parent: 'SEG',
      order: 1,
    },
  },
  {
    path: '/seguridad/usuarios/:id/permisos',
    element: <UsuarioPermisosPage />,
    key: 'SEG-USUARIO-PERMISOS',
    permiso: 'seguridad.rol.gestionar',
    menu: null,
  },
  {
    path: '/seguridad/roles/:id/permisos',
    element: <RolPermisosPage />,
    key: 'SEG-ROL-PERMISOS',
    permiso: 'seguridad.rol.gestionar',
    menu: null,
  },
  {
    path: '/seguridad/usuarios/:id',
    element: <UsuarioDetailPage />,
    key: 'SEG-USUARIO-DETALLE',
    permiso: 'seguridad.usuario.administrar',
    menu: null,
  },
  {
    path: '/seguridad/usuarios',
    element: <UsuariosListPage />,
    key: 'SEG-USUARIOS',
    permiso: 'seguridad.usuario.administrar',
    menu: {
      label: 'Administrar',
      module: 'SEG',
      parent: 'SEG',
      order: 2,
    },
  },
  {
    path: '/seguridad/roles',
    element: <RolesListPage />,
    key: 'SEG-ROLES',
    permiso: 'seguridad.rol.gestionar',
    menu: {
      label: 'Roles y Permisos',
      module: 'SEG',
      parent: 'SEG',
      order: 3,
    },
  },
];

export default seguridadRoutes;
