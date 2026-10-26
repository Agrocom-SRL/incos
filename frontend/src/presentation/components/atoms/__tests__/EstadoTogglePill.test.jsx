import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import EstadoTogglePill from '../EstadoTogglePill';

const conPermiso = { auth: { permisos: [permiso('cfg.idiomas', 'ACTIVAR')] } };

describe('EstadoTogglePill (RBAC)', () => {
  it('con permiso ACTIVAR muestra el switch y ejecuta onToggle con el nuevo estado', async () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(
      <EstadoTogglePill activo permiso="cfg.idiomas" onToggle={onToggle} />,
      conPermiso,
    );

    expect(screen.getByText('Activo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: 'Desactivar registro' }));
    await waitFor(() => expect(onToggle).toHaveBeenCalledWith(false));
  });

  it('inactivo ofrece "Activar registro"', () => {
    renderWithProviders(
      <EstadoTogglePill activo={false} permiso="cfg.idiomas" onToggle={vi.fn()} />,
      conPermiso,
    );
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Activar registro' })).toBeInTheDocument();
  });

  it('sin permiso solo muestra la pill informativa', () => {
    renderWithProviders(<EstadoTogglePill activo permiso="cfg.idiomas" onToggle={vi.fn()} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('sin handler onToggle no hay switch aunque tenga permiso', () => {
    renderWithProviders(<EstadoTogglePill activo permiso="cfg.idiomas" />, conPermiso);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('si onToggle rechaza, el componente no revienta y vuelve a quedar usable', async () => {
    const onToggle = vi.fn().mockRejectedValue(new Error('falló'));
    renderWithProviders(
      <EstadoTogglePill activo permiso="cfg.idiomas" onToggle={onToggle} />,
      conPermiso,
    );

    await userEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(onToggle).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('switch')).toBeEnabled());
  });
});
