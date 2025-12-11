// src/router/modules/pasantias.routes.js
import { lazy } from 'react';

const PasantiasAsignarPage = lazy(() => import('@pages/Pasantias/Asignar'));
const PasantiasEvaluarPage = lazy(() => import('@pages/Pasantias/Evaluar'));
const PasantiasSeguimientoPage = lazy(() => import('@pages/Pasantias/Seguimiento'));

export const pasantiasRoutes = [
    {
        path: '/pasantias/asignar',
        element: <PasantiasAsignarPage />,
        key: 'PAS-ASIGNAR',
    },
    {
        path: '/pasantias/evaluar',
        element: <PasantiasEvaluarPage />,
        key: 'PAS-EVALUAR',
    },
    {
        path: '/pasantias/seguimiento',
        element: <PasantiasSeguimientoPage />,
        key: 'PAS-SEGUIMIENTO',
    },
];

export default pasantiasRoutes;
