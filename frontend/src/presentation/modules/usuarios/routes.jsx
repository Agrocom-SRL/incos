// src/presentation/modules/usuarios/routes.jsx
/**
 * Rutas del módulo de Usuarios (dominio Seguridad).
 */

import { UnderConstruction } from '@components/pages';

export const usuariosRoutes = [
    {
        path: '/usuarios',
        element: null,
        key: 'USR',
        menu: null,
    },
    {
        path: '/usuarios/crear',
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        path: '/usuarios/roles',
        element: <UnderConstruction />,
        key: 'USR-ROLES',
        permiso: 'seguridad.rol.gestionar',
        menu: {
            label: 'Roles y Permisos',
            module: 'SEG',
            parent: 'SEG',
            order: 3,
        },
    },
];

export default usuariosRoutes;
