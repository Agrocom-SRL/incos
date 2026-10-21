import { useEffect, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form, InputNumber, Switch } from 'antd';

/**
 * Regresión: al pasar al paso 2 los campos de costo se desmontan. `Form.useWatch` sin
 * `preserve: true` los ve vacíos, el interruptor figura apagado y el efecto «apagar limpia el
 * monto» borraba el costo escrito (el backend recibía costo 0 con tieneCosto true).
 */
const formRef = { current: null };

const Wizard = ({ preserve }) => {
  const [form] = Form.useForm();
  const [paso, setPaso] = useState(1);
  const tieneCosto = Form.useWatch('tieneCosto', preserve ? { form, preserve: true } : form) === true;
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  useEffect(() => {
    if (!tieneCosto) form.setFieldsValue({ costo: undefined });
  }, [tieneCosto, form]);
  return (
    <Form form={form}>
      {paso === 1 ? (
        <>
          <Form.Item name="tieneCosto" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="costo">
            <InputNumber />
          </Form.Item>
        </>
      ) : null}
      <button type="button" onClick={() => form.setFieldsValue({ tieneCosto: true, costo: 150 })}>
        escribir
      </button>
      <button type="button" onClick={() => setPaso(2)}>
        siguiente
      </button>
    </Form>
  );
};

describe('costos al cambiar de paso', () => {
  it('sin preserve el costo se pierde (causa)', async () => {
    render(<Wizard preserve={false} />);
    fireEvent.click(screen.getByText('escribir'));
    fireEvent.click(screen.getByText('siguiente'));
    await waitFor(() => expect(screen.queryByRole('switch')).toBeNull());
    expect(formRef.current.getFieldValue('costo')).toBeUndefined();
  });

  it('con preserve: true el costo sobrevive al paso siguiente', async () => {
    render(<Wizard preserve />);
    fireEvent.click(screen.getByText('escribir'));
    fireEvent.click(screen.getByText('siguiente'));
    await waitFor(() => expect(screen.queryByRole('switch')).toBeNull());
    expect(formRef.current.getFieldValue('costo')).toBe(150);
  });
});
