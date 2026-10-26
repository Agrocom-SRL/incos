import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { App, Form, Input } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/seguridad/usuarios/nuevo', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({
  useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }),
}));

import { useSeguridadUsuarioCreatePage } from '../useSeguridadUsuarioCreatePage';

const ROLES = [
  { id: 1, codigo: 'ADMIN_SISTEMA' },
  { id: 2, codigo: 'DOCENTE' },
  { id: 3, codigo: 'ESTUDIANTE' },
  { id: 4, codigo: 'RECTOR' },
];

// Monta el hook dentro de un <Form> real para que Form.useWatch y los campos funcionen.
function montar() {
  const ref = { current: null };
  function Arnes() {
    const h = useSeguridadUsuarioCreatePage();
    ref.current = h;
    return (
      <Form form={h.form} key={h.wizardFormMountKey} initialValues={h.usuarioAltaInitialValues}>
        {['categoria_creacion', 'rol_id', 'username', 'password', 'password_confirm', 'docente_id', 'estudiante_id'].map((n) => (
          <Form.Item key={n} name={n}>
            <Input />
          </Form.Item>
        ))}
      </Form>
    );
  }
  render(
    <App>
      <Arnes />
    </App>,
  );
  return ref;
}

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/seguridad/usuarios/nuevo', state: null };
  Object.keys(casos).forEach((k) => delete casos[k]);
  casos.listarRolesAdmin = () => ({ ejecutar: vi.fn().mockResolvedValue(ROLES) });
});

describe('useSeguridadUsuarioCreatePage', () => {
  it('modo alta: pasos, migas y valores iniciales', async () => {
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    expect(ref.current.isEditMode).toBe(false);
    expect(ref.current.wizardSteps).toHaveLength(3);
    expect(ref.current.breadcrumbItems.at(-1).title).toBe('Nuevo usuario');
    expect(ref.current.usuarioAltaInitialValues.categoria_creacion).toBe('ACCESO_SISTEMA');
    expect(ref.current.wizardFormMountKey).toBe('usuario-nuevo');
    expect(ref.current.wizardInitialStep).toBe(0);
    // la categoría ACCESO_SISTEMA fija el único rol permitido
    await waitFor(() => expect(ref.current.form.getFieldValue('rol_id')).toBe(1));
  });

  it('valida cada paso con los campos de la categoría', async () => {
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    const f = { getFieldValue: vi.fn().mockReturnValue('ASIGNAR_DOCENTE'), validateFields: vi.fn().mockResolvedValue({}) };
    await ref.current.onValidateBeforeNext(1, f);
    expect(f.validateFields).toHaveBeenLastCalledWith(['categoria_creacion']);
    await ref.current.onValidateBeforeNext(2, f);
    expect(f.validateFields).toHaveBeenLastCalledWith(['docente_id']);
    await ref.current.onValidateBeforeNext(3, f);
    expect(f.validateFields).toHaveBeenLastCalledWith(['username', 'password', 'password_confirm', 'rol_id']);
    f.getFieldValue.mockReturnValue('otra');
    f.validateFields.mockClear();
    await ref.current.onValidateBeforeNext(2, f);
    expect(f.validateFields).not.toHaveBeenCalled();
    await expect(ref.current.onValidateBeforeNext(9, f)).resolves.toBeUndefined();
  });

  it('crea el usuario y navega a su ficha', async () => {
    const crear = vi.fn().mockResolvedValue({ id: 15 });
    casos.crearUsuarioAdmin = () => ({ ejecutar: crear });
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    ref.current.form.setFieldsValue({ username: ' juan ', password: 'abc12345', password_confirm: 'abc12345', rol_id: 1 });
    ref.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await ref.current.handleFinish();
    });
    expect(crear).toHaveBeenCalledWith(expect.objectContaining({ username: 'juan', rol_id: 1, categoria_creacion: 'ACCESO_SISTEMA', password: 'abc12345' }));
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/15');
  });

  it('muestra el error del backend al crear', async () => {
    casos.crearUsuarioAdmin = () => ({ ejecutar: vi.fn().mockRejectedValue({ error: 'Usuario duplicado' }) });
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    ref.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await ref.current.handleFinish();
    });
    expect(ref.current.submitError).toBe('Usuario duplicado');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('no envía si la validación del último paso falla', async () => {
    const crear = vi.fn();
    casos.crearUsuarioAdmin = () => ({ ejecutar: crear });
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    ref.current.form.validateFields = vi.fn().mockRejectedValue(new Error('inválido'));
    await act(async () => {
      await ref.current.handleFinish();
    });
    expect(crear).not.toHaveBeenCalled();
  });

  it('precarga docente desde el detalle del docente', async () => {
    router.location = {
      pathname: '/seguridad/usuarios/nuevo',
      state: {
        forceCategoriaCreacion: 'ASIGNAR_DOCENTE',
        forceRoleCode: 'DOCENTE',
        prefillDocenteUsuario: { docenteId: 9, ci: '1234567', nombreCompleto: 'Ana', ciCompleto: '1234567 LP', emailPersonal: 'a@x' },
      },
    };
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    await waitFor(() => expect(ref.current.form.getFieldValue('rol_id')).toBe(2));
    expect(ref.current.form.getFieldValue('docente_id')).toBe(9);
    expect(ref.current.wizardFormMountKey).toBe('prefill-docente-9');
  });

  it('precarga estudiante y vuelve a la ruta indicada', async () => {
    router.location = {
      pathname: '/seguridad/usuarios/nuevo',
      state: {
        forceCategoriaCreacion: 'ASIGNAR_ESTUDIANTE',
        createInitialStep: 2,
        returnToPath: '/estudiantes/5',
        prefillEstudianteUsuario: { estudianteId: 5, ci: '7654321', nombreCompleto: 'Beto', codigo: 'E5' },
      },
    };
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    await waitFor(() => expect(ref.current.form.getFieldValue('rol_id')).toBe(3));
    expect(ref.current.wizardInitialStep).toBe(2);
    expect(ref.current.wizardFormMountKey).toBe('prefill-estudiante-5');
    act(() => ref.current.goToUsuariosList());
    expect(router.navigate).toHaveBeenCalledWith('/estudiantes/5');
  });

  it('goToUsuariosList va al listado por defecto', async () => {
    const ref = montar();
    await waitFor(() => expect(ref.current.roles).toHaveLength(4));
    act(() => ref.current.goToUsuariosList());
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios');
  });

  it('modo edición: carga el usuario y actualiza', async () => {
    router.params = { id: '20' };
    router.location = { pathname: '/seguridad/usuarios/20/editar', state: null };
    casos.obtenerUsuarioAdmin = () => ({ ejecutar: vi.fn().mockResolvedValue({ id: 20, username: 'ana', rol: { id: 1 }, personal: { ci: '123' } }) });
    const actualizar = vi.fn().mockResolvedValue({});
    casos.actualizarUsuarioAdmin = () => ({ ejecutar: actualizar });
    const ref = montar();
    await waitFor(() => expect(ref.current.categoriaFijada).toBe('ACCESO_SISTEMA'));
    expect(ref.current.isEditMode).toBe(true);
    expect(ref.current.wizardInitialStep).toBe(1);
    expect(ref.current.breadcrumbItems.at(-1).title).toBe('Editar usuario #20');
    await waitFor(() => expect(ref.current.form.getFieldValue('username')).toBe('ana'));
    ref.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await ref.current.handleFinish();
    });
    expect(actualizar).toHaveBeenCalledWith(20, expect.objectContaining({ username: 'ana' }));
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/20');
    // en edición solo valida username y rol en el paso 3
    const f = { getFieldValue: vi.fn(), validateFields: vi.fn().mockResolvedValue({}) };
    await ref.current.onValidateBeforeNext(3, f);
    expect(f.validateFields).toHaveBeenLastCalledWith(['username', 'rol_id']);
  });

  it('modo edición: error de carga queda en submitError', async () => {
    router.params = { id: '20' };
    router.location = { pathname: '/seguridad/usuarios/20/editar', state: null };
    casos.obtenerUsuarioAdmin = () => ({ ejecutar: vi.fn().mockRejectedValue({ error: 'No existe' }) });
    const ref = montar();
    await waitFor(() => expect(ref.current.submitError).toBe('No existe'));
  });
});
