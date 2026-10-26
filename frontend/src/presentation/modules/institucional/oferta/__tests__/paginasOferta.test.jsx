import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import DocenteAsignacionesPage from '../pages/DocenteAsignacionesPage';
import GestionFormPage from '../pages/GestionFormPage';
import OfertaAcademicaDashboardPage from '../pages/OfertaAcademicaDashboardPage';
import OfertaGestionPlanesPage from '../pages/OfertaGestionPlanesPage';
import OfertaParaleloDetallePage from '../pages/OfertaParaleloDetallePage';
import RenovarOfertaPage from '../pages/RenovarOfertaPage';

const mocks = vi.hoisted(() => ({ docente: vi.fn(), gestion: vi.fn(), dashboard: vi.fn(), planes: vi.fn(), detalle: vi.fn(), renovar: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-institucional/oferta/hooks/state/useDocenteAsignacionesState', () => ({ useDocenteAsignacionesState: mocks.docente }));
vi.mock('@application-institucional/oferta', async (orig) => ({
  ...(await orig()),
  useGestionFormPage: mocks.gestion,
  useOfertaAcademicaDashboardState: mocks.dashboard,
  useOfertaGestionPlanesState: mocks.planes,
  useOfertaParaleloDetalleState: mocks.detalle,
  useRenovarOfertaPage: mocks.renovar,
}));

const bc = [{ title: 'Institucional' }];
const oferta = (...acciones) => ({ auth: { permisos: [permiso('institucional.oferta.gestion-plan', ...acciones)] } });

describe('DocenteAsignacionesPage', () => {
  const estado = (extra = {}) => ({
    tab: 'color', onTabChange: vi.fn(), pageTitle: 'Asignaciones del docente', breadcrumbItems: bc, handleVolver: vi.fn(), loading: false, error: null, validDocenteId: true,
    docenteNombre: 'Ing. Luna', gestionLabel: '2026', tablaAsignaciones: { filas: [] }, schedules: [], horarioSlotIndex: {}, turnoEfectivo: 'NOCHE', form: null, savingColor: false, handleGuardarColor: vi.fn(), ...extra,
  });

  it('muestra docente y gestión, el resumen vacío y vuelve', async () => {
    const s = estado();
    mocks.docente.mockReturnValue(s);
    renderWithProviders(<DocenteAsignacionesPage />);
    expect(screen.getByText(/Docente: Ing\. Luna · Gestión: 2026/)).toBeInTheDocument();
    expect(screen.getByText('Sin asignaciones vigentes en la gestión actual')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('id inválido oculta el espacio de trabajo y error se muestra', () => {
    mocks.docente.mockReturnValue(estado({ validDocenteId: false, error: 'Docente inválido' }));
    renderWithProviders(<DocenteAsignacionesPage />);
    expect(screen.getByText('Docente inválido')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

describe('GestionFormPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.gestion.mockReturnValue({
      form, pageTitle: 'Nueva gestión', breadcrumbItems: bc, navigateBack: vi.fn(), cargando: false, guardando: false, loadError: null, cardDesc: 'Defina la gestión', initialValues: {}, tipoOptions: [{ value: 'REGULAR', label: 'Regular' }], esEdicion: false, submitAccion: 'CREAR', submitLabel: 'Crear gestión', onSubmit: vi.fn(), ...props,
    });
    return <GestionFormPage />;
  };

  it('muestra los campos obligatorios y envía con el permiso de la acción', async () => {
    const onSubmit = vi.fn();
    const { unmount } = renderWithProviders(<Montar onSubmit={onSubmit} />, oferta('CREAR'));
    ['Código', 'Nombre', 'Año', 'Tipo', 'Fecha de inicio', 'Fecha de fin'].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Crear gestión/ }));
    expect(onSubmit).toHaveBeenCalled();
    unmount();
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Crear gestión/ })).not.toBeInTheDocument();
  });

  it('error de carga bloquea el formulario', () => {
    renderWithProviders(<Montar loadError="No se pudo cargar la gestión" />, oferta('CREAR'));
    expect(screen.getByText('No se pudo cargar la gestión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear gestión/ })).toBeDisabled();
  });

  it('Cancelar vuelve', async () => {
    const navigateBack = vi.fn();
    renderWithProviders(<Montar navigateBack={navigateBack} />, oferta('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(navigateBack).toHaveBeenCalled();
  });
});

describe('OfertaAcademicaDashboardPage', () => {
  const estado = (extra = {}) => ({
    pageTitle: 'Oferta académica', apiLoading: false, loadingParalelos: false, apiError: null, gestionVigente: { vigente: true, codigo: 'G-26' },
    setupKpis: { planesHabilitadosLoaded: true, sinPlanes: 0 }, dashboardKpis: { gestionesActivas: 1, planesHabilitados: 2, ofertados: 3, publicados: 1 },
    planesHabilitados: [], sinPlanesHabilitados: false, habilitandoPlanes: false, planesPendientesCount: 0, onHabilitarTodosPlanes: vi.fn(), onHabilitarPlanesVigentes: vi.fn(), navigateParalelosPlan: vi.fn(),
    dashboardSidebarStats: { planesCount: 2, paralelosTotal: 6 }, navigateRenovarOferta: vi.fn(), navigateGestiones: vi.fn(), navigateHorarios: vi.fn(), ...extra,
  });

  it('accesos de cabecera según permiso', async () => {
    const s = estado();
    mocks.dashboard.mockReturnValue(s);
    const auth = { permisos: [permiso('institucional.oferta.gestion-plan', 'CREAR'), permiso('institucional.gestion.pasadas', 'LISTAR')] };
    renderWithProviders(<OfertaAcademicaDashboardPage />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Renovar oferta/ }));
    await userEvent.click(screen.getByRole('button', { name: /Gestiones/ }));
    expect(s.navigateRenovarOferta).toHaveBeenCalled();
    expect(s.navigateGestiones).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Horarios/ })).not.toBeInTheDocument();
  });

  it('sin planes habilitados muestra la alerta; con todo en orden, el texto guía', () => {
    mocks.dashboard.mockReturnValue(estado({ setupKpis: { planesHabilitadosLoaded: true, sinPlanes: 2 }, sinPlanesHabilitados: true }));
    const { unmount } = renderWithProviders(<OfertaAcademicaDashboardPage />);
    expect(screen.getByText('Sin planes habilitados en la gestión')).toBeInTheDocument();
    unmount();
    mocks.dashboard.mockReturnValue(estado());
    renderWithProviders(<OfertaAcademicaDashboardPage />);
    expect(screen.getByText(/Configure planes y paralelos/)).toBeInTheDocument();
  });

  it('gestión no vigente muestra la alerta y el error de API', () => {
    mocks.dashboard.mockReturnValue(estado({ gestionVigente: { vigente: false }, apiError: 'Falla API' }));
    renderWithProviders(<OfertaAcademicaDashboardPage />);
    expect(screen.getByText('Gestión no vigente')).toBeInTheDocument();
    expect(screen.getByText('Falla API')).toBeInTheDocument();
  });
});

describe('OfertaGestionPlanesPage', () => {
  const plan = { id: 1, carreraNombre: 'Sistemas', nombre: 'Plan 2026' };
  const estado = (extra = {}) => ({
    pageTitle: 'Planes de la gestión', breadcrumbItems: bc, navigateBack: vi.fn(), planesLoading: false, apiError: null, gestionContextAlert: null, planesHabilitados: [plan], planSeleccionado: plan,
    puedeEditarOferta: true, generandoParalelos: false, onGenerarParalelos: vi.fn(), tabItems: [{ key: '1', label: 'Sistemas · Plan 2026', plan }], activePlanKey: '1', onTabChange: vi.fn(),
    paralelosByPlanId: { 1: [] }, coberturaByParaleloId: {}, paralelosLoadingPlanId: null, inhabilitandoParaleloId: null, onInhabilitarParalelo: vi.fn(), onHabilitarParalelo: vi.fn(), onNavigateDetalle: vi.fn(),
    gestionSeleccionada: { codigo: 'G-26' }, navigateGestionVigente: vi.fn(), ...extra,
  });
  const auth = { permisos: [permiso('institucional.oferta.gestion-plan', 'LISTAR'), permiso('institucional.oferta.paralelo-gestion', 'CREAR')] };

  it('con edición muestra "Generar paralelos"; en consulta no', async () => {
    const s = estado();
    mocks.planes.mockReturnValue(s);
    const { unmount } = renderWithProviders(<OfertaGestionPlanesPage />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Generar paralelos/ }));
    expect(s.onGenerarParalelos).toHaveBeenCalled();
    expect(screen.getByText('G-26')).toBeInTheDocument();
    unmount();
    mocks.planes.mockReturnValue(estado({ puedeEditarOferta: false }));
    renderWithProviders(<OfertaGestionPlanesPage />, { auth });
    expect(screen.queryByRole('button', { name: /Generar paralelos/ })).not.toBeInTheDocument();
    expect(screen.getByText('Consulta histórica de paralelos por plan habilitado en esta gestión.')).toBeInTheDocument();
  });

  it('sin planes no hay espacio de trabajo; alerta de contexto con acceso a la gestión actual', async () => {
    const s = estado({ planesHabilitados: [], gestionContextAlert: { type: 'warning', title: 'Gestión histórica', description: 'Solo consulta', showIrGestionVigente: true } });
    mocks.planes.mockReturnValue(s);
    renderWithProviders(<OfertaGestionPlanesPage />, { auth });
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByText('Gestión histórica')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ir a la gestión actual/ }));
    expect(s.navigateGestionVigente).toHaveBeenCalled();
  });
});

describe('OfertaParaleloDetallePage', () => {
  const carga = { materiasEsperadas: 8, materiasOfertadas: 6, horasPlan: 30, horasOfertadas: 24, valido: false, faltantes: [{ materiaCodigo: 'MAT-101' }, { materiaNombre: 'Cálculo' }] };
  const estado = (extra = {}) => ({
    pageTitle: 'Detalle del paralelo', paraleloGestionId: 5, detalle: { paraleloNombre: 'A', gestionId: 1 }, cargaHorariaResumen: carga, apiError: null, apiLoading: false, navigateBack: vi.fn(), navigateHorariosArmado: vi.fn(),
    puedeEditarAula: true, openAulaModal: vi.fn(), ofertaCursos: [], faltantesDocenteIds: new Set(), openDocenteModal: vi.fn(), aulaModalOpen: false, aulasModalItems: [], aulaModalDraftId: null, setAulaModalDraftId: vi.fn(), closeAulaModal: vi.fn(), onConfirmarAulaModal: vi.fn(), guardandoAula: false,
    docenteModalOpen: false, ...extra,
  });

  it('carga incompleta advierte con las materias faltantes', async () => {
    const s = estado();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<OfertaParaleloDetallePage />, { auth: { permisos: [permiso('institucional.oferta.paralelo-gestion', 'DETALLE'), permiso('institucional.horario.armado', 'LISTAR')] } });
    expect(screen.getByText('Carga horaria del periodo incompleta')).toBeInTheDocument();
    expect(screen.getByText(/Faltan: MAT-101, Cálculo\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver horario/ }));
    expect(s.navigateHorariosArmado).toHaveBeenCalled();
  });

  it('carga cubierta confirma y el error de API se muestra', () => {
    mocks.detalle.mockReturnValue(estado({ cargaHorariaResumen: { ...carga, valido: true, faltantes: [] }, apiError: 'Falla' }));
    renderWithProviders(<OfertaParaleloDetallePage />);
    expect(screen.getByText('Carga horaria del periodo cubierta')).toBeInTheDocument();
    expect(screen.getByText('Falla')).toBeInTheDocument();
  });
});

describe('RenovarOfertaPage', () => {
  const estado = (extra = {}) => ({
    pageTitle: 'Renovar oferta', breadcrumbItems: bc, navigateBack: vi.fn(), cargandoGestiones: false, renovando: false, puedeRenovar: true, onRenovar: vi.fn(), apiError: null,
    origenId: 1, destinoId: 2, onOrigenChange: vi.fn(), onDestinoChange: vi.fn(), opcionesOrigen: [{ value: 1, label: 'G-25' }], opcionesDestino: [{ value: 2, label: 'G-26' }], navigateNuevaGestion: vi.fn(),
    sinPlanesOrigen: false, planesOrigen: [{ id: 1, carreraCodigo: 'SIS', carreraNombre: 'Sistemas', nombre: 'Plan 2026', estado: 'VIGENTE' }], planesLoading: false, seleccionPlanes: [], setSeleccionPlanes: vi.fn(),
    resumen: null, resumenPlanes: [], advertenciasResumen: [], vigenteMarcada: false, gestionDestino: null, marcandoVigente: false, onMarcarVigente: vi.fn(), navigatePlanesDestino: vi.fn(), ...extra,
  });
  beforeEach(() => mocks.renovar.mockReset());

  it('renovar exige CREAR y respeta puedeRenovar', async () => {
    const s = estado();
    mocks.renovar.mockReturnValue(s);
    const { unmount } = renderWithProviders(<RenovarOfertaPage />, oferta('CREAR'));
    expect(screen.getByText('Gestión origen')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: /Renovar oferta/ }).at(-1));
    expect(s.onRenovar).toHaveBeenCalled();
    unmount();
    mocks.renovar.mockReturnValue(estado({ puedeRenovar: false }));
    renderWithProviders(<RenovarOfertaPage />, oferta('CREAR'));
    expect(screen.getAllByRole('button', { name: /Renovar oferta/ }).at(-1)).toBeDisabled();
  });

  it('sin planes de origen y con error', () => {
    mocks.renovar.mockReturnValue(estado({ sinPlanesOrigen: true, apiError: 'Falla' }));
    renderWithProviders(<RenovarOfertaPage />, oferta('CREAR'));
    expect(screen.getByText('La gestión origen no tiene planes habilitados para renovar.')).toBeInTheDocument();
    expect(screen.getByText('Falla')).toBeInTheDocument();
  });

  it('resultado: advertencias, marcar vigente con confirmación y ver planes', async () => {
    const s = estado({ resumen: {}, resumenPlanes: [{ key: 'k', label: 'Sistemas', carreraCodigo: 'SIS', creado: true, paralelos: 2 }], advertenciasResumen: ['Docente sin carga'], gestionDestino: { codigo: 'G-26' } });
    mocks.renovar.mockReturnValue(s);
    renderWithProviders(<RenovarOfertaPage />, oferta('CREAR', 'ACTIVAR', 'LISTAR'));
    expect(screen.getByText('Resultado de la renovación')).toBeInTheDocument();
    expect(screen.getByText('Docente sin carga')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver planes habilitados/ }));
    expect(s.navigatePlanesDestino).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Marcar vigente la nueva gestión/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Marcar vigente' }));
    await waitFor(() => expect(s.onMarcarVigente).toHaveBeenCalled());
  });

  it('con la nueva gestión ya vigente no ofrece marcarla', () => {
    mocks.renovar.mockReturnValue(estado({ resumen: {}, vigenteMarcada: true, gestionDestino: { codigo: 'G-26' } }));
    renderWithProviders(<RenovarOfertaPage />, oferta('CREAR', 'ACTIVAR', 'LISTAR'));
    expect(screen.getByText('La nueva gestión ya es la vigente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar vigente la nueva gestión/ })).not.toBeInTheDocument();
  });
});
