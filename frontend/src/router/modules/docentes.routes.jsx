// src/router/modules/docentes.routes.js
import { lazy } from 'react';

const DocentesListPage = lazy(() => import('@pages/Docentes/List'));
const DocentesCreatePage = lazy(() => import('@pages/Docentes/Create'));
const DocentesAsignarPage = lazy(() => import('@pages/Docentes/Asignar'));

export const docentesRoutes = [
    // Módulo raíz: Docentes
    {
        path: '/docentes',
        element: null, // No tiene página propia, es solo un grupo
        key: 'DOC',
        menu: {
            label: 'Docentes',
            module: 'DOC',
            order: 6,
        },
    },
    {
        path: '/docentes/listar',
        element: <DocentesListPage />,
        key: 'DOC-LIST',
        menu: {
            label: 'Listar',
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
            label: 'Registrar',
            module: 'DOC',
            parent: 'DOC',
            order: 2,
        },
    },
    {
        path: '/docentes/asignar',
        element: <DocentesAsignarPage />,
        key: 'DOC-ASIGNAR',
        menu: {
            label: 'Asignar',
            module: 'DOC',
            parent: 'DOC',
            order: 3,
        },
    },
];

export default docentesRoutes;
