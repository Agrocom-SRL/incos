// src/router/modules/estudiantes.routes.js
import { lazy } from 'react';

// Lazy loading de componentes - se crearán las páginas después
const EstudiantesListPage = lazy(() => import('@pages/Estudiantes/List'));
const EstudiantesCreatePage = lazy(() => import('@pages/Estudiantes/Create'));
const EstudiantesEstadoPage = lazy(() => import('@pages/Estudiantes/Estado'));
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
    {
        path: '/estudiantes',
        element: <EstudiantesListPage />,
        key: 'EST-LIST',
    },
    {
        path: '/estudiantes/listar',
        element: <EstudiantesListPage />,
        key: 'EST-LIST',
    },
    {
        path: '/estudiantes/registrar',
        element: <EstudiantesCreatePage />,
        key: 'EST-CREATE',
    },
    {
        path: '/estudiantes/estado',
        element: <EstudiantesEstadoPage />,
        key: 'EST-ESTADO',
    },
    // Becas
    {
        path: '/estudiantes/becas/asignar',
        element: <BecasAsignarPage />,
        key: 'EST-BECAS-ASIGNAR',
    },
    {
        path: '/estudiantes/becas/aprobar',
        element: <BecasAprobarPage />,
        key: 'EST-BECAS-APROBAR',
    },
    {
        path: '/estudiantes/becas/listar',
        element: <BecasListPage />,
        key: 'EST-BECAS-LIST',
    },
    // Licencias
    {
        path: '/estudiantes/licencias/solicitar',
        element: <LicenciasSolicitarPage />,
        key: 'EST-LICENCIAS-SOLICITAR',
    },
    {
        path: '/estudiantes/licencias/aprobar',
        element: <LicenciasAprobarPage />,
        key: 'EST-LICENCIAS-APROBAR',
    },
    {
        path: '/estudiantes/licencias/listar',
        element: <LicenciasListPage />,
        key: 'EST-LICENCIAS-LIST',
    },
    // Documentos
    {
        path: '/estudiantes/documentos/ver',
        element: <DocumentosVerPage />,
        key: 'EST-DOCUMENTOS-VER',
    },
    {
        path: '/estudiantes/documentos/verificar',
        element: <DocumentosVerificarPage />,
        key: 'EST-DOCUMENTOS-VERIFICAR',
    },
    {
        path: '/estudiantes/documentos/estado',
        element: <DocumentosEstadoPage />,
        key: 'EST-DOCUMENTOS-ESTADO',
    },
];

export default estudiantesRoutes;
