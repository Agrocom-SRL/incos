// src/presentation/modules/inscripciones/routes.jsx
/**
 * Rutas de matrículas / inscripciones (dominio Matrícula en sidebar).
 * Orden: rutas estáticas de /inscripciones/* antes de /inscripciones/:id.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';

const InscripcionesNuevaConnector = lazy(() => import('./connectors/InscripcionesNuevaConnector'));
const InscripcionesEditarConnector = lazy(() => import('./connectors/InscripcionesEditarConnector'));
const InscripcionesDetailConnector = lazy(() => import('./connectors/DetailConnector'));
const InscripcionesListConnector = lazy(() => import('./connectors/ListConnector'));

export const inscripcionesRoutes = [
    {
        path: '/matricula/listar',
        element: <InscripcionesListConnector />,
        key: 'MAT-LISTA',
        permiso: 'matricula.inscribir',
        accion: 'LISTAR',
        menu: {
            label: 'Matrículas',
            module: 'MAT',
            parent: 'MAT',
            order: 3,
        },
    },
    {
        path: '/matricula/nueva',
        element: <InscripcionesNuevaConnector />,
        key: 'MAT-NUEVA',
        permiso: 'matricula.inscribir',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'MAT-LISTA',
    },
    {
        path: '/inscripciones',
        element: <Navigate to="/matricula/listar" replace />,
        key: 'MAT-INS-REDIRECT-ROOT',
        menu: null,
    },
    {
        path: '/inscripciones/listar',
        element: <Navigate to="/matricula/listar" replace />,
        key: 'MAT-INS-REDIRECT-LIST',
        menu: null,
    },
    {
        path: '/inscripciones/nueva',
        element: <Navigate to="/matricula/nueva" replace />,
        key: 'MAT-INS-REDIRECT-NUEVA',
        menu: null,
    },
    {
        path: '/inscripciones/materias/validar',
        element: <UnderConstruction />,
        key: 'GES-MAT-VALIDAR',
        permiso: 'institucional.oferta.gestionar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'GES',
    },
    {
        path: '/inscripciones/:id',
        element: <InscripcionesDetailConnector />,
        key: 'MAT-INS-DETALLE',
        permiso: 'matricula.inscribir',
        accion: 'DETALLE',
        menu: null,
        breadcrumbParent: 'MAT-LISTA',
    },
    {
        path: '/inscripciones/:id/editar',
        element: <InscripcionesEditarConnector />,
        key: 'MAT-INS-EDITAR',
        permiso: 'matricula.inscripcion.editar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'MAT-LISTA',
    },
];

export default inscripcionesRoutes;
