import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Form } from 'antd';
import { renderWithProviders } from '@/test/renderWithProviders';
import NotFoundResult from '../components/molecules/NotFoundResult';
import NotFoundAuthenticatedPage from '../pages/NotFoundAuthenticatedPage';
import NotFoundPublicPage from '../pages/NotFoundPublicPage';
import NotFoundRouteError from '../pages/NotFoundRouteError';
import LoginPage from '../pages/LoginPage';

const mocks = vi.hoisted(() => ({
  authPage: vi.fn(),
  publicPage: vi.fn(),
  routeError: vi.fn(),
  login: vi.fn(),
}));

vi.mock('@application-auth', async (orig) => ({
  ...(await orig()),
  useNotFoundAuthenticatedPage: mocks.authPage,
  useNotFoundPublicPage: mocks.publicPage,
  useNotFoundRouteError: mocks.routeError,
  useLoginPage: mocks.login,
}));

describe('NotFoundResult', () => {
  it('variante panel: ir al inicio y volver atrás', async () => {
    const onGoHome = vi.fn();
    const onGoBack = vi.fn();
    renderWithProviders(<NotFoundResult variant="authenticated" onGoHome={onGoHome} onGoBack={onGoBack} />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ir al inicio del panel/ }));
    await userEvent.click(screen.getByRole('button', { name: /Volver atrás/ }));
    expect(onGoHome).toHaveBeenCalled();
    expect(onGoBack).toHaveBeenCalled();
  });

  it('variante panel sin onGoBack omite "Volver atrás"', () => {
    renderWithProviders(<NotFoundResult variant="authenticated" onGoHome={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Volver atrás/ })).not.toBeInTheDocument();
  });

  it('variante pública ofrece iniciar sesión', async () => {
    const onGoHome = vi.fn();
    renderWithProviders(<NotFoundResult variant="public" onGoHome={onGoHome} />);
    await userEvent.click(screen.getByRole('button', { name: /Iniciar sesión/ }));
    expect(onGoHome).toHaveBeenCalled();
  });
});

describe('páginas 404', () => {
  beforeEach(() => {
    mocks.authPage.mockReset();
    mocks.publicPage.mockReset();
    mocks.routeError.mockReset();
  });

  it('404 autenticado enlaza las acciones del hook', async () => {
    const hook = { goHome: vi.fn(), goBack: vi.fn() };
    mocks.authPage.mockReturnValue(hook);
    renderWithProviders(<NotFoundAuthenticatedPage />);
    await userEvent.click(screen.getByRole('button', { name: /Ir al inicio del panel/ }));
    expect(hook.goHome).toHaveBeenCalled();
  });

  it('404 público: cargando muestra spinner, con redirección navega, si no muestra el shell', async () => {
    mocks.publicPage.mockReturnValue({ isLoading: true });
    const { unmount } = renderWithProviders(<NotFoundPublicPage />);
    expect(screen.queryByText('Página no encontrada')).not.toBeInTheDocument();
    unmount();

    mocks.publicPage.mockReturnValue({ isLoading: false, redirectToPanelNotFound: '/panel/404' });
    const { unmount: u2 } = renderWithProviders(
      <Routes>
        <Route path="/" element={<NotFoundPublicPage />} />
        <Route path="/panel/404" element={<p>destino panel</p>} />
      </Routes>,
    );
    expect(screen.getByText('destino panel')).toBeInTheDocument();
    u2();

    const goLogin = vi.fn();
    mocks.publicPage.mockReturnValue({ isLoading: false, goLogin });
    renderWithProviders(<NotFoundPublicPage />);
    await userEvent.click(screen.getByRole('button', { name: /Iniciar sesión/ }));
    expect(goLogin).toHaveBeenCalled();
  });

  it('errorElement raíz: spinner, redirección o 404 público', () => {
    mocks.routeError.mockReturnValue({ isLoading: true });
    const { unmount } = renderWithProviders(<NotFoundRouteError />);
    expect(screen.queryByText('Página no encontrada')).not.toBeInTheDocument();
    unmount();

    mocks.routeError.mockReturnValue({ isLoading: false, redirectTo: '/login' });
    const { unmount: u2 } = renderWithProviders(
      <Routes>
        <Route path="/" element={<NotFoundRouteError />} />
        <Route path="/login" element={<p>pantalla login</p>} />
      </Routes>,
    );
    expect(screen.getByText('pantalla login')).toBeInTheDocument();
    u2();

    mocks.routeError.mockReturnValue({ isLoading: false, showPublicNotFound: true });
    mocks.publicPage.mockReturnValue({ isLoading: false, goLogin: vi.fn() });
    renderWithProviders(<NotFoundRouteError />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  const Montar = ({ onSubmit, error = null }) => {
    const [form] = Form.useForm();
    mocks.login.mockReturnValue({
      form,
      loading: false,
      error,
      clearError: vi.fn(),
      remember: false,
      onRememberChange: vi.fn(),
      onSubmit,
      initialValues: {},
      minPasswordLength: 8,
    });
    return <LoginPage />;
  };

  it('orquesta el formulario con el hook y envía las credenciales', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<Montar onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Usuario o correo de su ficha'), 'ana');
    await userEvent.type(screen.getByPlaceholderText('Ingrese su contraseña'), 'Clave-123456{enter}');
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('muestra el error que entrega el hook', () => {
    renderWithProviders(<Montar onSubmit={vi.fn()} error="Credenciales inválidas" />);
    expect(screen.getByText(/Credenciales inválidas/)).toBeInTheDocument();
  });
});
