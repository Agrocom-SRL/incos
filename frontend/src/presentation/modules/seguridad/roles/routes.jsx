// src/presentation/modules/seguridad/roles/routes.jsx
/**
 * Rutas del ítem de menú SEG → Roles y permisos.
 * Paths bajo `/seguridad/roles/...`. Orden: subpath (`.../permisos`) antes que la lista.
 */

import {
  RolDetailConnector,
  RolFormConnector,
  RolPermisosConnector,
  RolesListConnector,
} from '@modules/seguridad/roles/connectors';

export const rolesRoutes = [
  {
    path: '/seguridad/roles/nuevo',
    element: <RolFormConnector />,
    key: 'SEG-ROL-NUEVO',
    permiso: 'seguridad.rol.gestionar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'SEG-ROLES',
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
    path: '/seguridad/roles/:id',
    element: <RolDetailConnector />,
    key: 'SEG-ROL-DETALLE',
    permiso: 'seguridad.rol.gestionar',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'SEG-ROLES',
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

export default rolesRoutes;
