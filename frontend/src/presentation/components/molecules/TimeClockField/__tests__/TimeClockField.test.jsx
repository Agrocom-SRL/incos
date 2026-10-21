import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import TimeClockField from '../TimeClockField';

describe('TimeClockField', () => {
  it('muestra la hora en formato de 12 horas con AM/PM', () => {
    const { container } = render(<TimeClockField value={dayjs().hour(15).minute(0)} onChange={vi.fn()} />);
    expect(container.textContent).toMatch(/03.*00.*PM/i);
  });

  it('abre el reloj en un popup con título, AM/PM y botones', async () => {
    render(<TimeClockField value={dayjs().hour(8).minute(0)} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('Seleccionar hora')).toBeTruthy();
    expect(screen.getAllByText('PM').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AM').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy();
  });

  it('deshabilitado no permite abrir el reloj', () => {
    render(<TimeClockField value={null} onChange={vi.fn()} disabled />);
    expect(screen.getByRole('button').disabled).toBe(true);
  });
});
