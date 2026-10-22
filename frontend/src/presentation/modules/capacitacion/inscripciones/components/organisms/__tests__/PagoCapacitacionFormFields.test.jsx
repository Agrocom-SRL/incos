import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import PagoCapacitacionFormFields from '../PagoCapacitacionFormFields';

const MATRICULA = [{ value: 'MATRICULA', label: 'Matrícula (instituto)' }];
const AMBOS = [...MATRICULA, { value: 'CURSO', label: 'Costo del curso (entidad certificadora)' }];

const renderCampos = (props) =>
  render(
    <Form layout="vertical">
      <PagoCapacitacionFormFields reglasMetodo={{}} {...props} />
    </Form>,
  );

describe('PagoCapacitacionFormFields · concepto', () => {
  it('con una sola opción no hay selector: muestra el concepto y la nota del curso externo', () => {
    renderCampos({ conceptoOptions: MATRICULA, cursoExterno: true });
    expect(screen.getByText('Matrícula (instituto)')).toBeTruthy();
    expect(screen.getByText(/se deposita a la entidad certificadora/i)).toBeTruthy();
    expect(screen.queryByRole('combobox', { name: /concepto del pago/i })).toBeNull();
  });

  it('con dos opciones ofrece el selector de concepto', () => {
    renderCampos({ conceptoOptions: AMBOS });
    expect(screen.getByRole('combobox', { name: /concepto del pago/i })).toBeTruthy();
    expect(screen.queryByText(/se deposita a la entidad certificadora/i)).toBeNull();
  });
});
