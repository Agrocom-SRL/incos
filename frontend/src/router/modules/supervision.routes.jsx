// src/router/modules/supervision.routes.js
import { lazy } from 'react';

const SupervisionProgramarPage = lazy(() => import('@pages/Supervision/Programar'));
const SupervisionFichaCrearPage = lazy(() => import('@pages/Supervision/Ficha/Crear'));
const SupervisionFichaEditarPage = lazy(() => import('@pages/Supervision/Ficha/Editar'));
const SupervisionFichaVerPage = lazy(() => import('@pages/Supervision/Ficha/Ver'));
const SupervisionReportePage = lazy(() => import('@pages/Supervision/Reporte'));

export const supervisionRoutes = [
    {
        path: '/supervision/programar',
        element: <SupervisionProgramarPage />,
        key: 'SUP-PROGRAMAR',
    },
    {
        path: '/supervision/ficha/crear',
        element: <SupervisionFichaCrearPage />,
        key: 'SUP-FICHA-CREAR',
    },
    {
        path: '/supervision/ficha/editar',
        element: <SupervisionFichaEditarPage />,
        key: 'SUP-FICHA-EDITAR',
    },
    {
        path: '/supervision/ficha/ver',
        element: <SupervisionFichaVerPage />,
        key: 'SUP-FICHA-VER',
    },
    {
        path: '/supervision/reporte',
        element: <SupervisionReportePage />,
        key: 'SUP-REPORTE',
    },
];

export default supervisionRoutes;
