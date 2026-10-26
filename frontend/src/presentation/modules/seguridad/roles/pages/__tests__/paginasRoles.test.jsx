import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import RolesListPage from '../RolesListPage';
import RolDetailPage from '../RolDetailPage';
import RolPermisosPage from '../RolPermisosPage';
import RolFormPage from '../RolFormPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  permisos: vi.fn(),
  form: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@/application/modules/seguridad/hooks', () => ({
  useSeguridadRolesListPageContext: mocks.list,
  useSeguridadRolDetailPageContext: mocks.detail,
  useSeguridadRolPermisosPageContext: mocks.permisos,
  useRolForm: mocks.form,
}));

const bc = [{ title: 'Seguridad' }];
const gestionar = (...acciones) => ({ auth: { permisos: [permiso('seguridad.rol.gestionar', ...acciones)] } });

describe('RolesListPage', () => {
  const state = (extra = {}) => ({
    loading: false,
    columns: [{ title: 'Rol', dataIndex: 'nombre' }],
    search: '',
    filteredRoles: [{ id: 1, nombre: 'Rector' }],
    breadcrumbItems: bc,
    onSearchChange: vi.fn(),
    ...extra,
  });
  beforeEach(() => mocks.navigate.mockReset());

  it('sin permiso LISTAR muestra el aviso y no la tabla', () => {
    mocks.list.mockReturnValue(state());
    renderWithProviders(<RolesListPage />);
    expect(screen.getByText('Sin permiso.')).toBeInTheDocument();
    expect(screen.queryByText('Rector')).not.toBeInTheDocument();
  });

  it('con permiso lista roles y "Nuevo rol" exige CREAR', async () => {
    mocks.list.mockReturnValue(state());
    const { unmount } = renderWithProviders(<RolesListPage />, gestionar('LISTAR'));
    expect(screen.getByText('Rector')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo rol/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<RolesListPage />, gestionar('LISTAR', 'CREAR'));
    await userEvent.click(screen.getByRole('button', { name: /Nuevo rol/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/seguridad/roles/nuevo');
  });
});

describe('RolDetailPage', () => {
  const state = (extra = {}) => ({
    rol: { id: 1, nombre: 'Docente', codigo: 'DOCENTE', tipo: 'DOCENTE', is_system: true, cantidadPermisos: 12 },
    loading: false,
    breadcrumbItems: bc,
    puedeGestionarPermisos: true,
    usuarios: [],
    loadingUsuarios: false,
    errorUsuarios: null,
    refetchUsuarios: vi.fn(),
    searchText: '',
    handleSearchChange: vi.fn(),
    tablePagination: {},
    goToRolesList: vi.fn(),
    goToGestionarPermisos: vi.fn(),
    ...extra,
  });

  it('sin permiso DETALLE no muestra la ficha', () => {
    mocks.detail.mockReturnValue(state());
    renderWithProviders(<RolDetailPage />);
    expect(screen.getByText('No tiene permiso para ver esta página.')).toBeInTheDocument();
  });

  it('muestra la ficha con permisos y navega a gestionar permisos solo con EDITAR', async () => {
    const s = state();
    mocks.detail.mockReturnValue(s);
    const { unmount } = renderWithProviders(<RolDetailPage />, gestionar('DETALLE'));
    expect(screen.getByText('Rol Docente')).toBeInTheDocument();
    expect(screen.getByText('12', { selector: '.sd-stat__value, .sd-stat__value *' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gestionar permisos/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<RolDetailPage />, gestionar('DETALLE', 'EDITAR'));
    await userEvent.click(screen.getByRole('button', { name: /Gestionar permisos/ }));
    expect(s.goToGestionarPermisos).toHaveBeenCalled();
  });

  it('rol inexistente: estado vacío', () => {
    mocks.detail.mockReturnValue(state({ rol: null }));
    renderWithProviders(<RolDetailPage />, gestionar('DETALLE'));
    expect(screen.getByText('No se encontró el rol')).toBeInTheDocument();
  });
});

describe('RolPermisosPage', () => {
  const state = (extra = {}) => ({
    rolInfo: { id: 2, nombre: 'Secretaría', codigo: 'SEC', is_system: false },
    grupos: [
      { grupoUi: 'docentes', grupoNombre: 'Docentes', rutaSidebar: 'Docentes', accionesValidas: ['LISTAR'], accionesAsignadas: [] },
    ],
    delta: {},
    dominios: [{ value: 'docentes', label: 'Docentes' }],
    loading: false,
    loadingGrupos: false,
    saving: false,
    hasChanges: false,
    esAdminSistema: false,
    dominioSeleccionado: 'docentes',
    breadcrumbItems: bc,
    setDominioSeleccionado: vi.fn(),
    toggleAccion: vi.fn(),
    guardarCambios: vi.fn(),
    cancelarCambios: vi.fn(),
    goToRolesList: vi.fn(),
    ...extra,
  });

  it('sin permiso EDITAR muestra el aviso', () => {
    mocks.permisos.mockReturnValue(state());
    renderWithProviders(<RolPermisosPage />);
    expect(screen.getByText('Sin permiso.')).toBeInTheDocument();
  });

  it('con cambios pendientes ofrece guardar y cancelar', async () => {
    const s = state({ hasChanges: true });
    mocks.permisos.mockReturnValue(s);
    renderWithProviders(<RolPermisosPage />, gestionar('EDITAR'));
    expect(screen.getByText('Hay cambios sin guardar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(s.guardarCambios).toHaveBeenCalled();
    expect(s.cancelarCambios).toHaveBeenCalled();
  });

  it('rol protegido: avisa, deshabilita la grilla y no ofrece guardar', () => {
    mocks.permisos.mockReturnValue(state({ esAdminSistema: true, hasChanges: true }));
    renderWithProviders(<RolPermisosPage />, gestionar('EDITAR'));
    expect(screen.getByText('Rol protegido')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).toBeDisabled();
  });

  it('rol inexistente: estado vacío', () => {
    mocks.permisos.mockReturnValue(state({ rolInfo: null }));
    renderWithProviders(<RolPermisosPage />, gestionar('EDITAR'));
    expect(screen.getByText('No se encontró el rol')).toBeInTheDocument();
  });
});

describe('RolFormPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.form.mockReturnValue({
      form,
      breadcrumbItems: bc,
      submitLoading: false,
      submitError: null,
      formSections: { datosRol: { title: 'Datos del rol', description: 'Defina el rol', fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] } },
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      ...props,
    });
    return <RolFormPage />;
  };

  it('muestra el formulario y envía con "Crear rol" (solo con permiso CREAR)', async () => {
    const handleSubmit = vi.fn();
    const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, gestionar('CREAR'));
    expect(screen.getByText('Datos del rol')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Crear rol' }));
    expect(handleSubmit).toHaveBeenCalled();
    unmount();

    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: 'Crear rol' })).not.toBeInTheDocument();
  });

  it('muestra el error de envío', () => {
    renderWithProviders(<Montar submitError="El código ya existe" />, gestionar('CREAR'));
    expect(screen.getByText('El código ya existe')).toBeInTheDocument();
  });
});
