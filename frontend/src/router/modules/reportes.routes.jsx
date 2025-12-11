// src/router/modules/reportes.routes.js
import { lazy } from 'react';

const ReportesRendimientoPage = lazy(() => import('@pages/Reportes/Rendimiento'));
const ReportesAsistenciaPage = lazy(() => import('@pages/Reportes/Asistencia'));
const ReportesDesercionPage = lazy(() => import('@pages/Reportes/Desercion'));
const ReportesBecasPage = lazy(() => import('@pages/Reportes/Becas'));
const ReportesFinancieroPage = lazy(() => import('@pages/Reportes/Financiero'));

export const reportesRoutes = [
    {
        path: '/reportes/rendimiento',
        element: <ReportesRendimientoPage />,
        key: 'REP-RENDIMIENTO',
    },
    {
        path: '/reportes/asistencia',
        element: <ReportesAsistenciaPage />,
        key: 'REP-ASISTENCIA',
    },
    {
        path: '/reportes/desercion',
        element: <ReportesDesercionPage />,
        key: 'REP-DESERCION',
    },
    {
        path: '/reportes/becas',
        element: <ReportesBecasPage />,
        key: 'REP-BECAS',
    },
    {
        path: '/reportes/financiero',
        element: <ReportesFinancieroPage />,
        key: 'REP-FINANCIERO',
    },
];

export default reportesRoutes;
