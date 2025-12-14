// src/router/modules/usuarios.routes.js
import { lazy } from 'react';

const UsuariosListPage = lazy(() => import('@pages/Usuarios/List'));
const UsuariosCreatePage = lazy(() => import('@pages/Usuarios/Create'));
const UsuariosRolesPage = lazy(() => import('@pages/Usuarios/Roles'));
const UsuariosPermisosPage = lazy(() => import('@pages/Usuarios/Permisos'));
const UsuariosAuditoriaPage = lazy(() => import('@pages/Usuarios/Auditoria'));

export const usuariosRoutes = [
    // Módulo raíz: Usuarios
    {
        path: '/usuarios',
        element: null, // No tiene página propia, es solo un grupo
        key: 'USR',
        menu: {
            label: 'Usuarios',
            module: 'USR',
            order: 14,
        },
    },
    {
        path: '/usuarios/listar',
        element: <UsuariosListPage />,
        key: 'USR-LIST',
        menu: {
            label: 'Listar',
            module: 'USR',
            parent: 'USR',
            order: 1, // Listar primero
        },
    },
    {
        path: '/usuarios/crear',
        element: <UsuariosCreatePage />,
        key: 'USR-CREATE',
        menu: {
            label: 'Crear',
            module: 'USR',
            parent: 'USR',
            order: 2, // Crear segundo
        },
    },
    {
        path: '/usuarios/roles',
        element: <UsuariosRolesPage />,
        key: 'USR-ROLES',
        menu: {
            label: 'Roles',
            module: 'USR',
            parent: 'USR',
            order: 3, // Configuración
        },
    },
    {
        path: '/usuarios/permisos',
        element: <UsuariosPermisosPage />,
        key: 'USR-PERMISOS',
        menu: {
            label: 'Permisos',
            module: 'USR',
            parent: 'USR',
            order: 4, // Configuración
        },
    },
    {
        path: '/usuarios/auditoria',
        element: <UsuariosAuditoriaPage />,
        key: 'USR-AUDITORIA',
        menu: {
            label: 'Auditoría',
            module: 'USR',
            parent: 'USR',
            order: 5, // Consultar último
        },
    },
];

export default usuariosRoutes;
