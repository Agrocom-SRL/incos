/**
 * Redirige tras mostrar notificación de acceso denegado (403).
 * Usado por PrivateRoute y ModuleEntryConnector.
 */

import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { App } from 'antd';
import { notifyAccessDenied } from '../utils/notifyAccessDenied.js';

const AccessDeniedRedirect = ({ to = '/dashboard', description }) => {
  const { notification } = App.useApp();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    notifyAccessDenied(notification, description);
  }, [notification, description]);

  return <Navigate to={to} replace />;
};

export default AccessDeniedRedirect;
