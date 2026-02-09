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
            module: 'CFG',
            order: 12, // Configuración del sistema, antes de Usuarios
        },
    },
    // Submenu: Académico
    {
        path: '/configuracion/academico',
        element: null, // No tiene página propia, es solo un grupo
        key: 'CFG-ACADEMICO',
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
        menu: {
            label: 'Carreras',
            module: 'CFG',
            parent: 'CFG-ACADEMICO',
            order: 1,
        },
    },
    {
        path: '/configuracion/academico/materias',
        element: <MateriasListConnector />,
        key: 'CFG-MATERIAS',
        menu: {
            label: 'Materias',
            module: 'CFG',
            parent: 'CFG-ACADEMICO',
            order: 2,
        },
    },
    {
        path: '/configuracion/academico/plan-estudios',
        element: <UnderConstruction />,
        key: 'CFG-PLAN',
        menu: {
            label: 'Plan de Estudios',
            module: 'CFG',
            parent: 'CFG-ACADEMICO',
            order: 3,
        },
    },
    {
        path: '/configuracion/academico/cursos',
        element: <UnderConstruction />,
        key: 'CFG-CURSOS',
        menu: {
            label: 'Cursos/Paralelos',
            module: 'CFG',
            parent: 'CFG-ACADEMICO',
            order: 4,
        },
    },
    {
        path: '/configuracion/academico/turnos',
        element: <UnderConstruction />,
        key: 'CFG-TURNOS',
        menu: {
            label: 'Turnos',
            module: 'CFG',
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
            module: 'CFG',
            parent: 'CFG',
            order: 2,
        },
    },
    {
        path: '/configuracion/documentacion/inscripcion',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-INSCRIPCION',
        menu: {
            label: 'Para la Inscripción',
            module: 'CFG',
            parent: 'CFG-DOCUMENTACION',
            order: 1,
        },
    },
    {
        path: '/configuracion/documentacion/becas',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-BECAS',
        menu: {
            label: 'Para la Becas',
            module: 'CFG',
            parent: 'CFG-DOCUMENTACION',
            order: 2,
        },
    },
    {
        path: '/configuracion/documentacion/pasantias',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-PASANTIAS',
        menu: {
            label: 'Para la Pasantías',
            module: 'CFG',
            parent: 'CFG-DOCUMENTACION',
            order: 3,
        },
    },
    {
        path: '/configuracion/documentacion/traslado',
        element: <UnderConstruction />,
        key: 'CFG-DOCUMENTACION-TRASLADO',
        menu: {
            label: 'Para la Traslado',
            module: 'CFG',
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
            module: 'CFG',
            parent: 'CFG',
            order: 3,
        },
    },
    {
        path: '/configuracion/datos-complementarios/discapacidad',
        element: <DiscapacidadesListConnector />,
        key: 'CFG-DISCAPACIDAD',
        menu: {
            label: 'Discapacidad',
            module: 'CFG',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 1,
        },
    },
    {
        path: '/configuracion/datos-complementarios/apoderados',
        element: <UnderConstruction />,
        key: 'CFG-APODERADOS',
        menu: {
            label: 'Apoderados',
            module: 'CFG',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 2,
        },
    },
    {
        path: '/configuracion/datos-complementarios/idiomas',
        element: <UnderConstruction />,
        key: 'CFG-IDIOMAS',
        menu: {
            label: 'Idiomas',
            module: 'CFG',
            parent: 'CFG-DATOS-COMPLEMENTARIOS',
            order: 3,
        },
    },
    // Historial de Actividades
    {
        path: '/configuracion/historial-actividades',
        element: <UnderConstruction />,
        key: 'CFG-HISTORIAL-ACTIVIDADES',
        menu: {
            label: 'Historial de Actividades',
            module: 'CFG',
            parent: 'CFG',
            order: 4,
        },
    },
];

export default configuracionRoutes;

