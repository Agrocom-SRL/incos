import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditOutlined } from '@ant-design/icons';
import Button, { BackButton } from '../Button';
import IconButton from '../IconButton';
import Alert from '../Alert';
import Spinner from '../Spinner';
import SearchBar from '../SearchBar';
import FieldInput from '../FieldInput';
import FieldSelect from '../FieldSelect';
import FieldSwitch from '../FieldSwitch';

describe('Button', () => {
  it('aplica la clase semántica de la variante y dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button variant="danger" onClick={onClick}>Eliminar</Button>);
    const boton = screen.getByRole('button', { name: 'Eliminar' });
    expect(boton).toHaveClass('sd-btn', 'sd-btn--danger');
    await userEvent.click(boton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('variante desconocida cae en outline y size small agrega sd-btn--sm', () => {
    render(<Button variant="inexistente" size="small">X</Button>);
    expect(screen.getByRole('button', { name: 'X' })).toHaveClass('sd-btn--outline', 'sd-btn--sm');
  });

  it('disabled no dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading bloquea clics repetidos (evita doble envío)', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('type="link" no usa las clases sd-btn', () => {
    render(<Button type="link">Ver más</Button>);
    expect(screen.getByRole('button', { name: 'Ver más' })).not.toHaveClass('sd-btn');
  });

  it('BackButton es outline y dice "Volver" por defecto', () => {
    render(<BackButton />);
    expect(screen.getByRole('button', { name: 'Volver' })).toHaveClass('sd-btn--outline');
  });
});

describe('IconButton', () => {
  it('aplica forma y variante, y dispara onClick', async () => {
    const onClick = vi.fn();
    render(<IconButton icon={<EditOutlined />} variant="warning" circle onClick={onClick} />);
    const boton = screen.getByRole('button', { name: 'edit' });
    expect(boton).toHaveClass('icon-button--circle', 'icon-button--warning');
    await userEvent.click(boton);
    expect(onClick).toHaveBeenCalled();
  });

  it('disabled no dispara onClick', async () => {
    const onClick = vi.fn();
    render(<IconButton icon={<EditOutlined />} disabled onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Alert', () => {
  it('muestra título y descripción con rol alert', () => {
    render(<Alert title="Error" description="No se pudo cargar" />);
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Error');
    expect(alerta).toHaveTextContent('No se pudo cargar');
  });

  it('acepta `message` por compatibilidad', () => {
    render(<Alert message="Aviso legado" type="warning" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Aviso legado');
  });

  it('prioriza `title` sobre `message`', () => {
    render(<Alert title="Nuevo" message="Viejo" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Nuevo');
    expect(screen.queryByText('Viejo')).not.toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('con texto muestra el tip', () => {
    render(<Spinner text="Cargando docentes..." />);
    expect(screen.getByText('Cargando docentes...')).toBeInTheDocument();
  });

  it('sin texto no muestra tip', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    expect(container.querySelector('.ant-spin-description')).toBeNull();
  });
});

describe('SearchBar', () => {
  it('emite onChange al escribir y onSearch al presionar Enter', async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<SearchBar placeholder="Buscar docente" onChange={onChange} onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Buscar docente');
    await userEvent.type(input, 'ana{enter}');
    expect(onChange).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledWith('ana', expect.anything(), expect.anything());
  });

  it('allowClear limpia el valor', async () => {
    const onChange = vi.fn();
    render(<SearchBar value="ana" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /close-circle/i }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)[0].target.value).toBe('');
  });
});

describe('FieldInput', () => {
  it('propaga el valor escrito', async () => {
    const onChange = vi.fn();
    render(<FieldInput placeholder="Nombre" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'ab');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('capitalize entrega el valor en mayúsculas', async () => {
    const onChange = vi.fn();
    render(<FieldInput placeholder="Apellido" capitalize onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('Apellido'), 'a');
    expect(onChange.mock.calls[0][0].target.value).toBe('A');
  });

  it('readOnly bloquea la edición (se deshabilita)', () => {
    render(<FieldInput placeholder="CI" readOnly />);
    expect(screen.getByPlaceholderText('CI')).toBeDisabled();
  });

  it('maxLength limita la entrada', async () => {
    render(<FieldInput placeholder="Cel" maxLength={3} />);
    const input = screen.getByPlaceholderText('Cel');
    await userEvent.type(input, '12345');
    expect(input).toHaveValue('123');
  });
});

describe('FieldSelect', () => {
  it('muestra el placeholder y las opciones, y emite el valor elegido', async () => {
    const onChange = vi.fn();
    render(
      <FieldSelect
        placeholder="Seleccione turno"
        options={[
          { value: 'T', label: 'Tarde' },
          { value: 'N', label: 'Noche' },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Seleccione turno')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Noche'));
    expect(onChange).toHaveBeenCalledWith('N', expect.objectContaining({ value: 'N' }));
  });

  it('disabled impide abrir', () => {
    render(<FieldSelect disabled options={[]} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('FieldSwitch', () => {
  it('alterna y emite el nuevo estado', async () => {
    const onChange = vi.fn();
    render(<FieldSwitch onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('readOnly lo deshabilita', () => {
    render(<FieldSwitch readOnly />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
