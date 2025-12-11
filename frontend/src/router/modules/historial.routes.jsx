// src/router/modules/historial.routes.js
import { lazy } from 'react';

const HistorialGenerarPage = lazy(() => import('@pages/Historial/Generar'));
const HistorialValidarPage = lazy(() => import('@pages/Historial/Validar'));
const HistorialLibrosPage = lazy(() => import('@pages/Historial/Libros'));

export const historialRoutes = [
    {
        path: '/historial/generar',
        element: <HistorialGenerarPage />,
        key: 'HIS-GENERAR',
    },
    {
        path: '/historial/validar',
        element: <HistorialValidarPage />,
        key: 'HIS-VALIDAR',
    },
    {
        path: '/historial/libros',
        element: <HistorialLibrosPage />,
        key: 'HIS-LIBROS',
    },
];

export default historialRoutes;
