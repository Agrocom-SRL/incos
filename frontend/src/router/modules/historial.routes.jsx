// src/router/modules/historial.routes.js
import { lazy } from 'react';

const HistorialFolioPage = lazy(() => import('@pages/Historial/Folio'));
const HistorialAcademicoPage = lazy(() => import('@pages/Historial/Academico'));
const HistorialGenerarPage = lazy(() => import('@pages/Historial/Generar'));
const HistorialValidarPage = lazy(() => import('@pages/Historial/Validar'));

export const historialRoutes = [
    // Módulo raíz: Historial
    {
        path: '/historial',
        element: null, // No tiene página propia, es solo un grupo
        key: 'HIS',
        menu: {
            label: 'Historial',
            module: 'HIS',
            order: 9, // Usado ocasionalmente
        },
    },
    {
        path: '/historial/folio',
        element: <HistorialFolioPage />,
        key: 'HIS-FOLIO',
        menu: {
            label: 'Folio del Egresado',
            module: 'HIS',
            parent: 'HIS',
            order: 1, // Folio primero (incluye libros y actas)
        },
    },
    // Historial Académico - Grupo padre
    {
        path: '/historial/academico',
        element: null, // No tiene página propia, es solo un grupo
        key: 'HIS-ACADEMICO',
        menu: {
            label: 'Historial Académico',
            module: 'HIS',
            parent: 'HIS',
            order: 2,
        },
    },
    {
        path: '/historial/academico/generar',
        element: <HistorialGenerarPage />,
        key: 'HIS-GENERAR',
        menu: {
            label: 'Generar',
            module: 'HIS',
            parent: 'HIS-ACADEMICO',
            order: 1,
        },
    },
    {
        path: '/historial/academico/validar',
        element: <HistorialValidarPage />,
        key: 'HIS-VALIDAR',
        menu: {
            label: 'Validar',
            module: 'HIS',
            parent: 'HIS-ACADEMICO',
            order: 2,
        },
    },
];

export default historialRoutes;
