import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InscripcionPagosSection from '../InscripcionPagosSection';

const inscripcion = {
  totalPagado: 150,
  pagos: [
    { id: 1, numeroRecibo: '000001', concepto: 'MATRICULA', monto: 150, anulado: false },
    { id: 2, numeroRecibo: '000002', concepto: 'CURSO', monto: 440, anulado: true },
  ],
};

describe('InscripcionPagosSection', () => {
  it('no lista los pagos eliminados (anulados) ni los cuenta en el título', () => {
    render(<InscripcionPagosSection inscripcion={inscripcion} comprobante={{}} />);
    expect(screen.getByText('000001')).toBeTruthy();
    expect(screen.queryByText('000002')).toBeNull();
    expect(screen.getByText('Historial de pagos (1)')).toBeTruthy();
  });
});
