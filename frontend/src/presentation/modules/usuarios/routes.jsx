// src/presentation/modules/usuarios/routes.jsx
/**
 * Rutas del módulo de Usuarios
 * 
 * Single Responsibility: Define todas las rutas del módulo de usuarios
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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

