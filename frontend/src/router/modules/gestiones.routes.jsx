// src/router/modules/gestiones.routes.js
import { lazy } from 'react';

// Gestiones
const GestionesListPage = lazy(() => import('@pages/Gestiones/List'));
const GestionesCreatePage = lazy(() => import('@pages/Gestiones/Create'));
const GestionesOfertaPage = lazy(() => import('@pages/Gestiones/Oferta'));
const GestionesPlanEstudiosPage = lazy(() => import('@pages/Gestiones/PlanEstudios'));
const GestionesEtapasPage = lazy(() => import('@pages/Gestiones/Etapas'));
// Horarios (movidos desde módulo independiente)
const GestionesHorariosPage = lazy(() => import('@pages/Horarios/Asignar'));
const GestionesTurnosPage = lazy(() => import('@pages/Horarios/Turnos'));
const GestionesGenerarHorariosPage = lazy(() => import('@pages/Horarios/Generar'));

export const gestionesRoutes = [
    // Módulo raíz: Gestiones
    {
        path: '/gestiones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'GES',
        menu: {
            label: 'Gestiones',
            module: 'GES',
            order: 7, // Configuración, solo al inicio del año (antes de Docentes en configuración)
        },
    },
    {
        path: '/gestiones/listar',
        element: <GestionesListPage />,
        key: 'GES-LIST',
        menu: {
            label: 'Listar',
            module: 'GES',
            parent: 'GES',
            order: 1,
        },
    },
    {
        path: '/gestiones/nueva',
        element: <GestionesCreatePage />,
        key: 'GES-CREATE',
        menu: {
            label: 'Nueva Gestión',
            module: 'GES',
            parent: 'GES',
            order: 2,
        },
    },
    {
        path: '/gestiones/oferta',
        element: <GestionesOfertaPage />,
        key: 'GES-OFERTA',
        menu: {
            label: 'Oferta Académica',
            module: 'GES',
            parent: 'GES',
            order: 3,
        },
    },
    {
        path: '/gestiones/plan-estudios',
        element: <GestionesPlanEstudiosPage />,
        key: 'GES-PLAN',
        menu: {
            label: 'Plan de Estudios',
            module: 'GES',
            parent: 'GES',
            order: 4,
        },
    },
    {
        path: '/gestiones/etapas',
        element: <GestionesEtapasPage />,
        key: 'GES-ETAPAS',
        menu: {
            label: 'Etapas/Periodos',
            module: 'GES',
            parent: 'GES',
            order: 5,
        },
    },
    // Horarios - Grupo padre
    {
        path: '/gestiones/horarios',
        element: null, // No tiene página propia, es solo un grupo
        key: 'GES-HORARIOS',
        menu: {
            label: 'Horarios',
            module: 'GES',
            parent: 'GES',
            order: 6,
        },
    },
    {
        path: '/gestiones/horarios/turnos',
        element: <GestionesTurnosPage />,
        key: 'GES-HORARIOS-TURNOS',
        menu: {
            label: 'Turnos',
            module: 'GES',
            parent: 'GES-HORARIOS',
            order: 1,
        },
    },
    {
        path: '/gestiones/horarios/asignar',
        element: <GestionesHorariosPage />,
        key: 'GES-HORARIOS-ASIGNAR',
        menu: {
            label: 'Asignar Horarios',
            module: 'GES',
            parent: 'GES-HORARIOS',
            order: 2,
        },
    },
    {
        path: '/gestiones/horarios/generar',
        element: <GestionesGenerarHorariosPage />,
        key: 'GES-HORARIOS-GENERAR',
        menu: {
            label: 'Generar Horarios',
            module: 'GES',
            parent: 'GES-HORARIOS',
            order: 3,
        },
    },
];

export default gestionesRoutes;
