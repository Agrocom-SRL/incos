// src/presentation/modules/auth/routes.jsx
/**
 * Rutas del módulo de Autenticación
 * 
 * Single Responsibility: Define todas las rutas del módulo de autenticación
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI
 */

import { lazy } from 'react';

// Lazy loading de la página de login
const Login = lazy(() => import('./pages/Login'));

export const authRoutes = [
    {
        path: '/login',
        element: <Login />,
        key: 'AUTH-LOGIN',
        menu: null, // No aparece en el menú, es una ruta pública
    },
];

export default authRoutes;
