// src/router/modules/pagos.routes.js
import { lazy } from 'react';

const PagosArancelesPage = lazy(() => import('@pages/Pagos/Aranceles'));
const PagosRegistrarEfectivoPage = lazy(() => import('@pages/Pagos/Registrar/Efectivo'));
const PagosRegistrarTransferenciaPage = lazy(() => import('@pages/Pagos/Registrar/Transferencia'));
const PagosRegistrarQRPage = lazy(() => import('@pages/Pagos/Registrar/QR'));
const PagosComprobantePage = lazy(() => import('@pages/Pagos/Comprobante'));
const PagosMorosidadPage = lazy(() => import('@pages/Pagos/Morosidad'));

export const pagosRoutes = [
    {
        path: '/pagos/aranceles',
        element: <PagosArancelesPage />,
        key: 'PAG-ARANCELES',
    },
    {
        path: '/pagos/registrar/efectivo',
        element: <PagosRegistrarEfectivoPage />,
        key: 'PAG-REGISTRAR-EFECTIVO',
    },
    {
        path: '/pagos/registrar/transferencia',
        element: <PagosRegistrarTransferenciaPage />,
        key: 'PAG-REGISTRAR-TRANSFERENCIA',
    },
    {
        path: '/pagos/registrar/qr',
        element: <PagosRegistrarQRPage />,
        key: 'PAG-REGISTRAR-QR',
    },
    {
        path: '/pagos/comprobantes',
        element: <PagosComprobantePage />,
        key: 'PAG-COMPROBANTE',
    },
    {
        path: '/pagos/morosidad',
        element: <PagosMorosidadPage />,
        key: 'PAG-MOROSIDAD',
    },
];

export default pagosRoutes;
