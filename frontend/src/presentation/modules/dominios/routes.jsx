// src/presentation/modules/dominios/routes.jsx
/**
 * Raíces de dominio de negocio (solo menú; sin página).
 * Orden 2–8: Dashboard conserva order 1.
 */

export const dominiosRoutes = [
    {
        path: '/matricula',
        element: null,
        key: 'MAT',
        menu: { label: 'Matrícula', module: 'MAT', order: 2 },
    },
    {
        path: '/academico',
        element: null,
        key: 'ACA',
        menu: { label: 'Académico', module: 'ACA', order: 3 },
    },
    {
        path: '/docentes-dominio',
        element: null,
        key: 'DOC-DOM',
        menu: { label: 'Docentes', module: 'DOC', order: 4 },
    },
    {
        path: '/finanzas',
        element: null,
        key: 'FIN',
        menu: { label: 'Finanzas', module: 'FIN', order: 5 },
    },
    {
        path: '/institucional',
        element: null,
        key: 'INST',
        menu: { label: 'Institucional', module: 'INST', order: 6 },
    },
    {
        path: '/reportes-dominio',
        element: null,
        key: 'REP-DOM',
        menu: { label: 'Reportes', module: 'REP', order: 7 },
    },
    {
        path: '/seguridad',
        element: null,
        key: 'SEG',
        menu: { label: 'Seguridad', module: 'SEG', order: 8 },
    },
];

export default dominiosRoutes;
