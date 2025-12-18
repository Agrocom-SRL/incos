// src/router/modules/usuarios.routes.js
import { lazy } from 'react';

const UsuariosListPage = lazy(() => import('@pages/usuarios/list'));
const UsuariosCreatePage = lazy(() => import('@pages/usuarios/create'));
const UsuariosRolesPage = lazy(() => import('@pages/usuarios/roles'));

export const usuariosRoutes = [
    // Módulo raíz: Usuarios
    {
        path: '/usuarios',
        element: null, // No tiene página propia, es solo un grupo
        key: 'USR',
        menu: {
            label: 'Usuarios',
            module: 'USR',
            order: 13, // Configuración del sistema, último
        },
    },
    {
        path: '/usuarios/crear',
        element: <UsuariosCreatePage />,
        key: 'USR-CREATE',
        menu: {
            label: 'Crear Nuevo Usuario',
            module: 'USR',
            parent: 'USR',
            order: 1, // Crear primero
        },
    },
    {
        path: '/usuarios/administrar',
        element: <UsuariosListPage />,
        key: 'USR-LIST',
        menu: {
            label: 'Administrar Usuarios',
            module: 'USR',
            parent: 'USR',
            order: 2, // Administrar segundo
        },
    },
    {
        path: '/usuarios/roles',
        element: <UsuariosRolesPage />,
        key: 'USR-ROLES',
        menu: {
            label: 'Administrar Roles de Usuario',
            module: 'USR',
            parent: 'USR',
            order: 3, // Configuración de roles y permisos
        },
    },
];

export default usuariosRoutes;
