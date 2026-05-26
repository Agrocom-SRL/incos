/**
 * Navegación desde el dashboard: permite vista previa (resumen) pero bloquea
 * detalle/listados sin permiso RBAC, con notificación estándar.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useAuth } from '@application-auth';
import { findBestMatchingRoute } from '@navigation-services/routeMapper';
import { notifyAccessDenied } from '@navigation/utils/notifyAccessDenied.js';

const DETALLE_DENEGADO =
  'No tenés permiso para abrir el detalle de esta sección.';

export const useDashboardGuardedNavigate = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuth();
  const { notification } = App.useApp();

  const navigateIfPermiso = useCallback(
    (path, permiso, accion = 'LISTAR') => {
      if (permiso && !hasPermiso(permiso, accion)) {
        notifyAccessDenied(notification, DETALLE_DENEGADO);
        return false;
      }
      navigate(path);
      return true;
    },
    [navigate, hasPermiso, notification],
  );

  const navigateToPath = useCallback(
    (path) => {
      if (!path) return false;
      const pathname = String(path).split('?')[0].replace(/\/$/, '') || '/';
      const route = findBestMatchingRoute(pathname);
      if (route?.permiso && !hasPermiso(route.permiso, route.accion ?? 'LISTAR')) {
        notifyAccessDenied(notification, DETALLE_DENEGADO);
        return false;
      }
      navigate(path);
      return true;
    },
    [navigate, hasPermiso, notification],
  );

  return { navigateIfPermiso, navigateToPath };
};
