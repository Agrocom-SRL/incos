// src/router/modules/nivelaciones.routes.js
import { lazy } from 'react';

const NivelacionesListPage = lazy(() => import('@pages/nivelaciones/list'));
const NivelacionesInscribirPage = lazy(() => import('@pages/nivelaciones/inscribir'));
const NivelacionesAprobarPage = lazy(() => import('@pages/nivelaciones/aprobar'));

export const nivelacionesRoutes = [
    // Módulo raíz: Nivelaciones
    {
        path: '/nivelaciones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'NIV',
        menu: {
            label: 'Nivelaciones',
            module: 'NIV',
            order: 5, // Usado regularmente
        },
    },
    {
        path: '/nivelaciones/listar',
        element: <NivelacionesListPage />,
        key: 'NIV-LIST',
        menu: {
            label: 'Listar Nivelaciones',
            module: 'NIV',
            parent: 'NIV',
            order: 1,
        },
    },
    {
        path: '/nivelaciones/inscribir',
        element: <NivelacionesInscribirPage />,
        key: 'NIV-INSCRIBIR',
        menu: {
            label: 'Inscribir Nivelación',
            module: 'NIV',
            parent: 'NIV',
            order: 2,
        },
    },
    {
        path: '/nivelaciones/aprobar',
        element: <NivelacionesAprobarPage />,
        key: 'NIV-APROBAR',
        menu: {
            label: 'Aprobar Nivelación',
            module: 'NIV',
            parent: 'NIV',
            order: 3,
        },
    },
];

export default nivelacionesRoutes;
