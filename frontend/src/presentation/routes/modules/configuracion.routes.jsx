// src/router/modules/configuracion.routes.js
import { lazy } from 'react';

// Configuración Académica
const ConfiguracionCarrerasPage = lazy(() => import('@pages/Configuracion/Carreras'));
const ConfiguracionMateriasPage = lazy(() => import('@pages/Configuracion/Materias'));
const ConfiguracionPlanEstudiosPage = lazy(() => import('@pages/Configuracion/PlanEstudios'));
const ConfiguracionCursosPage = lazy(() => import('@pages/Configuracion/Cursos'));
const ConfiguracionTurnosPage = lazy(() => import('@pages/Configuracion/Turnos'));

// Configuración Documentación
const ConfiguracionDocumentacionInscripcionPage = lazy(() => import('@pages/Configuracion/Documentacion/Inscripcion'));
const ConfiguracionDocumentacionBecasPage = lazy(() => import('@pages/Configuracion/Documentacion/Becas'));
const ConfiguracionDocumentacionPasantiasPage = lazy(() => import('@pages/Configuracion/Documentacion/Pasantias'));
const ConfiguracionDocumentacionTrasladoPage = lazy(() => import('@pages/Configuracion/Documentacion/Traslado'));
const ConfiguracionDocumentacionTransferenciaPage = lazy(() => import('@pages/Configuracion/Documentacion/Transferencia'));

// Configuración Datos Complementarios
const ConfiguracionDiscapacidadPage = lazy(() => import('@pages/Configuracion/DatosComplementarios/Discapacidad'));
const ConfiguracionApoderadosPage = lazy(() => import('@pages/Configuracion/DatosComplementarios/Apoderados'));
const ConfiguracionIdiomasPage = lazy(() => import('@pages/Configuracion/DatosComplementarios/Idiomas'));

// Configuración Historial
const ConfiguracionLogActividadesPage = lazy(() => import('@pages/Configuracion/Log/Actividades'));

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
        element: <ConfiguracionCarrerasPage />,
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
        element: <ConfiguracionMateriasPage />,
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
        element: <ConfiguracionPlanEstudiosPage />,
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
        element: <ConfiguracionCursosPage />,
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
        element: <ConfiguracionTurnosPage />,
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
        element: <ConfiguracionDocumentacionInscripcionPage />,
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
        element: <ConfiguracionDocumentacionBecasPage />,
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
        element: <ConfiguracionDocumentacionPasantiasPage />,
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
        element: <ConfiguracionDocumentacionTrasladoPage />,
        key: 'CFG-DOCUMENTACION-TRASLADO',
        menu: {
            label: 'Para la Traslado',
            module: 'CFG',
            parent: 'CFG-DOCUMENTACION',
            order: 4,
        },
    },
    {
        path: '/configuracion/documentacion/transferencia',
        element: <ConfiguracionDocumentacionTransferenciaPage />,
        key: 'CFG-DOCUMENTACION-TRANSFERENCIA',
        menu: {
            label: 'Para la Transferencia',
            module: 'CFG',
            parent: 'CFG-DOCUMENTACION',
            order: 5,
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
        element: <ConfiguracionDiscapacidadPage />,
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
        element: <ConfiguracionApoderadosPage />,
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
        element: <ConfiguracionIdiomasPage />,
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
        element: <ConfiguracionLogActividadesPage />,
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
