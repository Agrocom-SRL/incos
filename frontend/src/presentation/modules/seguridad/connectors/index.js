import { lazy } from 'react';

export const UsuariosListConnector = lazy(() => import('@modules/seguridad/connectors/UsuariosListConnector.jsx'));
export const UsuarioDetailConnector = lazy(() => import('@modules/seguridad/connectors/UsuarioDetailConnector.jsx'));
export const UsuarioCreateConnector = lazy(() => import('@modules/seguridad/connectors/UsuarioCreateConnector.jsx'));
export const UsuarioPermisosConnector = lazy(() => import('@modules/seguridad/connectors/UsuarioPermisosConnector.jsx'));
export const RolesListConnector = lazy(() => import('@modules/seguridad/connectors/RolesListConnector.jsx'));
export const RolPermisosConnector = lazy(() => import('@modules/seguridad/connectors/RolPermisosConnector.jsx'));
