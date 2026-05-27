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

/** Visible si el rol tiene al menos un permiso hijo de la sección (menú + URL). Alineado con 54-seed-permisos.sql */
const CFG_ACADEMICO_PERMISOS = [
    'configuracion.carrera',
    'configuracion.materia',
    'configuracion.plan-estudio',
    'configuracion.plan-estudio.prerrequisitos',
];
const CFG_DOCUMENTACION_PERMISOS = [
    'configuracion.documentacion.inscripcion',
    'configuracion.documentacion.becas',
    'configuracion.documentacion.pasantias',
    'configuracion.documentacion.traslado',
];
const CFG_COMPLEMENTARIO_PERMISOS = [
    'configuracion.complementario.discapacidad',
    'configuracion.complementario.apoderados',
    'configuracion.complementario.idiomas',
];

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
        permisoAny: CFG_ACADEMICO_PERMISOS,
        accion: 'LISTAR',
        menu: {
            label: 'Académico',
            module: 'CFG',
            parent: 'CFG',
            order: 1,
        },
    },
    // Submenu: Documentación
    {
        path: '/configuracion/documentacion',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION',
        permiso: null,
        permisoAny: CFG_DOCUMENTACION_PERMISOS,
        accion: 'LISTAR',
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
        permiso: 'configuracion.documentacion.inscripcion',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/becas',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-BECAS',
        permiso: 'configuracion.documentacion.becas',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/pasantias',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-PASANTIAS',
        permiso: 'configuracion.documentacion.pasantias',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
        path: '/configuracion/documentacion/traslado',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-TRASLADO',
        permiso: 'configuracion.documentacion.traslado',
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
        permisoAny: CFG_COMPLEMENTARIO_PERMISOS,
        accion: 'LISTAR',
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
        permiso: 'configuracion.complementario.discapacidad',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/datos-complementarios/apoderados',
        element: <UnderConstruction />,
        key: 'CFG-APODERADOS',
        permiso: 'configuracion.complementario.apoderados',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/datos-complementarios/idiomas',
        element: <UnderConstruction />,
        key: 'CFG-IDIOMAS',
        permiso: 'configuracion.complementario.idiomas',
        accion: 'LISTAR',
        menu: null,
        breadcrumbParent: 'CFG-COMPLEMENTARIO',
    },
    {
        path: '/configuracion/convenios',
        element: <UnderConstruction />,
        key: 'CFG-CONVENIOS',
        permiso: 'configuracion.convenios',
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
        permiso: 'configuracion.historial-actividades',
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

