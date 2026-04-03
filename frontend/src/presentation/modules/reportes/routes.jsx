// src/presentation/modules/reportes/routes.jsx
/**
 * Rutas del módulo de Reportes (dominio Reportes).
 */

import { UnderConstruction } from '@components/pages';

export const reportesRoutes = [
    {
        path: '/reportes',
        element: null,
        key: 'REP',
        menu: {
            label: 'Informes',
            module: 'REP',
            parent: 'REP-DOM',
            order: 1,
        },
    },
    {
        path: '/reportes/avance-academico',
        element: <UnderConstruction />,
        key: 'REP-AVANCE-ACADEMICO',
        permiso: 'reportes.avance_academico',
        menu: {
            label: 'Avance Académico',
            module: 'REP',
            parent: 'REP',
            order: 1,
        },
    },
    {
        path: '/reportes/asistencia',
        element: <UnderConstruction />,
        key: 'REP-ASISTENCIA',
        permiso: 'reportes.asistencia',
        menu: {
            label: 'Asistencia',
            module: 'REP',
            parent: 'REP',
            order: 2,
        },
    },
    {
        path: '/reportes/desercion',
        element: <UnderConstruction />,
        key: 'REP-DESERCION',
        permiso: 'reportes.desercion',
        menu: {
            label: 'Deserción',
            module: 'REP',
            parent: 'REP',
            order: 3,
        },
    },
    {
        path: '/reportes/solicitudes',
        element: null,
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
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-GENERAL',
        permiso: 'reportes.solicitudes.general',
        menu: {
            label: 'Reporte General',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 1,
        },
    },
    {
        path: '/reportes/solicitudes/becas',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-BECAS',
        permiso: 'reportes.solicitudes.becas',
        menu: {
            label: 'Por Becas',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 2,
        },
    },
    {
        path: '/reportes/solicitudes/traspaso',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-TRASPASO',
        permiso: 'reportes.solicitudes.traspaso',
        menu: {
            label: 'Por Traspaso',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 3,
        },
    },
    {
        path: '/reportes/solicitudes/pasantia',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-PASANTIA',
        permiso: 'reportes.solicitudes.pasantia',
        menu: {
            label: 'Por Pasantía',
            module: 'REP',
            parent: 'REP-SOLICITUDES',
            order: 5,
        },
    },
];

export default reportesRoutes;
