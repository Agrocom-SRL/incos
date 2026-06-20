/**
 * Router de la app — el shell envuelve todas las rutas; cada feature aporta su page.
 * Las rutas sin contenido caen en PlaceholderPage (shell navegable durante la migración).
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@ui/templates/AppShell/AppShell';
import { EnrollmentsListPage } from '@features/matriculas/lista/EnrollmentsListPage';
import { PlaceholderPage } from '@features/_shared/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/enrollments" replace /> },
      { path: 'enrollments', element: <EnrollmentsListPage /> },
      { path: '*', element: <PlaceholderPage /> },
    ],
  },
]);

export default router;
