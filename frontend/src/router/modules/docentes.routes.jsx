// src/router/modules/docentes.routes.js
import { lazy } from 'react';

const DocentesListPage = lazy(() => import('@pages/Docentes/List'));
const DocentesCreatePage = lazy(() => import('@pages/Docentes/Create'));
const DocentesAsignarPage = lazy(() => import('@pages/Docentes/Asignar'));
// Licencias de Docentes
const LicenciasListPage = lazy(() => import('@pages/Docentes/Licencias/List'));
const LicenciasSolicitarPage = lazy(() => import('@pages/Docentes/Licencias/Solicitar'));
const LicenciasAprobarPage = lazy(() => import('@pages/Docentes/Licencias/Aprobar'));

export const docentesRoutes = [
    // Módulo raíz: Docentes
    {
        path: '/docentes',
        element: null, // No tiene página propia, es solo un grupo
        key: 'DOC',
        menu: {
            label: 'Docentes',
            module: 'DOC',
            order: 6, // Usado regularmente
        },
    },
    {
        path: '/docentes/listar',
        element: <DocentesListPage />,
        key: 'DOC-LIST',
        menu: {
            label: 'Listar Docentes',
            module: 'DOC',
            parent: 'DOC',
            order: 1,
        },
    },
    {
        path: '/docentes/registrar',
        element: <DocentesCreatePage />,
        key: 'DOC-CREATE',
        menu: {
            label: 'Nuevo Docente',
            module: 'DOC',
            parent: 'DOC',
            order: 2,
        },
    },
    // Licencias - Grupo padre (PROPUESTA: Gestión de Licencias y Permisos de Docentes)
    {
        path: '/docentes/licencias',
        element: null, // No tiene página propia, es solo un grupo
        key: 'DOC-LICENCIAS',
        menu: {
            label: 'Licencias',
            module: 'DOC',
            parent: 'DOC',
            order: 3,
        },
    },
    {
        path: '/docentes/licencias/listar',
        element: <LicenciasListPage />,
        key: 'DOC-LICENCIAS-LIST',
        menu: {
            label: 'Listar Licencias',
            module: 'DOC',
            parent: 'DOC-LICENCIAS',
            order: 1, // Listar primero
        },
    },
    {
        path: '/docentes/licencias/solicitar',
        element: <LicenciasSolicitarPage />,
        key: 'DOC-LICENCIAS-SOLICITAR',
        menu: {
            label: 'Solicitar Licencia',
            module: 'DOC',
            parent: 'DOC-LICENCIAS',
            order: 2, // Crear/Solicitar segundo
        },
    },
    {
        path: '/docentes/licencias/aprobar',
        element: <LicenciasAprobarPage />,
        key: 'DOC-LICENCIAS-APROBAR',
        menu: {
            label: 'Aprobar Licencia',
            module: 'DOC',
            parent: 'DOC-LICENCIAS',
            order: 3, // Estados (Aprobar) tercero
        },
    },
    // Ruta sin menú (se accede desde Gestiones -> Oferta Académica)
    {
        path: '/docentes/asignar',
        element: <DocentesAsignarPage />,
        key: 'DOC-ASIGNAR',
        // Sin menu - se accede desde Gestiones -> Oferta Académica (asignar docentes a ofertas)
    },
];

export default docentesRoutes;
