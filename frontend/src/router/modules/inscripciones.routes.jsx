// src/router/modules/inscripciones.routes.js
import { lazy } from 'react';

const InscripcionesCreatePage = lazy(() => import('@pages/Inscripciones/Create'));
const InscripcionesMateriasInscribirPage = lazy(() => import('@pages/Inscripciones/Materias/Inscribir'));
const InscripcionesMateriasCursoPage = lazy(() => import('@pages/Inscripciones/Materias/Curso'));
const InscripcionesMateriasValidarPage = lazy(() => import('@pages/Inscripciones/Materias/Validar'));
const InscripcionesHorarioPage = lazy(() => import('@pages/Inscripciones/Horario'));
const InscripcionesAnularPage = lazy(() => import('@pages/Inscripciones/Anular'));

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
        element: <InscripcionesCreatePage />,
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
        element: <InscripcionesHorarioPage />,
        key: 'INS-HORARIO',
        menu: {
            label: 'Horarios',
            module: 'INS',
            parent: 'INS',
            order: 2,
        },
    },
    {
        path: '/inscripciones/materias/inscribir',
        element: <InscripcionesMateriasInscribirPage />,
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
        element: <InscripcionesMateriasCursoPage />,
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
        element: <InscripcionesAnularPage />,
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
        element: <InscripcionesMateriasValidarPage />,
        key: 'INS-MATERIAS-VALIDAR',
        // Sin menu - la validación es una acción dentro de las páginas de inscripción
    },
];

export default inscripcionesRoutes;
