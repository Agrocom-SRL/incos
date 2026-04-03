// src/presentation/modules/supervision/routes.jsx
/**
 * Rutas del módulo de Supervisión (dominio Docentes).
 */

import { UnderConstruction } from '@components/pages';

export const supervisionRoutes = [
    {
        path: '/supervision',
        element: null,
        key: 'DOC-SUP',
        menu: {
            label: 'Supervisión',
            module: 'DOC',
            parent: 'DOC-DOM',
            order: 4,
        },
    },
    {
        path: '/supervision/ficha/ver',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-VER',
        permiso: 'docentes.supervision.evaluar',
        menu: {
            label: 'Evaluar Docente',
            module: 'DOC',
            parent: 'DOC-SUP',
            order: 1,
        },
    },
    {
        path: '/supervision/pasantias',
        element: null,
        key: 'SUP-PASANTIAS',
        menu: {
            label: 'Pasantías',
            module: 'DOC',
            parent: 'DOC-SUP',
            order: 2,
        },
    },
    {
        path: '/supervision/reporte',
        element: <UnderConstruction />,
        key: 'SUP-REPORTE',
        permiso: 'docentes.supervision.reporte',
        menu: {
            label: 'Reporte',
            module: 'DOC',
            parent: 'DOC-SUP',
            order: 3,
        },
    },
    {
        path: '/supervision/pasantias/solicitar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SOLICITAR',
        permiso: 'docentes.supervision.pasantia.solicitar',
        menu: {
            label: 'Solicitar Pasantía',
            module: 'DOC',
            parent: 'SUP-PASANTIAS',
            order: 1,
        },
    },
    {
        path: '/supervision/pasantias/seguimiento',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SEGUIMIENTO',
        permiso: 'docentes.supervision.pasantia.seguimiento',
        menu: {
            label: 'Seguimiento',
            module: 'DOC',
            parent: 'SUP-PASANTIAS',
            order: 2,
        },
    },
    {
        path: '/supervision/pasantias/evaluar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-EVALUAR',
        permiso: 'docentes.supervision.pasantia.evaluar',
        menu: {
            label: 'Evaluación Final',
            module: 'DOC',
            parent: 'SUP-PASANTIAS',
            order: 3,
        },
    },
    {
        path: '/supervision/programar',
        element: <UnderConstruction />,
        key: 'SUP-PROGRAMAR',
        permiso: 'docentes.supervision.programar',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
    {
        path: '/supervision/ficha/crear',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-CREAR',
        permiso: 'docentes.supervision.ficha.crear',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
    {
        path: '/supervision/ficha/editar',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-EDITAR',
        permiso: 'docentes.supervision.ficha.editar',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
];

export default supervisionRoutes;
