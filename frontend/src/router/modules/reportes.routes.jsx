// src/router/modules/reportes.routes.js
import { lazy } from 'react';

const ReportesRendimientoPage = lazy(() => import('@pages/Reportes/Rendimiento'));
const ReportesAsistenciaPage = lazy(() => import('@pages/Reportes/Asistencia'));
const ReportesDesercionPage = lazy(() => import('@pages/Reportes/Desercion'));
const ReportesBecasPage = lazy(() => import('@pages/Reportes/Becas'));
const ReportesFinancieroPage = lazy(() => import('@pages/Reportes/Financiero'));

export const reportesRoutes = [
    // Módulo raíz: Reportes
    {
        path: '/reportes',
        element: null, // No tiene página propia, es solo un grupo
        key: 'REP',
        menu: {
            label: 'Reportes',
            module: 'REP',
            order: 11, // Usado ocasionalmente
        },
    },
    {
        path: '/reportes/rendimiento',
        element: <ReportesRendimientoPage />,
        key: 'REP-RENDIMIENTO',
        menu: {
            label: 'Rendimiento',
            module: 'REP',
            parent: 'REP',
            order: 1,
        },
    },
    {
        path: '/reportes/asistencia',
        element: <ReportesAsistenciaPage />,
        key: 'REP-ASISTENCIA',
        menu: {
            label: 'Asistencia',
            module: 'REP',
            parent: 'REP',
            order: 2,
        },
    },
    {
        path: '/reportes/desercion',
        element: <ReportesDesercionPage />,
        key: 'REP-DESERCION',
        menu: {
            label: 'Deserción',
            module: 'REP',
            parent: 'REP',
            order: 3,
        },
    },
    {
        path: '/reportes/becas',
        element: <ReportesBecasPage />,
        key: 'REP-BECAS',
        menu: {
            label: 'Becas',
            module: 'REP',
            parent: 'REP',
            order: 4,
        },
    },
    {
        path: '/reportes/financiero',
        element: <ReportesFinancieroPage />,
        key: 'REP-FINANCIERO',
        menu: {
            label: 'Financiero',
            module: 'REP',
            parent: 'REP',
            order: 5,
        },
    },
];

export default reportesRoutes;
