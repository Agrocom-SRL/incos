// src/router/modules/calificaciones.routes.js
import { lazy } from 'react';

const CalificacionesRegistrar1ParcialPage = lazy(() => import('@pages/Calificaciones/Registrar/1Parcial'));
const CalificacionesRegistrar2ParcialPage = lazy(() => import('@pages/Calificaciones/Registrar/2Parcial'));
const CalificacionesRegistrar3ParcialPage = lazy(() => import('@pages/Calificaciones/Registrar/3Parcial'));
const CalificacionesRegistrarPracticoPage = lazy(() => import('@pages/Calificaciones/Registrar/Practico'));
const CalificacionesRegistrarRecuperatorioPage = lazy(() => import('@pages/Calificaciones/Registrar/Recuperatorio'));
const CalificacionesModificarPage = lazy(() => import('@pages/Calificaciones/Modificar'));
const CalificacionesCursoPage = lazy(() => import('@pages/Calificaciones/Curso'));
const CalificacionesCerrarPage = lazy(() => import('@pages/Calificaciones/Cerrar'));

export const calificacionesRoutes = [
    // Módulo raíz: Calificaciones
    {
        path: '/calificaciones',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CAL',
        menu: {
            label: 'Calificaciones',
            module: 'CAL',
            order: 4,
        },
    },
    // Registrar - Grupo padre
    {
        path: '/calificaciones/registrar',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CAL-REGISTRAR',
        menu: {
            label: 'Registrar',
            module: 'CAL',
            parent: 'CAL',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar/parcial',
        element: <CalificacionesRegistrar1ParcialPage />, // La página manejará qué parcial registrar
        key: 'CAL-REGISTRAR-PARCIAL',
        menu: {
            label: 'Parcial',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 1,
        },
    },
    // Rutas sin menú (se acceden desde la página de registrar parcial)
    {
        path: '/calificaciones/registrar/1-parcial',
        element: <CalificacionesRegistrar1ParcialPage />,
        key: 'CAL-REGISTRAR-1PARCIAL',
        // Sin menu - se accede desde registrar parcial
    },
    {
        path: '/calificaciones/registrar/2-parcial',
        element: <CalificacionesRegistrar2ParcialPage />,
        key: 'CAL-REGISTRAR-2PARCIAL',
        // Sin menu - se accede desde registrar parcial
    },
    {
        path: '/calificaciones/registrar/3-parcial',
        element: <CalificacionesRegistrar3ParcialPage />,
        key: 'CAL-REGISTRAR-3PARCIAL',
        // Sin menu - se accede desde registrar parcial
    },
    {
        path: '/calificaciones/registrar/practico',
        element: <CalificacionesRegistrarPracticoPage />,
        key: 'CAL-REGISTRAR-PRACTICO',
        menu: {
            label: 'Práctico',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 2,
        },
    },
    {
        path: '/calificaciones/registrar/recuperatorio',
        element: <CalificacionesRegistrarRecuperatorioPage />,
        key: 'CAL-REGISTRAR-RECUPERATORIO',
        menu: {
            label: 'Recuperatorio',
            module: 'CAL',
            parent: 'CAL-REGISTRAR',
            order: 3,
        },
    },
    {
        path: '/calificaciones/curso',
        element: <CalificacionesCursoPage />,
        key: 'CAL-CURSO',
        menu: {
            label: 'Por Curso',
            module: 'CAL',
            parent: 'CAL',
            order: 2,
        },
    },
    {
        path: '/calificaciones/cerrar-periodo',
        element: <CalificacionesCerrarPage />,
        key: 'CAL-CERRAR',
        menu: {
            label: 'Cerrar Periodo',
            module: 'CAL',
            parent: 'CAL',
            order: 3,
        },
    },
    // Ruta sin menú (se accede desde la página de calificaciones)
    {
        path: '/calificaciones/modificar',
        element: <CalificacionesModificarPage />,
        key: 'CAL-MODIFICAR',
        // Sin menu - se accede desde la página de calificaciones
    },
];

export default calificacionesRoutes;
