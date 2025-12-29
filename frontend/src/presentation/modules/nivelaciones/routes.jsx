// src/presentation/modules/nivelaciones/routes.jsx
/**
 * Rutas del módulo de Nivelaciones
 * 
 * Single Responsibility: Define todas las rutas del módulo de nivelaciones
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const nivelacionesRoutes = [
    // Módulo raíz: Nivelaciones
    {
        path: '/nivelaciones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'NIV',
        menu: {
            label: 'Nivelaciones',
            module: 'NIV',
            order: 5, // Usado regularmente
        },
    },
    {
        path: '/nivelaciones/listar',
        element: <UnderConstruction />,
        key: 'NIV-LIST',
        menu: {
            label: 'Listar Nivelaciones',
            module: 'NIV',
            parent: 'NIV',
            order: 1,
        },
    },
    {
        path: '/nivelaciones/inscribir',
        element: <UnderConstruction />,
        key: 'NIV-INSCRIBIR',
        menu: {
            label: 'Inscribir Nivelación',
            module: 'NIV',
            parent: 'NIV',
            order: 2,
        },
    },
    {
        path: '/nivelaciones/aprobar',
        element: <UnderConstruction />,
        key: 'NIV-APROBAR',
        menu: {
            label: 'Aprobar Nivelación',
            module: 'NIV',
            parent: 'NIV',
            order: 3,
        },
    },
];

export default nivelacionesRoutes;

