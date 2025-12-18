// src/router/modules/estudiantes.routes.js
import { lazy } from 'react';

// Lazy loading de componentes - se crearán las páginas después
const EstudiantesListPage = lazy(() => import('@pages/estudiantes/list'));
const EstudiantesRegistrarPage = lazy(() => import('@estudiantes/pages/registrar'));
const BecasAsignarPage = lazy(() => import('@pages/estudiantes/becas/asignar'));
const BecasAprobarPage = lazy(() => import('@pages/estudiantes/becas/aprobar'));
const BecasListPage = lazy(() => import('@pages/estudiantes/becas/list'));
const LicenciasSolicitarPage = lazy(() => import('@pages/estudiantes/licencias/solicitar'));
const LicenciasAprobarPage = lazy(() => import('@pages/estudiantes/licencias/aprobar'));
const LicenciasListPage = lazy(() => import('@pages/estudiantes/licencias/list'));
const DocumentosVerPage = lazy(() => import('@pages/estudiantes/documentos/ver'));
const DocumentosVerificarPage = lazy(() => import('@pages/estudiantes/documentos/verificar'));
const DocumentosEstadoPage = lazy(() => import('@pages/estudiantes/documentos/estado'));

export const estudiantesRoutes = [
    // Módulo raíz: Estudiantes
    {
        path: '/estudiantes',
        element: <EstudiantesListPage />,
        key: 'EST',
        menu: {
            label: 'Estudiantes',
            module: 'EST',
            order: 2, // Módulo más usado, después de Dashboard
        },
    },
    // Listar (alias de la ruta principal)
    {
        path: '/estudiantes/listar',
        element: <EstudiantesListPage />,
        key: 'EST-LIST',
        menu: {
            label: 'Listar Estudiantes',
            module: 'EST',
            parent: 'EST',
            order: 1,
        },
    },
    // Registrar
    {
        path: '/estudiantes/registrar',
        element: <EstudiantesRegistrarPage />,
        key: 'EST-REGISTRAR',
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
            label: 'Listar Becas',
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
            label: 'Asignar Beca',
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
        element: <LicenciasListPage />,
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
        element: <LicenciasSolicitarPage />,
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
        element: <LicenciasAprobarPage />,
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
