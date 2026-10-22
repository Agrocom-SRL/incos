import { describe, it, expect } from 'vitest';
import {
  esCursoExternoPagado,
  formatEstadoCursoExterno,
  getEstadoCursoExternoPillClass,
} from '../capacitacionPills';

describe('costo del curso externo', () => {
  it('CANCELADO = pagado a la entidad; cualquier otro = pendiente de acreditar', () => {
    expect(esCursoExternoPagado('CANCELADO')).toBe(true);
    expect(esCursoExternoPagado('PARCIAL')).toBe(false);
    expect(formatEstadoCursoExterno('CANCELADO')).toBe('Pagado a la entidad');
    expect(formatEstadoCursoExterno('PARCIAL')).toBe('Pendiente de acreditar con depósito');
  });

  it('pill success si está pagado y warning si está pendiente', () => {
    expect(getEstadoCursoExternoPillClass('CANCELADO')).toContain('--success');
    expect(getEstadoCursoExternoPillClass('PARCIAL')).toContain('--warning');
  });
});
