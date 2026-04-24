// src/presentation/modules/auth/routes.jsx
/**
 * Rutas del módulo de Autenticación
 */

import { lazy } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));

export const authRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    key: 'AUTH-LOGIN',
    menu: null,
  },
];

export default authRoutes;
