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
            order: 3,
        },
    },
    {
        path: '/inscripciones/nueva',
        element: <InscripcionesCreatePage />,
        key: 'INS-CREATE',
        menu: {
            label: 'Nueva',
            module: 'INS',
            parent: 'INS',
            order: 1,
        },
    },
    // Materias - Grupo padre
    {
        path: '/inscripciones/materias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'INS-MATERIAS',
        menu: {
            label: 'Inscribir Materias',
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
            label: 'Por Materia',
            module: 'INS',
            parent: 'INS-MATERIAS',
            order: 1,
        },
    },
    {
        path: '/inscripciones/materias/curso',
        element: <InscripcionesMateriasCursoPage />,
        key: 'INS-MATERIAS-CURSO',
        menu: {
            label: 'Por Curso',
            module: 'INS',
            parent: 'INS-MATERIAS',
            order: 2,
        },
    },
    {
        path: '/inscripciones/materias/validar',
        element: <InscripcionesMateriasValidarPage />,
        key: 'INS-MATERIAS-VALIDAR',
        menu: {
            label: 'Validar',
            module: 'INS',
            parent: 'INS-MATERIAS',
            order: 3,
        },
    },
    {
        path: '/inscripciones/horario',
        element: <InscripcionesHorarioPage />,
        key: 'INS-HORARIO',
        menu: {
            label: 'Horario',
            module: 'INS',
            parent: 'INS',
            order: 3,
        },
    },
    {
        path: '/inscripciones/anular',
        element: <InscripcionesAnularPage />,
        key: 'INS-ANULAR',
        menu: {
            label: 'Anular',
            module: 'INS',
            parent: 'INS',
            order: 4,
        },
    },
];

export default inscripcionesRoutes;
