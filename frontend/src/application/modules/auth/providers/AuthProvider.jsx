/**
 * Provider de autenticación (Application Layer).
 * Estado: usuario, permisos, JWT; bootstrap con GET /auth/me.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { apiCall } from '@/infrastructure/http/apiClient.js';
import { AUTH_ENDPOINTS } from '@api/endpoints.js';

const initialState = {
  usuario: null,
  permisos: [],
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem('incos_token');
      if (!token) {
        if (!cancelled) setState({ ...initialState, isLoading: false });
        return;
      }

      const res = await apiCall(AUTH_ENDPOINTS.ME);
      if (cancelled) return;
      if (!res) return;

      if (res.ok) {
        const json = await res.json();
        setState({
          usuario: json.data.usuario,
          permisos: json.data.permisos,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('incos_token');
        localStorage.removeItem('incos_usuario');
        setState({ ...initialState, isLoading: false });
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((token, usuario, permisos) => {
    localStorage.setItem('incos_token', token);
    localStorage.setItem('incos_usuario', JSON.stringify(usuario));
    setState({
      usuario,
      permisos: permisos ?? [],
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('incos_token');
    if (!token) return false;

    const res = await apiCall(AUTH_ENDPOINTS.ME);
    if (!res?.ok) return false;

    const json = await res.json();
    setState((prev) => ({
      ...prev,
      usuario: json.data?.usuario ?? prev.usuario,
      permisos: json.data?.permisos ?? prev.permisos,
      token,
      isAuthenticated: true,
      isLoading: false,
    }));
    return true;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiCall(AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch {
      /* ignorar */
    }
    localStorage.removeItem('incos_token');
    localStorage.removeItem('incos_usuario');
    setState({ ...initialState, isLoading: false });
    navigate('/login', { replace: true });
  }, [navigate]);

  const hasPermiso = useCallback(
    (codigo, accion) =>
      state.permisos.some(
        (p) => p.codigo === codigo && p.acciones.includes(accion),
      ),
    [state.permisos],
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshMe,
      hasPermiso,
    }),
    [state, login, logout, refreshMe, hasPermiso],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
