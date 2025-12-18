// src/router/modules/traspasos-transferencias.routes.js
import { lazy } from 'react';

// Traspasos (misma ciudad/región)
const TraspasosSolicitarPage = lazy(() => import('@pages/traspasostransferencias/traspasos/solicitar'));
const TraspasosRecibirPage = lazy(() => import('@pages/traspasostransferencias/traspasos/recibir'));
const TraspasosConvalidarNotasPage = lazy(() => import('@pages/traspasostransferencias/traspasos/convalidarnotas'));
const TraspasosAprobarPage = lazy(() => import('@pages/traspasostransferencias/traspasos/aprobar'));
const TraspasosListarPage = lazy(() => import('@pages/traspasostransferencias/traspasos/listar'));

// Transferencias (otra ciudad/región)
const TransferenciasSolicitarPage = lazy(() => import('@pages/traspasostransferencias/transferencias/solicitar'));
const TransferenciasRecibirPage = lazy(() => import('@pages/traspasostransferencias/transferencias/recibir'));
const TransferenciasConvalidarNotasPage = lazy(() => import('@pages/traspasostransferencias/transferencias/convalidarnotas'));
const TransferenciasAprobarPage = lazy(() => import('@pages/traspasostransferencias/transferencias/aprobar'));
const TransferenciasListarPage = lazy(() => import('@pages/traspasostransferencias/transferencias/listar'));

export const traspasosTransferenciasRoutes = [
    // Módulo raíz: Traspasos y Transferencias
    {
        path: '/traspasos-transferencias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA',
        menu: {
            label: 'Traspasos y Transferencias',
            module: 'TRA',
            order: 5, // Después de Inscripciones, antes de Calificaciones
        },
    },
    // Submenu: Traspasos (misma ciudad/región)
    {
        path: '/traspasos-transferencias/traspasos',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA-TRASPASOS',
        menu: {
            label: 'Traspasos',
            module: 'TRA',
            parent: 'TRA',
            order: 1,
        },
    },
    {
        path: '/traspasos-transferencias/traspasos/listar',
        element: <TraspasosListarPage />,
        key: 'TRA-TRASPASOS-LIST',
        menu: {
            label: 'Listar Traspasos',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 1,
        },
    },
    {
        path: '/traspasos-transferencias/traspasos/solicitar',
        element: <TraspasosSolicitarPage />,
        key: 'TRA-TRASPASOS-SOLICITAR',
        menu: {
            label: 'Solicitar Traspaso (Salida)',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 2,
        },
    },
    {
        path: '/traspasos-transferencias/traspasos/recibir',
        element: <TraspasosRecibirPage />,
        key: 'TRA-TRASPASOS-RECIBIR',
        menu: {
            label: 'Recibir Traspaso (Entrada)',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 3,
        },
    },
    {
        path: '/traspasos-transferencias/traspasos/convalidar-notas',
        element: <TraspasosConvalidarNotasPage />,
        key: 'TRA-TRASPASOS-CONVALIDAR-NOTAS',
        menu: {
            label: 'Convalidar Notas',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 4,
        },
    },
    {
        path: '/traspasos-transferencias/traspasos/aprobar',
        element: <TraspasosAprobarPage />,
        key: 'TRA-TRASPASOS-APROBAR',
        menu: {
            label: 'Aprobar Traspaso',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 5,
        },
    },
    // Submenu: Transferencias (otra ciudad/región)
    {
        path: '/traspasos-transferencias/transferencias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA-TRANSFERENCIAS',
        menu: {
            label: 'Transferencias',
            module: 'TRA',
            parent: 'TRA',
            order: 2,
        },
    },
    {
        path: '/traspasos-transferencias/transferencias/listar',
        element: <TransferenciasListarPage />,
        key: 'TRA-TRANSFERENCIAS-LIST',
        menu: {
            label: 'Listar Transferencias',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 1,
        },
    },
    {
        path: '/traspasos-transferencias/transferencias/solicitar',
        element: <TransferenciasSolicitarPage />,
        key: 'TRA-TRANSFERENCIAS-SOLICITAR',
        menu: {
            label: 'Solicitar Transferencia (Salida)',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 2,
        },
    },
    {
        path: '/traspasos-transferencias/transferencias/recibir',
        element: <TransferenciasRecibirPage />,
        key: 'TRA-TRANSFERENCIAS-RECIBIR',
        menu: {
            label: 'Recibir Transferencia (Entrada)',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 3,
        },
    },
    {
        path: '/traspasos-transferencias/transferencias/convalidar-notas',
        element: <TransferenciasConvalidarNotasPage />,
        key: 'TRA-TRANSFERENCIAS-CONVALIDAR-NOTAS',
        menu: {
            label: 'Convalidar Notas',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 4,
        },
    },
    {
        path: '/traspasos-transferencias/transferencias/aprobar',
        element: <TransferenciasAprobarPage />,
        key: 'TRA-TRANSFERENCIAS-APROBAR',
        menu: {
            label: 'Aprobar Transferencia',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 5,
        },
    },
];

export default traspasosTransferenciasRoutes;
