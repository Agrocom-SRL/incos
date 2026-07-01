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
    // Sin ítem en el sidebar: el acceso a "Mi perfil" vive en el menú de usuario
    // del header (HeaderRight). La ruta sigue activa para cualquier sesión válida.
    menu: null,
  },
];

export default perfilRoutes;
