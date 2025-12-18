// src/router/modules/historial.routes.js
import { lazy } from 'react';

const HistorialFolioPage = lazy(() => import('@pages/Historial/Folio'));
const HistorialAcademicoPage = lazy(() => import('@pages/Historial/Academico'));
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
    {
        path: '/historial/academico',
        element: <HistorialAcademicoPage />,
        key: 'HIS-ACADEMICO',
        menu: {
            label: 'Historial Académico',
            module: 'HIS',
            parent: 'HIS',
            order: 2, // Incluye validación automática y generación
        },
    },
    // Ruta sin menú (validación independiente de historiales existentes)
    {
        path: '/historial/validar',
        element: <HistorialValidarPage />,
        key: 'HIS-VALIDAR',
        // Sin menu - validación independiente de historiales existentes (opcional)
    },
];

export default historialRoutes;
