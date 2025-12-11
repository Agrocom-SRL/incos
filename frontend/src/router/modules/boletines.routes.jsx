// src/router/modules/boletines.routes.js
import { lazy } from 'react';

const BoletinesGenerarPage = lazy(() => import('@pages/Boletines/Generar'));
const BoletinesPublicarPage = lazy(() => import('@pages/Boletines/Publicar'));

export const boletinesRoutes = [
    {
        path: '/boletines/generar',
        element: <BoletinesGenerarPage />,
        key: 'BOL-GENERAR',
    },
    {
        path: '/boletines/publicar',
        element: <BoletinesPublicarPage />,
        key: 'BOL-PUBLICAR',
    },
];

export default boletinesRoutes;
