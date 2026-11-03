import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import UsuarioEstadoTag from '../atoms/UsuarioEstadoTag';
import RolDotCell from '../atoms/RolDotCell';
import UsuarioIdentidadCell from '../atoms/UsuarioIdentidadCell';
import RegistroMetricasCell from '../atoms/RegistroMetricasCell';
import CambiarPasswordModal from '../modals/CambiarPasswordModal';
import CambiarEstadoModal from '../modals/CambiarEstadoModal';
import AgregarOverrideModal from '../modals/AgregarOverrideModal';
import InstitutionalRoleRadioGroup from '../organisms/InstitutionalRoleRadioGroup';
import { createUsuariosTableColumns } from '../../config/usuariosTableColumns';
import {
  resolveUsuariosCategoria,
  USUARIOS_CATEGORIA_DEFAULT,
  USUARIOS_CATEGORIA_TABS,
} from '../../config/usuariosCategoriaTabs';
import { rolColorVar, rolPillClass } from '../../../roles/components/atoms/rolColor';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

describe('átomos de usuario', () => {
  it('UsuarioEstadoTag: sin estado es Activo y conoce los estados del ENUM', () => {
    const { rerender } = render(<UsuarioEstadoTag estado={null} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    rerender(<UsuarioEstadoTag estado="BLOQUEADO" />);
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    rerender(<UsuarioEstadoTag estado="SUSPENDIDO" />);
    expect(screen.getByText('Suspendido')).toBeInTheDocument();
    rerender(<UsuarioEstadoTag estado="OTRO" />);
    expect(screen.getByText('OTRO')).toBeInTheDocument();
  });

  it('RolDotCell: nombre, subtítulo y fallback "Sin rol"', () => {
    const { rerender } = render(<RolDotCell nombre="Rector" tipo="RECTOR" sub="Sistema" />);
    expect(screen.getByText(/Rector/)).toBeInTheDocument();
    expect(screen.getByText(/Sistema/)).toBeInTheDocument();
    rerender(<RolDotCell />);
    expect(screen.getByText('Sin rol')).toBeInTheDocument();
  });

  it('UsuarioIdentidadCell: usuario y correo, con fallbacks', () => {
    const { rerender } = render(<UsuarioIdentidadCell username="ana" email="a@b.com" />);
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    rerender(<UsuarioIdentidadCell />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Sin correo')).toBeInTheDocument();
  });

  it('RegistroMetricasCell: fechas válidas, vacías e inválidas', () => {
    render(<RegistroMetricasCell creado="2026-03-05T12:00:00" actualizado="no-es-fecha" />);
    expect(screen.getByText(/Creado: .*2026/)).toBeInTheDocument();
    expect(screen.getByText('Actualizado: no-es-fecha')).toBeInTheDocument();
    render(<RegistroMetricasCell />);
    expect(screen.getByText('Creado: —')).toBeInTheDocument();
  });

  it('rolColorVar / rolPillClass: categoría conocida, sistema y personalizado', () => {
    expect(rolColorVar('RECTOR')).toContain('error');
    expect(rolColorVar(undefined, true)).toContain('accent');
    expect(rolColorVar(undefined, false)).toContain('text-secondary');
    expect(rolPillClass('DOCENTE')).toContain('seg-rol-pill--docente');
    expect(rolPillClass(undefined, true)).toContain('seg-rol-pill--sistema');
    expect(rolPillClass()).toContain('seg-rol-pill--default');
  });
});

describe('categorías de usuarios', () => {
  it('resuelve una categoría válida y cae en la primera si es desconocida', () => {
    expect(resolveUsuariosCategoria('docente')).toBe('docente');
    expect(resolveUsuariosCategoria('xx')).toBe(USUARIOS_CATEGORIA_DEFAULT);
    expect(USUARIOS_CATEGORIA_TABS.map((t) => t.key)).toEqual(['sistema', 'estudiante', 'docente', 'personal']);
  });
});

describe('CambiarPasswordModal', () => {
  it('valida longitud mínima y coincidencia antes de enviar', async () => {
    const onSubmit = vi.fn();
    render(<CambiarPasswordModal open onCancel={vi.fn()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'corta');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('Mínimo 8 caracteres', { selector: '.ant-form-item-explain-error' })).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByPlaceholderText('Mínimo 8 caracteres'));
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Clave-Segura-1');
    await userEvent.type(screen.getByPlaceholderText('Repita la contraseña'), 'otra-distinta');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con datos válidos envía solo la nueva contraseña', async () => {
    const onSubmit = vi.fn();
    render(<CambiarPasswordModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Clave-Segura-1');
    await userEvent.type(screen.getByPlaceholderText('Repita la contraseña'), 'Clave-Segura-1');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Clave-Segura-1'));
  });
});

describe('CambiarEstadoModal', () => {
  it('estado Activo no exige motivo y envía estado null', async () => {
    const onSubmit = vi.fn();
    render(<CambiarEstadoModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: null, motivo: null }));
  });

  it('un estado restrictivo exige motivo', async () => {
    const onSubmit = vi.fn();
    render(<CambiarEstadoModal open initialValues={{ estado: 'BLOQUEADO' }} onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(await screen.findByText('El motivo es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText('Motivo del cambio de estado'), 'Mora');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: 'BLOQUEADO', motivo: 'Mora' }));
  });
});

describe('AgregarOverrideModal', () => {
  it('toggle rápido: pide motivo obligatorio y arma el payload completo', async () => {
    const onSubmit = vi.fn();
    const fixed = { permiso_id: 5, accion: 'EDITAR', tipo: 'REVOKE', permisoLabel: 'Docentes' };
    render(<AgregarOverrideModal open fixedValues={fixed} onCancel={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByText(/Va a revocar este permiso/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Revocar' }));
    expect(await screen.findByText('El motivo es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText('Razón del ajuste'), 'Licencia');
    await userEvent.click(screen.getByRole('button', { name: 'Revocar' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ permiso_id: 5, accion: 'EDITAR', tipo: 'REVOKE', motivo: 'Licencia' }),
    );
  });

  it('modo manual: exige permiso y acción y rotula "Agregar"', async () => {
    const onSubmit = vi.fn();
    render(<AgregarOverrideModal open permisoOptions={[{ value: 1, label: 'Docentes' }]} onCancel={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByText('Agregar override')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(document.querySelectorAll('.ant-form-item-explain-error').length).toBeGreaterThan(0));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('InstitutionalRoleRadioGroup', () => {
  const roles = [
    { id: 1, nombre: 'Rector', codigo: 'RECTOR', tipo: 'RECTOR' },
    { id: 2, nombre: 'Secretaría Académica', codigo: 'SEC_ACADEMICA', tipo: 'SECRETARIA' },
  ];

  it('lista cada cargo con su categoría y notifica la selección', async () => {
    const onChange = vi.fn();
    render(<InstitutionalRoleRadioGroup roles={roles} value={1} onChange={onChange} />);
    expect(screen.getAllByText('Rector').length).toBeGreaterThan(0);
    expect(screen.getByText('Secretaría')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /Secretaría Académica/ }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe(2);
  });
});

describe('createUsuariosTableColumns', () => {
  const usuario = {
    id: 3,
    username: 'ana',
    email: 'a@b.com',
    estado: 'SUSPENDIDO',
    motivo_cambio_estado: 'Mora de pagos',
    rol: { codigo: 'DOCENTE', nombre: 'Docente', tipo: 'DOCENTE', is_system: true },
  };

  it('define columnas y numera con offset', () => {
    const cols = createUsuariosTableColumns(vi.fn());
    expect(cols.map((c) => c.title)).toEqual(['#', 'Usuario', 'Rol', 'Estado', 'Registro', 'Acciones']);
    expect(cols[0].render(null, null, 0, 20)).toBe(21);
  });

  it('las celdas muestran usuario, rol, estado y motivo', () => {
    const cols = createUsuariosTableColumns(vi.fn());
    renderWithProviders(
      <>
        {cols[1].render(null, usuario)}
        {cols[2].render(null, usuario)}
        {cols[3].render(null, usuario)}
      </>,
    );
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText(/Docente/)).toBeInTheDocument();
    expect(screen.getByText(/Sistema/)).toBeInTheDocument();
    expect(screen.getByText('Suspendido')).toBeInTheDocument();
    expect(screen.getByText('Mora de pagos')).toBeInTheDocument();
  });

  it('acciones: editar docente va al paso 3; admin al paso 2; "Accesos" exige permiso de roles', async () => {
    const navigate = vi.fn();
    const acciones = createUsuariosTableColumns(navigate)[5];
    const permisos = [
      permiso('seguridad.usuario.administrar', 'EDITAR', 'DETALLE'),
      permiso('seguridad.rol.gestionar', 'LISTAR'),
    ];
    const { unmount } = renderWithProviders(acciones.render(null, usuario), { auth: { permisos } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenCalledWith('/seguridad/usuarios/3/editar', { state: { editInitialStep: 2 } });
    await userEvent.click(screen.getByRole('button', { name: 'key' }));
    expect(navigate).toHaveBeenCalledWith('/seguridad/usuarios/3/permisos');
    unmount();

    renderWithProviders(acciones.render(null, { ...usuario, rol: { codigo: 'ADMIN_SISTEMA' } }), { auth: { permisos } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenLastCalledWith('/seguridad/usuarios/3/editar', { state: { editInitialStep: 1 } });
  });

  it('sin permisos no hay acciones', () => {
    const acciones = createUsuariosTableColumns(vi.fn())[5];
    renderWithProviders(acciones.render(null, usuario));
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
