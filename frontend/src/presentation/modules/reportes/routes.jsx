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
        accion: 'LISTAR',
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
        accion: 'LISTAR',
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
        accion: 'LISTAR',
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
        permiso: 'reportes.solicitudes.general',
        accion: 'LISTAR',
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
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'REP-SOLICITUDES',
    },
    {
        path: '/reportes/solicitudes/becas',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-BECAS',
        permiso: 'reportes.solicitudes.becas',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'REP-SOLICITUDES',
    },
    {
        path: '/reportes/solicitudes/traspaso',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-TRASPASO',
        permiso: 'reportes.solicitudes.traspaso',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'REP-SOLICITUDES',
    },
    {
        path: '/reportes/solicitudes/pasantia',
        element: <UnderConstruction />,
        key: 'REP-SOLICITUDES-PASANTIA',
        permiso: 'reportes.solicitudes.pasantia',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'REP-SOLICITUDES',
    },
];

export default reportesRoutes;
