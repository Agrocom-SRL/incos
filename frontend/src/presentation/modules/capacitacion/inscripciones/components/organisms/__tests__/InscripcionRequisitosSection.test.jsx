import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InscripcionRequisitosSection from '../InscripcionRequisitosSection';

const requisitos = [
  { requisitoId: 1, descripcion: 'Fotocopia de CI', obligatorio: true, entregado: true, fechaEntrega: '2026-10-22' },
  { requisitoId: 2, descripcion: 'Folder amarillo', obligatorio: false, entregado: false, fechaEntrega: null },
];

describe('InscripcionRequisitosSection', () => {
  it('es de solo lectura: sin casillas ni botones de guardado', () => {
    const { container } = render(<InscripcionRequisitosSection requisitos={requisitos} />);
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(screen.queryByText(/guardar/i)).toBeNull();
  });

  it('muestra obligatorio, estado de entrega y fecha por requisito', () => {
    render(<InscripcionRequisitosSection requisitos={requisitos} />);
    expect(screen.getByText('Fotocopia de CI')).toBeTruthy();
    expect(screen.getByText('Entregado', { selector: '.cfg-materia-pill' })).toBeTruthy();
    expect(screen.getByText('Pendiente')).toBeTruthy();
    expect(screen.getByText('22/10/2026')).toBeTruthy();
  });
});
