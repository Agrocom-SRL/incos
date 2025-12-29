// src/presentation/modules/estudiantes/routes.jsx
/**
 * Rutas del módulo de Estudiantes
 * 
 * Single Responsibility: Define todas las rutas del módulo de estudiantes
 * 
 * Clean Architecture:
 * - Presentation Layer: Define rutas y metadata de UI (labels del menú, orden)
 * - Depende de: pages (dentro del mismo módulo), connectors
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

// Lazy loading del connector de listado (que incluye el Provider)
const EstudiantesListConnector = lazy(() => import('@estudiantes/connectors'));

export const estudiantesRoutes = [
    // Módulo raíz: Estudiantes (muestra la lista directamente)
    {
        path: '/estudiantes',
        element: <EstudiantesListConnector />,
        key: 'EST',
        menu: {
            label: 'Estudiantes',
            module: 'EST',
            order: 2, // Módulo más usado, después de Dashboard
        },
    },
    {
        path: '/estudiantes/listar',
        element: <EstudiantesListConnector />,
        key: 'EST-LIST',
        menu: {
            label: 'Listar Estudiantes',
            module: 'EST',
            parent: 'EST',
            order: 1,
        },
    },
    // Becas - Grupo padre
    {
        path: '/estudiantes/becas',
        element: null, // No tiene página propia, es solo un grupo
        key: 'EST-BECAS',
        menu: {
            label: 'Becas',
            module: 'EST',
            parent: 'EST',
            order: 3,
        },
    },
    {
        path: '/estudiantes/becas/listar',
        element: <UnderConstruction />,
        key: 'EST-BECAS-LIST',
        menu: {
            label: 'Listar Becas',
            module: 'EST',
            parent: 'EST-BECAS',
            order: 1, // Listar primero
        },
    },
    {
        path: '/estudiantes/becas/asignar',
        element: <UnderConstruction />,
        key: 'EST-BECAS-ASIGNAR',
        menu: {
            label: 'Asignar Beca',
            module: 'EST',
            parent: 'EST-BECAS',
            order: 2, // Crear/Asignar segundo
        },
    },
    {
        path: '/estudiantes/becas/aprobar',
        element: <UnderConstruction />,
        key: 'EST-BECAS-APROBAR',
        menu: {
            label: 'Aprobar Beca',
            module: 'EST',
            parent: 'EST-BECAS',
            order: 3, // Estados (Aprobar) tercero
        },
    },
    // Licencias - Grupo padre
    {
        path: '/estudiantes/licencias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'EST-LICENCIAS',
        menu: {
            label: 'Licencias',
            module: 'EST',
            parent: 'EST',
            order: 4,
        },
    },
    {
        path: '/estudiantes/licencias/listar',
        element: <UnderConstruction />,
        key: 'EST-LICENCIAS-LIST',
        menu: {
            label: 'Listar Licencias',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 1, // Listar primero
        },
    },
    {
        path: '/estudiantes/licencias/solicitar',
        element: <UnderConstruction />,
        key: 'EST-LICENCIAS-SOLICITAR',
        menu: {
            label: 'Solicitar Licencia',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 2, // Crear/Solicitar segundo
        },
    },
    {
        path: '/estudiantes/licencias/aprobar',
        element: <UnderConstruction />,
        key: 'EST-LICENCIAS-APROBAR',
        menu: {
            label: 'Aprobar Licencia',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 3, // Estados (Aprobar) tercero
        },
    },
    // Documentos - Solo listar (verificar y estado son acciones dentro de la lista)
    {
        path: '/estudiantes/documentos',
        element: <UnderConstruction />,
        key: 'EST-DOCUMENTOS',
        menu: {
            label: 'Documentos',
            module: 'EST',
            parent: 'EST',
            order: 6,
        },
    },
    // Rutas sin menú (acciones que se manejan dentro de la página de documentos)
];

export default estudiantesRoutes;
