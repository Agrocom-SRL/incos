import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import UsuariosListPage from '../UsuariosListPage';
import UsuarioDetailPage from '../UsuarioDetailPage';
import UsuarioAccesosPage from '../UsuarioAccesosPage';
import UsuarioCreatePage from '../UsuarioCreatePage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  accesos: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@/application/modules/seguridad/hooks', () => ({
  useSeguridadUsuariosListPageContext: mocks.list,
  useSeguridadUsuarioDetailPageContext: mocks.detail,
  useSeguridadUsuarioPermisosPageContext: mocks.accesos,
  useSeguridadUsuarioCreatePageContext: mocks.create,
}));

const bc = [{ title: 'Seguridad' }];
const admin = (...acciones) => ({ auth: { permisos: [permiso('seguridad.usuario.administrar', ...acciones)] } });

describe('UsuariosListPage', () => {
  let state;
  beforeEach(() => {
    state = {
      usuarios: [{ id: 1, username: 'ana' }],
      loading: false,
      searchText: '',
      columns: [{ title: 'Usuario', dataIndex: 'username' }],
      breadcrumbItems: bc,
      tablePagination: {},
      categoria: 'sistema',
      setCategoria: vi.fn(),
      handleCreateUsuario: vi.fn(),
      handleSearchChange: vi.fn(),
    };
    mocks.list.mockReturnValue(state);
  });

  it('sin permiso LISTAR bloquea la pantalla', () => {
    renderWithProviders(<UsuariosListPage />);
    expect(screen.getByText('No tiene permiso para ver esta página.')).toBeInTheDocument();
  });

  it('la URL manda: sincroniza la categoría del hook con el tab activo', () => {
    renderWithProviders(<UsuariosListPage />, { ...admin('LISTAR'), route: '/seguridad/usuarios?categoria=docente' });
    expect(state.setCategoria).toHaveBeenCalledWith('docente');
    expect(screen.getByText('Usuarios docentes')).toBeInTheDocument();
    expect(screen.getByText('ana')).toBeInTheDocument();
  });

  it('cambiar de pestaña actualiza la URL y el panel', async () => {
    renderWithProviders(<UsuariosListPage />, admin('LISTAR'));
    await userEvent.click(screen.getByRole('tab', { name: /Estudiante/ }));
    expect(await screen.findByText('Usuarios estudiantes')).toBeInTheDocument();
  });

  it('"Nuevo usuario" exige permiso CREAR', async () => {
    const { unmount } = renderWithProviders(<UsuariosListPage />, admin('LISTAR'));
    expect(screen.queryByRole('button', { name: /Nuevo usuario/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<UsuariosListPage />, {
      auth: { permisos: [permiso('seguridad.usuario.administrar', 'LISTAR'), permiso('seguridad.usuario.crear', 'CREAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Nuevo usuario/ }));
    expect(state.handleCreateUsuario).toHaveBeenCalled();
  });
});

describe('UsuarioDetailPage', () => {
  const state = (extra = {}) => ({
    usuario: {
      id: 1,
      username: 'ana',
      email: 'a@b.com',
      estado: 'BLOQUEADO',
      motivo_cambio_estado: 'Mora',
      rol: { nombre: 'Docente', is_system: false },
      vinculo_perfil: { tipo_etiqueta: 'Docente', nombre_completo: 'Pérez Ana', lineas: [{ etiqueta: 'CI', valor: '123' }] },
    },
    loading: false,
    savingPass: false,
    savingEstado: false,
    openPass: false,
    openEstado: false,
    puedeEditar: true,
    puedeVerPermisos: true,
    permisosEfectivosCount: 30,
    estadoInitialValues: {},
    breadcrumbItems: bc,
    setOpenPass: vi.fn(),
    setOpenEstado: vi.fn(),
    savePass: vi.fn(),
    saveEstado: vi.fn(),
    goToUsuarioEdit: vi.fn(),
    goToUsuarioPermisos: vi.fn(),
    goToUsuariosList: vi.fn(),
    ...extra,
  });

  it('sin permiso DETALLE bloquea', () => {
    mocks.detail.mockReturnValue(state());
    renderWithProviders(<UsuarioDetailPage />);
    expect(screen.getByText('No tiene permiso para ver esta página.')).toBeInTheDocument();
  });

  it('muestra la ficha: cuenta, vínculo y permisos efectivos', () => {
    mocks.detail.mockReturnValue(state());
    renderWithProviders(<UsuarioDetailPage />, admin('DETALLE'));
    expect(screen.getByText('Usuario ana')).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('en "Rol y acceso" las acciones de edición exigen EDITAR y abren los modales', async () => {
    const s = state();
    mocks.detail.mockReturnValue(s);
    const { unmount } = renderWithProviders(<UsuarioDetailPage initialTab="acceso" />, admin('DETALLE'));
    expect(screen.getByRole('button', { name: /Ver accesos/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cambiar contraseña/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<UsuarioDetailPage initialTab="acceso" />, admin('DETALLE', 'EDITAR'));
    expect(screen.getByText('Mora', { selector: '.sd-field__value, .sd-field__value *, dd, span, div' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cambiar contraseña/ }));
    expect(s.setOpenPass).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole('button', { name: /Cambiar estado/ }));
    expect(s.setOpenEstado).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole('button', { name: /Ver accesos/ }));
    expect(s.goToUsuarioPermisos).toHaveBeenCalled();
  });

  it('usuario inexistente: estado vacío', () => {
    mocks.detail.mockReturnValue(state({ usuario: null }));
    renderWithProviders(<UsuarioDetailPage />, admin('DETALLE'));
    expect(screen.getByText('No se encontró el usuario')).toBeInTheDocument();
  });
});

describe('UsuarioAccesosPage', () => {
  const state = (extra = {}) => ({
    usuario: { id: 1, username: 'ana', email: 'a@b.com', estado: null, rol: { nombre: 'Docente', is_system: false } },
    grupos: [{ grupoUi: 'docentes', grupoNombre: 'Docentes', rutaSidebar: 'Docentes', accionesValidas: ['LISTAR'], accionesAsignadas: ['LISTAR'] }],
    loading: false,
    loadingGrupos: false,
    dominios: [{ value: 'docentes', label: 'Docentes' }],
    dominioSeleccionado: 'docentes',
    puedeVer: true,
    puedeEditar: true,
    esAdminSistema: false,
    overrideOpen: false,
    savingOverride: false,
    pendingToggle: null,
    breadcrumbItems: bc,
    setDominioSeleccionado: vi.fn(),
    errorGrupos: null,
    reintentarGrupos: vi.fn(),
    estadoCelda: () => 'heredado',
    overrideDeCelda: () => undefined,
    toggleCelda: vi.fn(),
    isCeldaToggling: () => false,
    onAddOverride: vi.fn(),
    onCloseOverrideModal: vi.fn(),
    goToUsuarioDetail: vi.fn(),
    ...extra,
  });

  it('sin permiso EDITAR bloquea la pantalla', () => {
    mocks.accesos.mockReturnValue(state());
    renderWithProviders(<UsuarioAccesosPage />);
    expect(screen.getByText('Sin permiso.')).toBeInTheDocument();
  });

  it('muestra leyenda y grilla para quien puede ver', () => {
    mocks.accesos.mockReturnValue(state());
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    expect(screen.getByText('Heredado del rol')).toBeInTheDocument();
    expect(screen.getByText('Docentes', { selector: 'strong, .ant-typography strong' })).toBeInTheDocument();
  });

  it('sin permiso de ver la grilla muestra advertencia', () => {
    mocks.accesos.mockReturnValue(state({ puedeVer: false }));
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    expect(screen.getByText('Sin permiso para ver la grilla de accesos')).toBeInTheDocument();
  });

  it('usuario sin rol: vacío y sin tabs de dominio', () => {
    mocks.accesos.mockReturnValue(state({ usuario: { id: 1, username: 'ana', rol: null } }));
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    expect(screen.getByText('Este usuario no tiene un rol asignado.')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('admin del sistema: aviso y grilla deshabilitada', () => {
    mocks.accesos.mockReturnValue(state({ esAdminSistema: true }));
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    expect(screen.getByText('Administrador del sistema')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').every((c) => c.disabled)).toBe(true);
  });

  it('error de carga: alerta con reintento', async () => {
    const s = state({ errorGrupos: 'Timeout' });
    mocks.accesos.mockReturnValue(s);
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.reintentarGrupos).toHaveBeenCalled();
  });

  it('con un toggle pendiente abre el modal de ajuste con el permiso elegido', () => {
    mocks.accesos.mockReturnValue(
      state({ overrideOpen: true, pendingToggle: { permiso_id: 1, accion: 'LISTAR', tipo: 'REVOKE', permisoLabel: 'Docentes' } }),
    );
    renderWithProviders(<UsuarioAccesosPage />, admin('EDITAR'));
    expect(screen.getByText('Ajuste individual de acceso')).toBeInTheDocument();
  });
});

describe('UsuarioCreatePage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.create.mockReturnValue({
      form,
      roles: [],
      loading: false,
      submitError: null,
      prefillDocenteUsuario: null,
      prefillEstudianteUsuario: null,
      isEditMode: false,
      categoriaFijada: null,
      wizardInitialStep: 0,
      wizardFormMountKey: 'k',
      breadcrumbItems: bc,
      wizardSteps: [
        { title: 'Paso uno', formTitle: 'Primero', sections: ['otra'], config: { otra: { title: 'Sección', fields: [{ name: 'x', label: 'Campo X', type: 'text' }] } } },
      ],
      usuarioAltaInitialValues: {},
      onValidateBeforeNext: vi.fn().mockResolvedValue(true),
      handleFinish: vi.fn(),
      goToUsuariosList: vi.fn(),
      ...props,
    });
    return <UsuarioCreatePage />;
  };

  it('sin permiso CREAR muestra el aviso', () => {
    renderWithProviders(<Montar />);
    expect(screen.getByText('No tiene permiso para crear usuarios.')).toBeInTheDocument();
  });

  it('con permiso muestra el wizard y el título según el modo', () => {
    const auth = { permisos: [permiso('seguridad.usuario.crear', 'CREAR')] };
    const { unmount } = renderWithProviders(<Montar />, { auth });
    expect(screen.getAllByText('Nuevo usuario').length).toBeGreaterThan(0);
    unmount();
    renderWithProviders(<Montar isEditMode />, { auth });
    expect(screen.getAllByText('Editar usuario').length).toBeGreaterThan(0);
  });
});
