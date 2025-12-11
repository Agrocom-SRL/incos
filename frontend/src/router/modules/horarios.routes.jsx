// src/router/modules/horarios.routes.js
import { lazy } from 'react';

const HorariosTurnosPage = lazy(() => import('@pages/Horarios/Turnos'));
const HorariosAsignarPage = lazy(() => import('@pages/Horarios/Asignar'));
const HorariosGenerarPage = lazy(() => import('@pages/Horarios/Generar'));

export const horariosRoutes = [
    {
        path: '/horarios/turnos',
        element: <HorariosTurnosPage />,
        key: 'HOR-TURNOS',
    },
    {
        path: '/horarios/asignar',
        element: <HorariosAsignarPage />,
        key: 'HOR-ASIGNAR',
    },
    {
        path: '/horarios/generar',
        element: <HorariosGenerarPage />,
        key: 'HOR-GENERAR',
    },
];

export default horariosRoutes;
