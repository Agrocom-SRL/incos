// src/router/modules/nivelaciones.routes.js
import { lazy } from 'react';

const NivelacionesListPage = lazy(() => import('@pages/Nivelaciones/List'));
const NivelacionesInscribirPage = lazy(() => import('@pages/Nivelaciones/Inscribir'));
const NivelacionesAprobarPage = lazy(() => import('@pages/Nivelaciones/Aprobar'));

export const nivelacionesRoutes = [
    {
        path: '/nivelaciones/listar',
        element: <NivelacionesListPage />,
        key: 'NIV-LIST',
    },
    {
        path: '/nivelaciones/inscribir',
        element: <NivelacionesInscribirPage />,
        key: 'NIV-INSCRIBIR',
    },
    {
        path: '/nivelaciones/aprobar',
        element: <NivelacionesAprobarPage />,
        key: 'NIV-APROBAR',
    },
];

export default nivelacionesRoutes;
