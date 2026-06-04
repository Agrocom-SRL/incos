import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_DASHBOARD_PATH } from '../../utils/authPaths.js';

export function useNotFoundAuthenticatedPage() {
  const navigate = useNavigate();

  const goHome = useCallback(() => {
    navigate(AUTH_DASHBOARD_PATH, { replace: true });
  }, [navigate]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    goHome();
  }, [navigate, goHome]);

  return { goHome, goBack };
}
