/**
 * Helper de pruebas de presentación: monta un componente con Router, AntD <App>
 * (notification/modal) y un AuthContext simulado con permisos RBAC.
 *
 * `hasPermiso` replica el contrato de AuthProvider (`codigo` + `acciones.includes(accion)`),
 * así las pruebas de ActionButton / TableActions / guards ejercen la misma regla sin red.
 */
import { render } from '@testing-library/react';
import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@application-auth';

/** Atajo: `permiso('docentes.ver', 'LISTAR', 'DETALLE')` → { codigo, acciones }. */
export const permiso = (codigo, ...acciones) => ({ codigo, acciones });

/** Valor de AuthContext simulado (mismo contrato que AuthProvider). */
export function buildAuthValue({
  permisos = [],
  usuario = { id: 1, username: 'test', rol: { codigo: 'ADMIN', nombre: 'Administrador' } },
  isAuthenticated = true,
  isLoading = false,
  ...extra
} = {}) {
  return {
    usuario,
    permisos,
    token: isAuthenticated ? 'token' : null,
    isAuthenticated,
    isLoading,
    login: () => {},
    logout: async () => {},
    refreshMe: async () => true,
    hasPermiso: (codigo, accion) =>
      permisos.some((p) => p.codigo === codigo && p.acciones.includes(accion)),
    ...extra,
  };
}

/**
 * @param {import('react').ReactElement} ui
 * @param {object} [opts]
 * @param {string} [opts.route='/'] - entrada inicial del MemoryRouter
 * @param {object} [opts.auth] - opciones de buildAuthValue (permisos, usuario, ...)
 */
export function renderWithProviders(ui, { route = '/', auth = {}, ...renderOptions } = {}) {
  const value = buildAuthValue(auth);
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={value}>
        <App>{children}</App>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  return { auth: value, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
