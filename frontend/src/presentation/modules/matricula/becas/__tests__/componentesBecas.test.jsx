import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import BecaCardContent from '../components/molecules/BecaCardContent';
import AsignacionBecaResumen from '../components/organisms/AsignacionBecaResumen';
import BecaSelectionSection from '../components/organisms/BecaSelectionSection';
import { getBecaIcon } from '../components/utils/becaIcon';

const conForm = (ui, initialValues) => {
  let formRef;
  const Wrapper = () => {
    const [form] = Form.useForm();
    useEffect(() => {
      formRef = form;
    }, [form]);
    return <Form form={form} initialValues={initialValues}>{ui(form)}</Form>;
  };
  const view = render(<Wrapper />);
  return { ...view, getForm: () => formRef };
};

describe('getBecaIcon', () => {
  const nombreIcono = (beca) => {
    const { container, unmount } = render(getBecaIcon(beca));
    const label = container.querySelector('[aria-label]')?.getAttribute('aria-label');
    unmount();
    return label;
  };

  it.each([
    [{ nombre: 'Beca Excelencia' }, 'trophy'],
    [{ codigo: 'FERIA', nombre: '1er lugar' }, 'star'],
    [{ nombre: 'Promoción institucional' }, 'sound'],
    [{ nombre: 'Razón social' }, 'team'],
    [{ nombre: 'Convenio' }, 'file-protect'],
    [{ nombre: 'Mérito académico' }, 'read'],
    [{ nombre: 'Otra cosa' }, 'gift'],
    [undefined, 'gift'],
  ])('%j usa el icono %s', (beca, esperado) => {
    expect(nombreIcono(beca)).toBe(esperado);
  });
});

describe('BecaCardContent', () => {
  it('muestra porcentaje, nombre y descripción; marca la selección', () => {
    const { container, rerender } = render(<BecaCardContent beca={{ porcentaje: 50, nombre: 'Excelencia', descripcion: 'Mejores promedios' }} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByText('Mejores promedios')).toBeInTheDocument();
    expect(container.querySelector('.beca-card__check')).toBeNull();
    rerender(<BecaCardContent beca={{ porcentaje: 50, nombre: 'Excelencia' }} selected />);
    expect(container.querySelector('.beca-card__check')).not.toBeNull();
    expect(screen.queryByText('Mejores promedios')).not.toBeInTheDocument();
  });
});

describe('BecaSelectionSection', () => {
  const becas = [{ id: 1, nombre: 'A', porcentaje: 10 }, { id: 2, nombre: 'B', porcentaje: 20 }];

  it('lista las becas y notifica la elegida', async () => {
    const onSelectBeca = vi.fn();
    conForm(() => (
      <BecaSelectionSection becasDescuentosData={{ becasDescuentos: becas, selectedBecaDescuento: becas[0] }} onSelectBeca={onSelectBeca} renderBecaCard={(b) => <span>Beca {b.nombre}</span>} />
    ));
    await userEvent.click(screen.getByText('Beca B'));
    expect(onSelectBeca).toHaveBeenCalledWith(becas[1], 1);
  });

  it('error y vacío', () => {
    conForm(() => <BecaSelectionSection becasDescuentosData={{ becasDescuentos: [], error: 'Falla' }} renderBecaCard={() => null} />);
    expect(screen.getByText('Error al cargar becas y descuentos')).toBeInTheDocument();
    expect(screen.getByText('No hay becas o descuentos disponibles')).toBeInTheDocument();
  });

  it('cargando muestra el aviso', () => {
    conForm(() => <BecaSelectionSection becasDescuentosData={{ loading: true }} renderBecaCard={() => null} />);
    expect(screen.getByText('Cargando becas y descuentos...')).toBeInTheDocument();
  });
});

describe('AsignacionBecaResumen', () => {
  const student = { codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', ciCompleto: '123' };
  const beca = { nombre: 'Excelencia', porcentaje: 50, descripcion: 'Mejores promedios' };

  it('sin beca no renderiza', () => {
    const { container } = conForm(() => <AsignacionBecaResumen student={student} beca={null} />);
    expect(container.querySelector('.resumen-panel')).toBeNull();
  });

  it('solicitud nueva: panel de beca con fecha y estado inicial', () => {
    conForm(() => <AsignacionBecaResumen student={student} beca={beca} />);
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/Solicitud:/)).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Mejores promedios')).toBeInTheDocument();
  });

  it('en edición oculta fecha y estado de una solicitud nueva', () => {
    conForm(() => <AsignacionBecaResumen student={student} beca={beca} isEditMode />);
    expect(screen.queryByText(/Solicitud:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });

  it('el motivo es obligatorio y acepta texto', async () => {
    const { getForm } = conForm((form) => <AsignacionBecaResumen student={student} beca={beca} form={form} />);
    await expect(getForm().validateFields()).rejects.toMatchObject({ errorFields: [expect.objectContaining({ name: ['observaciones'] })] });
    await userEvent.type(screen.getByPlaceholderText(/motivo de la solicitud/), 'Escasos recursos');
    await expect(getForm().validateFields()).resolves.toMatchObject({ observaciones: 'Escasos recursos' });
  });
});
