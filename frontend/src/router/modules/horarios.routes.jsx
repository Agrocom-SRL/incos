// src/router/modules/horarios.routes.js
import { lazy } from 'react';

const HorariosTurnosPage = lazy(() => import('@pages/Horarios/Turnos'));
const HorariosAsignarPage = lazy(() => import('@pages/Horarios/Asignar'));
const HorariosGenerarPage = lazy(() => import('@pages/Horarios/Generar'));

export const horariosRoutes = [
    // Módulo raíz: Horarios
    {
        path: '/horarios',
        element: null, // No tiene página propia, es solo un grupo
        key: 'HOR',
        menu: {
            label: 'Horarios',
            module: 'HOR',
            order: 9,
        },
    },
    {
        path: '/horarios/turnos',
        element: <HorariosTurnosPage />,
        key: 'HOR-TURNOS',
        menu: {
            label: 'Turnos',
            module: 'HOR',
            parent: 'HOR',
            order: 1, // Configuración primero
        },
    },
    {
        path: '/horarios/asignar',
        element: <HorariosAsignarPage />,
        key: 'HOR-ASIGNAR',
        menu: {
            label: 'Asignar',
            module: 'HOR',
            parent: 'HOR',
            order: 2, // Asignar segundo
        },
    },
    {
        path: '/horarios/generar',
        element: <HorariosGenerarPage />,
        key: 'HOR-GENERAR',
        menu: {
            label: 'Generar',
            module: 'HOR',
            parent: 'HOR',
            order: 3, // Generar último
        },
    },
];

export default horariosRoutes;
