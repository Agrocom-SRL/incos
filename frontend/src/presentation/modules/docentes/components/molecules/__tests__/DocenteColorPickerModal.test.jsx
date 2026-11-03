import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import DocenteColorPickerModal from '../DocenteColorPickerModal';

const paleta = {
  success: true,
  data: {
    colores_sugeridos: [
      { color_hex: '#111111', disponible: true },
      { color_hex: '#222222', disponible: false, docente_nombre: 'Luis' },
    ],
  },
};

const montar = (props = {}) =>
  renderWithProviders(
    <DocenteColorPickerModal
      open
      docenteId={5}
      docenteNombre="Ana"
      fetchColoresSugeridos={vi.fn().mockResolvedValue(paleta)}
      updateDocenteColor={vi.fn().mockResolvedValue({ success: true })}
      onClose={vi.fn()}
      onSaved={vi.fn()}
      {...props}
    />,
  );

describe('DocenteColorPickerModal', () => {
  it('carga la paleta: los colores en uso quedan deshabilitados', async () => {
    montar();
    expect(await screen.findByLabelText('Color #111111')).toBeEnabled();
    expect(screen.getByLabelText('Color #222222 en uso')).toBeDisabled();
  });

  it('elegir un color y guardar llama a la API con el hex y avisa onSaved', async () => {
    const updateDocenteColor = vi.fn().mockResolvedValue({ success: true });
    const onSaved = vi.fn();
    montar({ updateDocenteColor, onSaved });
    await userEvent.click(await screen.findByLabelText('Color #111111'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar color' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('#111111'));
    expect(updateDocenteColor).toHaveBeenCalledWith(5, '#111111');
  });

  it('sin color válido no envía', async () => {
    const updateDocenteColor = vi.fn();
    const onSaved = vi.fn();
    montar({ updateDocenteColor, onSaved });
    await screen.findByLabelText('Color #111111');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar color' }));
    expect(updateDocenteColor).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('error del backend al guardar: no avisa onSaved', async () => {
    const onSaved = vi.fn();
    const updateDocenteColor = vi.fn().mockResolvedValue({ success: false, error: 'Color en uso' });
    montar({ updateDocenteColor, onSaved });
    await userEvent.type(await screen.findByPlaceholderText('#3498DB'), '#ABCDEF');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar color' }));
    await waitFor(() => expect(updateDocenteColor).toHaveBeenCalledWith(5, '#ABCDEF'));
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('sin docenteId solo aplica el color (alta)', async () => {
    const onSaved = vi.fn();
    const updateDocenteColor = vi.fn();
    montar({ docenteId: null, onSaved, updateDocenteColor });
    await userEvent.click(await screen.findByLabelText('Color #111111'));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar color' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('#111111'));
    expect(updateDocenteColor).not.toHaveBeenCalled();
  });

  it('"Sugerir libre" selecciona el primer color disponible', async () => {
    const onSaved = vi.fn();
    montar({ docenteId: null, onSaved });
    await screen.findByLabelText('Color #111111');
    await userEvent.click(screen.getByRole('button', { name: 'Sugerir libre' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar color' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('#111111'));
  });
});
