// src/presentation/modules/dashboard/routes.jsx
/**
 * Rutas del módulo de Dashboard
 * 
 * Single Responsibility: Define todas las rutas del módulo de dashboard
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 * - Depende de: pages (dentro del mismo módulo), connectors
 */

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

