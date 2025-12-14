// src/router/modules/historial.routes.js
import { lazy } from 'react';

const HistorialGenerarPage = lazy(() => import('@pages/Historial/Generar'));
const HistorialValidarPage = lazy(() => import('@pages/Historial/Validar'));
const HistorialLibrosPage = lazy(() => import('@pages/Historial/Libros'));

export const historialRoutes = [
    // Módulo raíz: Historial
    {
        path: '/historial',
        element: null, // No tiene página propia, es solo un grupo
        key: 'HIS',
        menu: {
            label: 'Historial',
            module: 'HIS',
            order: 10, // Usado ocasionalmente
        },
    },
    {
        path: '/historial/generar',
        element: <HistorialGenerarPage />,
        key: 'HIS-GENERAR',
        menu: {
            label: 'Generar',
            module: 'HIS',
            parent: 'HIS',
            order: 1, // Generar primero
        },
    },
    {
        path: '/historial/validar',
        element: <HistorialValidarPage />,
        key: 'HIS-VALIDAR',
        menu: {
            label: 'Validar',
            module: 'HIS',
            parent: 'HIS',
            order: 2, // Validar segundo (estado)
        },
    },
    {
        path: '/historial/libros',
        element: <HistorialLibrosPage />,
        key: 'HIS-LIBROS',
        menu: {
            label: 'Libros Oficiales',
            module: 'HIS',
            parent: 'HIS',
            order: 3, // Consultar último
        },
    },
];

export default historialRoutes;
