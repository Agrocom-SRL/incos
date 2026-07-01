import { lazy } from 'react';

export const UsuariosListConnector = lazy(() => import('@modules/seguridad/usuarios/connectors/UsuariosListConnector.jsx'));
export const UsuarioDetailConnector = lazy(() => import('@modules/seguridad/usuarios/connectors/UsuarioDetailConnector.jsx'));
export const UsuarioCreateConnector = lazy(() => import('@modules/seguridad/usuarios/connectors/UsuarioCreateConnector.jsx'));
