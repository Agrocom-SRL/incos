// src/router/modules/pasantias.routes.js
import { lazy } from 'react';

const PasantiasAsignarPage = lazy(() => import('@pages/Pasantias/Asignar'));
const PasantiasEvaluarPage = lazy(() => import('@pages/Pasantias/Evaluar'));
const PasantiasSeguimientoPage = lazy(() => import('@pages/Pasantias/Seguimiento'));

export const pasantiasRoutes = [
    // Módulo raíz: Pasantías
    {
        path: '/pasantias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'PAS',
        menu: {
            label: 'Pasantías',
            module: 'PAS',
            order: 7,
        },
    },
    {
        path: '/pasantias/asignar',
        element: <PasantiasAsignarPage />,
        key: 'PAS-ASIGNAR',
        menu: {
            label: 'Asignar',
            module: 'PAS',
            parent: 'PAS',
            order: 1,
        },
    },
    {
        path: '/pasantias/evaluar',
        element: <PasantiasEvaluarPage />,
        key: 'PAS-EVALUAR',
        menu: {
            label: 'Evaluar',
            module: 'PAS',
            parent: 'PAS',
            order: 2,
        },
    },
    {
        path: '/pasantias/seguimiento',
        element: <PasantiasSeguimientoPage />,
        key: 'PAS-SEGUIMIENTO',
        menu: {
            label: 'Seguimiento',
            module: 'PAS',
            parent: 'PAS',
            order: 3,
        },
    },
];

export default pasantiasRoutes;
