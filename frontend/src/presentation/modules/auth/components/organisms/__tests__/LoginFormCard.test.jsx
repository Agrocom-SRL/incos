import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import LoginFormCard from '../LoginFormCard';

/** El organismo es presentacional: el formulario y los callbacks llegan por props. */
const Montar = ({ onSubmit = vi.fn(), ...props }) => {
  const [form] = Form.useForm();
  return (
    <LoginFormCard
      form={form}
      loading={false}
      error={null}
      clearError={vi.fn()}
      remember={false}
      onRememberChange={vi.fn()}
      onSubmit={onSubmit}
      initialValues={{}}
      minPasswordLength={8}
      {...props}
    />
  );
};

const usuario = () => screen.getByPlaceholderText('Usuario o correo de su ficha');
const clave = () => screen.getByPlaceholderText('Ingrese su contraseña');
const ingresar = () => screen.getByRole('button', { name: /Ingresar/ });

describe('LoginFormCard (formulario con validación)', () => {
  it('campos vacíos: muestra ambos mensajes y no envía', async () => {
    const onSubmit = vi.fn();
    render(<Montar onSubmit={onSubmit} />);

    await userEvent.click(ingresar());
    expect(await screen.findByText('Por favor ingrese su usuario o correo')).toBeInTheDocument();
    expect(screen.getByText('Por favor ingrese su contraseña')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con credenciales envía usuario y contraseña', async () => {
    const onSubmit = vi.fn();
    render(<Montar onSubmit={onSubmit} />);

    await userEvent.type(usuario(), 'test.admin');
    await userEvent.type(clave(), 'Test-Incos-2026');
    await userEvent.click(ingresar());

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ username: 'test.admin', password: 'Test-Incos-2026' });
  });

  it('Enter en la contraseña también envía', async () => {
    const onSubmit = vi.fn();
    render(<Montar onSubmit={onSubmit} />);
    await userEvent.type(usuario(), 'test.admin');
    await userEvent.type(clave(), 'Test-Incos-2026{enter}');
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('la contraseña se oculta y se puede revelar', async () => {
    render(<Montar />);
    expect(clave()).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('img', { name: 'eye-invisible' }));
    expect(clave()).toHaveAttribute('type', 'text');
  });

  it('error: alerta visible y se puede cerrar con clearError', async () => {
    const clearError = vi.fn();
    render(<Montar error="Credenciales inválidas" clearError={clearError} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(clearError).toHaveBeenCalled());
  });

  it('sin error no hay alerta', () => {
    render(<Montar />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('loading deshabilita el botón (evita doble envío)', async () => {
    const onSubmit = vi.fn();
    render(<Montar loading onSubmit={onSubmit} />);
    const boton = screen.getByRole('button', { name: /Ingresar/ });
    expect(boton).toBeDisabled();
  });

  it('"Recordar" refleja el estado y notifica el cambio', async () => {
    const onRememberChange = vi.fn();
    render(<Montar remember onRememberChange={onRememberChange} />);
    const casilla = screen.getByRole('checkbox', { name: /Recordar usuario/ });
    expect(casilla).toBeChecked();
    await userEvent.click(casilla);
    expect(onRememberChange).toHaveBeenCalledWith(false);
  });

  it('muestra el largo mínimo de contraseña configurado', () => {
    render(<Montar minPasswordLength={10} />);
    expect(screen.getByText(/mínimo 10 caracteres/)).toBeInTheDocument();
  });

  it('precarga los valores recordados', () => {
    render(<Montar initialValues={{ username: 'guardado', password: 'Guardada-123' }} />);
    expect(usuario()).toHaveValue('guardado');
  });
});
