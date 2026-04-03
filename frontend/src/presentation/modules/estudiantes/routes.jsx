// src/presentation/modules/estudiantes/routes.jsx
/**
 * Rutas de admisión, becas y documentos (MAT). Licencias de estudiante: keys ACA-* (menú Académico).
 */

import { UnderConstruction } from '@components/pages';
import { ListConnector, RegisterConnector, DetailConnector, EditConnector, AsignarBecaConnector, BecasListConnector } from '@estudiantes/connectors';

export const estudiantesRoutes = [
    {
        path: '/matricula/admision',
        element: null,
        key: 'MAT-ADMISION',
        menu: { label: 'Admisión', module: 'MAT', parent: 'MAT', order: 1 },
    },
    {
        path: '/matricula/matriculas',
        element: null,
        key: 'MAT-MATRICULAS',
        menu: { label: 'Matrículas', module: 'MAT', parent: 'MAT', order: 2 },
    },
    {
        path: '/matricula/aportes',
        element: null,
        key: 'MAT-APORTES',
        menu: { label: 'Aportes', module: 'MAT', parent: 'MAT', order: 3 },
    },
    {
        path: '/matricula/becas',
        element: null,
        key: 'MAT-BECAS',
        menu: { label: 'Becas', module: 'MAT', parent: 'MAT', order: 4 },
    },
    {
        path: '/academico/licencias-estudiante',
        element: null,
        key: 'ACA-LIC-EST',
        menu: {
            label: 'Licencias de Estudiante',
            module: 'ACA',
            parent: 'ACA',
            order: 6,
        },
    },
    {
        path: '/estudiantes/registrar',
        element: <RegisterConnector />,
        key: 'MAT-ADM-NUEVA',
        permiso: 'matricula.admision.crear',
        menu: {
            label: 'Nueva Admisión',
            module: 'MAT',
            parent: 'MAT-ADMISION',
            order: 1,
        },
    },
    {
        path: '/estudiantes/listar',
        element: <ListConnector />,
        key: 'MAT-ADM-LISTAR',
        permiso: 'matricula.admision.ver',
        menu: {
            label: 'Listar Admisiones',
            module: 'MAT',
            parent: 'MAT-ADMISION',
            order: 2,
        },
    },
    {
        path: '/estudiantes/:id',
        element: <DetailConnector />,
        key: 'MAT-ADM-DETALLE',
        permiso: 'matricula.admision.ver',
        menu: null,
        breadcrumbParent: 'MAT-ADM-LISTAR',
    },
    {
        path: '/estudiantes/:id/editar',
        element: <EditConnector />,
        key: 'MAT-ADM-EDITAR',
        permiso: 'matricula.admision.editar',
        menu: null,
        breadcrumbParent: 'MAT-ADM-LISTAR',
    },
    {
        path: '/estudiantes/becas/listar',
        element: <BecasListConnector />,
        key: 'MAT-BEC-LISTAR',
        permiso: 'matricula.beca.ver',
        menu: {
            label: 'Listar Becas',
            module: 'MAT',
            parent: 'MAT-BECAS',
            order: 1,
        },
    },
    {
        path: '/estudiantes/becas/asignar',
        element: <AsignarBecaConnector />,
        key: 'MAT-BEC-ASIGNAR',
        permiso: 'matricula.beca.asignar',
        menu: null,
        breadcrumbParent: 'MAT-BECAS',
    },
    {
        path: '/estudiantes/becas/aprobar',
        element: <UnderConstruction />,
        key: 'MAT-BEC-APROBAR',
        permiso: 'matricula.beca.aprobar',
        menu: {
            label: 'Aprobar Beca',
            module: 'MAT',
            parent: 'MAT-BECAS',
            order: 2,
        },
    },
    {
        path: '/estudiantes/licencias/listar',
        element: <UnderConstruction />,
        key: 'ACA-LIC-EST-LIST',
        permiso: 'academico.licencia.ver',
        menu: {
            label: 'Listar Licencias',
            module: 'ACA',
            parent: 'ACA-LIC-EST',
            order: 1,
        },
    },
    {
        path: '/estudiantes/licencias/solicitar',
        element: <UnderConstruction />,
        key: 'ACA-LIC-EST-SOLICITAR',
        permiso: 'academico.licencia.crear',
        menu: null,
        breadcrumbParent: 'ACA-LIC-EST',
    },
    {
        path: '/estudiantes/licencias/aprobar',
        element: <UnderConstruction />,
        key: 'ACA-LIC-EST-APROBAR',
        permiso: 'academico.licencia.aprobar',
        menu: {
            label: 'Aprobar Licencia',
            module: 'ACA',
            parent: 'ACA-LIC-EST',
            order: 2,
        },
    },
    {
        path: '/estudiantes/documentos',
        element: <UnderConstruction />,
        key: 'MAT-DOCUMENTOS',
        permiso: 'matricula.documento.ver',
        menu: null,
        breadcrumbParent: 'MAT-ADM-LISTAR',
    },
];

export default estudiantesRoutes;
