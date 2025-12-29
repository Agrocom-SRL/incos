// src/presentation/modules/calificaciones/routes.jsx
/**
 * Rutas del módulo de Calificaciones
 * 
 * Single Responsibility: Define todas las rutas del módulo de calificaciones
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const calificacionesRoutes = [
    // Módulo raíz: Calificaciones
    {
        path: '/calificaciones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CAL',
        menu: {
            label: 'Calificaciones',
            module: 'CAL',
            order: 4, // Muy usado, después de Inscripciones
        },
    },
    // Registrar - Grupo padre
    {
        path: '/calificaciones/registrar',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CAL-REGISTRAR',
        menu: {
            label: 'Registrar',
            module: 'CAL',
            parent: 'CAL',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar/parcial',
        element: <UnderConstruction />,
        key: 'CAL-REGISTRAR-PARCIAL',
        menu: {
            label: 'Nota de Parciales',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar/practico',
        element: <UnderConstruction />,
        key: 'CAL-REGISTRAR-PRACTICO',
        menu: {
            label: 'Notas de Prácticos',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 2,
        },
    },
    {
        path: '/calificaciones/registrar/recuperatorio',
        element: <UnderConstruction />,
        key: 'CAL-REGISTRAR-RECUPERATORIO',
        menu: {
            label: 'Recuperatorio',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 3,
        },
    },
    {
        path: '/calificaciones/curso',
        element: <UnderConstruction />,
        key: 'CAL-CURSO',
        menu: {
            label: 'Notas Por Curso',
            module: 'CAL',
            parent: 'CAL',
            order: 2,
        },
    },
    {
        path: '/calificaciones/periodo',
        element: <UnderConstruction />,
        key: 'CAL-PERIODO',
        menu: {
            label: 'Entregar Notas',
            module: 'CAL',
            parent: 'CAL',
            order: 3, // Incluye cierre de periodo y generación de boletín
        },
    },
    // Ruta sin menú (se accede desde la página de calificaciones)
    {
        path: '/calificaciones/modificar',
        element: <UnderConstruction />,
        key: 'CAL-MODIFICAR',
        // Sin menu - se accede desde la página de calificaciones
    },
];

export default calificacionesRoutes;

