// src/presentation/modules/trazabilidad/routes.jsx
/**
 * Rutas del módulo de Transitabilidad
 * 
 * Single Responsibility: Define todas las rutas del módulo de transitabilidad
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { UnderConstruction } from '@components/pages';

export const trazabilidad = [
    // Módulo raíz: Transitabilidad
    {
        path: '/transitabilidad',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA',
        menu: {
            label: 'Transitabilidad',
            module: 'TRA',
            order: 5, // Después de Inscripciones, antes de Calificaciones
        },
    },
    // Submenu: Traspasos (misma ciudad/región)
    {
        path: '/transitabilidad/traspasos',
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
        path: '/transitabilidad/traspasos/listar',
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
        path: '/transitabilidad/traspasos/solicitar',
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
        path: '/transitabilidad/traspasos/recibir',
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
        path: '/transitabilidad/traspasos/convalidar-notas',
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
        path: '/transitabilidad/traspasos/aprobar',
        element: <UnderConstruction />,
        key: 'TRA-TRASPASOS-APROBAR',
        menu: {
            label: 'Aprobar Traspaso',
            module: 'TRA',
            parent: 'TRA-TRASPASOS',
            order: 5,
        },
    },
    // Submenu: Transitabilidad (otra ciudad/región)
    {
        path: '/transitabilidad/transitabilidad',
        element: null, // No tiene página propia, es solo un grupo
        key: 'TRA-TRANSFERENCIAS',
        menu: {
            label: 'Transitabilidad',
            module: 'TRA',
            parent: 'TRA',
            order: 2,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/listar',
        element: <UnderConstruction />,
        key: 'TRA-TRANSFERENCIAS-LIST',
        menu: {
            label: 'Listar Transitabilidad',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 1,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/solicitar',
        element: <UnderConstruction />,
        key: 'TRA-TRANSFERENCIAS-SOLICITAR',
        menu: {
            label: 'Solicitar Transitabilidad (Salida)',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 2,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/recibir',
        element: <UnderConstruction />,
        key: 'TRA-TRANSFERENCIAS-RECIBIR',
        menu: {
            label: 'Recibir Transitabilidad (Entrada)',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 3,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/convalidar-notas',
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
        path: '/transitabilidad/transitabilidad/aprobar',
        element: <UnderConstruction />,
        key: 'TRA-TRANSFERENCIAS-APROBAR',
        menu: {
            label: 'Aprobar Transitabilidad',
            module: 'TRA',
            parent: 'TRA-TRANSFERENCIAS',
            order: 5,
        },
    },
];

export default trazabilidad;

