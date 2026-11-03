import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DetailPageShell from '../DetailPageShell';
import DetailPageHeaderActions from '../DetailPageHeaderActions';
import DetailTabsPanel from '../DetailTabsPanel';
import CarreraCardPicker from '../CarreraCardPicker/CarreraCardPicker';

describe('DetailPageShell (carga / error / vacío / contenido)', () => {
  it('contenido: muestra los hijos', () => {
    render(<DetailPageShell><p>ficha</p></DetailPageShell>);
    expect(screen.getByText('ficha')).toBeInTheDocument();
  });

  it('cargando: oculta los hijos y muestra el tip', () => {
    render(<DetailPageShell loading loadingTip="Cargando docente…"><p>ficha</p></DetailPageShell>);
    expect(screen.getByText('Cargando docente…')).toBeInTheDocument();
    expect(screen.queryByText('ficha')).not.toBeInTheDocument();
  });

  it('error: alerta con el mensaje, sin hijos', () => {
    render(<DetailPageShell error="No se pudo cargar"><p>ficha</p></DetailPageShell>);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    expect(screen.queryByText('ficha')).not.toBeInTheDocument();
  });

  it('error con onRetry: ofrece Reintentar', async () => {
    const onRetry = vi.fn();
    render(<DetailPageShell error="Falló" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('error sin onRetry: no hay botón Reintentar', () => {
    render(<DetailPageShell error="Falló" />);
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('showEmpty: muestra la descripción vacía y no los hijos', () => {
    render(<DetailPageShell showEmpty emptyDescription="Docente inexistente"><p>ficha</p></DetailPageShell>);
    expect(screen.getByText('Docente inexistente')).toBeInTheDocument();
    expect(screen.queryByText('ficha')).not.toBeInTheDocument();
  });

  it('el error tiene prioridad sobre showEmpty', () => {
    render(<DetailPageShell error="Falló" showEmpty />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('No se encontró el registro solicitado')).not.toBeInTheDocument();
  });
});

describe('DetailPageHeaderActions', () => {
  it('botón Volver dispara onVolver; la etiqueta es configurable', async () => {
    const onVolver = vi.fn();
    const { rerender } = render(<DetailPageHeaderActions onVolver={onVolver} />);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(onVolver).toHaveBeenCalledTimes(1);
    rerender(<DetailPageHeaderActions onVolver={onVolver} label="Regresar al listado" />);
    expect(screen.getByRole('button', { name: /Regresar al listado/ })).toBeInTheDocument();
  });
});

describe('DetailTabsPanel', () => {
  const items = [
    { key: 'a', label: 'Resumen', children: <p>panel resumen</p> },
    { key: 'b', label: 'Materias', children: <p>panel materias</p> },
  ];

  it('muestra la pestaña activa y cambia al hacer clic', async () => {
    const onChange = vi.fn();
    render(<DetailTabsPanel items={items} defaultActiveKey="a" onChange={onChange} />);
    expect(screen.getByText('panel resumen')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Materias' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(await screen.findByText('panel materias')).toBeVisible();
  });
});

describe('CarreraCardPicker (estados)', () => {
  // El input del radio-button va oculto con pointer-events: none (patrón de AntD).
  const usuario = userEvent.setup({ pointerEventsCheck: 0 });
  const carreras = [
    { id: 1, nombre: 'Contaduría General', codigo: 'CG', colorHex: '#aa3300' },
    { id: 2, nombre: 'Sistemas Informáticos', codigo: 'SI', colorHex: '#0033aa' },
  ];

  it('error: alerta y sin tarjetas', () => {
    render(<CarreraCardPicker carreras={carreras} error="No se pudo cargar carreras" />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar carreras');
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('cargando: muestra el tip', () => {
    render(<CarreraCardPicker carreras={carreras} loading />);
    expect(screen.getByText('Cargando carreras…')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('vacío: mensaje explicativo', () => {
    render(<CarreraCardPicker carreras={[]} />);
    expect(screen.getByText('No hay carreras disponibles')).toBeInTheDocument();
  });

  it('muestra una tarjeta por carrera, marca la seleccionada y emite el id elegido', async () => {
    const onChange = vi.fn();
    render(<CarreraCardPicker carreras={carreras} value={1} onChange={onChange} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();

    await usuario.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('carreras no disponibles no se pueden elegir y se rotulan', async () => {
    const onChange = vi.fn();
    render(<CarreraCardPicker carreras={carreras} disabledIds={[2]} onChange={onChange} />);

    expect(screen.getByText('No disponible')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeDisabled();
    await usuario.click(radios[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('readOnly conserva la selección pero no emite cambios', async () => {
    const onChange = vi.fn();
    render(<CarreraCardPicker carreras={carreras} value={1} readOnly onChange={onChange} />);
    await usuario.click(screen.getAllByRole('radio')[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled deshabilita todo el grupo', () => {
    render(<CarreraCardPicker carreras={carreras} disabled />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });
});
