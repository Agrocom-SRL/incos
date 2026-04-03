// src/presentation/modules/nivelaciones/routes.jsx
/**
 * Rutas del módulo de Nivelaciones (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const nivelacionesRoutes = [
    {
        path: '/nivelaciones',
        element: null,
        key: 'ACA-NIV',
        menu: {
            label: 'Nivelaciones',
            module: 'ACA',
            parent: 'ACA',
            order: 2,
        },
    },
    {
        path: '/nivelaciones/listar',
        element: <UnderConstruction />,
        key: 'ACA-NIV-LIST',
        permiso: 'academico.nivelacion.ver',
        menu: {
            label: 'Listar Nivelaciones',
            module: 'ACA',
            parent: 'ACA-NIV',
            order: 1,
        },
    },
    {
        path: '/nivelaciones/inscribir',
        element: <UnderConstruction />,
        key: 'ACA-NIV-INSCRIBIR',
        permiso: 'academico.nivelacion.inscribir',
        menu: {
            label: 'Inscribir Nivelación',
            module: 'ACA',
            parent: 'ACA-NIV',
            order: 2,
        },
    },
    {
        path: '/nivelaciones/aprobar',
        element: <UnderConstruction />,
        key: 'ACA-NIV-APROBAR',
        permiso: 'academico.nivelacion.aprobar',
        menu: {
            label: 'Aprobar Nivelación',
            module: 'ACA',
            parent: 'ACA-NIV',
            order: 3,
        },
    },
];

export default nivelacionesRoutes;
