import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import PermisosDominioPicker from '../organisms/PermisosDominioPicker';
import RolUsuariosSection from '../organisms/RolUsuariosSection';
import AccesosUsuarioDominioPicker from '../../../usuarios/components/organisms/AccesosUsuarioDominioPicker';
import { labelGrupoUi, ACCIONES_GRILLA } from '../../constants/permisosGrillaConfig';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const grupos = [
  {
    grupoUi: 'docentes',
    grupoNombre: 'Docentes',
    rutaSidebar: 'Docentes › Listado',
    accionesValidas: ['LISTAR', 'CREAR'],
    accionesAsignadas: ['LISTAR'],
  },
];

/** Casilla de la fila de grupo para una acción (columna por orden de ACCIONES_GRILLA). */
const casilla = (accion) => {
  const idx = ACCIONES_GRILLA.findIndex((a) => a.key === accion);
  const fila = screen.getAllByRole('row').find((r) => r.textContent.includes('Docentes ›'));
  return fila.querySelectorAll('td')[idx + 1].querySelector('input[type="checkbox"]');
};

describe('labelGrupoUi', () => {
  it('usa el nombre del grupo y cae al código', () => {
    expect(labelGrupoUi({ grupoNombre: 'Docentes', grupoUi: 'doc' })).toBe('Docentes');
    expect(labelGrupoUi({ grupoUi: 'doc' })).toBe('doc');
    expect(labelGrupoUi(null)).toBe('');
  });
});

describe('PermisosDominioPicker', () => {
  it('sin grupos muestra el vacío', () => {
    render(<PermisosDominioPicker grupos={[]} />);
    expect(screen.getByText('Sin permisos para este dominio.')).toBeInTheDocument();
  });

  it('marca lo asignado, deja sin casilla las acciones que no aplican y alterna al clic', async () => {
    const toggleAccion = vi.fn();
    render(<PermisosDominioPicker grupos={grupos} toggleAccion={toggleAccion} />);
    expect(screen.getByText('Docentes')).toBeInTheDocument();
    expect(casilla('LISTAR')).toBeChecked();
    expect(casilla('CREAR')).not.toBeChecked();
    expect(casilla('EDITAR')).toBeNull();

    await userEvent.click(casilla('CREAR'));
    expect(toggleAccion).toHaveBeenCalledWith(grupos[0], 'CREAR');
  });

  it('el delta pisa lo asignado y disabled bloquea las casillas', () => {
    render(
      <PermisosDominioPicker
        grupos={grupos}
        delta={{ 'docentes:LISTAR': { habilitado: false }, 'docentes:CREAR': { habilitado: true } }}
        toggleAccion={vi.fn()}
        disabled
      />,
    );
    expect(casilla('LISTAR')).not.toBeChecked();
    expect(casilla('CREAR')).toBeChecked();
    expect(casilla('CREAR')).toBeDisabled();
  });
});

describe('AccesosUsuarioDominioPicker', () => {
  const estados = { LISTAR: 'heredado', CREAR: 'revocado' };
  const montar = (props = {}) =>
    render(
      <AccesosUsuarioDominioPicker
        grupos={grupos}
        estadoCelda={(_g, a) => estados[a] ?? 'ninguno'}
        overrideDeCelda={() => ({ motivo: 'Licencia' })}
        onToggle={vi.fn()}
        {...props}
      />,
    );

  it('heredado marcado, revocado desmarcado; ambos permiten crear un ajuste', async () => {
    const onToggle = vi.fn();
    montar({ onToggle });
    expect(casilla('LISTAR')).toBeChecked();
    expect(casilla('CREAR')).not.toBeChecked();
    await userEvent.click(casilla('CREAR'));
    expect(onToggle).toHaveBeenCalledWith(grupos[0], 'CREAR');
  });

  it('una celda en curso queda deshabilitada y no dispara el toggle', async () => {
    const onToggle = vi.fn();
    montar({ onToggle, isToggling: (_g, a) => a === 'CREAR' });
    expect(casilla('CREAR')).toBeDisabled();
    expect(screen.getByLabelText('Guardando…')).toBeInTheDocument();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('sin grupos muestra el vacío', () => {
    montar({ grupos: [] });
    expect(screen.getByText('Sin permisos para este dominio.')).toBeInTheDocument();
  });
});

describe('RolUsuariosSection', () => {
  const usuarios = [{ id: 1, username: 'ana', email: 'a@b.com', estado: null, rol: { tipo: 'DOCENTE' } }];

  it('lista usuarios con su estado', () => {
    renderWithProviders(<RolUsuariosSection usuarios={usuarios} navigate={vi.fn()} tablePagination={{ pageSize: 10 }} />);
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('vacío: distingue "sin usuarios" de "sin resultados de búsqueda"', () => {
    const { unmount } = renderWithProviders(<RolUsuariosSection navigate={vi.fn()} />);
    expect(screen.getByText('Ningún usuario tiene este rol.')).toBeInTheDocument();
    unmount();
    renderWithProviders(<RolUsuariosSection searchText="zzz" navigate={vi.fn()} />);
    expect(screen.getByText('No se encontraron usuarios que coincidan con la búsqueda.')).toBeInTheDocument();
  });

  it('error: alerta con reintento y sin tabla', async () => {
    const onRetry = vi.fn();
    renderWithProviders(<RolUsuariosSection error="Falla" onRetry={onRetry} navigate={vi.fn()} />);
    expect(screen.getByText('Falla')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Buscar por usuario o correo...')).not.toBeInTheDocument();
  });
});
