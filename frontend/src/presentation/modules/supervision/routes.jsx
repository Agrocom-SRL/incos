// src/presentation/modules/supervision/routes.jsx
/**
 * Rutas del módulo de Supervisión
 * 
 * Single Responsibility: Define todas las rutas del módulo de supervisión
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const supervisionRoutes = [
    // Módulo raíz: Supervisión
    {
        path: '/supervision',
        element: null, // No tiene página propia, es solo un grupo
        key: 'SUP',
        menu: {
            label: 'Supervisión',
            module: 'SUP',
            order: 7, // Usado periódicamente
        },
    },
    {
        path: '/supervision/ficha/ver',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-VER',
        menu: {
            label: 'Evaluar Docente',
            module: 'SUP',
            parent: 'SUP',
            order: 1,
        },
    },
    // Pasantías - Grupo padre (supervisión de estudiantes en pasantías)
    {
        path: '/supervision/pasantias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'SUP-PASANTIAS',
        menu: {
            label: 'Pasantías',
            module: 'SUP',
            parent: 'SUP',
            order: 2,
        },
    },
    {
        path: '/supervision/reporte',
        element: <UnderConstruction />,
        key: 'SUP-REPORTE',
        menu: {
            label: 'Reporte',
            module: 'SUP',
            parent: 'SUP',
            order: 3,
        },
    },
    {
        path: '/supervision/pasantias/solicitar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SOLICITAR',
        menu: {
            label: 'Solicitar Pasantía',
            module: 'SUP',
            parent: 'SUP-PASANTIAS',
            order: 1,
        },
    },
    {
        path: '/supervision/pasantias/seguimiento',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SEGUIMIENTO',
        menu: {
            label: 'Seguimiento',
            module: 'SUP',
            parent: 'SUP-PASANTIAS',
            order: 2,
        },
    },
    {
        path: '/supervision/pasantias/evaluar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-EVALUAR',
        menu: {
            label: 'Evaluación Final',
            module: 'SUP',
            parent: 'SUP-PASANTIAS',
            order: 3,
        },
    },
    // Rutas sin menú (se acceden desde las páginas de supervisión)
    {
        path: '/supervision/programar',
        element: <UnderConstruction />,
        key: 'SUP-PROGRAMAR',
        // Sin menu - se accede desde la página de evaluación docente (programar supervisión)
    },
    {
        path: '/supervision/ficha/crear',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-CREAR',
        // Sin menu - se accede desde la página de evaluación docente (crear ficha después de supervisar)
    },
    {
        path: '/supervision/ficha/editar',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-EDITAR',
        // Sin menu - se accede desde la página de evaluación docente (editar ficha existente)
    },
];

export default supervisionRoutes;

