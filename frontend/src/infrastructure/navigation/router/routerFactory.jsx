// src/infrastructure/navigation/router/routerFactory.jsx
/**
 * Factory del router (react-router-dom).
 */

import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getAllRoutes } from '@routes';
import { normalizeRoutes } from '@navigation-services/routeNormalizer';
import { filterRoutesWithElements } from '@navigation-services/routeFilter';
import { MainLayout } from '@templates';
import { PublicRoute } from '@navigation-guards';
import { PrivateRoute } from '@/presentation/guards/PrivateRoute.jsx';
import RootAuthOutlet from '@components-router/RootAuthOutlet';
import LoadingFallback from '@components-router/LoadingFallback';

export const createAppRouter = () => {
  const allRoutes = getAllRoutes();
  const routesWithElements = filterRoutesWithElements(allRoutes);
  const normalizedRoutes = normalizeRoutes(routesWithElements);

  const publicRoutes = normalizedRoutes.filter((route) => route.path === 'login');
  const protectedRoutes = normalizedRoutes.filter((route) => route.path !== 'login');

  const loginElement = publicRoutes[0]?.element;

  return createBrowserRouter([
    {
      element: <RootAuthOutlet />,
      children: [
        {
          path: 'login',
          element: (
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>{loginElement}</Suspense>
            </PublicRoute>
          ),
        },
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
                  element: route.element,
                })),
              ],
            },
          ],
        },
      ],
    },
  ]);
};
