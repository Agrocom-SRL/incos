// src/presentation/modules/pagos/routes.jsx
/**
 * Rutas de pagos (dominio Finanzas en sidebar).
 * Orden: rutas estáticas antes de /pagos/:id.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const PagosRegistrarConnector = lazy(() => import('./connectors/PagosRegistrarConnector'));
const PagosListConnector = lazy(() => import('./connectors/ListConnector'));
const PagosDetailConnector = lazy(() => import('./connectors/DetailConnector'));

export const pagosRoutes = [
    {
        path: '/pagos/listar',
        element: <PagosListConnector />,
        key: 'PAG-LIST',
        permiso: 'finanzas.pago.ver',
        accion: 'LISTAR',
        menu: {
            label: 'Listar Pagos',
            module: 'FIN',
            parent: 'FIN',
            order: 1,
        },
    },
    // Misma vista que PAG-LIST; URL distinta para menú MAT (aportes) sin duplicar path en el router.
    {
        path: '/matricula/aportes/listar',
        element: <PagosListConnector />,
        key: 'MAT-APO-LISTA',
        permiso: 'matricula.pago.aporte.ver',
        accion: 'LISTAR',
        menu: {
            label: 'Aportes',
            module: 'MAT',
            parent: 'MAT',
            order: 4,
            labelByRole: { ESTUDIANTE: 'Mis aportes' },
        },
    },
    {
        path: '/pagos/registrar',
        element: <PagosRegistrarConnector />,
        key: 'PAG-REGISTRAR',
        permiso: 'finanzas.pago.registrar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'PAG-LIST',
    },
    {
        path: '/pagos/reportes',
        element: null,
        key: 'PAG-REPORTES',
        menu: {
            label: 'Reportes',
            module: 'FIN',
            parent: 'FIN',
            order: 3,
        },
    },
    {
        path: '/pagos/reportes/carrera',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-CARRERA',
        permiso: 'finanzas.pago.reporte.carrera',
        accion: 'LISTAR',
        menu: {
            label: 'Por Carrera',
            module: 'FIN',
            parent: 'PAG-REPORTES',
            order: 1,
        },
    },
    {
        path: '/pagos/reportes/estudiante',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-ESTUDIANTE',
        permiso: 'finanzas.pago.reporte.estudiante',
        accion: 'LISTAR',
        menu: {
            label: 'Por Estudiante',
            module: 'FIN',
            parent: 'PAG-REPORTES',
            order: 2,
        },
    },
    {
        path: '/pagos/reportes/gestion',
        element: <UnderConstruction />,
        key: 'PAG-REPORTES-GESTION',
        permiso: 'finanzas.pago.reporte.gestion',
        accion: 'LISTAR',
        menu: {
            label: 'Por Gestión',
            module: 'FIN',
            parent: 'PAG-REPORTES',
            order: 3,
        },
    },
    {
        path: '/pagos/adicionales',
        element: <UnderConstruction />,
        key: 'PAG-ADICIONALES',
        permiso: 'finanzas.pago.adicionales',
        accion: 'LISTAR',
        menu: {
            label: 'Pagos Adicionales',
            module: 'FIN',
            parent: 'FIN',
            order: 4,
        },
    },
    // Debe declararse antes de /pagos/:id. Menú bajo Institucional > Configuración (parent CFG).
    {
        path: '/pagos/configuracion',
        element: <UnderConstruction />,
        key: 'CFG-PAGOS',
        permiso: 'cfg.pagos.gestionar',
        accion: 'LISTAR',
        menu: {
            label: 'Configuración de Pagos',
            module: 'FIN',
            parent: 'CFG',
            order: 4,
        },
    },
    {
        path: '/pagos/:id/editar',
        element: <UnderConstruction />,
        key: 'PAG-EDITAR',
        permiso: 'finanzas.pago.editar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'PAG-LIST',
    },
    {
        path: '/pagos/:id',
        element: <PagosDetailConnector />,
        key: 'PAG-DETALLE',
        permiso: 'finanzas.pago.ver',
        accion: 'DETALLE',
        menu: null,
        breadcrumbParent: 'PAG-LIST',
    },
    {
        path: '/pagos',
        element: <PagosListConnector />,
        key: 'PAG',
        permiso: 'finanzas.pago.ver',
        accion: 'LISTAR',
        menu: null,
    },
];

export default pagosRoutes;
