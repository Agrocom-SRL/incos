// src/presentation/modules/gestiones/routes.jsx
/**
 * Rutas del módulo de Gestiones
 * 
 * Single Responsibility: Define todas las rutas del módulo de gestiones
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const gestionesRoutes = [
    // Módulo raíz: Gestiones
    {
        path: '/gestiones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'GES',
        menu: {
            label: 'Gestiones',
            module: 'GES',
            order: 6, // Configuración de gestión específica, después de Docentes
        },
    },
    {
        path: '/gestiones/actual',
        element: <UnderConstruction />,
        key: 'GES-ACTUAL',
        menu: {
            label: 'Gestión Actual',
            module: 'GES',
            parent: 'GES',
            order: 1,
        },
    },
    {
        path: '/gestiones/cronograma',
        element: <UnderConstruction />,
        key: 'GES-ETAPAS',
        menu: {
            label: 'Cronogramas',
            module: 'GES',
            parent: 'GES',
            order: 2,
        },
    },
    {
        path: '/gestiones/oferta',
        element: <UnderConstruction />,
        key: 'GES-OFERTA',
        menu: {
            label: 'Oferta Académica',
            module: 'GES',
            parent: 'GES',
            order: 3,
        },
    },
    {
        path: '/gestiones/horarios/asignar',
        element: <UnderConstruction />,
        key: 'GES-HORARIOS-ASIGNAR',
        menu: {
            label: 'Asignar Horarios',
            module: 'GES',
            parent: 'GES',
            order: 4,
        },
    },
    {
        path: '/gestiones/pasadas',
        element: <UnderConstruction />,
        key: 'GES-LIST',
        menu: {
            label: 'Gestiones Pasadas',
            module: 'GES',
            parent: 'GES',
            order: 6,
        },
    },
];

export default gestionesRoutes;

