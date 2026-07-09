import { lazy } from 'react';

export const RolesListConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolesListConnector.jsx'));
export const RolDetailConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolDetailConnector.jsx'));
export const RolPermisosConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolPermisosConnector.jsx'));
export const RolFormConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolFormConnector.jsx'));
