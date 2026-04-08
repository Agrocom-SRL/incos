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
        accion: 'LISTAR',
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
        key: 'DOC-PAS',
        permiso: 'docentes.supervision.pasantia.solicitar',
        accion: 'LISTAR',
        menu: {
            label: 'Pasantías docentes',
            module: 'DOC',
            parent: 'DOC-DOM',
            order: 5,
        },
    },
    {
        path: '/supervision/reporte',
        element: <UnderConstruction />,
        key: 'SUP-REPORTE',
        permiso: 'docentes.supervision.reporte',
        accion: 'LISTAR',
        menu: {
            label: 'Reporte',
            module: 'DOC',
            parent: 'DOC-SUP',
            order: 2,
        },
    },
    {
        path: '/supervision/pasantias/solicitar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SOLICITAR',
        permiso: 'docentes.supervision.pasantia.solicitar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'DOC-PAS',
    },
    {
        path: '/supervision/pasantias/seguimiento',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-SEGUIMIENTO',
        permiso: 'docentes.supervision.pasantia.seguimiento',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'DOC-PAS',
    },
    {
        path: '/supervision/pasantias/evaluar',
        element: <UnderConstruction />,
        key: 'SUP-PASANTIAS-EVALUAR',
        permiso: 'docentes.supervision.pasantia.evaluar',
        accion: 'APROBAR',
        menu: null,
        breadcrumbParent: 'DOC-PAS',
    },
    {
        path: '/supervision/programar',
        element: <UnderConstruction />,
        key: 'SUP-PROGRAMAR',
        permiso: 'docentes.supervision.programar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
    {
        path: '/supervision/ficha/crear',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-CREAR',
        permiso: 'docentes.supervision.ficha.crear',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
    {
        path: '/supervision/ficha/editar',
        element: <UnderConstruction />,
        key: 'SUP-FICHA-EDITAR',
        permiso: 'docentes.supervision.ficha.editar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'DOC-SUP',
    },
];

export default supervisionRoutes;
