import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import ActionButton from '../ActionButton';

describe('ActionButton (RBAC)', () => {
  it('se muestra y responde al clic cuando el usuario tiene permiso + acción', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <ActionButton permiso="docentes.crear" accion="CREAR" onClick={onClick}>
        Registrar docente
      </ActionButton>,
      { auth: { permisos: [permiso('docentes.crear', 'CREAR')] } },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Registrar docente' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no renderiza nada sin el permiso', () => {
    renderWithProviders(
      <ActionButton permiso="docentes.crear" accion="CREAR">
        Registrar docente
      </ActionButton>,
      { auth: { permisos: [permiso('docentes.ver', 'LISTAR')] } },
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('el mismo código con otra acción no habilita el botón', () => {
    renderWithProviders(
      <ActionButton permiso="docentes.crear" accion="ELIMINAR">
        Eliminar
      </ActionButton>,
      { auth: { permisos: [permiso('docentes.crear', 'CREAR')] } },
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin permisos (lista vacía) falla cerrado', () => {
    renderWithProviders(
      <ActionButton permiso="x.y" accion="LISTAR">
        Ver
      </ActionButton>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('propaga disabled al botón visible', () => {
    renderWithProviders(
      <ActionButton permiso="x.y" accion="CREAR" disabled>
        Guardar
      </ActionButton>,
      { auth: { permisos: [permiso('x.y', 'CREAR')] } },
    );
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });
});
