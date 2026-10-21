import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import CursoRequisitosEditor from '../CursoRequisitosEditor';

const Contenedor = ({ inicial }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={inicial}>
      <CursoRequisitosEditor title="Requisitos de inscripción" description="Texto de ayuda." />
    </Form>
  );
};

describe('CursoRequisitosEditor', () => {
  it('«Agregar requisito» añade una sub-sección de requisito', async () => {
    render(<Contenedor inicial={{ requisitos: [] }} />);
    expect(screen.queryByText('Requisito 1')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /agregar requisito/i }));
    expect(await screen.findByText('Requisito 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: /agregar otro requisito/i })).toBeTruthy();
  });

  it('permite agregar varios y quitar uno', async () => {
    render(<Contenedor inicial={{ requisitos: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar requisito/i }));
    fireEvent.click(await screen.findByRole('button', { name: /agregar otro requisito/i }));
    expect(await screen.findByText('Requisito 2')).toBeTruthy();
  });
});
