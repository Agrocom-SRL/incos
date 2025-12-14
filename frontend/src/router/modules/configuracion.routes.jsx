// src/router/modules/configuracion.routes.js
import { lazy } from 'react';

// Configuración/Maestros
const ConfiguracionCarrerasPage = lazy(() => import('@pages/Configuracion/Carreras'));
const ConfiguracionMateriasPage = lazy(() => import('@pages/Configuracion/Materias'));
const ConfiguracionPlanEstudiosPage = lazy(() => import('@pages/Configuracion/PlanEstudios'));
const ConfiguracionCursosPage = lazy(() => import('@pages/Configuracion/Cursos'));
const ConfiguracionTurnosPage = lazy(() => import('@pages/Configuracion/Turnos'));

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
    {
        path: '/configuracion/carreras',
        element: <ConfiguracionCarrerasPage />,
        key: 'CFG-CARRERAS',
        menu: {
            label: 'Carreras',
            module: 'CFG',
            parent: 'CFG',
            order: 1,
        },
    },
    {
        path: '/configuracion/materias',
        element: <ConfiguracionMateriasPage />,
        key: 'CFG-MATERIAS',
        menu: {
            label: 'Materias',
            module: 'CFG',
            parent: 'CFG',
            order: 2,
        },
    },
    {
        path: '/configuracion/plan-estudios',
        element: <ConfiguracionPlanEstudiosPage />,
        key: 'CFG-PLAN',
        menu: {
            label: 'Plan de Estudios',
            module: 'CFG',
            parent: 'CFG',
            order: 3,
        },
    },
    {
        path: '/configuracion/cursos',
        element: <ConfiguracionCursosPage />,
        key: 'CFG-CURSOS',
        menu: {
            label: 'Cursos/Paralelos',
            module: 'CFG',
            parent: 'CFG',
            order: 4,
        },
    },
    {
        path: '/configuracion/turnos',
        element: <ConfiguracionTurnosPage />,
        key: 'CFG-TURNOS',
        menu: {
            label: 'Turnos',
            module: 'CFG',
            parent: 'CFG',
            order: 5,
        },
    },
];

export default configuracionRoutes;
