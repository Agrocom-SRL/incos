// src/infrastructure/navigation/router/routerFactory.jsx
/**
 * Factory del router (react-router-dom).
 */

import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getAllRoutes } from '@routes';
import { normalizeRoutes } from '@navigation-services/routeNormalizer';
import { filterRoutesWithElements } from '@navigation-services/routeFilter';
import { MainLayout } from '@templates';
import { PublicRoute } from '@navigation-guards';
import { PrivateRoute } from '@/presentation/guards/PrivateRoute.jsx';
import RootAuthOutlet from '@components-router/RootAuthOutlet';
import LoadingFallback from '@components-router/LoadingFallback';
import NotFoundRouteError from '@modules/auth/pages/NotFoundRouteError.jsx';
import { AUTH_PUBLIC_PATHS, AuthProvider } from '@application-auth';

const NotFoundAuthenticatedPage = lazy(
  () => import('@modules/auth/pages/NotFoundAuthenticatedPage.jsx'),
);

export const createAppRouter = () => {
  const allRoutes = getAllRoutes();
  const routesWithElements = filterRoutesWithElements(allRoutes);
  const normalizedRoutes = normalizeRoutes(routesWithElements);

  const publicRoutes = normalizedRoutes.filter((route) => AUTH_PUBLIC_PATHS.has(route.path));
  const protectedRoutes = normalizedRoutes.filter((route) => !AUTH_PUBLIC_PATHS.has(route.path));

  return createBrowserRouter([
    {
      element: <RootAuthOutlet />,
      errorElement: (
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundRouteError />
          </Suspense>
        </AuthProvider>
      ),
      children: [
        ...publicRoutes.map((route) => ({
          path: route.path,
          element: (
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>
            </PublicRoute>
          ),
        })),
        {
          path: '/',
          element: <PrivateRoute />,
          children: [
            {
              element: <MainLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to="/dashboard" replace />,
                },
                ...protectedRoutes.map((route) => ({
                  path: route.path,
                  element: (
                    <PrivateRoute
                      permiso={route.permiso}
                      permisoAny={route.permisoAny}
                      accion={route.accion}
                    >
                      {route.element}
                    </PrivateRoute>
                  ),
                })),
                {
                  path: '*',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NotFoundAuthenticatedPage />
                    </Suspense>
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
};
