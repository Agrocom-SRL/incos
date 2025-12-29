// src/presentation/modules/inscripciones/routes.jsx
/**
 * Rutas del módulo de Inscripciones
 * 
 * Single Responsibility: Define todas las rutas del módulo de inscripciones
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const inscripcionesRoutes = [
    // Módulo raíz: Inscripciones
    {
        path: '/inscripciones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'INS',
        menu: {
            label: 'Inscripciones',
            module: 'INS',
            order: 3, // Muy usado, después de Estudiantes
        },
    },
    {
        path: '/inscripciones/nueva',
        element: <UnderConstruction />,
        key: 'INS-CREATE',
        menu: {
            label: 'Estudiante Nuevo',
            module: 'INS',
            parent: 'INS',
            order: 1,
        },
    },
    {
        path: '/inscripciones/horario',
        element: <UnderConstruction />,
        key: 'INS-HORARIO',
        menu: {
            label: 'Generar Horarios',
            module: 'INS',
            parent: 'INS',
            order: 2,
        },
    },
    {
        path: '/inscripciones/materias/inscribir',
        element: <UnderConstruction />,
        key: 'INS-MATERIAS-INSCRIBIR',
        menu: {
            label: 'Inscribir por Materia',
            module: 'INS',
            parent: 'INS',
            order: 3,
        },
    },
    {
        path: '/inscripciones/materias/curso',
        element: <UnderConstruction />,
        key: 'INS-MATERIAS-CURSO',
        menu: {
            label: 'Inscribir por Curso',
            module: 'INS',
            parent: 'INS',
            order: 4,
        },
    },
    {
        path: '/inscripciones/anular',
        element: <UnderConstruction />,
        key: 'INS-ANULAR',
        menu: {
            label: 'Anular Inscripcion',
            module: 'INS',
            parent: 'INS',
            order: 5,
        },
    },
    // Ruta sin menú (se accede desde las páginas de inscripción)
    {
        path: '/inscripciones/materias/validar',
        element: <UnderConstruction />,
        key: 'INS-MATERIAS-VALIDAR',
        // Sin menu - se accede desde las páginas de inscripción
    },
];

export default inscripcionesRoutes;

