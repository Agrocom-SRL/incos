import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import CalendarioAsistenciaPage from '../pages/CalendarioAsistenciaPage';
import CoordinacionAsistenciaPage from '../pages/CoordinacionAsistenciaPage';
import ConsolidadoAsistenciaPage from '../pages/ConsolidadoAsistenciaPage';
import LicenciaSolicitarPage from '../pages/LicenciaSolicitarPage';
import LicenciasListPage from '../pages/LicenciasListPage';
import MisCursosAsistenciaPage from '../pages/MisCursosAsistenciaPage';
import PlanillaAsistenciaSemanalPage from '../pages/PlanillaAsistenciaSemanalPage';
import AsistenciaEntradaConnector from '../connectors/AsistenciaEntradaConnector';
import CalendarioAsistenciaConnector from '../connectors/CalendarioAsistenciaConnector';
import ConsolidadoAsistenciaConnector from '../connectors/ConsolidadoAsistenciaConnector';
import LicenciaSolicitarConnector from '../connectors/LicenciaSolicitarConnector';
import LicenciasListConnector from '../connectors/LicenciasListConnector';
import MisCursosAsistenciaConnector from '../connectors/MisCursosAsistenciaConnector';
import PlanillaAsistenciaSemanalConnector from '../connectors/PlanillaAsistenciaSemanalConnector';

const mocks = vi.hoisted(() => ({
  calendario: vi.fn(),
  consolidado: vi.fn(),
  exportar: vi.fn(),
  planilla: vi.fn(),
  licencias: vi.fn(),
  vistaAdmin: vi.fn(),
  misCursos: vi.fn(),
  crear: vi.fn(),
  editar: vi.fn(),
  inscripcion: vi.fn(),
  buscar: vi.fn(),
  entrada: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({
  useContainer: () => ({ resolve: vi.fn() }),
  useCasesFactory: { buscarEstudiantesAsignacionBeca: () => ({ ejecutar: (...a) => mocks.buscar(...a) }) },
}));
vi.mock('@application-academico/asistencia/hooks/state/useCalendarioAsistenciaState.js', () => ({ useCalendarioAsistenciaState: mocks.calendario }));
vi.mock('@application-academico/asistencia/hooks/state/useConsolidadoAsistenciaPage.js', () => ({ useConsolidadoAsistenciaPage: mocks.consolidado }));
vi.mock('@application-academico/asistencia/hooks/api/useExportConsolidadoAsistenciaExcel.js', () => ({ useExportConsolidadoAsistenciaExcel: () => mocks.exportar() }));
vi.mock('@application-academico/asistencia/hooks/state/usePlanillaAsistenciaState.js', () => ({ usePlanillaAsistenciaState: mocks.planilla }));
vi.mock('@application-academico/asistencia/hooks/state/useLicenciasListPage.js', () => ({ useLicenciasListPage: mocks.licencias }));
vi.mock('@application-academico/asistencia/hooks/useVistaAdminAsistenciaDocentes.js', () => ({ useVistaAdminAsistenciaDocentes: mocks.vistaAdmin }));
vi.mock('@application-academico/asistencia/hooks/useMisCursosAsistencia.js', () => ({ useMisCursosAsistencia: mocks.misCursos }));
vi.mock('@application-academico/asistencia/hooks/api/useLicenciaCrearApi.js', () => ({ useLicenciaCrearApi: () => mocks.crear() }));
vi.mock('@application-academico/asistencia/hooks/api/useLicenciaEditarApi.js', () => ({ useLicenciaEditarApi: () => mocks.editar() }));
vi.mock('@application-academico/asistencia/hooks/api/useInscripcionVigenteApi.js', () => ({ useInscripcionVigenteApi: () => mocks.inscripcion() }));
vi.mock('@application-academico/asistencia/providers/LicenciasProvider.jsx', () => ({
  LicenciasProvider: ({ children }) => <div data-testid="prov-licencias">{children}</div>,
}));
vi.mock('@navigation/components/ModuleEntryConnector.jsx', () => ({
  default: ({ menuKey, inlineElement }) => <div data-testid={`entrada-${menuKey}`}>{inlineElement}</div>,
}));

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  window.matchMedia = (query) => ({ matches: true, media: query, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
});

const curso = { materia: 'Matemática', materiaSigla: 'MAT-101', carrera: 'Sistemas', paralelo: 'A', docente: 'Luna', turno: 'NOCHE', estudiantes: 2 };

describe('CalendarioAsistenciaPage', () => {
  const estado = (extra = {}) => ({
    curso, bimestre: 1, bimestreNombre: 'Primer bimestre', bimestreColor: '#336699', gestion: '2026', anioCalendario: 2026, hoy: '2026-03-09', resumen: { total: 10, presentes: 8, atrasados: 1, faltantes: 1, conLicencia: 0 },
    horario: [], dias: [{ fechaClase: '2026-03-02', esDiaClase: true }], actividadesSinClase: [{ id: 1, nombre: 'Feriado', tipo: 'FERIADO', fechaInicio: '2026-05-01', fechaFin: '2026-05-01' }], rango: { desde: '2026-03-01', hasta: '2026-05-31' },
    registroEstado: 'ABIERTO', puedeEditar: true, isLoading: false, error: null, refetch: vi.fn(), breadcrumbItems: [{ title: 'Asistencia' }], planillaPath: (f) => `/planilla${f ? `?fecha=${f}` : ''}`,
    habilitarFechaEspecial: vi.fn(), eliminarFechaEspecial: vi.fn(), creandoSesion: false, eliminandoSesion: false, fechaEspecial: { abierto: false, fecha: null, sesion: null },
    abrirFechaEspecial: vi.fn(), abrirEditarFechaEspecial: vi.fn(), cerrarFechaEspecial: vi.fn(), ...extra,
  });

  it('muestra la ficha, el calendario, las actividades y el resumen; marcar asistencia exige LISTAR', async () => {
    mocks.calendario.mockReturnValue(estado());
    const { unmount } = renderWithProviders(<CalendarioAsistenciaPage />, { auth: { permisos: [permiso('academico.asistencia.registro.cuaderno', 'LISTAR')] } });
    expect(screen.getByRole('heading', { name: 'Matemática' })).toBeInTheDocument();
    expect(screen.getByText('Calendario del bimestre')).toBeInTheDocument();
    expect(screen.getByText('Días sin clase del bimestre')).toBeInTheDocument();
    expect(screen.getAllByText('Feriado').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Marcar asistencia/ }));
    expect(navigate).toHaveBeenCalledWith('/planilla');
    unmount();
    mocks.calendario.mockReturnValue(estado());
    renderWithProviders(<CalendarioAsistenciaPage />);
    expect(screen.queryByRole('button', { name: /Marcar asistencia/ })).not.toBeInTheDocument();
  });

  it('registro cerrado avisa; sin días informa y no pinta el calendario', () => {
    mocks.calendario.mockReturnValue(estado({ registroEstado: 'CERRADO', dias: [] }));
    renderWithProviders(<CalendarioAsistenciaPage />);
    expect(screen.getByText('Registro cerrado (solo lectura)')).toBeInTheDocument();
    expect(screen.getByText('Sin días de clase en el bimestre')).toBeInTheDocument();
    expect(screen.queryByText('Calendario del bimestre')).not.toBeInTheDocument();
  });

  it('carga y error con reintento', async () => {
    mocks.calendario.mockReturnValue(estado({ isLoading: true, dias: [] }));
    const a = renderWithProviders(<CalendarioAsistenciaPage />);
    expect(a.container.querySelector('.ant-skeleton')).not.toBeNull();
    a.unmount();
    const s = estado({ error: 'Falla del servidor', dias: [] });
    mocks.calendario.mockReturnValue(s);
    renderWithProviders(<CalendarioAsistenciaPage />);
    expect(screen.getByText('No se pudo cargar el calendario')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });

  it('hacer clic en un día libre del bimestre abre la fecha especial solo con permiso de edición', async () => {
    const s = estado();
    mocks.calendario.mockReturnValue(s);
    const { unmount } = renderWithProviders(<CalendarioAsistenciaPage />);
    await userEvent.click(document.querySelector('button.asi-cal__dia--habilitable'));
    expect(s.abrirFechaEspecial).toHaveBeenCalled();
    unmount();
    mocks.calendario.mockReturnValue(estado({ puedeEditar: false }));
    renderWithProviders(<CalendarioAsistenciaPage />);
    expect(document.querySelector('button.asi-cal__dia--habilitable')).toBeNull();
  });

  it('sin curso ni sigla usa el título por defecto y el drawer abierto precarga la fecha', async () => {
    mocks.calendario.mockReturnValue(estado({ curso: null, fechaEspecial: { abierto: true, fecha: '2026-03-14', sesion: null } }));
    renderWithProviders(<CalendarioAsistenciaPage />);
    expect(screen.getByText('Calendario de asistencia')).toBeInTheDocument();
    expect(await screen.findByText('Habilitar fecha especial')).toBeInTheDocument();
  });
});

describe('CoordinacionAsistenciaPage', () => {
  const vista = (extra = {}) => ({
    breadcrumbItems: [{ title: 'Asistencia' }], gestionVigente: '2026', docentes: [{ id: 3, nombre: 'Luna Pérez', especialidad: 'Matemática', carreras: [], cantidadMaterias: 2, cantidadCursos: 3, cantidadEstudiantes: 40 }],
    isLoading: false, error: null, refetch: vi.fn(), busquedaInput: '', setBusquedaInput: vi.fn(), esBusquedaActiva: false, busquedaMinChars: 2, prelimLimit: 10, ...extra,
  });

  it('lista docentes y navega a sus cursos con el docente elegido', async () => {
    mocks.vistaAdmin.mockReturnValue(vista());
    renderWithProviders(<CoordinacionAsistenciaPage />, { auth: { permisos: [permiso('academico.asistencia.registro.coordinacion', 'LISTAR')] } });
    expect(screen.getByText('Luna Pérez')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver cursos' }));
    expect(navigate).toHaveBeenCalledWith(expect.any(String), { state: { docenteId: 3, docenteNombre: 'Luna Pérez' } });
  });

  it('RBAC: consolidado y licencias solo con su permiso LISTAR', async () => {
    mocks.vistaAdmin.mockReturnValue(vista());
    const { unmount } = renderWithProviders(<CoordinacionAsistenciaPage />, {
      auth: { permisos: [permiso('academico.asistencia.consolidado.ver', 'LISTAR'), permiso('academico.asistencia.licencia.ver', 'LISTAR')] },
      route: '/academico/asistencia',
    });
    await userEvent.click(screen.getByRole('button', { name: /Consolidado %/ }));
    await userEvent.click(screen.getByRole('button', { name: /Licencias/ }));
    expect(navigate).toHaveBeenLastCalledWith(expect.any(String), { state: { returnPath: '/academico/asistencia' } });
    unmount();
    mocks.vistaAdmin.mockReturnValue(vista());
    renderWithProviders(<CoordinacionAsistenciaPage />);
    expect(screen.queryByRole('button', { name: /Consolidado %/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Licencias/ })).not.toBeInTheDocument();
  });

  it('sin gestión vigente muestra un guion', () => {
    mocks.vistaAdmin.mockReturnValue(vista({ gestionVigente: null, docentes: [] }));
    renderWithProviders(<CoordinacionAsistenciaPage />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('MisCursosAsistenciaPage', () => {
  const cursos = (extra = {}) => ({
    titulo: 'Mis cursos', cursos: [{ id: 7, materia: 'Matemática', carrera: 'Sistemas', paralelo: 'A', turno: 'NOCHE', periodo: '1° año', estudiantes: 30 }], docente: { gestionVigente: '2026' },
    esVistaCoordinacion: false, isLoading: false, error: null, refetch: vi.fn(), breadcrumbItems: [{ title: 'Asistencia' }], cursoPath: (id) => `/curso/${id}`, ...extra,
  });

  it('lista los cursos y tomar asistencia exige LISTAR del registro', async () => {
    mocks.misCursos.mockReturnValue(cursos());
    const { unmount } = renderWithProviders(<MisCursosAsistenciaPage />, { auth: { permisos: [permiso('academico.asistencia.registro.ver', 'LISTAR')] } });
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tomar asistencia' }));
    expect(navigate).toHaveBeenCalledWith('/curso/7');
    unmount();
    mocks.misCursos.mockReturnValue(cursos());
    renderWithProviders(<MisCursosAsistenciaPage />);
    expect(screen.queryByRole('button', { name: 'Tomar asistencia' })).not.toBeInTheDocument();
  });

  it('volver a coordinación solo para coordinación o vista coordinación', async () => {
    mocks.misCursos.mockReturnValue(cursos());
    const a = renderWithProviders(<MisCursosAsistenciaPage />);
    expect(screen.queryByRole('button', { name: 'Volver a coordinación de asistencia' })).not.toBeInTheDocument();
    a.unmount();
    mocks.misCursos.mockReturnValue(cursos({ esVistaCoordinacion: true }));
    renderWithProviders(<MisCursosAsistenciaPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a coordinación de asistencia' }));
    expect(navigate).toHaveBeenCalled();
  });

  it('sin cursos, error con reintento y carga', async () => {
    mocks.misCursos.mockReturnValue(cursos({ cursos: [] }));
    const a = renderWithProviders(<MisCursosAsistenciaPage />);
    expect(screen.getByText('Sin cursos asignados en el periodo vigente.')).toBeInTheDocument();
    a.unmount();
    const s = cursos({ cursos: [], error: 'Falla' });
    mocks.misCursos.mockReturnValue(s);
    const b = renderWithProviders(<MisCursosAsistenciaPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
    b.unmount();
    mocks.misCursos.mockReturnValue(cursos({ isLoading: true, cursos: [] }));
    const c = renderWithProviders(<MisCursosAsistenciaPage />);
    expect(c.container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });
});

describe('ConsolidadoAsistenciaPage', () => {
  const consolidado = (extra = {}) => ({
    paraleloOptions: [{ value: 5, label: 'Sistemas · A' }], paralelosLoading: false, paralelosError: null, refetchParalelos: vi.fn(), paraleloGestionId: 5, setParaleloGestionId: vi.fn(),
    paraleloSeleccionado: { carreraNombre: 'Sistemas', periodoNombre: '1° año', paraleloNombre: 'A' }, bimestre: null, setBimestre: vi.fn(),
    asignaturas: [{ ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática' }], estudiantes: [{ estudianteId: 1, codigo: 'E-1', nombreCompleto: 'Pérez Ana', promedioPct: 90, asistencia: { 1: { pctAsistencia: 90, sesiones: 10 } } }],
    gestionAnio: 2026, isLoading: false, error: null, refetch: vi.fn(), ...extra,
  });

  beforeEach(() => mocks.exportar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: true }), loading: false }));

  it('muestra el contexto del paralelo y la matriz', () => {
    mocks.consolidado.mockReturnValue(consolidado());
    renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.getByText('Gestión 2026 · Sistemas · 1° año · Paralelo A · Acumulado anual')).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
  });

  it('cambiar el alcance a un bimestre lo informa al hook', async () => {
    const s = consolidado();
    mocks.consolidado.mockReturnValue(s);
    renderWithProviders(<ConsolidadoAsistenciaPage />);
    await userEvent.click(screen.getByText('Bimestre 2'));
    expect(s.setBimestre).toHaveBeenCalledWith(2);
  });

  it('exportar exige EXPORTAR y notifica el resultado', async () => {
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Sin datos' });
    mocks.exportar.mockReturnValue({ exportar, loading: false });
    mocks.consolidado.mockReturnValue(consolidado({ bimestre: 2 }));
    const { unmount } = renderWithProviders(<ConsolidadoAsistenciaPage />, { auth: { permisos: [permiso('academico.asistencia.consolidado.ver', 'EXPORTAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Exportar/ }));
    expect(exportar).toHaveBeenCalledWith({ paraleloGestionId: 5, bimestre: 2 });
    expect(await screen.findByText('Consolidado exportado')).toBeInTheDocument();
    expect(screen.getByText(/bimestre 2 se descargó/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Exportar/ }));
    expect(await screen.findByText('No se pudo exportar')).toBeInTheDocument();
    unmount();
    mocks.consolidado.mockReturnValue(consolidado());
    renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument();
  });

  it('estados: sin paralelo, cargando, sin datos y errores', async () => {
    mocks.consolidado.mockReturnValue(consolidado({ paraleloGestionId: null }));
    const a = renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.getByText('Seleccione un paralelo para generar la matriz de asistencia.')).toBeInTheDocument();
    a.unmount();
    mocks.consolidado.mockReturnValue(consolidado({ isLoading: true, estudiantes: [] }));
    const b = renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.getByText('Cargando consolidado de asistencia...')).toBeInTheDocument();
    b.unmount();
    mocks.consolidado.mockReturnValue(consolidado({ estudiantes: [] }));
    const c = renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.getByText(/aún no tiene registros de asistencia computables/)).toBeInTheDocument();
    c.unmount();
    mocks.consolidado.mockReturnValue(consolidado({ estudiantes: [], bimestre: 3 }));
    const d = renderWithProviders(<ConsolidadoAsistenciaPage />);
    expect(screen.getByText(/para el bimestre seleccionado/)).toBeInTheDocument();
    d.unmount();
    const s = consolidado({ paralelosError: 'Falla paralelos' });
    mocks.consolidado.mockReturnValue(s);
    const e = renderWithProviders(<ConsolidadoAsistenciaPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetchParalelos).toHaveBeenCalled();
    e.unmount();
    const t = consolidado({ error: 'Falla matriz' });
    mocks.consolidado.mockReturnValue(t);
    renderWithProviders(<ConsolidadoAsistenciaPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(t.refetch).toHaveBeenCalled();
  });

  it('volver regresa a Asistencia', async () => {
    mocks.consolidado.mockReturnValue(consolidado());
    renderWithProviders(<ConsolidadoAsistenciaPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a Asistencia' }));
    expect(navigate).toHaveBeenCalled();
  });
});

describe('LicenciasListPage', () => {
  const lista = (extra = {}) => ({
    licencias: [{ id: 1, estudianteNombre: 'Pérez Ana', estado: 'PENDIENTE' }], loading: false, error: null, estado: undefined, setEstado: vi.fn(), searchText: '', handleSearchChange: vi.fn(),
    tableColumns: [{ title: 'Estudiante', key: 'e', render: (_, r) => r.estudianteNombre }], puedeDecidir: true, puedeCancelar: true, drawerAbierto: false, licenciaActiva: null, cerrarDrawer: vi.fn(),
    confirmarDecision: vi.fn(), onCancelar: vi.fn(), decidiendo: false, cancelando: false, ...extra,
  });

  it('lista las licencias y solicitar exige CREAR', async () => {
    mocks.licencias.mockReturnValue(lista());
    const { unmount } = renderWithProviders(<LicenciasListPage />, { auth: { permisos: [permiso('academico.asistencia.licencia.crear', 'CREAR')] } });
    expect(screen.getAllByText('Licencias estudiantiles').length).toBeGreaterThan(0);
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Solicitar licencia/ }));
    expect(navigate).toHaveBeenCalled();
    unmount();
    mocks.licencias.mockReturnValue(lista());
    renderWithProviders(<LicenciasListPage />);
    expect(screen.queryByRole('button', { name: /Solicitar licencia/ })).not.toBeInTheDocument();
  });

  it('el filtro de estado y el buscador delegan en el hook; volver usa el origen', async () => {
    const s = lista();
    mocks.licencias.mockReturnValue(s);
    renderWithProviders(<LicenciasListPage />, { route: { pathname: '/x', state: { returnPath: '/origen' } } });
    await userEvent.click(screen.getAllByRole('combobox')[0]);
    await userEvent.click(await screen.findByText('Aprobada', { selector: '.ant-select-item-option-content' }));
    expect(s.setEstado).toHaveBeenCalledWith('APROBADA');
    await userEvent.type(screen.getByPlaceholderText('Buscar por estudiante…'), 'p');
    expect(s.handleSearchChange).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenCalledWith('/origen');
  });

  it('el drawer de decisión se abre con la licencia activa', async () => {
    mocks.licencias.mockReturnValue(lista({ drawerAbierto: true, licenciaActiva: { id: 1, estado: 'PENDIENTE', estudianteNombre: 'Pérez Ana', motivo: 'SALUD' } }));
    renderWithProviders(<LicenciasListPage />);
    expect(await screen.findByText('Detalle de la licencia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aprobar$/ })).toBeInTheDocument();
  });

  it('error del listado', () => {
    mocks.licencias.mockReturnValue(lista({ licencias: [], error: 'No se pudo cargar' }));
    renderWithProviders(<LicenciasListPage />);
    expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe('PlanillaAsistenciaSemanalPage', () => {
  const dias = [{ fechaClase: '2026-03-02', esDiaClase: true, esFuturo: false, neutro: null, sesionEstado: 'ABIERTA' }];
  const filas = [{ matriculaMateriaId: 10, estudianteId: 3, estudianteCodigo: 'E-1', estudianteNombre: 'Pérez Ana', dias: [{ fechaClase: '2026-03-02', estado: 'AUSENTE' }] }, { matriculaMateriaId: 11, estudianteId: 4, estudianteCodigo: 'E-2', estudianteNombre: 'Rojas Beto', dias: [] }];
  const planilla = (extra = {}) => ({
    asignacionId: 7, curso, cursoFicha: null, bimestre: 1, bimestreNombre: 'Primer bimestre', bimestreColor: '#336699', gestion: '2026', anioCalendario: 2026, hoy: '2026-03-02',
    resumen: { total: 2, presentes: 1, atrasados: 0, faltantes: 1, conLicencia: 0 }, horario: [], filas, dias, rangoSemana: { desde: '2026-03-02', hasta: '2026-03-07' }, registroEstado: 'ABIERTO',
    puedeEditar: true, isLoading: false, error: null, refetch: vi.fn(), breadcrumbItems: [{ title: 'Asistencia' }], volverPath: '/mis-cursos', estadoCelda: (_m, _f, b) => b, toggleCelda: vi.fn(),
    hayCambios: false, flushPendientes: vi.fn(), cerrarDia: vi.fn(), reabrirDia: vi.fn(), procesandoCierre: false, semanaPrev: { desde: 'x' }, semanaSig: null, irSemanaAnterior: vi.fn(),
    irSemanaSiguiente: vi.fn(), irAFecha: vi.fn(), irHoy: vi.fn(), esSemanaActual: true, habilitarFechaEspecial: vi.fn(), creandoSesion: false, ...extra,
  });

  it('muestra la ficha del curso, la semana y la grilla; marcar una celda delega en el hook', async () => {
    const s = planilla();
    mocks.planilla.mockReturnValue(s);
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(screen.getByText('Planilla de asistencia : MAT-101')).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ausente · Pérez Ana/ }));
    expect(s.toggleCelda).toHaveBeenCalledWith(10, '2026-03-02', 'AUSENTE');
    await userEvent.click(screen.getByRole('button', { name: 'Semana anterior' }));
    expect(s.irSemanaAnterior).toHaveBeenCalled();
  });

  it('el buscador filtra los estudiantes de la grilla', async () => {
    mocks.planilla.mockReturnValue(planilla());
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    await userEvent.type(screen.getByRole('textbox', { name: /Buscar/i }), 'rojas');
    expect(screen.queryByText('Pérez Ana')).not.toBeInTheDocument();
    expect(screen.getByText('Rojas Beto')).toBeInTheDocument();
  });

  it('RBAC: calendario solo con coordinación; solicitar licencia solo con CREAR y precarga al estudiante', async () => {
    mocks.planilla.mockReturnValue(planilla());
    const { unmount } = renderWithProviders(<PlanillaAsistenciaSemanalPage />, {
      auth: { permisos: [permiso('academico.asistencia.registro.coordinacion', 'LISTAR'), permiso('academico.asistencia.licencia.crear', 'CREAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Calendario/ }));
    expect(navigate).toHaveBeenLastCalledWith(expect.stringContaining('7'));
    await userEvent.click(screen.getByRole('button', { name: 'Solicitar licencia para Pérez Ana' }));
    expect(navigate).toHaveBeenLastCalledWith(expect.any(String), { state: { estudiante: { id: 3, nombre: 'Pérez Ana', codigo: 'E-1' }, returnListPath: expect.stringContaining('7') } });
    unmount();
    mocks.planilla.mockReturnValue(planilla());
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(screen.queryByRole('button', { name: /Calendario/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Solicitar licencia para/ })).not.toBeInTheDocument();
  });

  it('volver guarda lo pendiente antes de salir', async () => {
    const s = planilla({ hayCambios: true });
    mocks.planilla.mockReturnValue(s);
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a mis cursos' }));
    await waitFor(() => expect(s.flushPendientes).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('/mis-cursos');
  });

  it('cerrar un día pide confirmación y luego lo cierra', async () => {
    const s = planilla();
    mocks.planilla.mockReturnValue(s);
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    await userEvent.click(screen.getByRole('button', { name: /Cerrar la asistencia del/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText('Cerrar la asistencia de este día').length).toBeGreaterThan(0);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar día' }));
    await waitFor(() => expect(s.cerrarDia).toHaveBeenCalledWith('2026-03-02'));
  });

  it('habilitar una fecha especial abre el drawer', async () => {
    mocks.planilla.mockReturnValue(planilla({ dias: [{ fechaClase: '2026-03-03', esDiaClase: false, puedeHabilitarEspecial: true }] }));
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    await userEvent.click(screen.getByRole('button', { name: /Habilitar asistencia especial el/ }));
    expect(await screen.findByText('Habilitar fecha especial')).toBeInTheDocument();
  });

  it('semana sin días, carga y error con reintento', async () => {
    mocks.planilla.mockReturnValue(planilla({ dias: [] }));
    const a = renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(screen.getByText('Semana sin días de clase')).toBeInTheDocument();
    a.unmount();
    mocks.planilla.mockReturnValue(planilla({ isLoading: true, filas: [] }));
    const b = renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(b.container.querySelector('.ant-skeleton')).not.toBeNull();
    b.unmount();
    const s = planilla({ error: 'Falla', filas: [] });
    mocks.planilla.mockReturnValue(s);
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(screen.getByText('No se pudo cargar la planilla')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });

  it('sin ficha del curso usa el título genérico', () => {
    mocks.planilla.mockReturnValue(planilla({ curso: null, cursoFicha: null }));
    renderWithProviders(<PlanillaAsistenciaSemanalPage />);
    expect(screen.getByText('Planilla de asistencia')).toBeInTheDocument();
  });
});

describe('LicenciaSolicitarPage', () => {
  const fila = (id, extra = {}) => ({ id, codigoEstudiante: `E-${id}`, nombreCompleto: `Estudiante ${id}`, carreraNombre: 'Sistemas', carreraCodigo: 'SIS', ...extra });
  const baseHooks = () => {
    mocks.crear.mockReturnValue({ crearLicencia: vi.fn().mockResolvedValue({ success: true }), loading: false });
    mocks.editar.mockReturnValue({ editarLicencia: vi.fn().mockResolvedValue({ success: true }), loading: false });
    mocks.inscripcion.mockReturnValue({
      inscripcion: null, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion: vi.fn(),
    });
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(1), fila(2)] });
  };
  const vigente = { inscripcionId: 55, codigoEstudiante: 'E-1', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', periodoNombre: '1° año', paraleloNombre: 'A', gestionNombre: 'Gestión 2026', gestionAnio: 2026 };

  it('sin estudiante muestra el buscador con la muestra preliminar', async () => {
    baseHooks();
    renderWithProviders(<LicenciaSolicitarPage />);
    expect(await screen.findByText('Estudiante 1')).toBeInTheDocument();
    expect(mocks.buscar).toHaveBeenCalledWith({ preliminar: true, limit: 10 });
    expect(screen.getByText(/Muestra de hasta 10 estudiantes/)).toBeInTheDocument();
  });

  it('elegir un estudiante consulta su inscripción vigente y habilita el formulario', async () => {
    baseHooks();
    const consultarInscripcion = vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } });
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion, limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    expect(consultarInscripcion).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Inscripción vigente')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026 (2026)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar solicitud/ })).toBeEnabled();
  });

  it('un estudiante sin inscripción vigente no permite enviar', async () => {
    baseHooks();
    mocks.inscripcion.mockReturnValue({ inscripcion: null, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: false }), limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    expect(await screen.findByText('El estudiante no tiene inscripción vigente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar solicitud/ })).toBeDisabled();
  });

  it('valida los campos obligatorios y envía la solicitud de un solo día', async () => {
    baseHooks();
    const crearLicencia = vi.fn().mockResolvedValue({ success: true });
    mocks.crear.mockReturnValue({ crearLicencia, loading: false });
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />, { route: { pathname: '/x', state: { returnListPath: '/licencias' } } });
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    await screen.findByText('Datos de la licencia');
    await userEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }));
    expect(await screen.findByText('Elija el motivo de la licencia')).toBeInTheDocument();
    expect(screen.getByText('Describa el motivo de la licencia')).toBeInTheDocument();
    expect(crearLicencia).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Enfermedad', { selector: '.ant-select-item-option-content' }));
    await userEvent.type(screen.getByPlaceholderText('Describa brevemente el motivo de la solicitud.'), ' Reposo médico ');
    await userEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }));
    await waitFor(() => expect(crearLicencia).toHaveBeenCalledWith(expect.objectContaining({ inscripcionId: 55, detalleMotivo: 'Reposo médico' })));
    const args = crearLicencia.mock.calls[0][0];
    expect(args.fechaFin).toBe(args.fechaInicio);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/licencias'));
  });

  it('el interruptor de un solo día revela la fecha de fin', async () => {
    baseHooks();
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    await screen.findByText('Datos de la licencia');
    expect(screen.queryByText('Fin del periodo de la licencia')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch'));
    expect(await screen.findByText('Fin del periodo de la licencia')).toBeInTheDocument();
    expect(screen.getByText('No, tiene fecha de fin')).toBeInTheDocument();
  });

  it('un error al registrar se muestra y no navega', async () => {
    baseHooks();
    mocks.crear.mockReturnValue({ crearLicencia: vi.fn().mockResolvedValue({ success: false, error: 'Supera el tope de 15 días' }), loading: false });
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    await screen.findByText('Datos de la licencia');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Enfermedad', { selector: '.ant-select-item-option-content' }));
    await userEvent.type(screen.getByPlaceholderText('Describa brevemente el motivo de la solicitud.'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }));
    expect(await screen.findByText('Supera el tope de 15 días')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('entrada desde la planilla: estudiante fijado, sin buscador ni "Cambiar estudiante"', async () => {
    baseHooks();
    const consultarInscripcion = vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } });
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion, limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />, { route: { pathname: '/x', state: { estudiante: { id: 3, nombre: 'Pérez Ana', codigo: 'E-3' } } } });
    await waitFor(() => expect(consultarInscripcion).toHaveBeenCalledWith(3));
    expect(screen.queryByPlaceholderText('Nombre, apellidos, código o CI…')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estudiante' })).not.toBeInTheDocument();
    expect(mocks.buscar).not.toHaveBeenCalled();
  });

  it('elegir y luego cambiar de estudiante vuelve al buscador', async () => {
    baseHooks();
    const limpiarInscripcion = vi.fn();
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    await userEvent.click(await screen.findByRole('button', { name: 'Cambiar estudiante' }));
    expect(await screen.findByPlaceholderText('Nombre, apellidos, código o CI…')).toBeInTheDocument();
    expect(limpiarInscripcion).toHaveBeenCalled();
  });

  it('modo edición: muestra los datos de la licencia, precarga y guarda cambios', async () => {
    baseHooks();
    const editarLicencia = vi.fn().mockResolvedValue({ success: true });
    mocks.editar.mockReturnValue({ editarLicencia, loading: false });
    const licencia = { id: 9, inscripcionId: 55, estudianteNombre: 'Pérez Ana', codigoEstudiante: 'E-1', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', periodoNombre: '1° año', paraleloNombre: 'A', motivo: 'SALUD', detalleMotivo: 'Reposo', fechaInicio: '2026-03-02', fechaFin: '2026-03-05' };
    renderWithProviders(<LicenciaSolicitarPage />, { route: { pathname: '/x', state: { licencia } } });
    expect(screen.getByRole('heading', { name: 'Editar licencia estudiantil' })).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Reposo')).toBeInTheDocument();
    expect(mocks.buscar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(editarLicencia).toHaveBeenCalledWith(9, expect.objectContaining({ fechaInicio: '2026-03-02', fechaFin: '2026-03-05', motivo: 'SALUD', detalleMotivo: 'Reposo' })));
  });

  it('búsqueda con error y sin resultados', async () => {
    baseHooks();
    mocks.buscar.mockResolvedValue({ success: false, error: 'Sin permiso' });
    renderWithProviders(<LicenciaSolicitarPage />);
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
    expect(screen.getByText('Sin resultados.')).toBeInTheDocument();
  });

  it('cancelar vuelve al listado', async () => {
    baseHooks();
    mocks.inscripcion.mockReturnValue({ inscripcion: vigente, loading: false, error: null, consultarInscripcion: vi.fn().mockResolvedValue({ success: true, inscripcion: { inscripcionId: 55 } }), limpiarInscripcion: vi.fn() });
    renderWithProviders(<LicenciaSolicitarPage />);
    await userEvent.click((await screen.findAllByRole('button', { name: 'Seleccionar' }))[0]);
    await userEvent.click(await screen.findByRole('button', { name: /Cancelar/ }));
    expect(navigate).toHaveBeenCalled();
  });
});

describe('conectores de asistencia', () => {
  it('la entrada del módulo incrusta la coordinación', () => {
    mocks.vistaAdmin.mockReturnValue({ breadcrumbItems: [], gestionVigente: '2026', docentes: [], isLoading: false, error: null, refetch: vi.fn(), busquedaInput: '', setBusquedaInput: vi.fn(), esBusquedaActiva: false, busquedaMinChars: 2, prelimLimit: 10 });
    renderWithProviders(<AsistenciaEntradaConnector />);
    expect(within(screen.getByTestId('entrada-ACA-ASI')).getByText(/Seleccione\s+uno para revisar sus materias/)).toBeInTheDocument();
  });

  it('cada conector monta su página', () => {
    mocks.calendario.mockReturnValue({ curso: null, dias: [], isLoading: true, breadcrumbItems: [], resumen: null, horario: [], actividadesSinClase: [], fechaEspecial: { abierto: false } });
    const a = renderWithProviders(<CalendarioAsistenciaConnector />);
    expect(screen.getByText('Calendario de asistencia')).toBeInTheDocument();
    a.unmount();
    mocks.exportar.mockReturnValue({ exportar: vi.fn(), loading: false });
    mocks.consolidado.mockReturnValue({ paraleloOptions: [], paraleloGestionId: null, asignaturas: [], estudiantes: [], setBimestre: vi.fn(), setParaleloGestionId: vi.fn(), bimestre: null });
    const b = renderWithProviders(<ConsolidadoAsistenciaConnector />);
    expect(screen.getAllByText('Consolidado de asistencia').length).toBeGreaterThan(0);
    b.unmount();
    mocks.licencias.mockReturnValue({ licencias: [], tableColumns: [], handleSearchChange: vi.fn(), setEstado: vi.fn(), searchText: '' });
    const c = renderWithProviders(<LicenciasListConnector />);
    expect(screen.getByTestId('prov-licencias')).toBeInTheDocument();
    c.unmount();
    mocks.misCursos.mockReturnValue({ titulo: 'Mis cursos', cursos: [], docente: null, esVistaCoordinacion: false, isLoading: false, error: null, refetch: vi.fn(), breadcrumbItems: [], cursoPath: () => '/' });
    const d = renderWithProviders(<MisCursosAsistenciaConnector />);
    expect(screen.getByText('Sin cursos asignados en el periodo vigente.')).toBeInTheDocument();
    d.unmount();
    mocks.planilla.mockReturnValue({ filas: [], dias: [], isLoading: true, breadcrumbItems: [], rangoSemana: null });
    const e = renderWithProviders(<PlanillaAsistenciaSemanalConnector />);
    expect(screen.getByText('Planilla de asistencia')).toBeInTheDocument();
    e.unmount();
    mocks.crear.mockReturnValue({ crearLicencia: vi.fn(), loading: false });
    mocks.editar.mockReturnValue({ editarLicencia: vi.fn(), loading: false });
    mocks.inscripcion.mockReturnValue({ inscripcion: null, loading: false, error: null, consultarInscripcion: vi.fn(), limpiarInscripcion: vi.fn() });
    mocks.buscar.mockResolvedValue({ success: true, data: [] });
    renderWithProviders(<LicenciaSolicitarConnector />);
    expect(screen.getByRole('heading', { name: 'Solicitar licencia estudiantil' })).toBeInTheDocument();
  });
});
