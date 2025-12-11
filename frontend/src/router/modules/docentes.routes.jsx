// src/router/modules/docentes.routes.js
import { lazy } from 'react';

const DocentesListPage = lazy(() => import('@pages/Docentes/List'));
const DocentesCreatePage = lazy(() => import('@pages/Docentes/Create'));
const DocentesAsignarPage = lazy(() => import('@pages/Docentes/Asignar'));

export const docentesRoutes = [
    {
        path: '/docentes/listar',
        element: <DocentesListPage />,
        key: 'DOC-LIST',
    },
    {
        path: '/docentes/registrar',
        element: <DocentesCreatePage />,
        key: 'DOC-CREATE',
    },
    {
        path: '/docentes/asignar',
        element: <DocentesAsignarPage />,
        key: 'DOC-ASIGNAR',
    },
];

export default docentesRoutes;
