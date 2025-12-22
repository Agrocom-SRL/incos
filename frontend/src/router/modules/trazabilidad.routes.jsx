// src/router/modules/trazabilidad.routes.js
import { lazy } from 'react';

// Traspasos (misma ciudad/región)
const TraspasosSolicitarPage = lazy(() => import('@pages/trazabilidad/Traspasos/Solicitar'));
const TraspasosRecibirPage = lazy(() => import('@pages/trazabilidad/Traspasos/Recibir'));
const TraspasosConvalidarNotasPage = lazy(() => import('@pages/trazabilidad/Traspasos/ConvalidarNotas'));
const TraspasosAprobarPage = lazy(() => import('@pages/trazabilidad/Traspasos/Aprobar'));
const TraspasosListarPage = lazy(() => import('@pages/trazabilidad/Traspasos/Listar'));

// Transferencias (otra ciudad/región)
const TransferenciasSolicitarPage = lazy(() => import('@pages/trazabilidad/Transferencias/Solicitar'));
const TransferenciasRecibirPage = lazy(() => import('@pages/trazabilidad/Transferencias/Recibir'));
const TransferenciasConvalidarNotasPage = lazy(() => import('@pages/trazabilidad/Transferencias/ConvalidarNotas'));
const TransferenciasAprobarPage = lazy(() => import('@pages/trazabilidad/Transferencias/Aprobar'));
const TransferenciasListarPage = lazy(() => import('@pages/trazabilidad/Transferencias/Listar'));

export const trazabilidad = [
    // Módulo raíz: Traspasos y Transferencias
    {
        path: '/trazabilidad',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA',
        menu: {
            label: 'Trazabilidad',
            module: 'TRA',
            order: 5, // Después de Inscripciones, antes de Calificaciones
        },
    },
    // Submenu: Traspasos (misma ciudad/región)
    {
        path: '/trazabilidad/traspasos',
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
        path: '/trazabilidad/traspasos/listar',
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
        path: '/trazabilidad/traspasos/solicitar',
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
        path: '/trazabilidad/traspasos/recibir',
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
        path: '/trazabilidad/traspasos/convalidar-notas',
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
        path: '/trazabilidad/traspasos/aprobar',
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
        path: '/trazabilidad/transferencias',
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
        path: '/trazabilidad/transferencias/listar',
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
        path: '/trazabilidad/transferencias/solicitar',
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
        path: '/trazabilidad/transferencias/recibir',
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
        path: '/trazabilidad/transferencias/convalidar-notas',
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
        path: '/trazabilidad/transferencias/aprobar',
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

export default trazabilidad;
