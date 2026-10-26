import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import FormField from '../FormField/FormField';

/** Formulario mínimo que monta N campos y expone un botón de envío. */
const Harness = ({ fields, onFinish, onFinishFailed, readOnly = false, resolveOptions }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical">
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          form={form}
          readOnly={readOnly}
          resolveOptions={resolveOptions}
          labelLayout="vertical"
        />
      ))}
      <button type="submit">Enviar</button>
    </Form>
  );
};

describe('FormField (formularios con validación)', () => {
  it('campo requerido: muestra el mensaje y no envía', async () => {
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        fields={[{ name: 'nombres', type: 'input', label: 'Nombres', required: true }]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Por favor ingrese nombres')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('el mensaje desaparece y se envía el valor al completar el campo', async () => {
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        fields={[{ name: 'nombres', type: 'input', label: 'Nombres', required: true, placeholder: 'Nombres' }]}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('Nombres'), 'Ana');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toEqual({ nombres: 'Ana' });
    expect(screen.queryByText('Por favor ingrese nombres')).not.toBeInTheDocument();
  });

  it('sin etiqueta usa el mensaje genérico', async () => {
    render(<Harness onFinish={vi.fn()} fields={[{ name: 'x', type: 'input', required: true }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument();
  });

  it('reglas extra (field.rules) se suman a la de requerido', async () => {
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        fields={[
          {
            name: 'correo',
            type: 'input',
            label: 'Correo',
            placeholder: 'Correo',
            rules: [{ type: 'email', message: 'Correo inválido' }],
          },
        ]}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('Correo'), 'no-es-correo');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Correo inválido')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('select requerido: valida y envía el valor elegido', async () => {
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        fields={[
          {
            name: 'turno',
            type: 'select',
            label: 'Turno',
            required: true,
            placeholder: 'Seleccione',
            options: [
              { value: 'T', label: 'Tarde' },
              { value: 'N', label: 'Noche' },
            ],
          },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Por favor ingrese turno')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Noche'));
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toEqual({ turno: 'N' });
  });

  it('opciones por nombre se resuelven con resolveOptions', async () => {
    const resolveOptions = vi.fn().mockReturnValue([{ value: 1, label: 'Mañana' }]);
    render(
      <Harness
        onFinish={vi.fn()}
        resolveOptions={resolveOptions}
        fields={[{ name: 'turno', type: 'select', label: 'Turno', options: 'turnos' }]}
      />,
    );

    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Mañana')).toBeInTheDocument();
    expect(resolveOptions).toHaveBeenCalledWith('turnos', expect.anything());
  });

  it('readOnly deshabilita el campo', () => {
    render(
      <Harness
        readOnly
        onFinish={vi.fn()}
        fields={[{ name: 'nombres', type: 'input', label: 'Nombres', placeholder: 'Nombres' }]}
      />,
    );
    expect(screen.getByPlaceholderText('Nombres')).toBeDisabled();
  });

  it('field.disabled deshabilita solo ese campo', () => {
    render(
      <Harness
        onFinish={vi.fn()}
        fields={[
          { name: 'a', type: 'input', placeholder: 'A', disabled: true },
          { name: 'b', type: 'input', placeholder: 'B' },
        ]}
      />,
    );
    expect(screen.getByPlaceholderText('A')).toBeDisabled();
    expect(screen.getByPlaceholderText('B')).toBeEnabled();
  });

  it('switch: guarda el booleano', async () => {
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} fields={[{ name: 'activo', type: 'switch', label: 'Activo' }]} />);
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toEqual({ activo: true });
  });

  it('campo hidden envía su valor sin mostrar etiqueta', async () => {
    const onFinish = vi.fn();
    const Oculto = () => {
      const [form] = Form.useForm();
      return (
        <Form form={form} onFinish={onFinish} initialValues={{ id: 9 }}>
          <FormField field={{ name: 'id', type: 'hidden', label: 'Identificador' }} form={form} />
          <button type="submit">Enviar</button>
        </Form>
      );
    };
    render(<Oculto />);
    expect(screen.queryByText('Identificador')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toEqual({ id: 9 });
  });
});
