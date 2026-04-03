// src/presentation/modules/trazabilidad/routes.jsx
/**
 * Rutas de traspasos y transitabilidad (dominio Académico, nivel 2 directo bajo ACA).
 */

import { UnderConstruction } from '@components/pages';

export const trazabilidad = [
    {
        path: '/transitabilidad/traspasos',
        element: null,
        key: 'ACA-TRASPASOS',
        menu: {
            label: 'Traspasos',
            module: 'ACA',
            parent: 'ACA',
            order: 3,
        },
    },
    {
        path: '/transitabilidad/traspasos/listar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TRP-LIST',
        permiso: 'academico.trazabilidad.traspaso.ver',
        menu: {
            label: 'Listar Traspasos',
            module: 'ACA',
            parent: 'ACA-TRASPASOS',
            order: 1,
        },
    },
    {
        path: '/transitabilidad/traspasos/solicitar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TRP-SOLICITAR',
        permiso: 'academico.trazabilidad.traspaso.solicitar',
        menu: {
            label: 'Solicitar Traspaso (Salida)',
            module: 'ACA',
            parent: 'ACA-TRASPASOS',
            order: 2,
        },
    },
    {
        path: '/transitabilidad/traspasos/recibir',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TRP-RECIBIR',
        permiso: 'academico.trazabilidad.traspaso.recibir',
        menu: {
            label: 'Recibir Traspaso (Entrada)',
            module: 'ACA',
            parent: 'ACA-TRASPASOS',
            order: 3,
        },
    },
    {
        path: '/transitabilidad/traspasos/convalidar-notas',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TRP-CONVALIDAR',
        permiso: 'academico.trazabilidad.traspaso.convalidar',
        menu: {
            label: 'Convalidar Notas',
            module: 'ACA',
            parent: 'ACA-TRASPASOS',
            order: 4,
        },
    },
    {
        path: '/transitabilidad/traspasos/aprobar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TRP-APROBAR',
        permiso: 'academico.trazabilidad.traspaso.aprobar',
        menu: {
            label: 'Aprobar Traspaso',
            module: 'ACA',
            parent: 'ACA-TRASPASOS',
            order: 5,
        },
    },
    {
        path: '/transitabilidad/transitabilidad',
        element: null,
        key: 'ACA-TRANSIT',
        menu: {
            label: 'Transitabilidad',
            module: 'ACA',
            parent: 'ACA',
            order: 4,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/listar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TNS-LIST',
        permiso: 'academico.trazabilidad.transitabilidad.ver',
        menu: {
            label: 'Listar Transitabilidad',
            module: 'ACA',
            parent: 'ACA-TRANSIT',
            order: 1,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/solicitar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TNS-SOLICITAR',
        permiso: 'academico.trazabilidad.transitabilidad.solicitar',
        menu: {
            label: 'Solicitar Transitabilidad (Salida)',
            module: 'ACA',
            parent: 'ACA-TRANSIT',
            order: 2,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/recibir',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TNS-RECIBIR',
        permiso: 'academico.trazabilidad.transitabilidad.recibir',
        menu: {
            label: 'Recibir Transitabilidad (Entrada)',
            module: 'ACA',
            parent: 'ACA-TRANSIT',
            order: 3,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/convalidar-notas',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TNS-CONVALIDAR',
        permiso: 'academico.trazabilidad.transitabilidad.convalidar',
        menu: {
            label: 'Convalidar Notas',
            module: 'ACA',
            parent: 'ACA-TRANSIT',
            order: 4,
        },
    },
    {
        path: '/transitabilidad/transitabilidad/aprobar',
        element: <UnderConstruction />,
        key: 'ACA-TRA-TNS-APROBAR',
        permiso: 'academico.trazabilidad.transitabilidad.aprobar',
        menu: {
            label: 'Aprobar Transitabilidad',
            module: 'ACA',
            parent: 'ACA-TRANSIT',
            order: 5,
        },
    },
];

export default trazabilidad;
