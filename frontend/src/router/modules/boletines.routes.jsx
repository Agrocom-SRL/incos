// src/router/modules/boletines.routes.js
import { lazy } from 'react';

const BoletinesGenerarPage = lazy(() => import('@pages/Boletines/Generar'));
const BoletinesPublicarPage = lazy(() => import('@pages/Boletines/Publicar'));

export const boletinesRoutes = [
    // Módulo raíz: Boletines
    {
        path: '/boletines',
        element: null, // No tiene página propia, es solo un grupo
        key: 'BOL',
        menu: {
            label: 'Boletines',
            module: 'BOL',
            order: 10, // Usado periódicamente
        },
    },
    {
        path: '/boletines/generar',
        element: <BoletinesGenerarPage />,
        key: 'BOL-GENERAR',
        menu: {
            label: 'Generar Boletín',
            module: 'BOL',
            parent: 'BOL',
            order: 1, // Generar primero
        },
    },
    {
        path: '/boletines/publicar',
        element: <BoletinesPublicarPage />,
        key: 'BOL-PUBLICAR',
        menu: {
            label: 'Publicar',
            module: 'BOL',
            parent: 'BOL',
            order: 2, // Publicar segundo (estado)
        },
    },
];

export default boletinesRoutes;
