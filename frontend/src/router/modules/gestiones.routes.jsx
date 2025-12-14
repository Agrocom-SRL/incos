// src/router/modules/gestiones.routes.js
import { lazy } from 'react';

// Gestiones
const GestionesListPage = lazy(() => import('@pages/Gestiones/List'));
const GestionesHabilitarPage = lazy(() => import('@pages/Gestiones/Habilitar'));
const GestionesOfertaPage = lazy(() => import('@pages/Gestiones/Oferta'));
const GestionesEtapasPage = lazy(() => import('@pages/Gestiones/Etapas'));
const GestionesHorariosPage = lazy(() => import('@pages/Horarios/Asignar'));

export const gestionesRoutes = [
    // Módulo raíz: Gestiones
    {
        path: '/gestiones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'GES',
        menu: {
            label: 'Gestiones',
            module: 'GES',
            order: 6, // Configuración de gestión específica, después de Docentes
        },
    },
    {
        path: '/gestiones/actual',
        element: <GestionesHabilitarPage />,
        key: 'GES-ACTUAL',
        menu: {
            label: 'Gestión Actual',
            module: 'GES',
            parent: 'GES',
            order: 1,
        },
    },
    {
        path: '/gestiones/cronograma',
        element: <GestionesEtapasPage />,
        key: 'GES-ETAPAS',
        menu: {
            label: 'Cronogramas',
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
        path: '/gestiones/horarios/asignar',
        element: <GestionesHorariosPage />,
        key: 'GES-HORARIOS-ASIGNAR',
        menu: {
            label: 'Asignar Horarios',
            module: 'GES',
            parent: 'GES',
            order: 4,
        },
    },
    {
        path: '/gestiones/pasadas',
        element: <GestionesListPage />,
        key: 'GES-LIST',
        menu: {
            label: 'Gestiones Pasadas',
            module: 'GES',
            parent: 'GES',
            order: 6,
        },
    },
];

export default gestionesRoutes;
