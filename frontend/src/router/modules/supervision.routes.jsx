// src/router/modules/supervision.routes.js
import { lazy } from 'react';

const SupervisionProgramarPage = lazy(() => import('@pages/supervision/programar'));
const SupervisionFichaCrearPage = lazy(() => import('@pages/supervision/ficha/crear'));
const SupervisionFichaEditarPage = lazy(() => import('@pages/supervision/ficha/editar'));
const SupervisionFichaVerPage = lazy(() => import('@pages/supervision/ficha/ver'));
const SupervisionReportePage = lazy(() => import('@pages/supervision/reporte'));
// Pasantías - movidas dentro de Supervisión
const PasantiasAsignarPage = lazy(() => import('@pages/pasantias/asignar'));
const PasantiasEvaluarPage = lazy(() => import('@pages/pasantias/evaluar'));
const PasantiasSeguimientoPage = lazy(() => import('@pages/pasantias/seguimiento'));

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
        element: <SupervisionFichaVerPage />,
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
        element: <SupervisionReportePage />,
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
        element: <PasantiasAsignarPage />,
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
        element: <PasantiasSeguimientoPage />,
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
        element: <PasantiasEvaluarPage />,
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
        element: <SupervisionProgramarPage />,
        key: 'SUP-PROGRAMAR',
        // Sin menu - se accede desde la página de evaluación docente (programar supervisión)
    },
    {
        path: '/supervision/ficha/crear',
        element: <SupervisionFichaCrearPage />,
        key: 'SUP-FICHA-CREAR',
        // Sin menu - se accede desde la página de evaluación docente (crear ficha después de supervisar)
    },
    {
        path: '/supervision/ficha/editar',
        element: <SupervisionFichaEditarPage />,
        key: 'SUP-FICHA-EDITAR',
        // Sin menu - se accede desde la página de evaluación docente (editar ficha existente)
    },
];

export default supervisionRoutes;
