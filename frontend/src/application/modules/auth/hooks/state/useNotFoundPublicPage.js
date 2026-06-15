import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';
import {
  AUTH_LOGIN_PATH,
  AUTH_NOT_FOUND_PANEL_PATH,
} from '../../utils/authPaths.js';

export function useNotFoundPublicPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const goLogin = useCallback(() => {
    navigate(AUTH_LOGIN_PATH, { replace: true });
  }, [navigate]);

  return {
    isLoading,
    redirectToPanelNotFound: isAuthenticated ? AUTH_NOT_FOUND_PANEL_PATH : null,
    goLogin,
  };
}
