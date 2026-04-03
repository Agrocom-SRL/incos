// src/presentation/modules/historial/routes.jsx
/**
 * Rutas del módulo de Historial (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const historialRoutes = [
    {
        path: '/historial',
        element: null,
        key: 'ACA-HIS',
        menu: {
            label: 'Historial',
            module: 'ACA',
            parent: 'ACA',
            order: 5,
        },
    },
    {
        path: '/historial/folio',
        element: <UnderConstruction />,
        key: 'ACA-HIS-FOLIO',
        permiso: 'academico.historial.folio',
        menu: {
            label: 'Folio del Egresado',
            module: 'ACA',
            parent: 'ACA-HIS',
            order: 1,
        },
    },
    {
        path: '/historial/academico',
        element: <UnderConstruction />,
        key: 'ACA-HIS-ACADEMICO',
        permiso: 'academico.historial.academico',
        menu: {
            label: 'Historial Académico',
            module: 'ACA',
            parent: 'ACA-HIS',
            order: 2,
        },
    },
    {
        path: '/historial/validar',
        element: <UnderConstruction />,
        key: 'ACA-HIS-VALIDAR',
        permiso: 'academico.historial.validar',
        menu: null,
        breadcrumbParent: 'ACA-HIS',
    },
];

export default historialRoutes;
