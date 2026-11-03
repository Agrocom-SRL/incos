import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { renderWithProviders } from '@/test/renderWithProviders';
import { showDeleteConfirm } from '../DeleteConfirmModal';

/** Botón que abre el diálogo con la instancia `modal` de <App> (como useDeleteItem). */
const Disparador = ({ opciones, onResultado }) => {
  const { modal } = App.useApp();
  return (
    <button
      type="button"
      onClick={async () => onResultado(await showDeleteConfirm({ modal, ...opciones }))}
    >
      Abrir
    </button>
  );
};

const abrir = async (opciones = {}) => {
  const onResultado = vi.fn();
  renderWithProviders(<Disparador opciones={opciones} onResultado={onResultado} />);
  await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
  const dialogo = await screen.findByRole('dialog');
  return { dialogo, onResultado };
};

describe('showDeleteConfirm', () => {
  it('muestra título, nombre del elemento y la advertencia de irreversibilidad', async () => {
    const { dialogo } = await abrir({ itemName: 'el docente Ana' });
    expect(dialogo).toHaveTextContent('Confirmar eliminación');
    expect(dialogo).toHaveTextContent('el docente Ana');
    expect(dialogo).toHaveTextContent('Esta acción no se puede deshacer.');
  });

  it('muestra los detalles del elemento (solo los completos)', async () => {
    const { dialogo } = await abrir({
      itemName: 'el pago',
      itemDetails: [
        { label: 'Estudiante', value: 'PÉREZ ANA' },
        { label: 'Monto', value: '' },
      ],
    });
    expect(dialogo).toHaveTextContent('Estudiante:');
    expect(dialogo).toHaveTextContent('PÉREZ ANA');
    expect(dialogo).not.toHaveTextContent('Monto:');
  });

  it('confirmar ejecuta onConfirm y resuelve true', async () => {
    const onConfirm = vi.fn().mockResolvedValue();
    const { onResultado } = await abrir({ onConfirm });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(onResultado).toHaveBeenCalledWith(true));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancelar no ejecuta onConfirm, llama onCancel y resuelve false', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { onResultado } = await abrir({ onConfirm, onCancel });
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(onResultado).toHaveBeenCalledWith(false));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('content personalizado reemplaza el mensaje por defecto', async () => {
    const { dialogo } = await abrir({ content: 'Mensaje propio' });
    expect(dialogo).toHaveTextContent('Mensaje propio');
    expect(dialogo).not.toHaveTextContent('Esta acción no se puede deshacer.');
  });
});
