import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { PermisoGuard } from '../PermisoGuard';

describe('PermisoGuard', () => {
  it('muestra los hijos con permiso (acción por defecto LISTAR)', () => {
    renderWithProviders(
      <PermisoGuard codigo="docentes.ver">
        <span>visible</span>
      </PermisoGuard>,
      { auth: { permisos: [permiso('docentes.ver', 'LISTAR')] } },
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('sin permiso muestra el fallback', () => {
    renderWithProviders(
      <PermisoGuard codigo="docentes.ver" fallback={<span>sin acceso</span>}>
        <span>visible</span>
      </PermisoGuard>,
    );
    expect(screen.queryByText('visible')).not.toBeInTheDocument();
    expect(screen.getByText('sin acceso')).toBeInTheDocument();
  });

  it('con otra acción distinta a la concedida no renderiza nada', () => {
    renderWithProviders(
      <PermisoGuard codigo="docentes.ver" accion="EDITAR">
        <span>visible</span>
      </PermisoGuard>,
      { auth: { permisos: [permiso('docentes.ver', 'LISTAR')] } },
    );
    expect(screen.queryByText('visible')).not.toBeInTheDocument();
  });
});
