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
import MatriculaV2Layout from '@/presentation/modules/matricula-v2/layout/MatriculaV2Layout.jsx';
import { PublicRoute } from '@navigation-guards';
import { PrivateRoute } from '@/presentation/guards/PrivateRoute.jsx';
import RootAuthOutlet from '@components-router/RootAuthOutlet';
import LoadingFallback from '@components-router/LoadingFallback';
import NotFoundRouteError from '@modules/auth/pages/NotFoundRouteError.jsx';
import { AUTH_PUBLIC_PATHS } from '@application-auth';

const NotFoundAuthenticatedPage = lazy(
  () => import('@modules/auth/pages/NotFoundAuthenticatedPage.jsx'),
);

export const createAppRouter = () => {
  const allRoutes = getAllRoutes();
  const routesWithElements = filterRoutesWithElements(allRoutes);
  const normalizedRoutes = normalizeRoutes(routesWithElements);

  const publicRoutes = normalizedRoutes.filter((route) => AUTH_PUBLIC_PATHS.has(route.path));
  const protectedRoutes = normalizedRoutes.filter((route) => !AUTH_PUBLIC_PATHS.has(route.path));
  const matriculaV2Routes = protectedRoutes.filter((route) => route.layout === 'matricula-v2');
  const mainLayoutRoutes = protectedRoutes.filter((route) => route.layout !== 'matricula-v2');

  return createBrowserRouter([
    {
      element: <RootAuthOutlet />,
      errorElement: (
        <Suspense fallback={<LoadingFallback />}>
          <NotFoundRouteError />
        </Suspense>
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
                ...mainLayoutRoutes.map((route) => ({
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
            ...matriculaV2Routes.map((route) => ({
              path: route.path,
              element: (
                <PrivateRoute permiso={route.permiso} accion={route.accion}>
                  <MatriculaV2Layout />
                </PrivateRoute>
              ),
              children: [
                {
                  index: true,
                  element: route.element,
                },
              ],
            })),
          ],
        },
      ],
    },
  ]);
};
