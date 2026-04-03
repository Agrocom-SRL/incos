// src/presentation/modules/calificaciones/routes.jsx
/**
 * Rutas del módulo de Calificaciones (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const calificacionesRoutes = [
    {
        path: '/calificaciones',
        element: null,
        key: 'ACA-CAL',
        menu: {
            label: 'Calificaciones',
            module: 'ACA',
            parent: 'ACA',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar',
        element: null,
        key: 'ACA-CAL-REGISTRAR',
        menu: {
            label: 'Registrar',
            module: 'ACA',
            parent: 'ACA-CAL',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar/parcial',
        element: <UnderConstruction />,
        key: 'ACA-CAL-REG-PARCIAL',
        permiso: 'academico.calificacion.registrar.parcial',
        menu: {
            label: 'Nota de Parciales',
            module: 'ACA',
            parent: 'ACA-CAL-REGISTRAR',
            order: 1,
        },
    },
    {
        path: '/calificaciones/registrar/practico',
        element: <UnderConstruction />,
        key: 'ACA-CAL-REG-PRACTICO',
        permiso: 'academico.calificacion.registrar.practico',
        menu: {
            label: 'Notas de Prácticos',
            module: 'ACA',
            parent: 'ACA-CAL-REGISTRAR',
            order: 2,
        },
    },
    {
        path: '/calificaciones/registrar/recuperatorio',
        element: <UnderConstruction />,
        key: 'ACA-CAL-REG-RECUP',
        permiso: 'academico.calificacion.registrar.recuperatorio',
        menu: {
            label: 'Recuperatorio',
            module: 'ACA',
            parent: 'ACA-CAL-REGISTRAR',
            order: 3,
        },
    },
    {
        path: '/calificaciones/curso',
        element: <UnderConstruction />,
        key: 'ACA-CAL-CURSO',
        permiso: 'academico.calificacion.curso',
        menu: {
            label: 'Notas Por Curso',
            module: 'ACA',
            parent: 'ACA-CAL',
            order: 2,
        },
    },
    {
        path: '/calificaciones/periodo',
        element: <UnderConstruction />,
        key: 'ACA-CAL-PERIODO',
        permiso: 'academico.calificacion.periodo',
        menu: {
            label: 'Entregar Notas',
            module: 'ACA',
            parent: 'ACA-CAL',
            order: 3,
        },
    },
    {
        path: '/calificaciones/modificar',
        element: <UnderConstruction />,
        key: 'ACA-CAL-MODIFICAR',
        permiso: 'academico.calificacion.modificar',
        menu: null,
        breadcrumbParent: 'ACA-CAL',
    },
];

export default calificacionesRoutes;
