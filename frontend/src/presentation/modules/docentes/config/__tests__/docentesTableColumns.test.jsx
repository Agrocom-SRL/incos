import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { createDocentesTableColumns } from '../docentesTableColumns';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const docente = {
  id: 7,
  nombreCompleto: 'Pérez Ana',
  ci: '123',
  expedicion: 'LP',
  genero: 'FEMENINO',
  celular: '7000',
  maxHorasSemana: 20,
  teachingStats: { hasAsignaciones: true, totalAsignaciones: 3, totalMaterias: 2, totalParalelos: 1 },
};

const columnas = (extra = {}) =>
  createDocentesTableColumns({ navigate: vi.fn(), listNavState: {}, refetch: vi.fn(), deleteDocente: vi.fn(), ...extra });
const col = (cols, key) => cols.find((c) => c.key === key || c.dataIndex === key);

describe('createDocentesTableColumns', () => {
  it('define las columnas esperadas y numera con offset', () => {
    const cols = columnas();
    expect(cols.map((c) => c.title)).toEqual(['#', 'Docente', 'Referencia', 'Carga horaria', 'Carga asignada', 'Acciones']);
    expect(cols[0].render(null, null, 2, 10)).toBe(13);
  });

  it('ordena por nombre sin distinguir acentos/mayúsculas y por carga', () => {
    const cols = columnas();
    const nombre = col(cols, 'nombreCompleto');
    expect(nombre.sortCompare({ nombreCompleto: 'Álvaro' }, { nombreCompleto: 'Beatriz' })).toBeLessThan(0);
    expect(col(cols, 'cargaHoraria').sortCompare({ maxHorasSemana: 10 }, { maxHorasSemana: 4 })).toBeGreaterThan(0);
    expect(
      col(cols, 'cargaAsignada').sortCompare({ teachingStats: { totalMaterias: 1 } }, {}),
    ).toBe(1);
  });

  it('la celda docente muestra nombre en mayúsculas y CI con expedición', () => {
    const { unmount } = renderWithProviders(col(columnas(), 'nombreCompleto').render(null, { ...docente, nombreCompleto: undefined, apellidoPaterno: 'Pérez', nombres: 'Ana' }));
    expect(screen.getByText('PÉREZ ANA')).toBeInTheDocument();
    expect(screen.getByText('123 LP')).toBeInTheDocument();
    unmount();
    renderWithProviders(col(columnas(), 'nombreCompleto').render(null, {}));
    expect(screen.getByText('SIN NOMBRE')).toBeInTheDocument();
  });

  it('la carga asignada exige asignaciones reales', () => {
    const cell = col(columnas(), 'cargaAsignada');
    const { unmount } = renderWithProviders(cell.render(null, docente));
    expect(screen.getByText('2 materias')).toBeInTheDocument();
    unmount();
    renderWithProviders(cell.render(null, { teachingStats: { hasAsignaciones: true, totalAsignaciones: 0 } }));
    expect(screen.getByText('Sin materias')).toBeInTheDocument();
  });

  it('acciones: según el permiso aparecen ver / editar / eliminar y navegan con el id', async () => {
    const navigate = vi.fn();
    const acciones = col(columnas({ navigate }), 'acciones');
    renderWithProviders(acciones.render(null, docente), {
      auth: { permisos: [permiso('docentes.ver', 'DETALLE'), permiso('docentes.editar', 'EDITAR')] },
    });
    expect(screen.getByRole('button', { name: 'eye' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenCalledWith('/docentes/7/editar', { state: {} });
  });
});
