// src/router/modules/estudiantes.routes.js
import { lazy } from 'react';

// Lazy loading de componentes - se crearán las páginas después
const EstudiantesListPage = lazy(() => import('@pages/Estudiantes/List'));
const EstudiantesCreatePage = lazy(() => import('@pages/Estudiantes/Create'));
const BecasAsignarPage = lazy(() => import('@pages/Estudiantes/Becas/Asignar'));
const BecasAprobarPage = lazy(() => import('@pages/Estudiantes/Becas/Aprobar'));
const BecasListPage = lazy(() => import('@pages/Estudiantes/Becas/List'));
const LicenciasSolicitarPage = lazy(() => import('@pages/Estudiantes/Licencias/Solicitar'));
const LicenciasAprobarPage = lazy(() => import('@pages/Estudiantes/Licencias/Aprobar'));
const LicenciasListPage = lazy(() => import('@pages/Estudiantes/Licencias/List'));
const DocumentosVerPage = lazy(() => import('@pages/Estudiantes/Documentos/Ver'));
const DocumentosVerificarPage = lazy(() => import('@pages/Estudiantes/Documentos/Verificar'));
const DocumentosEstadoPage = lazy(() => import('@pages/Estudiantes/Documentos/Estado'));

export const estudiantesRoutes = [
    // Módulo raíz: Estudiantes
    {
        path: '/estudiantes',
        element: <EstudiantesListPage />,
        key: 'EST',
        menu: {
            label: 'Estudiantes',
            module: 'EST',
            order: 2,
        },
    },
    // Listar (alias de la ruta principal)
    {
        path: '/estudiantes/listar',
        element: <EstudiantesListPage />,
        key: 'EST-LIST',
        menu: {
            label: 'Listar',
            module: 'EST',
            parent: 'EST',
            order: 1,
        },
    },
    // Registrar
    {
        path: '/estudiantes/registrar',
        element: <EstudiantesCreatePage />,
        key: 'EST-CREATE',
        menu: {
            label: 'Nuevo Estudiante',
            module: 'EST',
            parent: 'EST',
            order: 2,
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
        element: <BecasListPage />,
        key: 'EST-BECAS-LIST',
        menu: {
            label: 'Listar',
            module: 'EST',
            parent: 'EST-BECAS',
            order: 1, // Listar primero
        },
    },
    {
        path: '/estudiantes/becas/asignar',
        element: <BecasAsignarPage />,
        key: 'EST-BECAS-ASIGNAR',
        menu: {
            label: 'Asignar',
            module: 'EST',
            parent: 'EST-BECAS',
            order: 2, // Crear/Asignar segundo
        },
    },
    {
        path: '/estudiantes/becas/aprobar',
        element: <BecasAprobarPage />,
        key: 'EST-BECAS-APROBAR',
        menu: {
            label: 'Aprobar',
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
        element: <LicenciasListPage />,
        key: 'EST-LICENCIAS-LIST',
        menu: {
            label: 'Listar',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 1, // Listar primero
        },
    },
    {
        path: '/estudiantes/licencias/solicitar',
        element: <LicenciasSolicitarPage />,
        key: 'EST-LICENCIAS-SOLICITAR',
        menu: {
            label: 'Solicitar',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 2, // Crear/Solicitar segundo
        },
    },
    {
        path: '/estudiantes/licencias/aprobar',
        element: <LicenciasAprobarPage />,
        key: 'EST-LICENCIAS-APROBAR',
        menu: {
            label: 'Aprobar',
            module: 'EST',
            parent: 'EST-LICENCIAS',
            order: 3, // Estados (Aprobar) tercero
        },
    },
    // Documentos - Solo listar (verificar y estado son acciones dentro de la lista)
    {
        path: '/estudiantes/documentos',
        element: <DocumentosVerPage />,
        key: 'EST-DOCUMENTOS',
        menu: {
            label: 'Documentos',
            module: 'EST',
            parent: 'EST',
            order: 6,
        },
    },
    // Rutas sin menú (acciones que se manejan dentro de la página de documentos)
    {
        path: '/estudiantes/documentos/verificar',
        element: <DocumentosVerificarPage />,
        key: 'EST-DOCUMENTOS-VERIFICAR',
        // Sin menu - se accede desde la página de documentos
    },
    {
        path: '/estudiantes/documentos/estado',
        element: <DocumentosEstadoPage />,
        key: 'EST-DOCUMENTOS-ESTADO',
        // Sin menu - se accede desde la página de documentos
    },
];

export default estudiantesRoutes;
