// src/router/modules/usuarios.routes.js
import { lazy } from 'react';

const UsuariosListPage = lazy(() => import('@pages/Usuarios/List'));
const UsuariosCreatePage = lazy(() => import('@pages/Usuarios/Create'));
const UsuariosRolesPage = lazy(() => import('@pages/Usuarios/Roles'));
const UsuariosPermisosPage = lazy(() => import('@pages/Usuarios/Permisos'));
const UsuariosAuditoriaPage = lazy(() => import('@pages/Usuarios/Auditoria'));

export const usuariosRoutes = [
    {
        path: '/usuarios/listar',
        element: <UsuariosListPage />,
        key: 'USR-LIST',
    },
    {
        path: '/usuarios/crear',
        element: <UsuariosCreatePage />,
        key: 'USR-CREATE',
    },
    {
        path: '/usuarios/roles',
        element: <UsuariosRolesPage />,
        key: 'USR-ROLES',
    },
    {
        path: '/usuarios/permisos',
        element: <UsuariosPermisosPage />,
        key: 'USR-PERMISOS',
    },
    {
        path: '/usuarios/auditoria',
        element: <UsuariosAuditoriaPage />,
        key: 'USR-AUDITORIA',
    },
];

export default usuariosRoutes;
