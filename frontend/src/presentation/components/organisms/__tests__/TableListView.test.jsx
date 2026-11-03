import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableListView from '../TableListView/TableListView';

const columns = [
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
  { title: 'CI', dataIndex: 'ci', key: 'ci' },
];
const data = [
  { id: 1, nombre: 'PÉREZ SOTO ANA', ci: '1234567' },
  { id: 2, nombre: 'ROJAS VACA LUIS', ci: '7654321' },
];

const montar = (props = {}) =>
  render(<TableListView columns={columns} rowKey="id" embedded {...props} />);

describe('TableListView', () => {
  it('con datos: una fila por registro', () => {
    montar({ data });
    expect(screen.getByRole('row', { name: /PÉREZ SOTO ANA/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /ROJAS VACA LUIS/ })).toBeInTheDocument();
  });

  it('carga inicial (loading sin datos): muestra el spinner con su texto y oculta la tabla', () => {
    montar({ data: [], loading: true, loadingTip: 'Cargando docentes...' });
    expect(screen.getByText('Cargando docentes...')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('recarga con datos previos: conserva la tabla (no parpadea al spinner)', () => {
    montar({ data, loading: true });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('PÉREZ SOTO ANA')).toBeInTheDocument();
  });

  it('vacío: muestra el texto contextual emptyText', () => {
    montar({ data: [], emptyText: 'No hay docentes registrados' });
    expect(screen.getByText('No hay docentes registrados')).toBeInTheDocument();
  });

  it('vacío sin emptyText: usa el estado vacío por defecto de la tabla', () => {
    montar({ data: [] });
    expect(document.querySelector('.ant-empty')).toBeInTheDocument();
  });

  it('error: muestra la alerta y mantiene la tabla', () => {
    montar({ data: [], error: 'Error al cargar los docentes' });
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Error');
    expect(alerta).toHaveTextContent('Error al cargar los docentes');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('búsqueda: emite onSearchChange y respeta showSearch=false', async () => {
    const onSearchChange = vi.fn();
    const { rerender } = montar({
      data,
      onSearchChange,
      searchPlaceholder: 'Buscar por nombre',
    });
    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre'), 'a');
    expect(onSearchChange).toHaveBeenCalled();

    rerender(
      <TableListView columns={columns} rowKey="id" embedded data={data} showSearch={false} searchPlaceholder="Buscar por nombre" />,
    );
    expect(screen.queryByPlaceholderText('Buscar por nombre')).not.toBeInTheDocument();
  });

  it('paginación: con más filas que la página muestra el paginador y navega', async () => {
    const muchas = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, nombre: `DOC ${i + 1}`, ci: String(i) }));
    montar({ data: muchas });
    const filas = () => within(screen.getByRole('table')).getAllByRole('row');
    expect(filas()).toHaveLength(11); // cabecera + 10
    await userEvent.click(screen.getByTitle('2'));
    expect(screen.getByText('DOC 11')).toBeInTheDocument();
  });

  it('título y acciones del encabezado interno', () => {
    montar({ data, title: 'Docentes', headerActions: <button type="button">Exportar</button> });
    expect(screen.getByText('Docentes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });
});
