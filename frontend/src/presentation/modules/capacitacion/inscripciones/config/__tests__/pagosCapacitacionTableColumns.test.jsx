import { describe, it, expect } from 'vitest';
import { createPagosCapacitacionTableColumns } from '../pagosCapacitacionTableColumns';

describe('columnas del historial de pagos', () => {
  it('la tabla solo muestra los datos principales (cuenta, observaciones y comprobante van al detalle)', () => {
    const keys = createPagosCapacitacionTableColumns().map((c) => c.dataIndex ?? c.key);
    expect(keys).toEqual(['numeroRecibo', 'fechaPagoLabel', 'concepto', 'monto', 'metodoPagoNombre']);
  });

  it('el recibo PDF es una acción de fila', () => {
    const columnas = createPagosCapacitacionTableColumns({
      puedeDescargarRecibo: true,
      onDescargarRecibo: () => {},
    });
    expect(columnas.at(-1).key).toBe('acciones');
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
