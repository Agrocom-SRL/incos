import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import Dashboard from '../Dashboard';
import DocenteDashboard from '../DocenteDashboard';
import EstudianteDashboard from '../EstudianteDashboard';
import DashboardConnector from '../../connectors/DashboardConnector';

const mocks = vi.hoisted(() => ({
  ctx: vi.fn(),
  nav: vi.fn(),
  cursos: vi.fn(),
  docenteHome: vi.fn(),
  estudianteHome: vi.fn(),
  miDocenteId: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-dashboard', () => ({
  useDashboardContext: mocks.ctx,
  useDashboardGuardedNavigate: mocks.nav,
  DashboardProvider: ({ children }) => <div data-testid="provider">{children}</div>,
  PERMISO_CARRERAS_DETALLE: 'configuracion.academico.carreras',
  PERMISO_DOCENTES_DETALLE: 'docentes.ver',
  PERMISO_ESTUDIANTES_DETALLE: 'estudiantes.ver',
}));
vi.mock('@application-capacitacion/inscripciones/hooks/api/useCursosCapacitacionOptions', () => ({
  useCursosCapacitacionOptions: mocks.cursos,
}));
vi.mock('@application-dashboard/hooks/useDocenteHome.js', () => ({ useDocenteHome: mocks.docenteHome }));
vi.mock('@application-dashboard/hooks/useEstudianteHome.js', () => ({ useEstudianteHome: mocks.estudianteHome }));
vi.mock('@application-docentes/hooks/api/useMiDocenteId.js', () => ({ useMiDocenteId: mocks.miDocenteId }));

const adminCtx = (extra = {}) => ({
  puedeVerDetalleCarreras: true,
  puedeVerDetalleDocentes: true,
  puedeVerDetalleEstudiantes: true,
  carreras: [{ id: 1, label: 'Sistemas', codigo: 'SIS' }],
  ultimosDocentes: [{ id: 1, name: 'Ana', description: 'Sistemas' }],
  ultimosEstudiantes: [{ id: 2, name: 'Luis', description: 'Primer año' }],
  actividades: [{ name: 'Ana', action: 'se inscribió', linkPath: '/estudiantes/2' }],
  stats: { todayOrders: 1, monthOrders: 5, participantesHoy: 2, participantesMes: 7 },
  loading: false,
  error: null,
  ...extra,
});

describe('Dashboard administrativo', () => {
  let nav;
  beforeEach(() => {
    nav = { navigateIfPermiso: vi.fn().mockReturnValue(true), navigateToPath: vi.fn() };
    mocks.nav.mockReturnValue(nav);
    mocks.cursos.mockReturnValue({ cursos: [] });
    mocks.ctx.mockReturnValue(adminCtx());
    mocks.navigate.mockReset();
  });

  it('cargando sin datos: muestra el spinner y no el contenido', () => {
    mocks.ctx.mockReturnValue(adminCtx({ loading: true, carreras: [], ultimosDocentes: [], ultimosEstudiantes: [], actividades: [] }));
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Cargando resumen…')).toBeInTheDocument();
    expect(screen.queryByText('Nuestras carreras')).not.toBeInTheDocument();
  });

  it('muestra carreras, últimos registros y KPIs (participantes solo con permiso)', () => {
    const { unmount } = renderWithProviders(<Dashboard />);
    expect(screen.getByText('Nuestras carreras')).toBeInTheDocument();
    expect(screen.getByText('Hoy: 1 estudiantes')).toBeInTheDocument();
    expect(screen.queryByText(/participantes/)).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<Dashboard />, { auth: { permisos: [permiso('capacitacion.participante', 'LISTAR')] } });
    expect(screen.getByText('Este mes: 7 participantes')).toBeInTheDocument();
  });

  it('error del resumen: avisa pero mantiene la página', () => {
    mocks.ctx.mockReturnValue(adminCtx({ error: 'Servidor caído' }));
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('No se pudo cargar el resumen en vivo')).toBeInTheDocument();
    expect(screen.getByText('Servidor caído')).toBeInTheDocument();
  });

  it('"Ver carreras" navega con guardia de permiso; "Registrar estudiante" solo con permiso', async () => {
    const { unmount } = renderWithProviders(<Dashboard />);
    expect(screen.queryByRole('button', { name: 'Registrar estudiante' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver carreras' }));
    expect(nav.navigateIfPermiso).toHaveBeenCalledWith('/configuracion/academico?tab=carreras', 'configuracion.academico.carreras', 'LISTAR');
    unmount();

    renderWithProviders(<Dashboard />, { auth: { permisos: [permiso('matricula.admision.crear', 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'Registrar estudiante' }));
    expect(nav.navigateIfPermiso).toHaveBeenCalledWith('/estudiantes/registrar', 'matricula.admision.crear', 'CREAR');
  });

  it('los cursos de capacitación abiertos requieren ambos permisos y llevan al alta de inscripción', async () => {
    mocks.cursos.mockReturnValue({ cursos: [{ id: 9, tituloCompleto: 'Excel básico' }] });
    const { unmount } = renderWithProviders(<Dashboard />);
    expect(screen.queryByText('Excel básico')).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<Dashboard />, {
      auth: { permisos: [permiso('capacitacion.inscripcion', 'CREAR'), permiso('capacitacion.curso', 'LISTAR')] },
    });
    await userEvent.click(screen.getByText('Excel básico'));
    expect(mocks.navigate).toHaveBeenCalledWith(expect.any(String), { state: expect.objectContaining({ cursoId: 9 }) });
  });

  it('una fila de actividad navega con navigateToPath', async () => {
    renderWithProviders(<Dashboard />);
    await userEvent.click(screen.getAllByText('se inscribió')[0]);
    expect(nav.navigateToPath).toHaveBeenCalledWith('/estudiantes/2');
  });
});

describe('DocenteDashboard', () => {
  const home = (extra = {}) => ({
    docente: { nombre: 'Ana' },
    gestion: { nombre: 'Gestión 2026', bimestreNombre: 'B2' },
    cursos: [{ id: 1, materia: 'Álgebra', carrera: 'Sistemas', periodo: 'Primer Año', estudiantes: 3 }],
    stats: { sesionesHoy: 1, sesionesMes: 8 },
    actividades: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...extra,
  });

  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.docenteHome.mockReturnValue(home());
    mocks.miDocenteId.mockReturnValue({ docenteId: 12, loading: false });
  });

  it('saluda, muestra gestión, cursos y accesos que navegan a rutas internas', async () => {
    renderWithProviders(<DocenteDashboard />);
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument();
    expect(screen.getByText(/Gestión 2026 · B2/)).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('Hoy: 1 sesiones')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Mi horario/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/docentes/mi-horario');
    await userEvent.click(screen.getByRole('button', { name: /Asistencia/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/academico/asistencia');
  });

  it('"Mis asignaciones" exige permiso y usa SU id', async () => {
    const { unmount } = renderWithProviders(<DocenteDashboard />);
    expect(screen.queryByRole('button', { name: /Mis asignaciones/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<DocenteDashboard />, { auth: { permisos: [permiso('docentes.ver', 'LISTAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Mis asignaciones/ }));
    const [ruta, opts] = mocks.navigate.mock.calls.at(-1);
    expect(ruta).toContain('12');
    expect(opts).toEqual({ state: { returnListPath: '/dashboard' } });
  });

  it('error: alerta con reintento', async () => {
    const state = home({ error: 'Sin red' });
    mocks.docenteHome.mockReturnValue(state);
    renderWithProviders(<DocenteDashboard />);
    expect(screen.getByText('No se pudo cargar su resumen en vivo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(state.refetch).toHaveBeenCalled();
  });
});

describe('EstudianteDashboard', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.estudianteHome.mockReturnValue({
      estudiante: { nombre: 'Luis' },
      carrera: { label: 'Sistemas' },
      docentes: [{ id: 1, name: 'PEREZ ANA', description: 'Álgebra' }],
      actividades: [],
      stats: { sesionesHoy: 0, sesionesMes: 3 },
      saldoPendiente: 200,
      loading: false,
      error: null,
    });
  });

  it('muestra saludo, carrera, docentes y saldo; los accesos navegan', async () => {
    renderWithProviders(<EstudianteDashboard />);
    expect(screen.getByText('Hola, Luis')).toBeInTheDocument();
    expect(screen.getByText(/Está cursando Sistemas/)).toBeInTheDocument();
    expect(screen.getByText('PEREZ ANA')).toBeInTheDocument();
    expect(screen.getByText('Tiene un saldo por cubrir.')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Mis aportes'));
    expect(mocks.navigate).toHaveBeenCalledWith('/matricula/aportes/listar');
    await userEvent.click(screen.getByRole('button', { name: /Mi boletín/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/academico/mi-boletin');
  });

  it('error: muestra la alerta', () => {
    mocks.estudianteHome.mockReturnValue({ ...mocks.estudianteHome(), error: 'Falla' });
    renderWithProviders(<EstudianteDashboard />);
    expect(screen.getByText('No se pudo cargar su resumen en vivo')).toBeInTheDocument();
  });
});

describe('DashboardConnector', () => {
  const conRol = (codigo) => ({ auth: { usuario: { id: 1, username: 'u', rol: { codigo, nombre: codigo } } } });

  beforeEach(() => {
    mocks.ctx.mockReturnValue(adminCtx());
    mocks.nav.mockReturnValue({ navigateIfPermiso: vi.fn(), navigateToPath: vi.fn() });
    mocks.cursos.mockReturnValue({ cursos: [] });
    mocks.docenteHome.mockReturnValue({
      docente: { nombre: 'Doc' }, gestion: {}, cursos: [], stats: {}, actividades: [], loading: false, error: null, refetch: vi.fn(),
    });
    mocks.miDocenteId.mockReturnValue({ docenteId: 1, loading: false });
    mocks.estudianteHome.mockReturnValue({
      estudiante: { nombre: 'Est' }, carrera: null, docentes: [], actividades: [], stats: {}, saldoPendiente: 0, loading: false, error: null,
    });
  });

  it('elige la página según el rol', () => {
    const { unmount } = renderWithProviders(<DashboardConnector />, conRol('DOCENTE'));
    expect(screen.getByText('Hola, Doc')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<DashboardConnector />, conRol('ESTUDIANTE'));
    expect(screen.getByText('Hola, Est')).toBeInTheDocument();
    u2();
    renderWithProviders(<DashboardConnector />, conRol('RECTOR'));
    expect(screen.getByTestId('provider')).toBeInTheDocument();
    expect(within(screen.getByTestId('provider')).getByText('Nuestras carreras')).toBeInTheDocument();
  });
});
