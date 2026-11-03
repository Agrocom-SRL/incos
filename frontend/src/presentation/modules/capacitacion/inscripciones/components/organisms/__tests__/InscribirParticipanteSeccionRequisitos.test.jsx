import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InscribirParticipanteSeccionRequisitos from '../InscribirParticipanteSeccionRequisitos';

const requisitos = [
  { id: 1, descripcion: 'Fotocopia de CI', obligatorio: true },
  { id: 2, descripcion: 'Folder amarillo', obligatorio: false },
];

describe('InscribirParticipanteSeccionRequisitos', () => {
  it('«Marcar todos» entrega todos los requisitos del curso', () => {
    const onChange = vi.fn();
    render(
      <InscribirParticipanteSeccionRequisitos
        requisitos={requisitos}
        requisitosEntregados={[1]}
        onRequisitosChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Marcar todos los requisitos'));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it('con todos marcados, desmarcar deja la lista vacía', () => {
    const onChange = vi.fn();
    render(
      <InscribirParticipanteSeccionRequisitos
        requisitos={requisitos}
        requisitosEntregados={[1, 2]}
        onRequisitosChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Marcar todos los requisitos'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
