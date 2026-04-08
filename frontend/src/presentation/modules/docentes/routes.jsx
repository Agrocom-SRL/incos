// src/presentation/modules/docentes/routes.jsx
/**
 * Rutas del módulo de Docentes (dominio Docentes).
 */

import { UnderConstruction } from '@components/pages';

export const docentesRoutes = [
    {
        path: '/docentes/listar',
        element: <UnderConstruction />,
        key: 'DOC-LIST',
        permiso: 'docentes.ver',
        accion: 'LISTAR',
        menu: {
            label: 'Listar Docentes',
            module: 'DOC',
            parent: 'DOC-DOM',
            order: 1,
        },
    },
    {
        path: '/docentes/registrar',
        element: <UnderConstruction />,
        key: 'DOC-CREATE',
        permiso: 'docentes.crear',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'DOC-LIST',
    },
    {
        path: '/docentes/licencias',
        element: null,
        key: 'DOC-LIC',
        menu: {
            label: 'Licencias de Docente',
            module: 'DOC',
            parent: 'DOC-DOM',
            order: 3,
        },
    },
    {
        path: '/docentes/licencias/listar',
        element: <UnderConstruction />,
        key: 'DOC-LIC-LIST',
        permiso: 'docentes.licencia.ver',
        accion: 'LISTAR',
        menu: {
            label: 'Listar Licencias',
            module: 'DOC',
            parent: 'DOC-LIC',
            order: 1,
        },
    },
    {
        path: '/docentes/licencias/solicitar',
        element: <UnderConstruction />,
        key: 'DOC-LIC-SOLICITAR',
        permiso: 'docentes.licencia.crear',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'DOC-LIC',
    },
    {
        path: '/docentes/licencias/aprobar',
        element: <UnderConstruction />,
        key: 'DOC-LIC-APROBAR',
        permiso: 'docentes.licencia.aprobar',
        accion: 'APROBAR',
        menu: null,
        breadcrumbParent: 'DOC-LIC',
    },
    {
        path: '/docentes/asignar',
        element: <UnderConstruction />,
        key: 'DOC-ASIGNAR',
        permiso: 'docentes.asignar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'DOC-DOM',
    },
];

export default docentesRoutes;
