// src/presentation/modules/reportes/routes.jsx
/**
 * Rutas del módulo de Reportes
 * 
 * Single Responsibility: Define todas las rutas del módulo de reportes
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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

