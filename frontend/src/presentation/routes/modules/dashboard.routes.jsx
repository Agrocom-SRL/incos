// src/presentation/routes/modules/dashboard.routes.jsx
import { lazy } from 'react';

// Lazy loading del connector (que incluye el Provider)
const DashboardConnector = lazy(() => import('@dashboard/connectors'));

export const dashboardRoutes = [
    {
        path: '/dashboard',
        element: <DashboardConnector />,
        key: 'DASH',
        menu: {
            label: 'Dashboard',
            module: 'DASH',
            order: 1,
        },
    },
];

export default dashboardRoutes;
