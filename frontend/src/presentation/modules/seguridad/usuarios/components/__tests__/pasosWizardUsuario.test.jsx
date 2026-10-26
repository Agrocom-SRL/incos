import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import UsuarioCategoriaCreacionStepContent from '../organisms/UsuarioCategoriaCreacionStepContent';
import UsuarioWizardCredencialesStepContent from '../organisms/UsuarioWizardCredencialesStepContent';
import UsuarioFormSection from '../organisms/UsuarioFormSection';
import {
  getInstitutionalCargoVisual,
  sortInstitutionalRoles,
  getWizardRoleResumenVisual,
} from '../../constants/usuarioCargoInstitucionalVisual';

const formRef = { current: null };
const Host = ({ initialValues, children }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  return (
    <Form form={form} initialValues={initialValues}>
      {children(form)}
    </Form>
  );
};

describe('UsuarioCategoriaCreacionStepContent', () => {
  it('por defecto selecciona "Sistema" y permite cambiar el tipo de alta limpiando el rol', async () => {
    render(
      <Host initialValues={{ rol_id: 7 }}>
        {(form) => <UsuarioCategoriaCreacionStepContent form={form} />}
      </Host>,
    );
    await waitFor(() => expect(formRef.current.getFieldValue('categoria_creacion')).toBe('ACCESO_SISTEMA'));
    expect(screen.getAllByRole('radio')).toHaveLength(4);

    await userEvent.click(screen.getByText('Docente'));
    expect(formRef.current.getFieldValue('categoria_creacion')).toBe('ASIGNAR_DOCENTE');
    expect(formRef.current.getFieldValue('rol_id')).toBeUndefined();
  });

  it('en modo edición las opciones están bloqueadas', () => {
    render(
      <Host initialValues={{ categoria_creacion: 'ASIGNAR_ESTUDIANTE' }}>
        {(form) => <UsuarioCategoriaCreacionStepContent form={form} isEditMode />}
      </Host>,
    );
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });
});

describe('UsuarioWizardCredencialesStepContent', () => {
  const roles = [{ id: 3, nombre: 'Docente', codigo: 'DOCENTE', tipo: 'DOCENTE' }];

  it('muestra el rol asignado según el paso anterior', () => {
    render(
      <Host initialValues={{ categoria_creacion: 'ASIGNAR_DOCENTE', rol_id: 3 }}>
        {(form) => <UsuarioWizardCredencialesStepContent form={form} rolesCatalog={roles} />}
      </Host>,
    );
    expect(screen.getByRole('status', { name: 'Rol asignado: Docente' })).toBeInTheDocument();
    expect(screen.getByText(/Acceso a docente/)).toBeInTheDocument();
  });

  it('sin rol resuelto advierte que falta', () => {
    render(
      <Host initialValues={{ categoria_creacion: 'PERSONAL_INSTITUCIONAL' }}>
        {(form) => <UsuarioWizardCredencialesStepContent form={form} rolesCatalog={[]} />}
      </Host>,
    );
    expect(screen.getByText(/No hay rol asignado aún/)).toBeInTheDocument();
  });

  it('vínculo de ficha: resume la persona y precarga usuario y contraseña con el C.I.', async () => {
    render(
      <Host
        initialValues={{
          categoria_creacion: 'ASIGNAR_ESTUDIANTE',
          rol_id: 3,
          estudiante_id: 9,
          vinculo_nombre_display: 'Pérez Ana',
          vinculo_ci_display: '1234567 LP',
        }}
      >
        {(form) => <UsuarioWizardCredencialesStepContent form={form} rolesCatalog={roles} />}
      </Host>,
    );
    expect(screen.getAllByText('Pérez Ana').length).toBeGreaterThan(0);
    expect(screen.getByText(/Sin correo registrado en la ficha/)).toBeInTheDocument();
    await waitFor(() => expect(formRef.current.getFieldValue('username')).toBe('1234567'));
    expect(formRef.current.getFieldValue('password')).toBe('1234567');
    expect(formRef.current.getFieldValue('password_confirm')).toBe('1234567');
  });

  it('no pisa credenciales ya escritas ni precarga en edición', async () => {
    render(
      <Host
        initialValues={{
          categoria_creacion: 'ASIGNAR_DOCENTE',
          vinculo_ci_display: '7654321',
          username: 'ana',
        }}
      >
        {(form) => <UsuarioWizardCredencialesStepContent form={form} rolesCatalog={roles} isEditMode />}
      </Host>,
    );
    expect(formRef.current.getFieldValue('username')).toBe('ana');
    expect(formRef.current.getFieldValue('password')).toBeUndefined();
    expect(screen.getByText(/La contraseña es opcional/)).toBeInTheDocument();
  });
});

describe('UsuarioFormSection', () => {
  it('compone encabezado, bloque previo, hijos y pie', () => {
    render(
      <Host>
        {(form) => (
          <UsuarioFormSection title="Título" description="Detalle" form={form} beforeFields={<p>antes</p>} footer={<p>pie</p>}>
            <p>hijo</p>
          </UsuarioFormSection>
        )}
      </Host>,
    );
    ['Título', 'Detalle', 'antes', 'hijo', 'pie'].forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
  });
});

describe('constantes visuales de cargo', () => {
  it('ordena los cargos institucionales y resuelve un visual por código', () => {
    const ordenados = sortInstitutionalRoles([
      { codigo: 'SEC_ADMIN', nombre: 'b' },
      { codigo: 'RECTOR', nombre: 'a' },
    ]);
    expect(ordenados.map((r) => r.codigo)).toEqual(['RECTOR', 'SEC_ADMIN']);
    expect(getInstitutionalCargoVisual('RECTOR').Icon).toBeTruthy();
    expect(getInstitutionalCargoVisual('DESCONOCIDO').Icon).toBeTruthy();
    expect(getWizardRoleResumenVisual('DOCENTE').color).toBeTruthy();
  });
});
