import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const router = vi.hoisted(() => ({ navigate: vi.fn(), routeError: null }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useRouteError: () => router.routeError,
}));

const api = vi.hoisted(() => ({ apiCall: vi.fn(), buildV1FetchUrl: vi.fn((p) => `http://api${p}`) }));
vi.mock('@/infrastructure/http/apiClient.js', () => api);
vi.mock('@/infrastructure/navigation/utils/clearSessionNavigationState.js', () => ({ clearSessionNavigationState: vi.fn() }));

import { AuthProvider } from '../providers/AuthProvider';
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { usePermiso } from '../hooks/usePermiso';
import { useAuthContext } from '../hooks/context/useAuthContext';
import { useLoginPage } from '../hooks/state/useLoginPage';
import { useNotFoundAuthenticatedPage } from '../hooks/state/useNotFoundAuthenticatedPage';
import { useNotFoundPublicPage } from '../hooks/state/useNotFoundPublicPage';
import { useNotFoundRouteError } from '../hooks/state/useNotFoundRouteError';
import { authenticateCredentials } from '../utils/authenticateCredentials';
import { mapLoginErrorMessage } from '../utils/mapLoginErrorMessage';
import { isRouteNotFoundError } from '../utils/isRouteNotFoundError';
import { esDocente } from '../utils/esDocente';
import { esEstudiante } from '../utils/esEstudiante';
import { AUTH_PUBLIC_PATHS } from '../utils/authPaths';
import {
  isLoginRememberEnabled,
  loadRememberedLogin,
  saveRememberedLogin,
  clearRememberedLogin,
} from '../utils/loginRememberStorage';

const respuesta = (ok, json, status = ok ? 200 : 400) => ({ ok, status, json: async () => json });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  router.routeError = null;
  vi.unstubAllGlobals();
});

describe('utilidades de auth', () => {
  it('mapea errores de login', () => {
    expect(mapLoginErrorMessage({ status: 401 })).toBe('Usuario o contraseña incorrectos');
    expect(mapLoginErrorMessage({ status: 403, payload: { error: 'bloqueado por intentos' } })).toBe('Cuenta bloqueada por intentos');
    expect(mapLoginErrorMessage({ status: 403, payload: { error: { message: 'Cuenta suspendido' } } })).toBe('Cuenta suspendida');
    expect(mapLoginErrorMessage({ status: 403 })).toBe('Cuenta no disponible');
    expect(mapLoginErrorMessage({ status: 422, message: 'Dato inválido' })).toBe('Dato inválido');
    expect(mapLoginErrorMessage({ status: 500 })).toBe('No se pudo iniciar sesión');
    expect(mapLoginErrorMessage(new Error('x'))).toBe('Error de red. Intente nuevamente.');
  });

  it('detecta roles y rutas públicas', () => {
    expect(esDocente({ rol: { codigo: 'DOCENTE' } })).toBe(true);
    expect(esDocente(null)).toBe(false);
    expect(esEstudiante({ rol: { codigo: 'ESTUDIANTE' } })).toBe(true);
    expect(AUTH_PUBLIC_PATHS.has('login')).toBe(true);
  });

  it('isRouteNotFoundError reconoce 404 y mensajes', () => {
    expect(isRouteNotFoundError(new Error('Route Not Found'))).toBe(true);
    expect(isRouteNotFoundError(new Error('otro'))).toBe(false);
    expect(isRouteNotFoundError({ status: 404, statusText: 'x', data: null, internal: true })).toBe(true);
    expect(isRouteNotFoundError('x')).toBe(false);
  });

  it('recuerda credenciales en localStorage', () => {
    expect(isLoginRememberEnabled()).toBe(false);
    expect(loadRememberedLogin()).toBeNull();
    saveRememberedLogin({ username: ' ana ', password: 'clave1234' });
    expect(isLoginRememberEnabled()).toBe(true);
    expect(loadRememberedLogin()).toEqual({ username: 'ana', password: 'clave1234' });
    saveRememberedLogin({ username: '  ', password: 'x' });
    expect(loadRememberedLogin().username).toBe('ana');
    localStorage.setItem('incos_login_password', '%%%');
    expect(loadRememberedLogin().password).toBe('');
    clearRememberedLogin();
    expect(loadRememberedLogin()).toBeNull();
  });
});

describe('authenticateCredentials', () => {
  it('devuelve token, usuario y permisos y guarda el token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(true, { data: { token: 't', usuario: { id: 1 }, permisos: [{ codigo: 'x' }] } })));
    const r = await authenticateCredentials({ username: 'a', password: 'b' });
    expect(r).toEqual({ token: 't', usuario: { id: 1 }, permisos: [{ codigo: 'x' }] });
    expect(localStorage.getItem('incos_token')).toBe('t');
  });

  it('completa permisos desde /me cuando el login no los trae', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(true, { data: { token: 't', usuario: { id: 1 } } })));
    api.apiCall.mockResolvedValue(respuesta(true, { data: { permisos: [{ codigo: 'y' }] } }));
    const r = await authenticateCredentials({ username: 'a', password: 'b' });
    expect(r.permisos).toEqual([{ codigo: 'y' }]);
  });

  it('limpia sesión si /me falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(true, { data: { token: 't', usuario: {} } })));
    api.apiCall.mockResolvedValue(respuesta(false, { error: 'Sesión inválida' }, 401));
    await expect(authenticateCredentials({})).rejects.toMatchObject({ message: 'Sesión inválida', status: 401 });
    expect(localStorage.getItem('incos_token')).toBeNull();
  });

  it('propaga errores HTTP con estado y payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(false, { error: { details: [{ message: 'a' }, { msg: 'b' }] } }, 422)));
    await expect(authenticateCredentials({})).rejects.toMatchObject({ message: 'a. b', status: 422 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(false, { error: 'Mal' }, 401)));
    await expect(authenticateCredentials({})).rejects.toMatchObject({ message: 'Mal' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('x'); } }));
    await expect(authenticateCredentials({})).rejects.toMatchObject({ message: 'No se pudo iniciar sesión' });
  });

  it('rechaza respuestas incompletas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(true, { data: {} })));
    await expect(authenticateCredentials({})).rejects.toMatchObject({ status: 500 });
  });
});

describe('AuthProvider', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const permisos = [{ codigo: 'a.b', acciones: ['LISTAR'] }];

  it('useAuth falla fuera del provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('AuthProvider');
  });

  it('sin token termina de cargar como no autenticado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('con token válido restaura la sesión desde /me', async () => {
    localStorage.setItem('incos_token', 't');
    api.apiCall.mockResolvedValue(respuesta(true, { data: { usuario: { id: 1 }, permisos } }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.hasPermiso('a.b', 'LISTAR')).toBe(true);
    expect(result.current.hasPermiso('a.b', 'CREAR')).toBe(false);
  });

  it('con token inválido limpia el almacenamiento', async () => {
    localStorage.setItem('incos_token', 't');
    api.apiCall.mockResolvedValue(respuesta(false, {}, 401));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(localStorage.getItem('incos_token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login, refreshMe y logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.login('tok', { id: 2 }, undefined));
    expect(result.current).toMatchObject({ isAuthenticated: true, permisos: [] });
    expect(localStorage.getItem('incos_token')).toBe('tok');

    api.apiCall.mockResolvedValueOnce(respuesta(true, { data: { permisos } }));
    let ok;
    await act(async () => {
      ok = await result.current.refreshMe();
    });
    expect(ok).toBe(true);
    expect(result.current.permisos).toEqual(permisos);
    expect(result.current.usuario).toEqual({ id: 2 });

    api.apiCall.mockResolvedValueOnce(respuesta(false, {}));
    await act(async () => {
      expect(await result.current.refreshMe()).toBe(false);
    });

    api.apiCall.mockRejectedValueOnce(new Error('red'));
    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('incos_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('refreshMe sin token devuelve false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(await result.current.refreshMe()).toBe(false);
  });

  it('usePermiso y useAuthContext derivan del contexto', async () => {
    localStorage.setItem('incos_token', 't');
    api.apiCall.mockResolvedValue(respuesta(true, { data: { usuario: { id: 1 }, permisos } }));
    const { result } = renderHook(() => ({ p: usePermiso('a.b', 'LISTAR'), c: useAuthContext() }), { wrapper });
    await waitFor(() => expect(result.current.p).toBe(true));
    expect(result.current.c.user).toEqual({ id: 1 });
    expect(result.current.c.loading).toBe(false);
  });
});

describe('páginas de auth', () => {
  const authWrapper = (value) => {
    return ({ children }) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };

  it('useLoginPage valida longitud, inicia sesión y recuerda', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(true, { data: { token: 't', usuario: { id: 1 }, permisos: [{}] } })));
    const login = vi.fn();
    const { result } = renderHook(() => useLoginPage(), { wrapper: authWrapper({ login }) });
    await act(async () => {
      await result.current.onSubmit({ username: 'a', password: 'corta' });
    });
    expect(result.current.error).toMatch(/al menos 8/);
    act(() => result.current.onRememberChange(true));
    await act(async () => {
      await result.current.onSubmit({ username: ' ana ', password: 'clave1234' });
    });
    expect(login).toHaveBeenCalledWith('t', { id: 1 }, [{}]);
    expect(router.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    expect(loadRememberedLogin()).toEqual({ username: 'ana', password: 'clave1234' });
    act(() => result.current.onRememberChange(false));
    expect(isLoginRememberEnabled()).toBe(false);
    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('useLoginPage muestra el error mapeado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(false, {}, 401)));
    const { result } = renderHook(() => useLoginPage(), { wrapper: authWrapper({ login: vi.fn() }) });
    await act(async () => {
      await result.current.onSubmit({ username: 'a', password: 'clave1234' });
    });
    expect(result.current.error).toBe('Usuario o contraseña incorrectos');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('red')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      await result.current.onSubmit({ username: 'a', password: 'clave1234' });
    });
    expect(result.current.error).toBe('Error de red. Intente nuevamente.');
  });

  it('useNotFoundAuthenticatedPage vuelve atrás o al inicio', () => {
    const { result } = renderHook(() => useNotFoundAuthenticatedPage());
    result.current.goHome();
    expect(router.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(3);
    result.current.goBack();
    expect(router.navigate).toHaveBeenCalledWith(-1);
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    router.navigate.mockClear();
    result.current.goBack();
    expect(router.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('useNotFoundPublicPage redirige si hay sesión', () => {
    const a = renderHook(() => useNotFoundPublicPage(), { wrapper: authWrapper({ isAuthenticated: true, isLoading: false }) });
    expect(a.result.current.redirectToPanelNotFound).toBe('/pagina-no-encontrada');
    const b = renderHook(() => useNotFoundPublicPage(), { wrapper: authWrapper({ isAuthenticated: false, isLoading: false }) });
    expect(b.result.current.redirectToPanelNotFound).toBeNull();
    b.result.current.goLogin();
    expect(router.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('useNotFoundRouteError decide entre redirigir o mostrar 404 público', () => {
    router.routeError = new Error('Not Found');
    const a = renderHook(() => useNotFoundRouteError(), { wrapper: authWrapper({ isAuthenticated: true, isLoading: false }) });
    expect(a.result.current).toMatchObject({ redirectTo: '/pagina-no-encontrada', showPublicNotFound: false });
    const b = renderHook(() => useNotFoundRouteError(), { wrapper: authWrapper({ isAuthenticated: false, isLoading: false }) });
    expect(b.result.current).toMatchObject({ redirectTo: null, showPublicNotFound: true });
    const c = renderHook(() => useNotFoundRouteError(), { wrapper: authWrapper({ isAuthenticated: false, isLoading: true }) });
    expect(c.result.current.showPublicNotFound).toBe(false);
  });
});
