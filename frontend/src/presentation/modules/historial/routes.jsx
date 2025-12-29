// src/presentation/modules/historial/routes.jsx
/**
 * Rutas del módulo de Historial
 * 
 * Single Responsibility: Define todas las rutas del módulo de historial
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const historialRoutes = [
    // Módulo raíz: Historial
    {
        path: '/historial',
        element: null, // No tiene página propia, es solo un grupo
        key: 'HIS',
        menu: {
            label: 'Historial',
            module: 'HIS',
            order: 9, // Usado ocasionalmente
        },
    },
    {
        path: '/historial/folio',
        element: <UnderConstruction />,
        key: 'HIS-FOLIO',
        menu: {
            label: 'Folio del Egresado',
            module: 'HIS',
            parent: 'HIS',
            order: 1, // Folio primero (incluye libros y actas)
        },
    },
    {
        path: '/historial/academico',
        element: <UnderConstruction />,
        key: 'HIS-ACADEMICO',
        menu: {
            label: 'Historial Académico',
            module: 'HIS',
            parent: 'HIS',
            order: 2, // Incluye validación automática y generación
        },
    },
    // Ruta sin menú (validación independiente de historiales existentes)
    {
        path: '/historial/validar',
        element: <UnderConstruction />,
        key: 'HIS-VALIDAR',
        // Sin menu - validación independiente de historiales existentes (opcional)
    },
];

export default historialRoutes;

