import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createPagosCapacitacionTableColumns,
  pagoRowClassName,
} from '../pagosCapacitacionTableColumns';

const pagoVigente = { id: 1, monto: 100, concepto: 'MATRICULA', anulado: false };
const pagoAnulado = {
  id: 2,
  monto: 50,
  concepto: 'MATRICULA',
  anulado: true,
  motivoAnulacion: 'Monto equivocado',
  fechaAnulacionLabel: '22/10/2026 14:30',
};

describe('columnas del historial de pagos', () => {
  it('atenúa solo las filas de pagos anulados', () => {
    expect(pagoRowClassName(pagoAnulado)).toBe('cfg-table-row--inactiva');
    expect(pagoRowClassName(pagoVigente)).toBe('');
  });

  it('la columna Estado marca el pago anulado con motivo y fecha', () => {
    const estado = createPagosCapacitacionTableColumns().find((c) => c.key === 'estado');
    render(estado.render(null, pagoAnulado));
    expect(screen.getByText('Anulado')).toBeTruthy();
    expect(screen.getByText('Motivo: Monto equivocado')).toBeTruthy();
    expect(screen.getByText('22/10/2026 14:30')).toBeTruthy();
  });

  it('un pago vigente se rotula «Vigente»; el monto anulado va tachado', () => {
    const columnas = createPagosCapacitacionTableColumns();
    render(columnas.find((c) => c.key === 'estado').render(null, pagoVigente));
    expect(screen.getByText('Vigente')).toBeTruthy();

    const monto = columnas.find((c) => c.dataIndex === 'monto');
    const { container } = render(monto.render(50, pagoAnulado));
    expect(container.querySelector('.ant-typography-delete, del')).not.toBeNull();
  });

  it('sin acciones no agrega la columna; con acciones sí', () => {
    expect(createPagosCapacitacionTableColumns().some((c) => c.key === 'acciones')).toBe(false);
    const conAcciones = createPagosCapacitacionTableColumns(
      {},
      { evaluarPago: () => ({ permitido: true, motivo: null }), onEditar: () => {}, onAnular: () => {} },
    );
    expect(conAcciones.at(-1).key).toBe('acciones');
  });
});
