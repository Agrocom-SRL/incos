import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WizardActions from '../WizardActions/WizardActions';

const botones = () => screen.getAllByRole('button').map((b) => b.textContent.trim());

describe('WizardActions', () => {
  it('primer paso: sin Anterior; con Guardar y Siguiente', () => {
    render(<WizardActions currentStep={0} totalSteps={3} onSave={vi.fn()} onNext={vi.fn()} />);
    expect(botones()).toEqual(['Guardar y continuar después', 'Siguiente']);
  });

  it('paso intermedio: Anterior, Guardar y Siguiente', () => {
    render(<WizardActions currentStep={1} totalSteps={3} onSave={vi.fn()} />);
    expect(botones()).toEqual(['Anterior', 'Guardar y continuar después', 'Siguiente']);
  });

  it('último paso: Anterior y Finalizar (sin Siguiente ni Guardar)', () => {
    render(<WizardActions currentStep={2} totalSteps={3} onSave={vi.fn()} onFinish={vi.fn()} />);
    expect(botones()).toEqual(['Anterior', 'Finalizar registro']);
  });

  it('sin onSave no hay Guardar; showSaveButton=false también lo oculta', () => {
    const { rerender } = render(<WizardActions currentStep={0} totalSteps={3} />);
    expect(botones()).toEqual(['Siguiente']);
    rerender(<WizardActions currentStep={0} totalSteps={3} onSave={vi.fn()} showSaveButton={false} />);
    expect(botones()).toEqual(['Siguiente']);
  });

  it('modo vista: sin Guardar ni Finalizar', () => {
    render(<WizardActions currentStep={2} totalSteps={3} viewMode onSave={vi.fn()} onFinish={vi.fn()} />);
    expect(botones()).toEqual(['Anterior']);
  });

  it('los callbacks reciben el paso en base 1 y no envían el formulario', async () => {
    const onSave = vi.fn();
    const onFinish = vi.fn();
    const onPrev = vi.fn();
    const { rerender } = render(
      <WizardActions currentStep={1} totalSteps={3} onSave={onSave} onPrev={onPrev} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar y continuar después' }));
    expect(onSave).toHaveBeenCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onPrev).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveAttribute('type', 'button');

    rerender(<WizardActions currentStep={2} totalSteps={3} onFinish={onFinish} />);
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar registro' }));
    expect(onFinish).toHaveBeenCalledWith(3);
  });

  it('etiquetas personalizables', () => {
    render(<WizardActions currentStep={0} totalSteps={2} nextLabel="Continuar" />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('loading en Finalizar evita el doble clic', async () => {
    const onFinish = vi.fn();
    render(<WizardActions currentStep={1} totalSteps={2} onFinish={onFinish} loading />);
    await userEvent.click(screen.getByRole('button', { name: /Finalizar registro/ }));
    expect(onFinish).not.toHaveBeenCalled();
  });
});
