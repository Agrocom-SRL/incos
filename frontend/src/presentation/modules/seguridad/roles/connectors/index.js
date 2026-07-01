import { lazy } from 'react';

export const RolesListConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolesListConnector.jsx'));
export const RolPermisosConnector = lazy(() => import('@modules/seguridad/roles/connectors/RolPermisosConnector.jsx'));
