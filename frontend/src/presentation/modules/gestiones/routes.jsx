// src/presentation/modules/gestiones/routes.jsx
/**
 * Rutas del módulo de Gestiones
 *
 * Incluye rutas con path bajo /inscripciones/* (gestión institucional, no flujo MAT individual).
 */

import { UnderConstruction } from '@components/pages';

export const gestionesRoutes = [
    {
        path: '/gestiones',
        element: null,
        key: 'GES',
        menu: {
            label: 'Gestiones',
            module: 'INST',
            parent: 'INST',
            order: 1,
        },
    },
    {
        path: '/gestiones/actual',
        element: <UnderConstruction />,
        key: 'GES-ACTUAL',
        permiso: 'institucional.gestion.actual',
        menu: {
            label: 'Gestión Actual',
            module: 'INST',
            parent: 'GES',
            order: 1,
        },
    },
    {
        path: '/gestiones/cronograma',
        element: <UnderConstruction />,
        key: 'GES-ETAPAS',
        permiso: 'institucional.gestion.cronograma',
        menu: {
            label: 'Cronogramas',
            module: 'INST',
            parent: 'GES',
            order: 2,
        },
    },
    {
        path: '/gestiones/oferta',
        element: <UnderConstruction />,
        key: 'GES-OFERTA',
        permiso: 'institucional.gestion.oferta',
        menu: {
            label: 'Oferta Académica',
            module: 'INST',
            parent: 'GES',
            order: 3,
        },
    },
    {
        path: '/gestiones/horarios/asignar',
        element: <UnderConstruction />,
        key: 'GES-HORARIOS-ASIGNAR',
        permiso: 'institucional.gestion.horarios',
        menu: {
            label: 'Asignar Horarios',
            module: 'INST',
            parent: 'GES',
            order: 4,
        },
    },
    {
        path: '/inscripciones/materias/inscribir',
        element: <UnderConstruction />,
        key: 'GES-MAT-INSCRIBIR',
        permiso: 'institucional.oferta.gestionar',
        menu: {
            label: 'Inscribir por Materia',
            module: 'INST',
            parent: 'GES',
            order: 5,
        },
    },
    {
        path: '/inscripciones/materias/curso',
        element: <UnderConstruction />,
        key: 'GES-MAT-CURSO',
        permiso: 'institucional.oferta.gestionar',
        menu: {
            label: 'Inscribir por Curso',
            module: 'INST',
            parent: 'GES',
            order: 6,
        },
    },
    {
        path: '/inscripciones/horario',
        element: <UnderConstruction />,
        key: 'GES-HORARIO-GEN',
        permiso: 'institucional.horario.asignar',
        menu: {
            label: 'Generar Horarios',
            module: 'INST',
            parent: 'GES',
            order: 7,
        },
    },
    {
        path: '/gestiones/pasadas',
        element: <UnderConstruction />,
        key: 'GES-LIST',
        permiso: 'institucional.gestion.pasadas',
        menu: {
            label: 'Gestiones Pasadas',
            module: 'INST',
            parent: 'GES',
            order: 8,
        },
    },
];

export default gestionesRoutes;
