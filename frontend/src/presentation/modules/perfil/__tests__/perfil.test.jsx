import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { buildPerfilAccesos, resumen } from '../config/perfilAccesos';
import PerfilAccesosGrid from '../components/organisms/PerfilAccesosGrid';
import PerfilStaffSection from '../components/organisms/PerfilStaffSection';
import PerfilDocenteSection from '../components/organisms/PerfilDocenteSection';
import PerfilEstudianteSection from '../components/organisms/PerfilEstudianteSection';
import CambiarMiPasswordModal from '../components/modals/CambiarMiPasswordModal';
import PerfilPage from '../pages/PerfilPage';

const mocks = vi.hoisted(() => ({ page: vi.fn(), navigate: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@/application/modules/perfil/hooks', () => ({ usePerfilPageContext: mocks.page }));

describe('perfilAccesos', () => {
  it('resumen une las partes presentes o cae al texto guía', () => {
    expect(resumen(['A', null, 'B'], 'x')).toBe('A · B');
    expect(resumen([null, ''], 'x')).toBe('x');
  });

  it('el estudiante tiene su set y el saldo cambia el mensaje', () => {
    const conSaldo = buildPerfilAccesos('ESTUDIANTE', { resumenEstudiante: { saldoPendiente: 50, carrera: 'Sistemas' } });
    expect(conSaldo.map((a) => a.key)).toContain('mis-aportes');
    expect(conSaldo.find((a) => a.key === 'mis-aportes').description).toMatch(/Saldo pendiente/);
    expect(conSaldo.find((a) => a.key === 'mis-datos').description).toBe('Sistemas');
    const alDia = buildPerfilAccesos('ESTUDIANTE', { resumenEstudiante: { saldoPendiente: 0 } });
    expect(alDia.find((a) => a.key === 'mis-aportes').description).toBe('Sin saldo pendiente.');
  });

  it('un rol sin mapeo no tiene accesos y los demás roles sí', () => {
    expect(buildPerfilAccesos('INEXISTENTE')).toEqual([]);
    expect(buildPerfilAccesos(undefined)).toEqual([]);
    ['DOCENTE', 'RECTOR', 'ADMIN_SISTEMA', 'DIR_ACADEMICO', 'SEC_ACADEMICA', 'DIR_ADMIN', 'SEC_ADMIN'].forEach((rol) => {
      const accesos = buildPerfilAccesos(rol, {});
      expect(accesos.length).toBeGreaterThan(0);
      accesos.forEach((a) => {
        expect(a.path.startsWith('/')).toBe(true);
        expect(a.title).toBeTruthy();
      });
    });
  });
});

describe('PerfilAccesosGrid', () => {
  beforeEach(() => mocks.navigate.mockReset());
  const accesos = [
    { key: 'a', icon: <i />, title: 'Libre', description: 'sin permiso', path: '/libre' },
    { key: 'b', icon: <i />, title: 'Restringido', description: 'con permiso', path: '/rest', permiso: { codigo: 'x.y', accion: 'LISTAR' } },
    { key: 'c', icon: <i />, title: 'Externo', description: 'ruta externa', path: 'https://malo.test' },
    { key: 'd', icon: <i />, title: 'Multiple', description: 'OR', path: '/or', permiso: { codigo: ['m.a', 'm.b'], accion: 'LISTAR' } },
  ];

  it('oculta lo que el usuario no puede ver (fail-closed) y soporta códigos en OR', () => {
    renderWithProviders(<PerfilAccesosGrid accesos={accesos} />, { auth: { permisos: [permiso('m.b', 'LISTAR')] } });
    expect(screen.getByText('Libre')).toBeInTheDocument();
    expect(screen.queryByText('Restringido')).not.toBeInTheDocument();
    expect(screen.getByText('Multiple')).toBeInTheDocument();
  });

  it('navega solo a rutas internas', async () => {
    renderWithProviders(<PerfilAccesosGrid accesos={accesos} />, { auth: { permisos: [permiso('x.y', 'LISTAR')] } });
    await userEvent.click(screen.getByText('Restringido'));
    expect(mocks.navigate).toHaveBeenCalledWith('/rest');
    mocks.navigate.mockClear();
    await userEvent.click(screen.getByText('Externo'));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('sin accesos visibles no renderiza nada', () => {
    const { container } = renderWithProviders(<PerfilAccesosGrid accesos={[]} />);
    expect(container.querySelector('.estudiante-accesos-grid')).toBeNull();
    expect(screen.queryByText('Accesos')).not.toBeInTheDocument();
  });
});

describe('secciones por rol', () => {
  const rol = { codigo: 'DOCENTE', nombre: 'Docente', tipo: 'DOCENTE' };
  const usuario = { username: 'ana', email: 'a@b.com', rol };

  it('staff: cuenta, tipo de rol y ficha vinculada', () => {
    renderWithProviders(
      <PerfilStaffSection
        usuario={usuario}
        tipoRol="Personalizado"
        vinculoPerfil={{ tipo_etiqueta: 'Personal', nombre_completo: 'Pérez Ana', lineas: [{ etiqueta: 'Cargo', valor: 'Rectora' }, { etiqueta: 'Oficina', valor: '' }] }}
        accesos={[]}
      />,
    );
    expect(screen.getByText('Cuenta y rol')).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('Rectora')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('staff sin vínculo no muestra "Persona / ficha"', () => {
    renderWithProviders(<PerfilStaffSection usuario={{ username: 'x', rol: null }} tipoRol="—" accesos={[]} />);
    expect(screen.queryByText('Persona / ficha')).not.toBeInTheDocument();
    expect(screen.getByText('Sin correo')).toBeInTheDocument();
  });

  it('docente: métricas de carga con guion si faltan', () => {
    const { unmount } = renderWithProviders(
      <PerfilDocenteSection usuario={usuario} nombreMostrado="Ana Pérez" resumenDocente={{ cursos: 3, horasSemanales: 12, gestion: '2026' }} accesos={[]} />,
    );
    expect(screen.getByText('12')).toBeInTheDocument();
    unmount();
    renderWithProviders(<PerfilDocenteSection usuario={usuario} nombreMostrado="Ana Pérez" accesos={[]} vinculoPerfil={{ lineas: [{ etiqueta: 'Título profesional', valor: 'Ing.' }] }} />);
    expect(screen.getByText('Docente · Ing.')).toBeInTheDocument();
  });

  it('estudiante: cuenta y correo', () => {
    renderWithProviders(<PerfilEstudianteSection usuario={{ ...usuario, rol: null }} nombreMostrado="Luis Soto" correo="l@x.com" accesos={[]} />);
    expect(screen.getByText('l@x.com')).toBeInTheDocument();
    expect(screen.getByText('Estudiante')).toBeInTheDocument();
  });
});

describe('CambiarMiPasswordModal', () => {
  it('exige la contraseña actual y no envía si falta algo', async () => {
    const onSubmit = vi.fn();
    render(<CambiarMiPasswordModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('Ingrese su contraseña actual')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía actual y nueva cuando coinciden', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<CambiarMiPasswordModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Su contraseña actual'), 'Vieja-1234');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Nueva-12345');
    await userEvent.type(screen.getByPlaceholderText('Repita la contraseña'), 'Nueva-12345');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ password_actual: 'Vieja-1234', password_nuevo: 'Nueva-12345' }));
  });

  it('confirmación distinta bloquea el envío', async () => {
    const onSubmit = vi.fn();
    render(<CambiarMiPasswordModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Su contraseña actual'), 'Vieja-1234');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Nueva-12345');
    await userEvent.type(screen.getByPlaceholderText('Repita la contraseña'), 'distinta-123');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('PerfilPage', () => {
  const base = (extra = {}) => ({
    usuario: { username: 'ana', email: 'a@b.com', rol: { codigo: 'RECTOR', nombre: 'Rector' } },
    loading: false,
    vinculoPerfil: null,
    esEstudiante: false,
    esDocente: false,
    resumenEstudiante: null,
    resumenDocente: null,
    rol: { codigo: 'RECTOR' },
    tipoRol: 'Sistema',
    nombreMostrado: 'Ana',
    correo: 'a@b.com',
    openPass: false,
    saving: false,
    breadcrumbItems: [{ title: 'Inicio' }],
    setOpenPass: vi.fn(),
    cambiarPassword: vi.fn(),
    ...extra,
  });

  it('staff por defecto; el botón abre el modal de contraseña', async () => {
    const state = base();
    mocks.page.mockReturnValue(state);
    renderWithProviders(<PerfilPage />);
    expect(screen.getByText('Cuenta y rol')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cambiar contraseña/ }));
    expect(state.setOpenPass).toHaveBeenCalledWith(true);
  });

  it('elige la rama estudiante o docente', () => {
    mocks.page.mockReturnValue(base({ esEstudiante: true }));
    const { unmount } = renderWithProviders(<PerfilPage />);
    expect(screen.queryByText('Cuenta y rol')).not.toBeInTheDocument();
    expect(screen.getByText('Cuenta')).toBeInTheDocument();
    unmount();
    mocks.page.mockReturnValue(base({ esDocente: true, resumenDocente: { cursos: 2 } }));
    renderWithProviders(<PerfilPage />);
    expect(screen.getByText('Cursos')).toBeInTheDocument();
  });

  it('sin usuario muestra el vacío', () => {
    mocks.page.mockReturnValue(base({ usuario: null }));
    renderWithProviders(<PerfilPage />);
    expect(screen.getByText('No se pudo cargar su perfil')).toBeInTheDocument();
  });
});
