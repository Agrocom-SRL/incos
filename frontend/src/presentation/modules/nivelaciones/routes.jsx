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
        accion: 'LISTAR',
        menu: {
            label: 'Listar Nivelaciones',
            module: 'ACA',
            parent: 'ACA-NIV',
            order: 1,
            labelByRole: { ESTUDIANTE: 'Mi nivelación' },
        },
    },
    {
        path: '/nivelaciones/inscribir',
        element: <UnderConstruction />,
        key: 'ACA-NIV-INSCRIBIR',
        permiso: 'academico.nivelacion.inscribir',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'ACA-NIV',
    },
    {
        path: '/nivelaciones/aprobar',
        element: <UnderConstruction />,
        key: 'ACA-NIV-APROBAR',
        permiso: 'academico.nivelacion.aprobar',
        accion: 'APROBAR',
        menu: null,
        breadcrumbParent: 'ACA-NIV',
    },
];

export default nivelacionesRoutes;
