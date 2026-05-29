// src/presentation/modules/institucional/routes.jsx
/**
 * Rutas del módulo Institucional.
 *
 * Base del flujo operativo por gestión: oferta, cronogramas y horarios.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';
import {
    ArmadoGestionRedirectFromParaleloPath,
    ArmadoGestionRedirectFromPlantillaPath,
} from './horarios/connectors/HorariosArmadoEntryRedirects';

const GestionHorariosConnector = lazy(() => import('./horarios/connectors'));
const GestionHorariosArmadoConnector = lazy(() => import('./horarios/connectors/ArmadoConnector'));
const GestionHorariosAulasConnector = lazy(() => import('./horarios/connectors/AulasConnector'));
const GestionHorariosPublicacionConnector = lazy(() => import('./horarios/connectors/PublicacionConnector'));
const OfertaAcademicaConnector = lazy(() => import('./oferta/connectors/OfertaAcademicaConnector'));

const INST_OFERTA_ACADEMICA_PERMISOS = [
    'institucional.oferta.gestion-plan',
    'institucional.oferta.paralelo-gestion',
    'institucional.oferta.cursos',
];

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
        element: <OfertaAcademicaConnector />,
        key: 'INST-OFERTA-ACADEMICA',
        permisoAny: INST_OFERTA_ACADEMICA_PERMISOS,
        accion: 'LISTAR',
        menu: {
            label: 'Oferta Académica',
            module: 'INST',
            parent: 'INST',
            order: 3,
        },
    },
    {
        path: '/institucional/oferta-academica',
        element: <Navigate to="/institucional/oferta" replace />,
        key: 'INST-OFERTA-LEGACY-REDIRECT',
        menu: null,
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
        element: <ArmadoGestionRedirectFromPlantillaPath />,
        key: 'INST-HORARIO-PLANTILLA',
        permiso: 'institucional.horario.plantilla',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/paralelo/:paraleloId/gestion',
        element: <ArmadoGestionRedirectFromParaleloPath />,
        key: 'INST-HORARIO-PARALELO-GESTION',
        permiso: 'institucional.gestion.horarios',
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
        path: '/institucional/horarios/aulas',
        element: <GestionHorariosAulasConnector />,
        key: 'INST-HORARIO-AULAS',
        permiso: 'institucional.gestion.horarios',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/asignacion-docente',
        element: <UnderConstruction />,
        key: 'INST-HORARIO-ASIGNACION-DOCENTE',
        permiso: 'institucional.horarios.asignacion-docente',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'INST-HORARIOS',
    },
    {
        path: '/institucional/horarios/carga-docentes/:gestionId',
        element: <UnderConstruction />,
        key: 'INST-HORARIO-CARGA-DOCENTES',
        permiso: 'institucional.horarios.carga-docente',
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
