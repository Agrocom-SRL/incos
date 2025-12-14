// src/router/modules/pagos.routes.js
import { lazy } from 'react';

const PagosArancelesPage = lazy(() => import('@pages/Pagos/Aranceles'));
const PagosRegistrarEfectivoPage = lazy(() => import('@pages/Pagos/Registrar/Efectivo'));
const PagosRegistrarTransferenciaPage = lazy(() => import('@pages/Pagos/Registrar/Transferencia'));
const PagosRegistrarQRPage = lazy(() => import('@pages/Pagos/Registrar/QR'));
const PagosComprobantePage = lazy(() => import('@pages/Pagos/Comprobante'));
const PagosMorosidadPage = lazy(() => import('@pages/Pagos/Morosidad'));

export const pagosRoutes = [
    // Módulo raíz: Pagos
    {
        path: '/pagos',
        element: null, // No tiene página propia, es solo un grupo
        key: 'PAG',
        menu: {
            label: 'Pagos',
            module: 'PAG',
            order: 9, // Usado regularmente
        },
    },
    {
        path: '/pagos/aranceles',
        element: <PagosArancelesPage />,
        key: 'PAG-ARANCELES',
        menu: {
            label: 'Aranceles',
            module: 'PAG',
            parent: 'PAG',
            order: 1, // Consultar primero
        },
    },
    // Registrar Pago - Grupo padre
    {
        path: '/pagos/registrar',
        element: null, // No tiene página propia, es solo un grupo
        key: 'PAG-REGISTRAR',
        menu: {
            label: 'Registrar Pago',
            module: 'PAG',
            parent: 'PAG',
            order: 2,
        },
    },
    {
        path: '/pagos/registrar/efectivo',
        element: <PagosRegistrarEfectivoPage />,
        key: 'PAG-REGISTRAR-EFECTIVO',
        menu: {
            label: 'Efectivo',
            module: 'PAG',
            parent: 'PAG-REGISTRAR',
            order: 1,
        },
    },
    {
        path: '/pagos/registrar/transferencia',
        element: <PagosRegistrarTransferenciaPage />,
        key: 'PAG-REGISTRAR-TRANSFERENCIA',
        menu: {
            label: 'Transferencia',
            module: 'PAG',
            parent: 'PAG-REGISTRAR',
            order: 2,
        },
    },
    {
        path: '/pagos/registrar/qr',
        element: <PagosRegistrarQRPage />,
        key: 'PAG-REGISTRAR-QR',
        menu: {
            label: 'QR',
            module: 'PAG',
            parent: 'PAG-REGISTRAR',
            order: 3,
        },
    },
    {
        path: '/pagos/comprobantes',
        element: <PagosComprobantePage />,
        key: 'PAG-COMPROBANTE',
        menu: {
            label: 'Comprobantes',
            module: 'PAG',
            parent: 'PAG',
            order: 3, // Consultar comprobantes
        },
    },
    {
        path: '/pagos/morosidad',
        element: <PagosMorosidadPage />,
        key: 'PAG-MOROSIDAD',
        menu: {
            label: 'Morosidad',
            module: 'PAG',
            parent: 'PAG',
            order: 4, // Reportes/Estados
        },
    },
];

export default pagosRoutes;
