/**
 * Conector genérico de entrada a módulo: elige pantalla según menu.landingStack + permisos.
 *
 * Usar en routes.jsx cuando un ítem de menú (permiso ingreso) agrupa varias pantallas
 * hijas con permisos distintos (coordinación vs vista propia, admin vs alumno, etc.).
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { getAllRoutes } from '@routes';
import { resolveModuleLanding } from '../utils/resolveModuleLanding.js';
import AccessDeniedRedirect from './AccessDeniedRedirect.jsx';

const ModuleEntryConnector = ({
  menuKey,
  inlineElement = null,
  fallbackPath = '/dashboard',
}) => {
  const { hasPermiso } = useAuth();

  const route = getAllRoutes().find((r) => r.key === menuKey);
  const landingStack = route?.menu?.landingStack;
  const landing = resolveModuleLanding(landingStack, hasPermiso);

  if (landing?.type === 'redirect') {
    return <Navigate to={landing.path} replace />;
  }

  if (landing?.type === 'inline' && inlineElement) {
    return inlineElement;
  }

  return (
    <AccessDeniedRedirect
      to={fallbackPath}
      description="No tiene permiso para abrir ninguna pantalla de este módulo."
    />
  );
};

export default ModuleEntryConnector;
