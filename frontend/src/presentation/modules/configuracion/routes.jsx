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
        element: null, // No tiene página propia, es solo un grupo
        key: 'CFG',
        menu: {
            label: 'Configuración',
            module: 'INST',
            parent: 'INST',
            order: 2,
        },
    },
    // Submenu: Académico
    {
        path: '/configuracion/academico',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CFG-ACADEMICO',
        menu: {
            label: 'Académico',
            module: 'INST',
            parent: 'CFG',
            order: 1,
        },
    },
    {
        path: '/configuracion/academico/carreras',
        element: <CarrerasListConnector />,
        key: 'CFG-CARRERAS',
        permiso: 'institucional.config.academico.carreras',
        menu: {
            label: 'Carreras',
            module: 'INST',
            parent: 'CFG-ACADEMICO',
            order: 1,
        },
    },
    {
        path: '/configuracion/academico/materias',
        element: <MateriasListConnector />,
        key: 'CFG-MATERIAS',
        permiso: 'institucional.config.academico.materias',
        menu: {
            label: 'Materias',
            module: 'INST',
            parent: 'CFG-ACADEMICO',
            order: 2,
        },
    },
    {
        path: '/configuracion/academico/plan-estudios',
        element: <UnderConstruction />,
        key: 'CFG-PLAN',
        permiso: 'institucional.config.academico.plan',
        menu: {
            label: 'Plan de Estudios',
            module: 'INST',
            parent: 'CFG-ACADEMICO',
            order: 3,
        },
    },
    {
        path: '/configuracion/academico/cursos',
        element: <UnderConstruction />,
        key: 'CFG-CURSOS',
        permiso: 'institucional.config.academico.cursos',
        menu: {
            label: 'Cursos/Paralelos',
            module: 'INST',
            parent: 'CFG-ACADEMICO',
            order: 4,
        },
    },
    {
        path: '/configuracion/academico/turnos',
        element: <UnderConstruction />,
        key: 'CFG-TURNOS',
        permiso: 'institucional.config.academico.turnos',
        menu: {
            label: 'Turnos',
            module: 'INST',
            parent: 'CFG-ACADEMICO',
            order: 5,
        },
    },
    // Submenu: Documentación
    {
        path: '/configuracion/documentacion',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CFG-DOCUMENTACION',
        menu: {
            label: 'Documentación',
            module: 'INST',
            parent: 'CFG',
            order: 2,
        },
    },
    {
        path: '/configuracion/documentacion/inscripcion',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-INSCRIPCION',
        permiso: 'institucional.config.documentacion.inscripcion',
        menu: {
            label: 'Para la Inscripción',
            module: 'INST',
            parent: 'CFG-DOCUMENTACION',
            order: 1,
        },
    },
    {
        path: '/configuracion/documentacion/becas',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-BECAS',
        permiso: 'institucional.config.documentacion.becas',
        menu: {
            label: 'Para la Becas',
            module: 'INST',
            parent: 'CFG-DOCUMENTACION',
            order: 2,
        },
    },
    {
        path: '/configuracion/documentacion/pasantias',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-PASANTIAS',
        permiso: 'institucional.config.documentacion.pasantias',
        menu: {
            label: 'Para la Pasantías',
            module: 'INST',
            parent: 'CFG-DOCUMENTACION',
            order: 3,
        },
    },
    {
        path: '/configuracion/documentacion/traslado',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-TRASLADO',
        permiso: 'institucional.config.documentacion.traslado',
        menu: {
            label: 'Para la Traslado',
            module: 'INST',
            parent: 'CFG-DOCUMENTACION',
            order: 4,
        },
    },
    // Submenu: Datos Complementarios
    {
        path: '/configuracion/datos-complementarios',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CFG-DATOS-COMPLEMENTARIOS',
        menu: {
            label: 'Datos Complementarios',
            module: 'INST',
            parent: 'CFG',
            order: 3,
        },
    },
    {
        path: '/configuracion/datos-complementarios/discapacidad',
        element: <DiscapacidadesListConnector />,
        key: 'CFG-DISCAPACIDAD',
        permiso: 'institucional.config.complementario.discapacidad',
        menu: {
            label: 'Discapacidad',
            module: 'INST',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 1,
        },
    },
    {
        path: '/configuracion/datos-complementarios/apoderados',
        element: <UnderConstruction />,
        key: 'CFG-APODERADOS',
        permiso: 'institucional.config.complementario.apoderados',
        menu: {
            label: 'Apoderados',
            module: 'INST',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 2,
        },
    },
    {
        path: '/configuracion/datos-complementarios/idiomas',
        element: <UnderConstruction />,
        key: 'CFG-IDIOMAS',
        permiso: 'institucional.config.complementario.idiomas',
        menu: {
            label: 'Idiomas',
            module: 'INST',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 3,
        },
    },
    {
        path: '/configuracion/historial-actividades',
        element: <UnderConstruction />,
        key: 'CFG-HISTORIAL-ACTIVIDADES',
        permiso: 'institucional.config.historial_actividades',
        menu: {
            label: 'Historial de Actividades',
            module: 'INST',
            parent: 'CFG',
            order: 5,
        },
    },
];

export default configuracionRoutes;

