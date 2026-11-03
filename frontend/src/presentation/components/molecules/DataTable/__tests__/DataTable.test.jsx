import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../DataTable';

const columns = [
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', sorter: true },
  { title: 'CI', dataIndex: 'ci', key: 'ci' },
];
const data = [
  { id: 1, nombre: 'Zárate', ci: '3' },
  { id: 2, nombre: 'Álvarez', ci: '1' },
  { id: 3, nombre: 'Méndez', ci: '2' },
];

/** Nombres en el orden visible de las filas del cuerpo. */
const nombresVisibles = () =>
  within(screen.getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((fila) => within(fila).getAllByRole('cell')[0].textContent);

describe('DataTable', () => {
  it('renderiza cabeceras y una fila por registro', () => {
    render(<DataTable dataSource={data} columns={columns} rowKey="id" />);
    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toBeInTheDocument();
    expect(nombresVisibles()).toEqual(['Zárate', 'Álvarez', 'Méndez']);
  });

  it('orden en cliente sobre el dataset completo, con colación en español', async () => {
    render(<DataTable dataSource={data} columns={columns} rowKey="id" />);
    await userEvent.click(screen.getByRole('columnheader', { name: /Nombre/ }));
    expect(nombresVisibles()).toEqual(['Álvarez', 'Méndez', 'Zárate']);

    await userEvent.click(screen.getByRole('columnheader', { name: /Nombre/ }));
    expect(nombresVisibles()).toEqual(['Zárate', 'Méndez', 'Álvarez']);
  });

  it('el tercer clic no pierde el orden: alterna asc/desc', async () => {
    render(<DataTable dataSource={data} columns={columns} rowKey="id" />);
    const cabecera = () => screen.getByRole('columnheader', { name: /Nombre/ });
    await userEvent.click(cabecera());
    await userEvent.click(cabecera());
    await userEvent.click(cabecera());
    expect(nombresVisibles()).toEqual(['Álvarez', 'Méndez', 'Zárate']);
  });

  it('defaultSort aplica el orden inicial', () => {
    render(
      <DataTable
        dataSource={data}
        columns={columns}
        rowKey="id"
        defaultSort={{ field: 'nombre', order: 'descend' }}
      />,
    );
    expect(nombresVisibles()).toEqual(['Zárate', 'Méndez', 'Álvarez']);
  });

  it('no muta el arreglo de datos original', async () => {
    const original = [...data];
    render(<DataTable dataSource={original} columns={columns} rowKey="id" />);
    await userEvent.click(screen.getByRole('columnheader', { name: /Nombre/ }));
    expect(original.map((d) => d.id)).toEqual([1, 2, 3]);
  });

  it('sin datos muestra el estado vacío de la tabla', () => {
    render(<DataTable dataSource={[]} columns={columns} rowKey="id" />);
    expect(document.querySelector('.ant-empty')).toBeInTheDocument();
  });

  it('paginación del lado del servidor: delega el cambio de página y no recorta filas', async () => {
    const onChange = vi.fn();
    render(
      <DataTable
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ serverPagination: true, current: 1, pageSize: 3, total: 9, onChange }}
      />,
    );
    expect(nombresVisibles()).toHaveLength(3);
    await userEvent.click(screen.getByTitle('2'));
    expect(onChange).toHaveBeenCalledWith(2, 3);
  });

  it('server-side: orden por columna con sortField se delega al provider', async () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        dataSource={data}
        columns={[{ ...columns[0], sortField: 'apellido' }, columns[1]]}
        rowKey="id"
        pagination={{ serverPagination: true, current: 1, pageSize: 10, total: 3, onSortChange }}
      />,
    );
    await userEvent.click(screen.getByRole('columnheader', { name: /Nombre/ }));
    expect(onSortChange).toHaveBeenCalledWith({ field: 'apellido', order: 'ASC' });
    // El orden visible no cambia en cliente: lo recarga el servidor.
    expect(nombresVisibles()).toEqual(['Zárate', 'Álvarez', 'Méndez']);
  });

  it('la columna "nro" recibe el desplazamiento de la página actual', () => {
    const render_ = vi.fn((_v, _r, index, offset) => index + 1 + offset);
    render(
      <DataTable
        dataSource={data.slice(0, 2)}
        columns={[{ title: '#', key: 'nro', render: render_ }, columns[0]]}
        rowKey="id"
        pagination={{ serverPagination: true, current: 3, pageSize: 10, total: 25 }}
      />,
    );
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });
});
