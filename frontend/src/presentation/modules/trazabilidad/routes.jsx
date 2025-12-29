// src/presentation/modules/trazabilidad/routes.jsx
/**
 * Rutas del módulo de Trazabilidad
 * 
 * Single Responsibility: Define todas las rutas del módulo de trazabilidad
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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
        element: <UnderConstruction />,
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

