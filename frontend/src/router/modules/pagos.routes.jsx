// src/router/modules/pagos.routes.js
import { lazy } from 'react';

// Configuración y listado
const PagosConfiguracionPage = lazy(() => import('@pages/pagos/configuracion'));
const PagosListPage = lazy(() => import('@pages/pagos/list'));
// Registro
const PagosRegistrarPage = lazy(() => import('@pages/pagos/registrar'));
// Reportes/Consultas
const PagosReporteCarreraPage = lazy(() => import('@pages/pagos/reportes/carrera'));
const PagosReporteEstudiantePage = lazy(() => import('@pages/pagos/reportes/estudiante'));
const PagosReporteGestionPage = lazy(() => import('@pages/pagos/reportes/gestion'));
// Pagos adicionales
const PagosAdicionalesPage = lazy(() => import('@pages/pagos/adicionales'));

export const pagosRoutes = [
    // Módulo raíz: Pagos
    {
        path: '/pagos',
        element: null, // No tiene página propia, es solo un grupo
        key: 'PAG',
        menu: {
            label: 'Pagos',
            module: 'PAG',
            order: 8, // Usado regularmente
        },
    },
    {
        path: '/pagos/listar',
        element: <PagosListPage />,
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
        element: <PagosRegistrarPage />,
        key: 'PAG-REGISTRAR',
        menu: {
            label: 'Registrar Pago',
            module: 'PAG',
            parent: 'PAG',
            order: 2, // Registrar segundo
        },
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
        element: <PagosReporteCarreraPage />,
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
        element: <PagosReporteEstudiantePage />,
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
        element: <PagosReporteGestionPage />,
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
        element: <PagosAdicionalesPage />,
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
        element: <PagosConfiguracionPage />,
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
