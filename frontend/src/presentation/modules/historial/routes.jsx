// src/presentation/modules/historial/routes.jsx
/**
 * Rutas del módulo de Historial (dominio Académico).
 */

import { UnderConstruction } from '@components/pages';

export const historialRoutes = [
    {
        path: '/historial',
        element: null,
        key: 'ACA-HIS',
        menu: {
            label: 'Historial',
            module: 'ACA',
            parent: 'ACA',
            order: 5,
        },
    },
    {
        path: '/historial/folio',
        element: <UnderConstruction />,
        key: 'ACA-HIS-FOLIO',
        permiso: 'academico.historial.folio',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'ACA-HIS',
    },
    {
        path: '/historial/academico',
        element: <UnderConstruction />,
        key: 'ACA-HIS-ACADEMICO',
        permiso: 'academico.historial.academico',
        accion: 'LISTAR',
        menu: {
            label: 'Historial Académico',
            module: 'ACA',
            parent: 'ACA-HIS',
            order: 2,
            labelByRole: { ESTUDIANTE: 'Mi historial' },
        },
    },
    {
        path: '/historial/validar',
        element: <UnderConstruction />,
        key: 'ACA-HIS-VALIDAR',
        permiso: 'academico.historial.validar',
        accion: 'APROBAR',
        menu: null,
        breadcrumbParent: 'ACA-HIS',
    },
    {
        path: '/academico/avance',
        element: <UnderConstruction />,
        key: 'ACA-AVANCE',
        permiso: 'academico.avance',
        accion: 'LISTAR',
        menu: {
            label: 'Avance académico',
            module: 'ACA',
            parent: 'ACA',
            order: 6,
            labelByRole: { ESTUDIANTE: 'Mi avance' },
        },
    },
];

export default historialRoutes;
