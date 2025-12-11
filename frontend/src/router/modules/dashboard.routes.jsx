// src/router/modules/dashboard.routes.js
import { lazy } from 'react';

// Lazy loading de componentes
const DashboardPage = lazy(() => import('@pages/Dashboard'));

export const dashboardRoutes = [
    {
        path: '/',
        element: <DashboardPage />,
        key: 'DASH',
    },
    {
        path: '/dashboard',
        element: <DashboardPage />,
        key: 'DASH',
    },
];

export default dashboardRoutes;
