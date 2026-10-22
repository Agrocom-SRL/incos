import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import CursoGruposEditor from '../CursoGruposEditor';

const OPCIONES = [
  { value: 1, label: 'SAB 08:00-12:00' },
  { value: 2, label: 'SAB 15:00-19:00' },
];
const formRef = { current: null };

const Contenedor = ({ inicial, opciones = OPCIONES, onCrearHorario, aulaProps = {} }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  return (
    <Form form={form} layout="vertical" initialValues={inicial}>
      <CursoGruposEditor
        title="Grupos y horarios"
        description="Texto de ayuda."
        horarioOptions={opciones}
        onCrearHorario={onCrearHorario}
        {...aulaProps}
      />
    </Form>
  );
};

describe('CursoGruposEditor', () => {
  it('«Agregar grupo» añade una sub-sección de grupo', async () => {
    render(<Contenedor inicial={{ grupos: [] }} />);
    expect(screen.queryByText('Grupo 1')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    expect(await screen.findByText('Grupo 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: /agregar otro grupo/i })).toBeTruthy();
  });

  it('sin valor inicial de grupos también agrega', async () => {
    render(<Contenedor inicial={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    expect(await screen.findByText('Grupo 1')).toBeTruthy();
  });

  it('permite agregar un segundo grupo', async () => {
    render(<Contenedor inicial={{ grupos: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    fireEvent.click(await screen.findByRole('button', { name: /agregar otro grupo/i }));
    expect(await screen.findByText('Grupo 2')).toBeTruthy();
  });

  it('el grupo nuevo arranca con el cupo del curso (paso 1)', async () => {
    render(<Contenedor inicial={{ cupoMaximo: 30, grupos: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await screen.findByText('Grupo 1');
    expect(formRef.current.getFieldValue(['grupos', 0, 'cupoMaximo'])).toBe(30);
  });

  it('los horarios se eligen con casillas en un popup y se muestran como pills debajo', async () => {
    render(<Contenedor inicial={{ grupos: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await screen.findByText('Grupo 1');
    expect(screen.getByText('Sin horarios asignados')).toBeTruthy();
    fireEvent.click(screen.getByPlaceholderText('Seleccione uno o más horarios'));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'SAB 08:00-12:00' }));
    expect(formRef.current.getFieldValue(['grupos', 0, 'horarios'])).toEqual([{ horarioId: 1 }]);
    expect(await screen.findByRole('button', { name: 'Quitar SAB 08:00-12:00' })).toBeTruthy();
  });

  it('quitar una pill saca el horario del grupo', async () => {
    render(<Contenedor inicial={{ grupos: [{ key: 'a', nombre: 'x', horarios: [{ horarioId: 1 }] }] }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar SAB 08:00-12:00' }));
    expect(formRef.current.getFieldValue(['grupos', 0, 'horarios'])).toEqual([]);
  });

  it('un horario ya usado por otro grupo se sigue ofreciendo (el aula se asigna después)', async () => {
    render(
      <Contenedor
        inicial={{
          grupos: [
            { key: 'a', nombre: 'lun-vie', horarios: [{ horarioId: 1 }] },
            { key: 'b', nombre: 'mar-jue', horarios: [] },
          ],
        }}
      />,
    );
    await screen.findByText('Grupo 2');
    fireEvent.click(screen.getAllByPlaceholderText('Seleccione uno o más horarios')[1]);
    expect(await screen.findByRole('checkbox', { name: 'SAB 08:00-12:00' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'SAB 15:00-19:00' })).toBeTruthy();
  });

  it('el botón «Agregar horario» abre el modal de creación para ese grupo', async () => {
    const onCrearHorario = vi.fn();
    render(<Contenedor inicial={{ grupos: [] }} onCrearHorario={onCrearHorario} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await screen.findByText('Grupo 1');
    fireEvent.click(screen.getByRole('button', { name: /agregar horario/i }));
    expect(onCrearHorario).toHaveBeenCalledWith(0);
  });

  it('cada grupo tiene el campo opcional «Aula» (select con el catálogo)', async () => {
    render(
      <Contenedor
        inicial={{ grupos: [] }}
        aulaProps={{ aulaOptions: [{ value: 3, label: 'A-01 · Aula 1' }], aulasDisponible: true }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await screen.findByText('Grupo 1');
    expect(screen.getByText('Aula')).toBeTruthy();
    expect(formRef.current.getFieldValue(['grupos', 0, 'aulaId'])).toBeNull();
  });

  it('sin permiso sobre el catálogo de aulas el select queda deshabilitado', async () => {
    render(<Contenedor inicial={{ grupos: [] }} aulaProps={{ aulasDisponible: false }} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await screen.findByText('Grupo 1');
    const select = screen.getByText('Catálogo de aulas no disponible para su rol');
    expect(select).toBeTruthy();
  });
});
