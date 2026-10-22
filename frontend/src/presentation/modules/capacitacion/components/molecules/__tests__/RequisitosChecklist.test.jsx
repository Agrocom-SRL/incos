import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RequisitosChecklist from '../RequisitosChecklist';

const items = [
  { id: 1, descripcion: 'Fotocopia de CI', obligatorio: true, checked: false },
  { id: 2, descripcion: 'Depósito a la entidad', obligatorio: true, checked: true, acreditaPagoCurso: true },
];

describe('RequisitosChecklist', () => {
  it('el requisito que acredita el pago del curso lleva pill y texto de ayuda', () => {
    render(<RequisitosChecklist items={items} />);
    expect(screen.getAllByText('Acredita pago del curso')).toHaveLength(1);
    expect(screen.getAllByText(/queda acreditado como pagado a la entidad/i)).toHaveLength(1);
  });

  it('notifica el cambio de un requisito', () => {
    const onToggle = vi.fn();
    render(<RequisitosChecklist items={items} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText('Fotocopia de CI'));
    expect(onToggle).toHaveBeenCalledWith(1, true);
  });
});
