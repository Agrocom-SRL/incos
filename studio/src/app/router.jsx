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

      // Principal
      { path: 'dashboard', element: <PlaceholderPage /> },

      // Matrícula
      { path: 'enrollments/new-student', element: <PlaceholderPage /> },
      { path: 'enrollments/admission', element: <PlaceholderPage /> },
      { path: 'enrollments', element: <EnrollmentsListPage /> },
      { path: 'enrollments/contributions', element: <PlaceholderPage /> },
      { path: 'enrollments/scholarships', element: <PlaceholderPage /> },
      { path: 'enrollments/internships', element: <PlaceholderPage /> },

      // Académico
      { path: 'academic/attendance', element: <PlaceholderPage /> },
      { path: 'academic/grades', element: <PlaceholderPage /> },
      { path: 'academic/leveling', element: <PlaceholderPage /> },
      { path: 'academic/transfers', element: <PlaceholderPage /> },
      { path: 'academic/transitability', element: <PlaceholderPage /> },
      { path: 'academic/history', element: <PlaceholderPage /> },
      { path: 'academic/progress', element: <PlaceholderPage /> },

      // Docentes
      { path: 'teachers', element: <PlaceholderPage /> },
      { path: 'teachers/leaves', element: <PlaceholderPage /> },
      { path: 'teachers/supervision', element: <PlaceholderPage /> },
      { path: 'teachers/internships', element: <PlaceholderPage /> },

      // Institucional
      { path: 'institutional/current-term', element: <PlaceholderPage /> },
      { path: 'institutional/offer', element: <PlaceholderPage /> },
      { path: 'institutional/schedules', element: <PlaceholderPage /> },
      { path: 'institutional/past-terms', element: <PlaceholderPage /> },

      // Finanzas
      { path: 'finance/payments', element: <PlaceholderPage /> },
      { path: 'finance/additional', element: <PlaceholderPage /> },
      { path: 'finance/reports', element: <PlaceholderPage /> },
      { path: 'finance/settings', element: <PlaceholderPage /> },

      // Reportes
      { path: 'reports/progress', element: <PlaceholderPage /> },
      { path: 'reports/attendance', element: <PlaceholderPage /> },
      { path: 'reports/dropout', element: <PlaceholderPage /> },
      { path: 'reports/requests', element: <PlaceholderPage /> },

      // Configuración
      { path: 'settings/academic', element: <PlaceholderPage /> },
      { path: 'settings/documentation', element: <PlaceholderPage /> },
      { path: 'settings/complementary', element: <PlaceholderPage /> },
      { path: 'settings/companies', element: <PlaceholderPage /> },
      { path: 'settings/activity-history', element: <PlaceholderPage /> },

      // Seguridad
      { path: 'security/users', element: <PlaceholderPage /> },
      { path: 'security/roles', element: <PlaceholderPage /> },

      // Mi perfil
      { path: 'profile', element: <PlaceholderPage /> },

      { path: '*', element: <PlaceholderPage /> },
    ],
  },
]);

export default router;
