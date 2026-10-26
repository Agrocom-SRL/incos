import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import DocentesList from '../DocentesList';
import DocentesDetail from '../DocentesDetail';
import DocentesForm from '../DocentesForm';
import MiHorarioPage from '../MiHorarioPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  form: vi.fn(),
  home: vi.fn(),
}));

vi.mock('@application-docentes/hooks', () => ({
  useDocentesListPage: mocks.list,
  useDocentesDetailContext: mocks.detail,
  useDocentesFormContext: mocks.form,
}));
vi.mock('@application-dashboard/hooks/useDocenteHome.js', () => ({ useDocenteHome: mocks.home }));
vi.mock('@docentes/components/organisms/DocenteHorarioSemanalGrid', () => ({
  default: ({ courseSchedules }) => <div data-testid="grilla">{courseSchedules.length} cursos</div>,
}));
vi.mock('@docentes/supervision/components/organisms/MisFichasSeguimientoTab', () => ({
  default: () => <div>tab-supervision</div>,
}));

const breadcrumbItems = [{ title: 'Inicio' }, { title: 'Docentes' }];

describe('DocentesList', () => {
  const base = () => ({
    docentes: [{ id: 1, nombreCompleto: 'Ana Pérez', ciCompleto: '123 LP' }],
    loading: false,
    error: null,
    searchText: '',
    tableColumns: [{ title: 'Docente', dataIndex: 'nombreCompleto' }],
    breadcrumbItems,
    handleNuevoDocente: vi.fn(),
    handleSearchChange: vi.fn(),
    tablePagination: undefined,
  });

  beforeEach(() => mocks.list.mockReset());

  it('lista los docentes y ofrece registrar solo con permiso CREAR', async () => {
    const state = base();
    mocks.list.mockReturnValue(state);
    renderWithProviders(<DocentesList />, { auth: { permisos: [permiso('docentes.crear', 'CREAR')] } });

    expect(screen.getByText('Listado de docentes')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar docente/ }));
    expect(state.handleNuevoDocente).toHaveBeenCalledTimes(1);
  });

  it('sin permiso oculta "Registrar docente"', () => {
    mocks.list.mockReturnValue(base());
    renderWithProviders(<DocentesList />);
    expect(screen.queryByRole('button', { name: /Registrar docente/ })).not.toBeInTheDocument();
  });

  it('muestra el error del listado', () => {
    mocks.list.mockReturnValue({ ...base(), docentes: [], error: 'Falla de red' });
    renderWithProviders(<DocentesList />);
    expect(screen.getByText(/Falla de red/)).toBeInTheDocument();
  });

  it('escribir en el buscador notifica el cambio', async () => {
    const state = base();
    mocks.list.mockReturnValue(state);
    renderWithProviders(<DocentesList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por nombre, CI/), 'a');
    expect(state.handleSearchChange).toHaveBeenCalled();
  });
});

describe('DocentesDetail', () => {
  const ctx = (extra = {}) => ({
    docenteId: 3,
    loading: false,
    error: null,
    profile: {
      nombreCompleto: 'Ana Pérez',
      ciCompleto: '123 LP',
      genero: 'FEMENINO',
      tituloProfesional: 'Ing. de Sistemas',
      registroActivo: true,
      maxHorasSemana: 20,
    },
    assignments: [],
    access: { tieneAcceso: false },
    nombreCompleto: 'Ana Pérez',
    iniciales: 'AP',
    breadcrumbItems,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    handleAsignacionAcademica: vi.fn(),
    ...extra,
  });

  beforeEach(() => mocks.detail.mockReset());

  it('muestra el resumen, las pestañas y el botón Volver', async () => {
    const state = ctx();
    mocks.detail.mockReturnValue(state);
    renderWithProviders(<DocentesDetail />);

    expect(screen.getByRole('heading', { name: 'Ana Pérez' })).toBeInTheDocument();
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Materias asignadas/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Supervisión/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(state.handleVolver).toHaveBeenCalled();
  });

  it('el botón de editar depende del permiso docentes.editar', () => {
    mocks.detail.mockReturnValue(ctx());
    const { unmount } = renderWithProviders(<DocentesDetail />, {
      auth: { permisos: [permiso('docentes.editar', 'EDITAR')] },
    });
    expect(screen.getByRole('button', { name: 'Editar ficha del docente' })).toBeInTheDocument();
    unmount();
    renderWithProviders(<DocentesDetail />);
    expect(screen.queryByRole('button', { name: 'Editar ficha del docente' })).not.toBeInTheDocument();
  });

  it('muestra el error en lugar de la ficha', () => {
    mocks.detail.mockReturnValue(ctx({ error: 'No existe' }));
    renderWithProviders(<DocentesDetail />);
    expect(screen.getByText('No se pudo cargar la ficha')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ana Pérez' })).not.toBeInTheDocument();
  });

  it('un docente en su propia ficha no ve Volver y sí la pestaña Supervisión', async () => {
    mocks.detail.mockReturnValue(ctx());
    renderWithProviders(<DocentesDetail />, {
      auth: { usuario: { id: 5, username: 'ana', rol: { codigo: 'DOCENTE', nombre: 'Docente' } } },
    });
    expect(screen.queryByRole('button', { name: /Volver/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Supervisión/ }));
    expect(await screen.findByText('tab-supervision')).toBeInTheDocument();
  });
});

describe('DocentesForm', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.form.mockReturnValue({
      pageTitle: 'Registrar docente',
      breadcrumbItems,
      loading: false,
      error: null,
      submitLoading: false,
      form,
      wizardMountKey: 'k',
      wizardSteps: [
        {
          title: 'Datos personales',
          formTitle: 'Identificación',
          sections: ['identidad'],
          config: { identidad: { title: 'Identidad', fields: [{ name: 'nombres', label: 'Nombres', type: 'text', rules: [{ required: true, message: 'Ingrese los nombres' }] }] } },
        },
      ],
      wizardInitialValues: {},
      resolveOptions: () => [],
      onValidateBeforeNext: vi.fn().mockResolvedValue(true),
      finishLabel: 'Guardar docente',
      handleVolver: vi.fn(),
      handleFinish: vi.fn(),
      isInvalidEditId: false,
      ...props,
    });
    return <DocentesForm />;
  };

  it('id de edición inválido: muestra la alerta y no el wizard', () => {
    renderWithProviders(<Montar isInvalidEditId />);
    expect(screen.getByText('Identificador de docente inválido')).toBeInTheDocument();
    expect(screen.queryByText('Nombres')).not.toBeInTheDocument();
  });

  it('muestra el error de carga y el título de la página', () => {
    renderWithProviders(<Montar error="No se cargó el docente" />);
    expect(screen.getByText('No se cargó el docente')).toBeInTheDocument();
    expect(screen.getAllByText('Registrar docente').length).toBeGreaterThan(0);
  });

  it('mientras carga no monta el wizard', () => {
    renderWithProviders(<Montar loading />);
    expect(screen.queryByText('Nombres')).not.toBeInTheDocument();
  });
});

describe('MiHorarioPage', () => {
  beforeEach(() => mocks.home.mockReset());
  const home = (extra = {}) => ({
    gestion: { nombre: 'Gestión 2026', bimestreNombre: 'Bimestre 2' },
    horarioCursos: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...extra,
  });

  it('sin bloques muestra el estado vacío', () => {
    mocks.home.mockReturnValue(home());
    renderWithProviders(<MiHorarioPage />);
    expect(screen.getByText(/Aún no tiene bloques de horario publicados/)).toBeInTheDocument();
    expect(screen.queryByTestId('grilla')).not.toBeInTheDocument();
  });

  it('con bloques muestra la grilla y la gestión vigente', () => {
    mocks.home.mockReturnValue(home({ horarioCursos: [{ id: 1 }, { id: 2 }] }));
    renderWithProviders(<MiHorarioPage />);
    expect(screen.getByTestId('grilla')).toHaveTextContent('2 cursos');
    expect(screen.getByText(/Gestión 2026 · Bimestre 2/)).toBeInTheDocument();
  });

  it('error: muestra la alerta y permite reintentar', async () => {
    const state = home({ error: 'Sin conexión' });
    mocks.home.mockReturnValue(state);
    renderWithProviders(<MiHorarioPage />);
    expect(screen.getByText('No se pudo cargar su horario')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(state.refetch).toHaveBeenCalled();
  });
});
