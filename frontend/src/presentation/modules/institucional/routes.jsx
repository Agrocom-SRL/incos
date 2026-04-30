// src/presentation/modules/institucional/routes.jsx
/**
 * Rutas del módulo Institucional.
 *
 * Base del flujo operativo por gestión: oferta, cronogramas y horarios.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const GestionHorariosConnector = lazy(() => import('./horarios/connectors'));
const GestionHorariosPlantillaConnector = lazy(() => import('./horarios/connectors/PlantillaConnector'));
const GestionHorariosArmadoConnector = lazy(() => import('./horarios/connectors/ArmadoConnector'));
const GestionHorariosConflictosConnector = lazy(() => import('./horarios/connectors/ConflictosConnector'));
const GestionHorariosPublicacionConnector = lazy(() => import('./horarios/connectors/PublicacionConnector'));

export const institucionalRoutes = [
    {
        path: '/institucional',
        element: <UnderConstruction />,
        key: 'INST-ROOT',
        menu: null,
    },
    {
        path: '/institucional/actual',
        element: <UnderConstruction />,
        key: 'INST-GESTION-ACTUAL',
        permiso: 'institucional.gestion.actual',
        accion: 'LISTAR',
        menu: {
            label: 'Gestión Actual',
            module: 'INST',
            parent: 'INST',
            order: 1,
        },
    },
    {
        path: '/institucional/cronogramas',
        element: <UnderConstruction />,
        key: 'INST-CRONOGRAMAS',
        permiso: 'institucional.gestion.cronograma',
        accion: 'LISTAR',
        menu: {
            label: 'Cronogramas',
            module: 'INST',
            parent: 'INST',
            order: 2,
        },
    },
    {
        path: '/institucional/oferta',
        element: <UnderConstruction />,
        key: 'INST-OFERTA-ACADEMICA',
        permiso: 'institucional.gestion.oferta',
        accion: 'LISTAR',
        menu: {
            label: 'Oferta Académica',
            module: 'INST',
            parent: 'INST',
            order: 3,
        },
    },
    {
        path: '/institucional/horarios',
        element: <GestionHorariosConnector />,
        key: 'INST-HORARIOS',
        permiso: 'institucional.gestion.horarios',
        accion: 'LISTAR',
        menu: {
            label: 'Gestión de Horarios',
            module: 'INST',
            parent: 'INST',
            order: 4,
        },
    },
    {
        path: '/institucional/oferta/inscribir',
        element: <UnderConstruction />,
        key: 'INST-OFERTA-MAT-INSCRIBIR',
        permiso: 'institucional.oferta.gestionar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'INST-OFERTA-ACADEMICA',
    },
    {
        path: '/institucional/oferta/curso',
        element: <UnderConstruction />,
        key: 'INST-OFERTA-MAT-CURSO',
        permiso: 'institucional.oferta.gestionar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'INST-OFERTA-ACADEMICA',
    },
    {
        path: '/institucional/horarios/generar',
        element: <UnderConstruction />,
        key: 'INST-HORARIO-GENERAR',
        permiso: 'institucional.horario.asignar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/plantilla',
        element: <GestionHorariosPlantillaConnector />,
        key: 'INST-HORARIO-PLANTILLA',
        permiso: 'institucional.horario.plantilla',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/armado',
        element: <GestionHorariosArmadoConnector />,
        key: 'INST-HORARIO-ARMADO',
        permiso: 'institucional.horario.armado',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/conflictos',
        element: <GestionHorariosConflictosConnector />,
        key: 'INST-HORARIO-CONFLICTOS',
        permiso: 'institucional.horario.conflictos',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/publicacion',
        element: <GestionHorariosPublicacionConnector />,
        key: 'INST-HORARIO-PUBLICACION',
        permiso: 'institucional.horario.publicacion',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/pasadas',
        element: <UnderConstruction />,
        key: 'INST-GESTIONES-PASADAS',
        permiso: 'institucional.gestion.pasadas',
        accion: 'LISTAR',
        menu: {
            label: 'Gestiones Pasadas',
            module: 'INST',
            parent: 'INST',
            order: 5,
        },
    },
];

export default institucionalRoutes;
