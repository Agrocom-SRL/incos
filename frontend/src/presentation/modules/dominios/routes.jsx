// src/presentation/modules/dominios/routes.jsx
/**
 * Raíces de dominio de negocio (solo menú; sin página).
 * Orden 2–8: Dashboard conserva order 1.
 * Nota: la ruta `/perfil` vive en su propio módulo (`@modules/perfil/routes.jsx`).
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
        key: 'DOC',
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
        path: '/capacitacion',
        element: null,
        key: 'CAP',
        menu: { label: 'Capacitación', module: 'CAP', order: 8 },
    },
    {
        path: '/titulacion',
        element: null,
        key: 'TIT',
        menu: { label: 'Titulación', module: 'TIT', order: 9 },
    },
    {
        path: '/configuracion-sistema',
        key: 'CFG',
        element: null,
        permiso: null,
        accion: null,
        menu: { label: 'Configuración', module: 'CFG', order: 10 },
    },
    {
        path: '/seguridad',
        element: null,
        key: 'SEG',
        menu: { label: 'Seguridad', module: 'SEG', order: 11 },
    },
];

export default dominiosRoutes;
