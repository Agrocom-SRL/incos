import { useRouteError } from 'react-router-dom';
import { useAuth } from '../useAuth.js';
import { isRouteNotFoundError } from '../../utils/isRouteNotFoundError.js';
import { AUTH_NOT_FOUND_PANEL_PATH } from '../../utils/authPaths.js';

export function useNotFoundRouteError() {
  const error = useRouteError();
  const { isAuthenticated, isLoading } = useAuth();

  const esNoEncontrado = isRouteNotFoundError(error);

  const redirectTo =
    !isLoading && isAuthenticated && esNoEncontrado ? AUTH_NOT_FOUND_PANEL_PATH : null;

  const showPublicNotFound = !isLoading && !redirectTo;

  return {
    isLoading,
    redirectTo,
    showPublicNotFound,
  };
}
