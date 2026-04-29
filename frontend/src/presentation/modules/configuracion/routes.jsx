// src/presentation/modules/configuracion/routes.jsx
/**
 * Rutas del módulo de Configuración
 * 
 * Single Responsibility: Define todas las rutas del módulo de configuración
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

// Lazy loading de los connectors
const CarrerasListConnector = lazy(() => import('./academico/carreras/connectors'));
const MateriasListConnector = lazy(() => import('./academico/materias/connectors'));
const DiscapacidadesListConnector = lazy(() => import('./complementario/discapacidad/connectors'));

export const configuracionRoutes = [
    // Módulo raíz: Configuración
    {
        path: '/configuracion',
        element: <UnderConstruction />, // Fallback navegable para accesos directos
        key: 'CFG-ROOT',
        menu: null,
    },
    // Submenu: Académico
    {
        path: '/configuracion/academico',
        element: <UnderConstruction />,
        key: 'CFG-ACADEMICO',
        permiso: null,
        accion: null,
        menu: {
            label: 'Académico',
            module: 'CFG',
            parent: 'CFG',
            order: 1,
        },
    },
    {
        path: '/configuracion/academico/carreras',
        element: <CarrerasListConnector />,
        key: 'CFG-CARRERAS',
        permiso: 'cfg.academico.carreras',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-ACADEMICO',
    },
    {
        path: '/configuracion/academico/materias',
        element: <MateriasListConnector />,
        key: 'CFG-MATERIAS',
        permiso: 'cfg.academico.materias',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-ACADEMICO',
    },
    {
        path: '/configuracion/academico/plan-estudios',
        element: <UnderConstruction />,
        key: 'CFG-PLAN',
        permiso: 'cfg.academico.plan',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-ACADEMICO',
    },
    {
        path: '/configuracion/academico/cursos',
        element: <UnderConstruction />,
        key: 'CFG-CURSOS',
        permiso: 'cfg.academico.cursos',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-ACADEMICO',
    },
    {
        path: '/configuracion/academico/turnos',
        element: <UnderConstruction />,
        key: 'CFG-TURNOS',
        permiso: 'cfg.academico.turnos',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-ACADEMICO',
    },
    // Submenu: Documentación
    {
        path: '/configuracion/documentacion',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION',
        permiso: null,
        accion: null,
        menu: {
            label: 'Documentación',
            module: 'CFG',
            parent: 'CFG',
            order: 2,
        },
    },
    {
        path: '/configuracion/documentacion/inscripcion',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-INSCRIPCION',
        permiso: 'cfg.documentacion.inscripcion',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/becas',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-BECAS',
        permiso: 'cfg.documentacion.becas',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/pasantias',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-PASANTIAS',
        permiso: 'cfg.documentacion.pasantias',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/traslado',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-TRASLADO',
        permiso: 'cfg.documentacion.traslado',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    // Submenu: Datos Complementarios
    {
        path: '/configuracion/datos-complementarios',
        element: <UnderConstruction />,
        key: 'CFG-COMPLEMENTARIO',
        permiso: null,
        accion: null,
        menu: {
            label: 'Datos Complementarios',
            module: 'CFG',
            parent: 'CFG',
            order: 3,
        },
    },
    {
        path: '/configuracion/datos-complementarios/discapacidad',
        element: <DiscapacidadesListConnector />,
        key: 'CFG-DISCAPACIDAD',
        permiso: 'cfg.complementario.discapacidad',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/datos-complementarios/apoderados',
        element: <UnderConstruction />,
        key: 'CFG-APODERADOS',
        permiso: 'cfg.complementario.apoderados',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/datos-complementarios/idiomas',
        element: <UnderConstruction />,
        key: 'CFG-IDIOMAS',
        permiso: 'cfg.complementario.idiomas',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/convenios',
        element: <UnderConstruction />,
        key: 'CFG-CONVENIOS',
        permiso: 'cfg.convenios.ver',
        accion: 'LISTAR',
        menu: {
            label: 'Empresas y Convenios',
            module: 'CFG',
            parent: 'CFG',
            order: 4,
        },
    },
    {
        path: '/configuracion/historial-actividades',
        element: <UnderConstruction />,
        key: 'CFG-HISTORIAL-ACTIVIDADES',
        permiso: 'cfg.historial_actividades',
        accion: 'LISTAR',
        menu: {
            label: 'Historial de Actividades',
            module: 'CFG',
            parent: 'CFG',
            order: 5,
        },
    },
];

export default configuracionRoutes;

