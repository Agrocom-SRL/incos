// src/router/modules/inscripciones.routes.js
import { lazy } from 'react';

const InscripcionesCreatePage = lazy(() => import('@pages/Inscripciones/Create'));
const InscripcionesMateriasInscribirPage = lazy(() => import('@pages/Inscripciones/Materias/Inscribir'));
const InscripcionesMateriasCursoPage = lazy(() => import('@pages/Inscripciones/Materias/Curso'));
const InscripcionesMateriasValidarPage = lazy(() => import('@pages/Inscripciones/Materias/Validar'));
const InscripcionesHorarioPage = lazy(() => import('@pages/Inscripciones/Horario'));
const InscripcionesAnularPage = lazy(() => import('@pages/Inscripciones/Anular'));

export const inscripcionesRoutes = [
    {
        path: '/inscripciones/nueva',
        element: <InscripcionesCreatePage />,
        key: 'INS-CREATE',
    },
    {
        path: '/inscripciones/materias/inscribir',
        element: <InscripcionesMateriasInscribirPage />,
        key: 'INS-MATERIAS-INSCRIBIR',
    },
    {
        path: '/inscripciones/materias/curso',
        element: <InscripcionesMateriasCursoPage />,
        key: 'INS-MATERIAS-CURSO',
    },
    {
        path: '/inscripciones/materias/validar',
        element: <InscripcionesMateriasValidarPage />,
        key: 'INS-MATERIAS-VALIDAR',
    },
    {
        path: '/inscripciones/horario',
        element: <InscripcionesHorarioPage />,
        key: 'INS-HORARIO',
    },
    {
        path: '/inscripciones/anular',
        element: <InscripcionesAnularPage />,
        key: 'INS-ANULAR',
    },
];

export default inscripcionesRoutes;
