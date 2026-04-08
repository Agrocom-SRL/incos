// src/presentation/modules/gestiones/routes.jsx
/**
 * Rutas del módulo de Gestiones
 *
 * Incluye rutas con path bajo /inscripciones/* (gestión institucional, no flujo MAT individual).
 */

import { UnderConstruction } from '@components/pages';

export const gestionesRoutes = [
    {
        path: '/gestiones',
        element: null,
        key: 'GES',
        menu: null,
    },
    {
        path: '/gestiones/actual',
        element: <UnderConstruction />,
        key: 'GES-ACTUAL',
        permiso: 'institucional.gestion.actual',
        accion: 'LISTAR',
        menu: {
            label: 'Gestión Actual',
            module: 'INST',
            parent: 'INST',
            order: 1,
        },
    },
    {
        path: '/gestiones/cronograma',
        element: <UnderConstruction />,
        key: 'GES-ETAPAS',
        permiso: 'institucional.gestion.cronograma',
        accion: 'LISTAR',
        menu: {
            label: 'Cronogramas',
            module: 'INST',
            parent: 'INST',
            order: 2,
        },
    },
    {
        path: '/gestiones/oferta',
        element: <UnderConstruction />,
        key: 'GES-OFERTA',
        permiso: 'institucional.gestion.oferta',
        accion: 'LISTAR',
        menu: {
            label: 'Oferta Académica',
            module: 'INST',
            parent: 'INST',
            order: 3,
        },
    },
    {
        path: '/gestiones/horarios/asignar',
        element: <UnderConstruction />,
        key: 'GES-HORARIOS-ASIGNAR',
        permiso: 'institucional.gestion.horarios',
        accion: 'LISTAR',
        menu: {
            label: 'Asignar Horarios',
            module: 'INST',
            parent: 'INST',
            order: 4,
        },
    },
    {
        path: '/inscripciones/materias/inscribir',
        element: <UnderConstruction />,
        key: 'GES-MAT-INSCRIBIR',
        permiso: 'institucional.oferta.gestionar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'GES-OFERTA',
    },
    {
        path: '/inscripciones/materias/curso',
        element: <UnderConstruction />,
        key: 'GES-MAT-CURSO',
        permiso: 'institucional.oferta.gestionar',
        accion: 'EDITAR',
        menu: null,
        breadcrumbParent: 'GES-OFERTA',
    },
    {
        path: '/inscripciones/horario',
        element: <UnderConstruction />,
        key: 'GES-HORARIO-GEN',
        permiso: 'institucional.horario.asignar',
        accion: 'CREAR',
        menu: null,
        breadcrumbParent: 'GES-HORARIOS-ASIGNAR',
    },
    {
        path: '/gestiones/pasadas',
        element: <UnderConstruction />,
        key: 'GES-LIST',
        permiso: 'institucional.gestion.pasadas',
        accion: 'LISTAR',
        menu: {
            label: 'Gestiones Pasadas',
            module: 'INST',
            parent: 'INST',
            order: 5,
        },
    },
];

export default gestionesRoutes;
