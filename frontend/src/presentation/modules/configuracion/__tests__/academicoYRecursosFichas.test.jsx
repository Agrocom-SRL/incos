import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { describeDetailPage, describeFormPage } from '@/test/pageContracts';
import CarreraFormPage from '../academico/pages/CarreraFormPage';
import CarreraDetailPage from '../academico/pages/CarreraDetailPage';
import MateriaFormPage from '../academico/pages/MateriaFormPage';
import MateriaDetailPage from '../academico/pages/MateriaDetailPage';
import PlanFormPage from '../academico/pages/PlanFormPage';
import PlanDetailPage from '../academico/pages/PlanDetailPage';
import ParaleloFormPage from '../recursos/pages/ParaleloFormPage';
import ParaleloDetailPage from '../recursos/pages/ParaleloDetailPage';
import ParaleloFormSections from '../recursos/components/organisms/ParaleloFormSections';
import ParaleloCarreraFormControl from '../recursos/components/organisms/ParaleloCarreraFormControl';
import ParaleloDetailOfertaSection from '../recursos/components/organisms/ParaleloDetailOfertaSection';

const mocks = vi.hoisted(() => {
  const m = {};
  ['carreraForm', 'carreraDetalle', 'materiaForm', 'materiaDetalle', 'planForm', 'planDetalle', 'paraleloForm', 'paraleloDetalle'].forEach((k) => { m[k] = vi.fn(); });
  return m;
});

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-configuracion/academico/hooks', async (orig) => ({
  ...(await orig()),
  useCarreraForm: mocks.carreraForm,
  useCarreraDetallePage: mocks.carreraDetalle,
  useMateriaForm: mocks.materiaForm,
  useMateriaDetallePage: mocks.materiaDetalle,
  usePlanForm: mocks.planForm,
  usePlanDetallePage: mocks.planDetalle,
}));
vi.mock('@application-configuracion/recursos/hooks', async (orig) => ({
  ...(await orig()),
  useParaleloForm: mocks.paraleloForm,
  useParaleloDetallePage: mocks.paraleloDetalle,
}));
vi.mock('@application-institucional/horarios/hooks/api/useParaleloGestionGrillaHorarioApi', () => ({
  useParaleloGestionGrillaHorarioApi: () => ({ fetchGrillaHorario: vi.fn(), grillaHorario: null, loading: false }),
}));

describeFormPage({ name: 'Formulario de Carrera', Page: CarreraFormPage, useHook: mocks.carreraForm, permisoCodigo: 'configuracion.carrera', saveLabel: 'Guardar carrera', invalidTitle: 'Identificador de carrera inválido', sectionKey: 'datosCarrera' });
describeFormPage({ name: 'Formulario de Materia', Page: MateriaFormPage, useHook: mocks.materiaForm, permisoCodigo: 'configuracion.materia', saveLabel: 'Guardar materia', invalidTitle: 'Identificador de materia inválido', sectionKey: 'datosMateria' });
describeFormPage({
  name: 'Formulario de Plan de estudio',
  Page: PlanFormPage,
  useHook: mocks.planForm,
  permisoCodigo: 'configuracion.plan-estudio',
  saveLabel: 'Guardar plan de estudio',
  invalidTitle: 'Identificador de plan de estudio inválido',
  sectionKey: 'datosPlan',
  extraState: { resolveOptions: () => [], carreras: [], carrerasLoading: false, carrerasError: null },
});
describeFormPage({
  name: 'Formulario de Paralelo',
  Page: ParaleloFormPage,
  useHook: mocks.paraleloForm,
  permisoCodigo: 'configuracion.paralelo',
  saveLabel: 'Guardar paralelo',
  invalidTitle: 'Identificador de paralelo inválido',
  sectionKey: 'datosParalelo',
  extraState: { resolveOptions: () => [], carreras: [], carrerasLoading: false, carrerasError: null, carreraId: undefined, sinPlanActivo: false, planesDisponibles: [] },
});

describeDetailPage({ name: 'Ficha de Carrera', Page: CarreraDetailPage, useHook: mocks.carreraDetalle, entityKey: 'carrera', entity: { id: 1, codigo: 'SIS', nombre: 'Sistemas', activo: true }, title: 'Sistemas', invalidTitle: 'Identificador de carrera inválido', emptyText: 'No se encontró la carrera solicitada', permisoCodigo: 'configuracion.carrera', editLabel: 'Editar carrera', extraState: { periodos: [], totalMaterias: 0, planVigente: null } });
describeDetailPage({ name: 'Ficha de Materia', Page: MateriaDetailPage, useHook: mocks.materiaDetalle, entityKey: 'materia', entity: { id: 1, sigla: 'MAT-101', nombre: 'Álgebra', activo: true, asignaturas: [] }, title: 'ÁLGEBRA', invalidTitle: 'Identificador de materia inválido', emptyText: 'No se encontró la materia solicitada', permisoCodigo: 'configuracion.materia', editLabel: 'Editar materia', extraState: { tipoLabel: 'Teórica', cargaHorariaResumen: '4 h' } });
describeDetailPage({ name: 'Ficha de Paralelo', Page: ParaleloDetailPage, useHook: mocks.paraleloDetalle, entityKey: 'paralelo', entity: { id: 1, nombre: 'A', turno: 'NOCHE', periodoNumero: 1, activo: true }, title: 'A', invalidTitle: 'Identificador de paralelo inválido', emptyText: 'No se encontró el paralelo solicitado', permisoCodigo: 'configuracion.paralelo', editLabel: 'Editar paralelo', extraState: { carrera: { codigo: 'SIS', nombre: 'Sistemas' }, instanciasGestion: [], instanciasLoading: false } });

describe('PlanDetailPage', () => {
  const estado = (extra = {}) => ({
    plan: { id: 1, nombrePlan: 'Plan 2026', vigente: false, activo: true, duracionAnios: 3, resolucionMinisterial: '123/2024', cargaHorariaTotal: 3000 },
    planMetaRaw: { resolucion_ministerial: 'R.M. 123/2024' },
    carrera: { nombre: 'Sistemas' },
    periodos: [],
    prereqSiglaByAsignaturaId: new Map(),
    loading: false,
    error: null,
    isInvalidId: false,
    avatarInitials: 'PL',
    avatarColor: '#112233',
    breadcrumbItems: [],
    publicando: false,
    creandoVersion: false,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    handleEditarPeriodo: vi.fn(),
    handlePublicar: vi.fn(),
    handleNuevaVersion: vi.fn(),
    refetch: vi.fn(),
    ...extra,
  });
  const auth = { permisos: [permiso('configuracion.plan-estudio', 'EDITAR', 'ACTIVAR', 'CREAR')] };

  it('plan no vigente: se puede editar y publicar; no ofrece nueva versión', async () => {
    const s = estado();
    mocks.planDetalle.mockReturnValue(s);
    renderWithProviders(<PlanDetailPage />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Publicar como vigente/ }));
    expect(s.handlePublicar).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Nueva versión/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Editar$/ }));
    expect(s.handleEditar).toHaveBeenCalled();
  });

  it('plan vigente: ofrece nueva versión y no publicar', async () => {
    const s = estado({ plan: { id: 1, nombrePlan: 'Plan 2026', vigente: true, activo: true } });
    mocks.planDetalle.mockReturnValue(s);
    renderWithProviders(<PlanDetailPage />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Nueva versión \(RM\)/ }));
    expect(s.handleNuevaVersion).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Publicar como vigente/ })).not.toBeInTheDocument();
  });

  it('sin permisos no hay acciones; id inválido y vacío', () => {
    mocks.planDetalle.mockReturnValue(estado());
    const { unmount } = renderWithProviders(<PlanDetailPage />);
    expect(screen.queryByRole('button', { name: /Publicar como vigente/ })).not.toBeInTheDocument();
    unmount();
    mocks.planDetalle.mockReturnValue(estado({ plan: null, isInvalidId: true }));
    const { unmount: u2 } = renderWithProviders(<PlanDetailPage />);
    expect(screen.getByText('Identificador de plan de estudio inválido')).toBeInTheDocument();
    u2();
    mocks.planDetalle.mockReturnValue(estado({ plan: null }));
    renderWithProviders(<PlanDetailPage />);
    expect(screen.getByText('No se encontró el plan de estudio solicitado')).toBeInTheDocument();
  });
});

describe('organismos de paralelo', () => {
  const Host = ({ children, initialValues }) => {
    const [form] = Form.useForm();
    return <Form form={form} initialValues={initialValues}>{children(form)}</Form>;
  };

  it('ParaleloFormSections: alerta sin plan activo, plan de estudios si hay varios y franjas del turno', () => {
    const secciones = { datosParalelo: { title: 'Datos', fields: [{ name: 'periodo_id', label: 'Periodo', type: 'input' }, { name: 'turno', label: 'Turno', type: 'input' }] } };
    renderWithProviders(
      <Host initialValues={{ turno: 'NOCHE' }}>
        {(form) => (
          <ParaleloFormSections
            form={form}
            formSections={secciones}
            resolveOptions={() => []}
            sinPlanActivo
            carreraId={3}
            planesDisponibles={[{ id: 1 }, { id: 2 }]}
          />
        )}
      </Host>,
    );
    expect(screen.getByText(/no tiene plan de estudio activo/)).toBeInTheDocument();
    expect(screen.getByText('Plan de estudios')).toBeInTheDocument();
    expect(screen.getByText(/Franjas del turno/)).toBeInTheDocument();
  });

  it('ParaleloFormSections sin campos no renderiza', () => {
    const { container } = renderWithProviders(<Host>{(form) => <ParaleloFormSections form={form} formSections={{}} />}</Host>);
    expect(container.querySelector('form')).toBeInTheDocument();
    expect(screen.queryByText('Carrera')).not.toBeInTheDocument();
  });

  it('ParaleloCarreraFormControl limpia periodo y plan al cambiar de carrera', async () => {
    const onChange = vi.fn();
    const form = { setFieldValue: vi.fn() };
    renderWithProviders(
      <ParaleloCarreraFormControl form={form} value={1} onChange={onChange} carreras={[{ id: 1, codigo: 'SIS', nombre: 'Sistemas' }, { id: 2, codigo: 'CON', nombre: 'Contaduría' }]} />,
    );
    await userEvent.click(screen.getByText(/Contaduría/i));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(form.setFieldValue).toHaveBeenCalledWith('periodo_id', undefined);
    expect(form.setFieldValue).toHaveBeenCalledWith('plan_estudio_id', undefined);
  });

  it('ParaleloDetailOfertaSection: carga, vacío y lista de instancias', () => {
    const { unmount, container } = renderWithProviders(<ParaleloDetailOfertaSection loading />);
    expect(container.querySelector('.ant-spin')).not.toBeNull();
    unmount();
    const { unmount: u2 } = renderWithProviders(<ParaleloDetailOfertaSection />);
    expect(screen.getByText(/aún no fue copiado a ninguna gestión/)).toBeInTheDocument();
    u2();
    renderWithProviders(
      <ParaleloDetailOfertaSection
        paralelo={{ nombre: 'A' }}
        carrera={{ nombre: 'Sistemas' }}
        instancias={[{ id: 9, gestionNombre: 'Gestión 2026', gestionVigente: true, estado: 'PUBLICADO', turno: 'NOCHE', aulaCodigo: 'A-1', ofertaActual: 3 }]}
      />,
    );
    expect(screen.getByText('Instancias en gestión')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('PUBLICADO')).toBeInTheDocument();
    expect(screen.getByText('Sin bloques de horario armados para esta instancia en gestión.')).toBeInTheDocument();
  });
});
