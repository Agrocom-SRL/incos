import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AuthGuard } from '../AuthGuard';
import { PublicRoute } from '../PublicRoute';

describe('AuthGuard', () => {
  const arbol = (
    <Routes>
      <Route path="/login" element={<p>Pantalla de login</p>} />
      <Route
        path="/privada"
        element={
          <AuthGuard>
            <p>Contenido privado</p>
          </AuthGuard>
        }
      />
    </Routes>
  );

  it('autenticado: renderiza los hijos', () => {
    renderWithProviders(arbol, { route: '/privada' });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('sin sesión: redirige a /login', () => {
    renderWithProviders(arbol, { route: '/privada', auth: { isAuthenticated: false } });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('cargando: muestra el spinner y no redirige', () => {
    const { container } = renderWithProviders(arbol, {
      route: '/privada',
      auth: { isAuthenticated: false, isLoading: true },
    });
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  const arbol = (
    <Routes>
      <Route path="/dashboard" element={<p>Pantalla dashboard</p>} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <p>Formulario de login</p>
          </PublicRoute>
        }
      />
    </Routes>
  );

  it('sin sesión: muestra la pantalla pública', () => {
    renderWithProviders(arbol, { route: '/login', auth: { isAuthenticated: false } });
    expect(screen.getByText('Formulario de login')).toBeInTheDocument();
  });

  it('con sesión: redirige al dashboard', () => {
    renderWithProviders(arbol, { route: '/login' });
    expect(screen.getByText('Pantalla dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de login')).not.toBeInTheDocument();
  });

  it('cargando: spinner, sin mostrar login ni dashboard', () => {
    const { container } = renderWithProviders(arbol, {
      route: '/login',
      auth: { isAuthenticated: false, isLoading: true },
    });
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de login')).not.toBeInTheDocument();
    expect(screen.queryByText('Pantalla dashboard')).not.toBeInTheDocument();
  });
});
