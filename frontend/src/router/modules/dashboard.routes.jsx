// src/router/modules/dashboard.routes.js
import { lazy } from 'react';

// Lazy loading de componentes
const DashboardPage = lazy(() => import('@pages/Dashboard'));

export const dashboardRoutes = [
    {
        path: '/dashboard',
        element: <DashboardPage />,
        key: 'DASH',
        menu: {
            label: 'Dashboard',
            module: 'DASH',
            order: 1,
        },
    },
];

export default dashboardRoutes;
