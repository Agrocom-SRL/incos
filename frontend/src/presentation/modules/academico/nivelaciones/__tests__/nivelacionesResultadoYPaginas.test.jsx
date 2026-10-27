/**
 * Nivelaciones: ResultadoNivelacionDrawer y páginas (listar, grilla del paralelo, aprobar, inscribir).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from 'antd';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const mocks = vi.hoisted(() => ({
  paralelo: vi.fn(),
  paralelos: vi.fn(),
  pendientes: vi.fn(),
  selector: vi.fn(),
  registrar: vi.fn(),
  programar: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionParalelo.js', () => ({
  useNivelacionParalelo: () => mocks.paralelo(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useParalelosNivelacion.js', () => ({
  useParalelosNivelacion: () => mocks.paralelos(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionesPendientes.js', () => ({
  useNivelacionesPendientes: () => mocks.pendientes(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionSelector.js', () => ({
  useNivelacionSelector: () => mocks.selector(),
}));
vi.mock('@application-academico/nivelaciones/hooks/api', () => ({
  useRegistrarEventoHistorial: () => mocks.registrar(),
  useProgramarNivelacion: () => mocks.programar(),
}));

import ResultadoNivelacionDrawer from '../components/ResultadoNivelacionDrawer.jsx';
import NivelacionListarPage from '../pages/NivelacionListarPage.jsx';
import NivelacionParaleloPage from '../pages/NivelacionParaleloPage.jsx';
import NivelacionAprobarPage from '../pages/NivelacionAprobarPage.jsx';
import NivelacionInscribirPage from '../pages/NivelacionInscribirPage.jsx';
import NivelacionListarConnector from '../connectors/NivelacionListarConnector.jsx';
import NivelacionParaleloConnector from '../connectors/NivelacionParaleloConnector.jsx';
import NivelacionAprobarConnector from '../connectors/NivelacionAprobarConnector.jsx';
import NivelacionInscribirConnector from '../connectors/NivelacionInscribirConnector.jsx';

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.registrar.mockReturnValue({ registrarEvento: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }), loading: false });
  mocks.programar.mockReturnValue({ programar: vi.fn().mockResolvedValue({ success: true, data: { id: 2 } }), loading: false });
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
  Modal.destroyAll();
});

const con = (...pares) => ({ auth: { permisos: pares.map(([c, ...a]) => permiso(c, ...a)) } });

describe('ResultadoNivelacionDrawer', () => {
  const fila = {
    nivelacionId: 7,
    nombreCompleto: 'PEREZ JUAN',
    codigoEstudiante: 'E-1',
    asignaturaSigla: 'MAT',
    asignaturaNombre: 'Matemática',
    paraleloGestionId: 2,
    stateType: 'NIVELACION_1RA',
    status: 'PROGRAMADA',
    subjectEnrollmentId: 33,
  };
  // El drawer sincroniza los formularios cuando la fila cambia (como en la bandeja:
  // primero cerrado, luego abierto con la fila elegida).
  const montar = (filaInicial = fila, extra = {}) => {
    const props = {
      abierto: false,
      fila: null,
      onCerrar: vi.fn(),
      onGuardarResultado: vi.fn().mockResolvedValue({ success: true }),
      guardandoResultado: false,
      onRegistrarDecision: vi.fn().mockResolvedValue({ success: true }),
      guardandoDecision: false,
      ...extra,
    };
    const view = renderWithProviders(<ResultadoNivelacionDrawer {...props} />);
    view.rerender(<ResultadoNivelacionDrawer {...props} abierto fila={filaInicial} />);
    return { props, ...view };
  };
  const elegir = async (indiceCombo, label) => {
    await userEvent.click(screen.getAllByRole('combobox')[indiceCombo]);
    await userEvent.click(await screen.findByText(label, { selector: '.ant-select-item-option-content' }));
  };

  it('muestra el contexto de la fila y la nota mínima', async () => {
    montar();
    expect(await screen.findByText('Gestionar nivelación')).toBeInTheDocument();
    expect(screen.getByText('E-1 — PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('MAT — Matemática')).toBeInTheDocument();
    expect(screen.getByText(/Nota mínima de aprobación: 61/)).toBeInTheDocument();
    expect(screen.getByText('Decisión administrativa')).toBeInTheDocument();
  });

  it('materia arrastrada sin ancla directa no ofrece decisión administrativa', async () => {
    montar({ ...fila, paraleloGestionId: null, subjectEnrollmentId: null });
    expect(await screen.findByText(/\(materia arrastrada\)/)).toBeInTheDocument();
    expect(screen.queryByText('Decisión administrativa')).not.toBeInTheDocument();
  });

  it('guarda el resultado directo (sin nota si el estado no es final)', async () => {
    const { props } = montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar resultado' }));
    await waitFor(() => expect(props.onGuardarResultado).toHaveBeenCalled());
    expect(props.onGuardarResultado).toHaveBeenCalledWith(7, { status: 'PROGRAMADA', levelingGrade: undefined, observations: undefined });
  });

  it('un estado final exige la nota obtenida', async () => {
    const { props } = montar();
    await elegir(0, 'Aprobada');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar resultado' }));
    expect(await screen.findByText('Ingrese la nota')).toBeInTheDocument();
    expect(props.onGuardarResultado).not.toHaveBeenCalled();
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '80' } });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar resultado' }));
    await waitFor(() =>
      expect(props.onGuardarResultado).toHaveBeenCalledWith(7, { status: 'APROBADA', levelingGrade: 80, observations: undefined }),
    );
  });

  it('un error del resultado se muestra', async () => {
    montar(fila, { onGuardarResultado: vi.fn().mockResolvedValue({ success: false, error: 'Examen cerrado' }) });
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar resultado' }));
    expect(await screen.findByText('Examen cerrado')).toBeInTheDocument();
  });

  it('decisión administrativa: valida, confirma y registra con el ancla', async () => {
    const { props } = montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar decisión administrativa' }));
    expect(await screen.findByText('Seleccione una decisión')).toBeInTheDocument();
    expect(screen.getByText('Ingrese la nota forzada')).toBeInTheDocument();
    expect(props.onRegistrarDecision).not.toHaveBeenCalled();

    await elegir(1, 'Retirado');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    await userEvent.click(screen.getByRole('button', { name: 'Registrar decisión administrativa' }));
    expect((await screen.findAllByText(/irreversible/)).length).toBeGreaterThan(0);
    expect(props.onRegistrarDecision).not.toHaveBeenCalled();
    const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Registrar' }));
    await waitFor(() => expect(props.onRegistrarDecision).toHaveBeenCalled());
    expect(props.onRegistrarDecision).toHaveBeenCalledWith({
      subjectEnrollmentId: 33,
      stateType: 'RETIRADO',
      resultingGrade: 10,
      transitionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      observations: undefined,
    });
  });

  it('un error de la decisión se muestra', async () => {
    montar(fila, { onRegistrarDecision: vi.fn().mockResolvedValue({ success: false, error: 'Sin permiso' }) });
    await elegir(1, 'Abandono');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    await userEvent.click(screen.getByRole('button', { name: 'Registrar decisión administrativa' }));
    await screen.findAllByText(/irreversible/);
    const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Registrar' }));
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
  });

  it('cerrar respeta guardados en curso', async () => {
    const { props, unmount } = montar();
    await userEvent.click(await waitFor(() => document.querySelector('.ant-drawer-close')));
    expect(props.onCerrar).toHaveBeenCalled();
    unmount();
    const b = montar(fila, { guardandoResultado: true });
    await userEvent.click(await waitFor(() => document.querySelector('.ant-drawer-close')));
    expect(b.props.onCerrar).not.toHaveBeenCalled();
  });
});

describe('NivelacionListarPage', () => {
  const paralelos = [
    { paraleloGestionId: 4, carreraId: 1, carreraNombre: 'Sistemas', carreraColorHex: '#336699', periodoNombre: '1er Año', paraleloNombre: 'A', totalEstudiantes: 22, totalPendientes: 3 },
  ];

  it('lista paralelos y abre su grilla', async () => {
    mocks.paralelos.mockReturnValue({ paralelos, isLoading: false, error: null, breadcrumbItems: [] });
    renderWithProviders(<NivelacionListarPage />, con(['academico.nivelacion.ver', 'LISTAR']));
    expect(screen.getByText('Paralelos en gestión')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver grilla/ }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('4'));
  });

  it('vacío y conector', () => {
    mocks.paralelos.mockReturnValue({ paralelos: [], isLoading: false, error: null, breadcrumbItems: [] });
    renderWithProviders(<NivelacionListarConnector />);
    expect(screen.getByText('No hay paralelos en gestión vigente.')).toBeInTheDocument();
  });
});

describe('NivelacionParaleloPage', () => {
  const estudiantes = [
    {
      estudianteId: 1,
      nombreCompleto: 'PEREZ JUAN',
      codigoEstudiante: 'E-1',
      celdas: {
        1: { notaFinal: 70 },
        2: { evento: { stateType: 'NIVELACION_1RA', historialMatriculaId: 5, nivelacion: { id: 9, status: 'PROGRAMADA' } } },
        3: { evento: { stateType: 'VENCIDA', historialMatriculaId: 6, transitionDate: '2026-01-02' } },
      },
    },
  ];
  const estado = (extra = {}) => ({
    paraleloGestionId: 4,
    paraleloSeleccionado: { carreraNombre: 'Sistemas', periodoNombre: '1er Año', paraleloNombre: 'A' },
    asignaturas: [
      { ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática' },
      { ofertaCursoId: 2, sigla: 'FIS', nombre: 'Física' },
      { ofertaCursoId: 3, sigla: 'QUI', nombre: 'Química' },
    ],
    estudiantes,
    totalPendientes: 2,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    breadcrumbItems: [],
    ...extra,
  });

  it('muestra la grilla y el total de pendientes', () => {
    mocks.paralelo.mockReturnValue(estado());
    renderWithProviders(<NivelacionParaleloPage />);
    expect(screen.getByText('Pendientes de nivelación:')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
  });

  it('un evento con nivelación activa va a aprobar con su id', async () => {
    mocks.paralelo.mockReturnValue(estado());
    renderWithProviders(<NivelacionParaleloPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle: Nivelación 1ra' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/nivelacionId=9/));
  });

  it('un evento sin nivelación activa va a inscribir en modo detalle', async () => {
    mocks.paralelo.mockReturnValue(estado());
    renderWithProviders(<NivelacionParaleloPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle: Materia vencida' }));
    const destino = navigate.mock.calls.at(-1)[0];
    expect(destino).toMatch(/historialMatriculaId=6/);
    expect(destino).toMatch(/estudiante=PEREZ\+JUAN/);
  });

  it('acciones de cabecera: centralizador y volver', async () => {
    mocks.paralelo.mockReturnValue(estado());
    renderWithProviders(<NivelacionParaleloPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver en Centralizador' }));
    await userEvent.click(screen.getByRole('button', { name: 'Volver a los paralelos' }));
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('sin paralelo seleccionado el acceso al centralizador queda deshabilitado', () => {
    mocks.paralelo.mockReturnValue(estado({ paraleloGestionId: null, estudiantes: [] }));
    renderWithProviders(<NivelacionParaleloPage />);
    expect(screen.getByRole('button', { name: 'Ver en Centralizador' })).toBeDisabled();
  });

  it('error con reintento, carga y sin datos; conector', async () => {
    const s = estado({ error: 'Falla', estudiantes: [] });
    mocks.paralelo.mockReturnValue(s);
    const a = renderWithProviders(<NivelacionParaleloPage />);
    expect(screen.getByText('No se pudo cargar la grilla de nivelación')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
    a.unmount();
    mocks.paralelo.mockReturnValue(estado({ isLoading: true, estudiantes: [] }));
    const b = renderWithProviders(<NivelacionParaleloPage />);
    expect(screen.getByText('Cargando grilla de nivelación…')).toBeInTheDocument();
    b.unmount();
    mocks.paralelo.mockReturnValue(estado({ asignaturas: [] }));
    renderWithProviders(<NivelacionParaleloConnector />);
    expect(screen.getByText('Sin datos para este paralelo')).toBeInTheDocument();
  });
});

describe('NivelacionAprobarPage', () => {
  const fila = { nivelacionId: 9, nombreCompleto: 'PEREZ JUAN', codigoEstudiante: 'E-1', asignaturaSigla: 'MAT', asignaturaNombre: 'Matemática', stateType: 'NIVELACION_1RA', status: 'PROGRAMADA', examDate: null, paraleloGestionId: 1 };
  const estado = (extra = {}) => ({
    nivelaciones: [fila],
    loading: false,
    error: null,
    searchText: '',
    handleSearchChange: vi.fn(),
    filaSeleccionada: null,
    abrirDrawer: vi.fn(),
    cerrarDrawer: vi.fn(),
    handleGuardarResultado: vi.fn(),
    guardandoResultado: false,
    handleRegistrarDecision: vi.fn(),
    guardandoDecision: false,
    breadcrumbItems: [],
    ...extra,
  });

  it('lista la bandeja y "Gestionar" abre el drawer', async () => {
    const s = estado();
    mocks.pendientes.mockReturnValue(s);
    renderWithProviders(<NivelacionAprobarPage />, con(['academico.nivelacion.aprobar', 'APROBAR']));
    expect(screen.getByText('Nivelaciones pendientes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Gestionar/ }));
    expect(s.abrirDrawer).toHaveBeenCalledWith(fila);
  });

  it('el deep-link abre el drawer una sola vez', () => {
    const s = estado();
    mocks.pendientes.mockReturnValue(s);
    renderWithProviders(<NivelacionAprobarPage />, { route: '/aprobar?nivelacionId=9' });
    expect(s.abrirDrawer).toHaveBeenCalledTimes(1);
    expect(s.abrirDrawer).toHaveBeenCalledWith(fila);
  });

  it('el deep-link espera a que termine la carga o a que exista la fila', () => {
    const s = estado({ loading: true });
    mocks.pendientes.mockReturnValue(s);
    const a = renderWithProviders(<NivelacionAprobarPage />, { route: '/aprobar?nivelacionId=9' });
    expect(s.abrirDrawer).not.toHaveBeenCalled();
    a.unmount();
    const t = estado({ nivelaciones: [] });
    mocks.pendientes.mockReturnValue(t);
    renderWithProviders(<NivelacionAprobarPage />, { route: '/aprobar?nivelacionId=9' });
    expect(t.abrirDrawer).not.toHaveBeenCalled();
  });

  it('con fila seleccionada muestra el drawer; vacío y conector', async () => {
    mocks.pendientes.mockReturnValue(estado({ filaSeleccionada: fila }));
    const a = renderWithProviders(<NivelacionAprobarPage />);
    expect(await screen.findByText('Gestionar nivelación')).toBeInTheDocument();
    a.unmount();
    mocks.pendientes.mockReturnValue(estado({ nivelaciones: [] }));
    renderWithProviders(<NivelacionAprobarConnector />);
    expect(screen.getByText('No hay nivelaciones pendientes de resolver.')).toBeInTheDocument();
  });
});

describe('NivelacionInscribirPage', () => {
  const selector = (extra = {}) => ({
    query: '',
    onQueryChange: vi.fn(),
    modoBusqueda: false,
    estudiantesLista: [{ id: 8, nombreCompleto: 'PEREZ JUAN', codigoEstudiante: 'E-8', carreraNombre: 'Sistemas', carreraColorHex: '#336699', ciCompleto: '123' }],
    listaLoading: false,
    listaError: null,
    tablePagination: false,
    resultadosBusqueda: [],
    busquedaLoading: false,
    busquedaError: null,
    estudianteSeleccionado: null,
    seleccionarEstudiante: vi.fn(),
    limpiarSeleccion: vi.fn(),
    materiasPendientes: null,
    materiasPendientesLoading: false,
    materiasPendientesError: null,
    ...extra,
  });
  const INSCRIBIR = con(['academico.nivelacion.inscribir', 'CREAR']);

  it('lista estudiantes y seleccionar delega en el hook', async () => {
    const s = selector();
    mocks.selector.mockReturnValue(s);
    renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText('Seleccionar estudiante')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Seleccionar$/ }));
    expect(s.seleccionarEstudiante).toHaveBeenCalledWith(s.estudiantesLista[0]);
  });

  it('el buscador propaga y el modo búsqueda muestra resultados', async () => {
    const s = selector({ modoBusqueda: true, query: 'ro', resultadosBusqueda: [{ id: 9, nombreCompleto: 'ROJAS ANA', ci: '9' }] });
    mocks.selector.mockReturnValue(s);
    renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText('ROJAS ANA')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Buscar por nombre/), 'x');
    expect(s.onQueryChange).toHaveBeenCalledWith('rox');
  });

  it('estudiante elegido: materias pendientes y registro con ancla en la URL', async () => {
    const s = selector({
      estudianteSeleccionado: { nombreCompleto: 'Perez Juan', codigoEstudiante: 'E-8' },
      materiasPendientes: {
        materiasPendientes: [
          { asignaturaPlanId: 5, matriculaMateriaId: 3, esAnclaDirecta: true, asignaturaSigla: 'MAT', asignaturaNombre: 'Matemática', evento: { stateType: 'VENCIDA' } },
        ],
      },
    });
    mocks.selector.mockReturnValue(s);
    renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText('Materias pendientes de PEREZ JUAN')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar evento/ }));
    expect(await screen.findByText('Registrar evento de nivelación', { selector: '.ant-drawer-title' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Elegir otro estudiante'));
    expect(s.limpiarSeleccion).toHaveBeenCalled();
  });

  it('materias pendientes: vacío, error y carga', () => {
    const base = { estudianteSeleccionado: { nombreCompleto: 'Perez' } };
    mocks.selector.mockReturnValue(selector({ ...base }));
    const a = renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText(/no tiene materias pendientes o arrastradas/)).toBeInTheDocument();
    a.unmount();
    mocks.selector.mockReturnValue(selector({ ...base, materiasPendientesError: 'Falla' }));
    const b = renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText('Falla')).toBeInTheDocument();
    b.unmount();
    mocks.selector.mockReturnValue(selector({ ...base, materiasPendientesLoading: true }));
    renderWithProviders(<NivelacionInscribirPage />, INSCRIBIR);
    expect(screen.getByText('Cargando materias pendientes…')).toBeInTheDocument();
  });

  it('deep-link con ancla abre el drawer de registro', async () => {
    mocks.selector.mockReturnValue(selector());
    renderWithProviders(<NivelacionInscribirPage />, {
      ...INSCRIBIR,
      route: '/inscribir?subjectEnrollmentId=3&estudiante=PEREZ&asignaturaSigla=MAT&asignaturaNombre=Matem',
    });
    expect(await screen.findByText('Registrar evento de nivelación', { selector: '.ant-drawer-title' })).toBeInTheDocument();
    expect(screen.getByText('PEREZ')).toBeInTheDocument();
  });

  it('deep-link de detalle abre el drawer de solo lectura', async () => {
    mocks.selector.mockReturnValue(selector());
    renderWithProviders(<NivelacionInscribirPage />, {
      route: '/inscribir?historialMatriculaId=6&stateType=VENCIDA&observations=Sin+prerrequisito',
    });
    expect(await screen.findByText('Detalle del evento')).toBeInTheDocument();
    expect(screen.getByText('Sin prerrequisito')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.selector.mockReturnValue(selector({ estudiantesLista: [] }));
    renderWithProviders(<NivelacionInscribirConnector />);
    expect(screen.getByText('Seleccionar estudiante')).toBeInTheDocument();
  });
});
