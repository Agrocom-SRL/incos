// src/presentation/modules/pagos/routes.jsx
/**
 * Rutas del módulo de Pagos
 * 
 * Single Responsibility: Define todas las rutas del módulo de pagos
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

// Lazy loading de connectors
// El Suspense ya está manejado globalmente por MainLayout con LoadingFallback
const PagosRegistrarConnector = lazy(() => import('./connectors/PagosRegistrarConnector'));
const PagosListConnector = lazy(() => import('./connectors/ListConnector'));
const PagosDetailConnector = lazy(() => import('./connectors/DetailConnector'));

export const pagosRoutes = [
    // Módulo raíz: Pagos (muestra la lista directamente)
    {
        path: '/pagos',
        element: <PagosListConnector />,
        key: 'PAG',
        menu: {
            label: 'Pagos',
            module: 'PAG',
            order: 8, // Usado regularmente
        },
    },
    {
        path: '/pagos/listar',
        element: <PagosListConnector />,
        key: 'PAG-LIST',
        menu: {
            label: 'Listar Pagos',
            module: 'PAG',
            parent: 'PAG',
            order: 1, // Listar primero
        },
    },
    {
        path: '/pagos/registrar',
        element: <PagosRegistrarConnector />,
        key: 'PAG-REGISTRAR',
        menu: {
            label: 'Registrar Pago',
            module: 'PAG',
            parent: 'PAG',
            order: 2, // Registrar segundo
        },
    },
    // Detalle de pago (sin menú, se accede por URL con parámetro de ruta :id)
    {
        path: '/pagos/:id',
        element: <PagosDetailConnector />,
        key: 'PAG-DETALLE',
        menu: null, // No aparece en el menú, se accede por URL con /pagos/:id
    },
    // Editar pago (sin menú, se accede por URL con parámetro de ruta :id)
    {
        path: '/pagos/:id/editar',
        element: <UnderConstruction />,
        key: 'PAG-EDITAR',
        menu: null, // No aparece en el menú, se accede por URL con /pagos/:id/editar
    },
    // Reportes/Consultas - Grupo padre (opcional, para ver ingresos de manera específica)
    {
        path: '/pagos/reportes',
        element: null, // No tiene página propia, es solo un grupo
        key: 'PAG-REPORTES',
        menu: {
            label: 'Reportes',
            module: 'PAG',
            parent: 'PAG',
            order: 3,
        },
    },
    {
        path: '/pagos/reportes/carrera',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-CARRERA',
        menu: {
            label: 'Por Carrera',
            module: 'PAG',
            parent: 'PAG-REPORTES',
            order: 1,
        },
    },
    {
        path: '/pagos/reportes/estudiante',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-ESTUDIANTE',
        menu: {
            label: 'Por Estudiante',
            module: 'PAG',
            parent: 'PAG-REPORTES',
            order: 2,
        },
    },
    {
        path: '/pagos/reportes/gestion',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-GESTION',
        menu: {
            label: 'Por Gestión',
            module: 'PAG',
            parent: 'PAG-REPORTES',
            order: 3,
        },
    },
    {
        path: '/pagos/adicionales',
        element: <UnderConstruction />,
        key: 'PAG-ADICIONALES',
        menu: {
            label: 'Pagos Adicionales',
            module: 'PAG',
            parent: 'PAG',
            order: 4, // Pagos especiales
        },
    },
    {
        path: '/pagos/configuracion',
        element: <UnderConstruction />,
        key: 'PAG-CONFIG',
        menu: {
            label: 'Configuración',
            module: 'PAG',
            parent: 'PAG',
            order: 5, // Configuración al final
        },
    },
];

export default pagosRoutes;

