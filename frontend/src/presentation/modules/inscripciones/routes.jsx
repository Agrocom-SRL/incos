// src/presentation/modules/inscripciones/routes.jsx
/**
 * Rutas del módulo de Inscripciones
 * 
 * Single Responsibility: Define todas las rutas del módulo de inscripciones
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';

// Lazy loading de connectors
// El Suspense ya está manejado globalmente por MainLayout con LoadingFallback
const InscripcionesNuevaConnector = lazy(() => import('./connectors/InscripcionesNuevaConnector'));
const InscripcionesDetailConnector = lazy(() => import('./connectors/DetailConnector'));

export const inscripcionesRoutes = [
    // Módulo raíz: Inscripciones (redirige a la primera opción disponible)
    {
        path: '/inscripciones',
        element: <UnderConstruction />,
        key: 'INS',
        menu: {
            label: 'Inscripciones',
            module: 'INS',
            order: 3, // Muy usado, después de Estudiantes
        },
    },
    {
        path: '/inscripciones/nueva',
        element: <InscripcionesNuevaConnector />,
        key: 'INS-CREATE',
        menu: {
            label: 'Estudiante Nuevo',
            module: 'INS',
            parent: 'INS',
            order: 1,
        },
    },
    // Detalle de inscripción (sin menú, se accede por URL con parámetro de ruta :id)
    {
        path: '/inscripciones/:id',
        element: <InscripcionesDetailConnector />,
        key: 'INS-DETALLE',
        menu: null, // No aparece en el menú, se accede por URL con /inscripciones/:id
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

