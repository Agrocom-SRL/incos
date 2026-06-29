// src/presentation/modules/perfil/routes.jsx
/**
 * Ruta del módulo Perfil (PERFIL): "Mi perfil" del usuario autenticado.
 * Sin permiso RBAC: disponible para cualquier sesión válida (solo authenticate).
 */

import { PerfilConnector } from '@modules/perfil/connectors';

export const perfilRoutes = [
  {
    path: '/perfil',
    element: <PerfilConnector />,
    key: 'PERFIL',
    permiso: null,
    accion: null,
    menu: { label: 'Mi perfil', module: 'PERFIL', order: 10 },
  },
];

export default perfilRoutes;
