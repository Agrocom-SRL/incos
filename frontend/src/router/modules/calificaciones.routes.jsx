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
    {
        path: '/calificaciones/registrar/1-parcial',
        element: <CalificacionesRegistrar1ParcialPage />,
        key: 'CAL-REGISTRAR-1PARCIAL',
    },
    {
        path: '/calificaciones/registrar/2-parcial',
        element: <CalificacionesRegistrar2ParcialPage />,
        key: 'CAL-REGISTRAR-2PARCIAL',
    },
    {
        path: '/calificaciones/registrar/3-parcial',
        element: <CalificacionesRegistrar3ParcialPage />,
        key: 'CAL-REGISTRAR-3PARCIAL',
    },
    {
        path: '/calificaciones/registrar/practico',
        element: <CalificacionesRegistrarPracticoPage />,
        key: 'CAL-REGISTRAR-PRACTICO',
    },
    {
        path: '/calificaciones/registrar/recuperatorio',
        element: <CalificacionesRegistrarRecuperatorioPage />,
        key: 'CAL-REGISTRAR-RECUPERATORIO',
    },
    {
        path: '/calificaciones/modificar',
        element: <CalificacionesModificarPage />,
        key: 'CAL-MODIFICAR',
    },
    {
        path: '/calificaciones/curso',
        element: <CalificacionesCursoPage />,
        key: 'CAL-CURSO',
    },
    {
        path: '/calificaciones/cerrar',
        element: <CalificacionesCerrarPage />,
        key: 'CAL-CERRAR',
    },
];

export default calificacionesRoutes;
