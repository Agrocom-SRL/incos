// src/presentation/modules/auth/routes.jsx
/**
 * Rutas del módulo de Autenticación
 */

import { lazy } from 'react';
import {
  AUTH_PUBLIC_PATHS,
  AUTH_LOGIN_PATH,
  AUTH_NOT_FOUND_PUBLIC_PATH,
  AUTH_NOT_FOUND_PANEL_PATH,
} from '@application-auth';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const NotFoundPublicPage = lazy(() => import('./pages/NotFoundPublicPage.jsx'));
const NotFoundAuthenticatedPage = lazy(() => import('./pages/NotFoundAuthenticatedPage.jsx'));

export { AUTH_PUBLIC_PATHS };

export const authRoutes = [
  {
    path: AUTH_LOGIN_PATH,
    element: <LoginPage />,
    key: 'AUTH-LOGIN',
    menu: null,
  },
  {
    path: AUTH_NOT_FOUND_PUBLIC_PATH,
    element: <NotFoundPublicPage />,
    key: 'AUTH-NOT-FOUND-PUBLIC',
    menu: null,
  },
  {
    path: AUTH_NOT_FOUND_PANEL_PATH,
    element: <NotFoundAuthenticatedPage />,
    key: 'AUTH-NOT-FOUND',
    menu: null,
  },
];

export default authRoutes;
