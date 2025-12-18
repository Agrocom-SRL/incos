// src/router/modules/reportes.routes.js
import { lazy } from 'react';

const ReportesRendimientoPage = lazy(() => import('@pages/reportes/rendimiento'));
const ReportesAsistenciaPage = lazy(() => import('@pages/reportes/asistencia'));
const ReportesDesercionPage = lazy(() => import('@pages/reportes/desercion'));

// Reportes de Solicitudes
const ReportesSolicitudesGeneralPage = lazy(() => import('@pages/reportes/solicitudes/general'));
const ReportesSolicitudesBecasPage = lazy(() => import('@pages/reportes/solicitudes/becas'));
const ReportesSolicitudesTraspasoPage = lazy(() => import('@pages/reportes/solicitudes/traspaso'));
const ReportesSolicitudesTransferenciaPage = lazy(() => import('@pages/reportes/solicitudes/transferencia'));
const ReportesSolicitudesPasantiaPage = lazy(() => import('@pages/reportes/solicitudes/pasantia'));

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
        path: '/reportes/avance-academico',
        element: <ReportesRendimientoPage />,
        key: 'REP-AVANCE-ACADEMICO',
        menu: {
            label: 'Avance Académico',
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
            label: 'Reporte de Asistencia',
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
            label: 'Reporte de Deserción',
            module: 'REP',
            parent: 'REP',
            order: 3,
        },
    },
    // Submenu: Solicitudes
    {
        path: '/reportes/solicitudes',
        element: null, // No tiene página propia, es solo un grupo
        key: 'REP-SOLICITUDES',
        menu: {
            label: 'Solicitudes',
            module: 'REP',
            parent: 'REP',
            order: 4,
        },
    },
    {
        path: '/reportes/solicitudes/general',
        element: <ReportesSolicitudesGeneralPage />,
        key: 'REP-SOLICITUDES-GENERAL',
        menu: {
            label: 'Reporte General',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 1,
        },
    },
    {
        path: '/reportes/solicitudes/becas',
        element: <ReportesSolicitudesBecasPage />,
        key: 'REP-SOLICITUDES-BECAS',
        menu: {
            label: 'Por Becas',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 2,
        },
    },
    {
        path: '/reportes/solicitudes/traspaso',
        element: <ReportesSolicitudesTraspasoPage />,
        key: 'REP-SOLICITUDES-TRASPASO',
        menu: {
            label: 'Por Traspaso',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 3,
        },
    },
    {
        path: '/reportes/solicitudes/transferencia',
        element: <ReportesSolicitudesTransferenciaPage />,
        key: 'REP-SOLICITUDES-TRANSFERENCIA',
        menu: {
            label: 'Por Transferencia',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 4,
        },
    },
    {
        path: '/reportes/solicitudes/pasantia',
        element: <ReportesSolicitudesPasantiaPage />,
        key: 'REP-SOLICITUDES-PASANTIA',
        menu: {
            label: 'Por Pasantía',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 5,
        },
    },
];

export default reportesRoutes;
