// src/router/modules/supervision.routes.js
import { lazy } from 'react';

const SupervisionProgramarPage = lazy(() => import('@pages/Supervision/Programar'));
const SupervisionFichaCrearPage = lazy(() => import('@pages/Supervision/Ficha/Crear'));
const SupervisionFichaEditarPage = lazy(() => import('@pages/Supervision/Ficha/Editar'));
const SupervisionFichaVerPage = lazy(() => import('@pages/Supervision/Ficha/Ver'));
const SupervisionReportePage = lazy(() => import('@pages/Supervision/Reporte'));

export const supervisionRoutes = [
    // Módulo raíz: Supervisión
    {
        path: '/supervision',
        element: null, // No tiene página propia, es solo un grupo
        key: 'SUP',
        menu: {
            label: 'Supervisión',
            module: 'SUP',
            order: 8,
        },
    },
    {
        path: '/supervision/programar',
        element: <SupervisionProgramarPage />,
        key: 'SUP-PROGRAMAR',
        menu: {
            label: 'Programar',
            module: 'SUP',
            parent: 'SUP',
            order: 1, // Crear/Programar primero
        },
    },
    // Ficha - Grupo padre
    {
        path: '/supervision/ficha',
        element: null, // No tiene página propia, es solo un grupo
        key: 'SUP-FICHA',
        menu: {
            label: 'Evaluación Docente',
            module: 'SUP',
            parent: 'SUP',
            order: 2,
        },
    },
    {
        path: '/supervision/ficha/ver',
        element: <SupervisionFichaVerPage />,
        key: 'SUP-FICHA-VER',
        menu: {
            label: 'Ver',
            module: 'SUP',
            parent: 'SUP-FICHA',
            order: 1, // Ver/Listar primero
        },
    },
    {
        path: '/supervision/ficha/crear',
        element: <SupervisionFichaCrearPage />,
        key: 'SUP-FICHA-CREAR',
        menu: {
            label: 'Crear',
            module: 'SUP',
            parent: 'SUP-FICHA',
            order: 2, // Crear segundo
        },
    },
    {
        path: '/supervision/ficha/editar',
        element: <SupervisionFichaEditarPage />,
        key: 'SUP-FICHA-EDITAR',
        menu: {
            label: 'Editar',
            module: 'SUP',
            parent: 'SUP-FICHA',
            order: 3, // Editar tercero
        },
    },
    {
        path: '/supervision/reporte',
        element: <SupervisionReportePage />,
        key: 'SUP-REPORTE',
        menu: {
            label: 'Reporte',
            module: 'SUP',
            parent: 'SUP',
            order: 3, // Reporte último
        },
    },
];

export default supervisionRoutes;
