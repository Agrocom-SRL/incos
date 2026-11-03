import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { PrivateRoute } from '../PrivateRoute';

/** Árbol mínimo: /login, /dashboard y una ruta protegida configurable. */
const arbol = (guardProps) => (
  <Routes>
    <Route path="/login" element={<p>Pantalla de login</p>} />
    <Route path="/dashboard" element={<p>Pantalla dashboard</p>} />
    <Route
      path="/docentes"
      element={
        <PrivateRoute {...guardProps}>
          <p>Contenido protegido</p>
        </PrivateRoute>
      }
    />
  </Routes>
);

describe('PrivateRoute (RBAC)', () => {
  it('sin sesión redirige a /login', () => {
    renderWithProviders(arbol({ permiso: 'docentes.ver' }), {
      route: '/docentes',
      auth: { isAuthenticated: false },
    });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('mientras carga la sesión no muestra contenido ni redirige', () => {
    renderWithProviders(arbol({ permiso: 'docentes.ver' }), {
      route: '/docentes',
      auth: { isLoading: true, isAuthenticated: false },
    });
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });

  it('con permiso LISTAR (acción por defecto) renderiza el contenido', () => {
    renderWithProviders(arbol({ permiso: 'docentes.ver' }), {
      route: '/docentes',
      auth: { permisos: [permiso('docentes.ver', 'LISTAR')] },
    });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('sin permiso: notifica "Acceso denegado" y vuelve al dashboard', async () => {
    renderWithProviders(arbol({ permiso: 'docentes.ver' }), {
      route: '/docentes',
      auth: { permisos: [] },
    });
    expect(screen.getByText('Pantalla dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('respeta la acción exigida (CREAR no se cubre con LISTAR)', () => {
    renderWithProviders(arbol({ permiso: 'docentes.crear', accion: 'CREAR' }), {
      route: '/docentes',
      auth: { permisos: [permiso('docentes.crear', 'LISTAR')] },
    });
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    expect(screen.getByText('Pantalla dashboard')).toBeInTheDocument();
  });

  it('permisoAny: basta con uno de los códigos', () => {
    renderWithProviders(arbol({ permisoAny: ['a.x', 'b.y'] }), {
      route: '/docentes',
      auth: { permisos: [permiso('b.y', 'LISTAR')] },
    });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('permisoAny sin ninguno de los códigos deniega', () => {
    renderWithProviders(arbol({ permisoAny: ['a.x', 'b.y'] }), {
      route: '/docentes',
      auth: { permisos: [permiso('z.z', 'LISTAR')] },
    });
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('sin permiso declarado basta con estar autenticado', () => {
    renderWithProviders(arbol({}), { route: '/docentes' });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
