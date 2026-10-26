import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import GestionHorariosPage from '../pages/GestionHorariosPage';
import GestionHorariosPublicacionPage from '../pages/GestionHorariosPublicacionPage';
import GestionHorariosArmadoPage from '../pages/GestionHorariosArmadoPage';
import GestionHorariosConflictosPage from '../pages/GestionHorariosConflictosPage';
import {
  ArmadoGestionRedirectFromParaleloPath,
  ArmadoGestionRedirectFromPlantillaPath,
} from '../connectors/HorariosArmadoEntryRedirects';

const mocks = vi.hoisted(() => ({ lista: vi.fn(), publicacion: vi.fn(), armado: vi.fn() }));
const conflictosMock = vi.hoisted(() => vi.fn());
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-institucional/horarios', async (orig) => ({
  ...(await orig()),
  useHorariosContext: mocks.lista,
  useHorariosPublicacionContext: mocks.publicacion,
  useHorariosArmadoContext: mocks.armado,
}));
vi.mock('@application-institucional/horarios/hooks/context/useHorariosConflictosContext', () => ({
  useHorariosConflictosContext: conflictosMock,
}));

const authTodo = {
  permisos: [
    permiso('institucional.horario.publicacion', 'EDITAR'),
    permiso('institucional.horario.armado', 'EDITAR'),
    permiso('institucional.oferta.paralelo-gestion', 'DETALLE'),
  ],
};

const paralelo = { id: 1, paralelo: 'A', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_horarios', paraleloAulaId: 2, paraleloGestionId: 71 };

describe('GestionHorariosPage', () => {
  const estado = (extra = {}) => ({
    title: 'Gestión de horarios',
    filters: { carrera: 'all', periodo: 'all', turno: 'all' },
    options: { carreras: ['Sistemas'], periodos: [], turnos: [] },
    viewMode: 'board',
    kpis: { total: 4, completos: 1, sinAulas: 1, sinDocentes: 1, sinHorarios: 1 },
    boardByStatus: [{ key: 'sin_horarios', title: 'Sin horarios', items: [paralelo] }],
    filteredParallels: [paralelo],
    setViewMode: vi.fn(),
    onFilterChange: vi.fn(),
    onOpenArmado: vi.fn(),
    onPublish: vi.fn(),
    clearFilters: vi.fn(),
    hayAlertas: false,
    alertLineas: [],
    pendientesSidebar: null,
    loading: false,
    sidebarLoading: false,
    error: null,
    ...extra,
  });

  it('muestra KPI, filtros y el tablero; publicar cambios exige EDITAR', async () => {
    const s = estado();
    mocks.lista.mockReturnValue(s);
    const { unmount } = renderWithProviders(<GestionHorariosPage />, { auth: authTodo });
    expect(screen.getByRole('heading', { name: 'Gestión de horarios' })).toBeInTheDocument();
    expect(screen.getByText('Vista de planificación')).toBeInTheDocument();
    expect(screen.getByText('Total paralelos')).toBeInTheDocument();
    expect(screen.getByText('Sin horarios', { selector: '.ant-card-head-title *, .ant-card-head-title' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
    expect(s.onPublish).toHaveBeenCalledTimes(1);
    unmount();
    renderWithProviders(<GestionHorariosPage />);
    expect(screen.queryByRole('button', { name: 'Publicar cambios' })).not.toBeInTheDocument();
  });

  it('cambiar de pestaña a la tabla delega en setViewMode y abre el armado desde la tabla', async () => {
    const s = estado({ viewMode: 'table' });
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<GestionHorariosPage />, { auth: authTodo });
    await userEvent.click(screen.getByRole('button', { name: /Completar|Asignar|Resolver/ }));
    expect(s.onOpenArmado).toHaveBeenCalledWith(paralelo);
    await userEvent.click(screen.getByRole('tab', { name: /Conflictos de horarios/ }));
    expect(s.setViewMode).toHaveBeenCalledWith('board');
  });

  it('error y alertas se muestran sobre el contenido', () => {
    mocks.lista.mockReturnValue(estado({ error: 'No se pudo cargar', hayAlertas: true, alertLineas: ['2 cursos sin docente'] }));
    renderWithProviders(<GestionHorariosPage />);
    expect(screen.getByText('No se pudo cargar')).toBeInTheDocument();
    expect(screen.getByText('2 cursos sin docente')).toBeInTheDocument();
  });

  it('estado de carga y sin paralelos', () => {
    mocks.lista.mockReturnValue(estado({ loading: true, boardByStatus: [], filteredParallels: [], kpis: { total: 0 } }));
    const { container } = renderWithProviders(<GestionHorariosPage />);
    expect(container.querySelector('.ant-spin-spinning')).not.toBeNull();
    expect(screen.queryByText('Sistemas')).not.toBeInTheDocument();
  });
});

describe('GestionHorariosPublicacionPage', () => {
  const plan = { paralelo: { id: 1, paraleloGestionId: 7, paraleloGestionEstado: 'OFERTADO', nombre: 'Paralelo A', carreraNombre: 'Sistemas', turno: 'NOCHE' }, schedule: [] };
  const estado = (extra = {}) => ({
    filters: {}, options: {}, onFilterChange: vi.fn(), clearFilters: vi.fn(), planes: [plan], loading: false, error: null,
    breadcrumbItems: [{ title: 'Institucional' }], handleVolver: vi.fn(), gestionVigente: { id: 3, nombre: 'Gestión 2026' },
    resumenPublicacion: { ofertado: 2, publicado: 1 }, publicandoPgId: null, publicarParaleloLoading: false,
    publicarTodosLoading: false, publicarTodosResultado: null, handlePublicarParalelo: vi.fn(), handlePublicarTodos: vi.fn(), ...extra,
  });

  it('resume la gestión vigente y publica todos los OFERTADO con permiso', async () => {
    const s = estado();
    mocks.publicacion.mockReturnValue(s);
    renderWithProviders(<GestionHorariosPublicacionPage />, { auth: authTodo });
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText(/2 en OFERTADO · 1\s+publicados/)).toBeInTheDocument();
    expect(screen.getByText('Paralelo A')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Publicar todos/ }));
    expect(s.handlePublicarTodos).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('sin OFERTADO o sin gestión vigente la publicación masiva se deshabilita', () => {
    mocks.publicacion.mockReturnValue(estado({ resumenPublicacion: { ofertado: 0, publicado: 3 } }));
    renderWithProviders(<GestionHorariosPublicacionPage />, { auth: authTodo });
    expect(screen.getByRole('button', { name: /Publicar todos/ })).toBeDisabled();
  });

  it('sin permiso EDITAR no hay publicación masiva', () => {
    mocks.publicacion.mockReturnValue(estado());
    renderWithProviders(<GestionHorariosPublicacionPage />);
    expect(screen.queryByRole('button', { name: /Publicar todos/ })).not.toBeInTheDocument();
  });

  it('muestra el resultado de la publicación masiva', () => {
    mocks.publicacion.mockReturnValue(estado({ publicarTodosResultado: { resumen: { publicados: 3 } } }));
    renderWithProviders(<GestionHorariosPublicacionPage />, { auth: authTodo });
    expect(screen.getByText('Resultado publicación masiva')).toBeInTheDocument();
    expect(screen.getByText(/Publicados: 3\. Omitidos: 0\./)).toBeInTheDocument();
  });

  it('vacío, error y carga', () => {
    mocks.publicacion.mockReturnValue(estado({ planes: [], gestionVigente: null }));
    const { unmount } = renderWithProviders(<GestionHorariosPublicacionPage />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    unmount();
    mocks.publicacion.mockReturnValue(estado({ planes: [], error: 'Falla de red' }));
    const otra = renderWithProviders(<GestionHorariosPublicacionPage />);
    expect(screen.getByText('Falla de red')).toBeInTheDocument();
    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
    otra.unmount();
    mocks.publicacion.mockReturnValue(estado({ planes: [], loading: true }));
    const cargando = renderWithProviders(<GestionHorariosPublicacionPage />);
    expect(cargando.container.querySelector('.ant-spin-spinning')).not.toBeNull();
    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
  });

  it('un paralelo sin paralelo en gestión se renderiza igualmente', () => {
    mocks.publicacion.mockReturnValue(estado({ planes: [{ paralelo: { nombre: 'Suelto' }, schedule: [] }] }));
    renderWithProviders(<GestionHorariosPublicacionPage />);
    expect(screen.getByText('Suelto')).toBeInTheDocument();
  });
});

describe('GestionHorariosArmadoPage', () => {
  const schedules = [
    { cursoId: 10, cursoCodigo: 'MAT-1', materiaSigla: 'MAT-1', materiaNombre: 'Matemática', docente: 'Luna', docenteId: 5, horasSemanalesPlan: 1, bloques: [{ cursoHorarioId: 100, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00' }] },
  ];
  const estado = (extra = {}) => ({
    tab: 'cobertura', setTab: vi.fn(), turnoEfectivo: 'NOCHE', breadcrumbItems: [{ title: 'Institucional' }], pageTitle: 'Armado de horario',
    loading: false, error: null, persistLoading: false, paraleloGestionDetalle: { paralelo: { nombre: 'A' } }, draftSchedules: schedules,
    setDraftSchedules: vi.fn(), onRequestPersist: vi.fn(), handleVolver: vi.fn(), paraleloGestionId: 7, validatePlacement: vi.fn(),
    hasParaleloSelected: true, horarioEditable: true, planSemanalEditable: true, planSemanalDirty: true, coberturaReajustable: true,
    coberturaGrilla: [], reajustarCoberturaParalelo: vi.fn(), puedePublicarDesdeArmado: false, publicandoParalelo: false, publicarParalelo: vi.fn(), ...extra,
  });

  it('abre en la pestaña de cobertura con las tres vistas disponibles', () => {
    mocks.armado.mockReturnValue(estado());
    renderWithProviders(<GestionHorariosArmadoPage />, { auth: authTodo });
    expect(screen.getByRole('heading', { name: 'Armado de horario' })).toBeInTheDocument();
    ['Cobertura', 'Plan semanal', 'Vista previa'].forEach((t) => expect(screen.getByRole('tab', { name: t })).toBeInTheDocument());
    expect(screen.getByText('Cobertura de la semana')).toBeInTheDocument();
  });

  it('cambiar de pestaña delega en setTab', async () => {
    const s = estado();
    mocks.armado.mockReturnValue(s);
    renderWithProviders(<GestionHorariosArmadoPage />, { auth: authTodo });
    await userEvent.click(screen.getByRole('tab', { name: 'Plan semanal' }));
    expect(s.setTab).toHaveBeenCalledWith('plan');
  });

  it('plan semanal: guarda con permiso y alterna pantalla completa', async () => {
    const s = estado({ tab: 'plan' });
    mocks.armado.mockReturnValue(s);
    renderWithProviders(<GestionHorariosArmadoPage />, { auth: authTodo });
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(s.onRequestPersist).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Expandir plan semanal a pantalla completa' }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.click(screen.getByRole('button', { name: 'Salir de pantalla completa del plan' }));
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('vista previa: solo lectura con resumen del plan', () => {
    mocks.armado.mockReturnValue(estado({ tab: 'vista' }));
    renderWithProviders(<GestionHorariosArmadoPage />, { auth: authTodo });
    expect(screen.getByText('Resumen del plan')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it('publicar paralelo solo aparece cuando corresponde y con permiso', async () => {
    const s = estado({ puedePublicarDesdeArmado: true });
    mocks.armado.mockReturnValue(s);
    const { unmount } = renderWithProviders(<GestionHorariosArmadoPage />, { auth: authTodo });
    await userEvent.click(screen.getByRole('button', { name: /Publicar paralelo/ }));
    expect(s.publicarParalelo).toHaveBeenCalled();
    unmount();
    renderWithProviders(<GestionHorariosArmadoPage />);
    expect(screen.queryByRole('button', { name: /Publicar paralelo/ })).not.toBeInTheDocument();
  });

  it('sin paralelo seleccionado explica cómo llegar y permite volver', async () => {
    const s = estado({ hasParaleloSelected: false });
    mocks.armado.mockReturnValue(s);
    renderWithProviders(<GestionHorariosArmadoPage />);
    expect(screen.getByText('Paralelo no indicado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Volver al tablero' }));
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('error de carga y estado de carga', () => {
    mocks.armado.mockReturnValue(estado({ error: 'Falla del servidor' }));
    const { unmount } = renderWithProviders(<GestionHorariosArmadoPage />);
    expect(screen.getByText('No se pudo cargar el plan')).toBeInTheDocument();
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    unmount();
    mocks.armado.mockReturnValue(estado({ loading: true }));
    const { container } = renderWithProviders(<GestionHorariosArmadoPage />);
    expect(container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });
});

describe('GestionHorariosConflictosPage', () => {
  const bloque = (id, dia = 'LUNES') => ({ cursoHorarioId: id, dia, horaInicio: '19:00:00', horaFin: '19:45:00', turno: 'NOCHE', paralelo: 'A' });
  const curso = (id, bloques) => ({ cursoId: id, cursoCodigo: `C-${id}`, materiaSigla: `C-${id}`, materiaNombre: `Materia ${id}`, docente: 'Luna', bloques });
  const estado = (extra = {}) => ({
    docenteId: 5, docentesConConflictos: [{ docenteId: 5, docenteNombre: 'Luna Pérez' }], gestionVigente: { nombre: 'Gestión 2026' }, loading: false, error: null,
    grilla: { paresConflicto: [], solapeParaleloHorarioKeys: [] }, docenteDraftSchedules: [curso(1, [bloque(100)])], conflictHorarioIds: new Set([100]),
    horarioSlotIndex: new Map(), paraleloStates: {}, setParaleloDraftSchedules: vi.fn(), persistLoading: false, onRequestPersist: vi.fn(), validatePlacement: vi.fn(),
    handleVolver: vi.fn(), breadcrumbItems: [{ title: 'Institucional' }], pageTitle: 'Conflictos de horario', vistaActivaKey: 'docente',
    vistaOpciones: [{ key: 'docente', label: 'Docente' }], setVistaModo: vi.fn(), turnoEfectivo: 'NOCHE', conflictoResuelto: false, ...extra,
  });

  it('sin docente indica cómo llegar a la pantalla', () => {
    conflictosMock.mockReturnValue(estado({ docenteId: null }));
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText(/Abra esta pantalla desde el panel lateral/)).toBeInTheDocument();
    expect(screen.queryByText('Resolver conflictos de horario')).not.toBeInTheDocument();
  });

  it('solo vista de docente: explica el choque y vuelve', async () => {
    const s = estado();
    conflictosMock.mockReturnValue(s);
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText('Resolver conflictos de horario')).toBeInTheDocument();
    expect(screen.getByText(/Docente con conflicto operativo: Luna Pérez · Gestión: Gestión 2026/)).toBeInTheDocument();
    expect(screen.getByText('Esta vista del docente es de solo lectura')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('conflicto resuelto: confirma y cambia el título', () => {
    conflictosMock.mockReturnValue(estado({ conflictoResuelto: true }));
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText('El docente ya no tiene choques de horario en esta gestión')).toBeInTheDocument();
    expect(screen.getByText('Conflicto resuelto')).toBeInTheDocument();
    expect(screen.queryByText('Esta vista del docente es de solo lectura')).not.toBeInTheDocument();
  });

  it('nombre del docente se resuelve desde la grilla o por id', () => {
    conflictosMock.mockReturnValue(estado({ grilla: { docenteNombre: 'Sol Rojas', paresConflicto: [] } }));
    const { unmount } = renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText(/Sol Rojas/)).toBeInTheDocument();
    unmount();
    conflictosMock.mockReturnValue(estado({ docentesConConflictos: [], gestionVigente: null }));
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText(/Docente con conflicto operativo: Docente #5/)).toBeInTheDocument();
  });

  it('con pestañas de paralelo: cambia de vista, edita y guarda el paralelo activo', async () => {
    const s = estado({
      vistaActivaKey: '71',
      vistaOpciones: [{ key: 'docente', label: 'Docente' }, { key: '71', label: 'Paralelo A' }, { key: '72', label: 'Paralelo B' }],
      paraleloStates: {
        71: { draftSchedules: [curso(2, [bloque(200)])], serverSchedules: [], horarioSlotIndex: new Map(), turno: 'NOCHE', paraleloGestionEstado: 'OFERTADO', loading: false, error: null },
        72: { draftSchedules: [], loading: true },
      },
    });
    conflictosMock.mockReturnValue(s);
    renderWithProviders(<GestionHorariosConflictosPage />, { auth: authTodo });
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    await userEvent.click(screen.getByRole('tab', { name: /Docente/ }));
    expect(s.setVistaModo).toHaveBeenCalledWith('docente');
    await userEvent.click(screen.getByRole('tab', { name: /Paralelo B/ }));
    expect(s.setVistaModo).toHaveBeenCalledWith(72);
  });

  it('pestaña de paralelo con error muestra la alerta', async () => {
    conflictosMock.mockReturnValue(estado({
      vistaActivaKey: '71',
      vistaOpciones: [{ key: 'docente', label: 'Docente' }, { key: '71', label: 'Paralelo A' }],
      paraleloStates: { 71: { draftSchedules: [], error: 'No se pudo cargar el paralelo', loading: false } },
    }));
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(await screen.findByText('No se pudo cargar el paralelo')).toBeInTheDocument();
  });

  it('error general y carga', () => {
    conflictosMock.mockReturnValue(estado({ error: 'Falla del servidor', loading: true }));
    const { container } = renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    expect(container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });

  it('muestra las líneas de conflicto del docente cuando hay pares', () => {
    conflictosMock.mockReturnValue(estado({
      grilla: { paresConflicto: [{ horarioId: 100, tipo: 'docente', a: { cursoHorarioId: 100 }, b: { cursoHorarioId: 200 } }], solapeParaleloHorarioKeys: [] },
    }));
    renderWithProviders(<GestionHorariosConflictosPage />);
    expect(screen.getByText('Esta vista del docente es de solo lectura')).toBeInTheDocument();
  });
});

describe('redirecciones de armado', () => {
  const Ubicacion = () => {
    const l = useLocation();
    return <output data-testid="loc">{`${l.pathname}${l.search}`}</output>;
  };
  const montar = (route) =>
    renderWithProviders(
      <Routes>
        <Route path="/institucional/horarios/plantilla" element={<ArmadoGestionRedirectFromPlantillaPath />} />
        <Route path="/institucional/horarios/paralelo/:paraleloId/gestion" element={<ArmadoGestionRedirectFromParaleloPath />} />
        <Route path="*" element={<Ubicacion />} />
      </Routes>,
      { route },
    );

  beforeEach(() => {});

  it('plantilla con ?pg= normaliza al armado en la pestaña plan', () => {
    montar('/institucional/horarios/plantilla?pg=7');
    const destino = screen.getByTestId('loc').textContent;
    expect(destino).toContain('/institucional/horarios/armado');
    expect(destino).toContain('pg=7');
    expect(destino).toContain('tab=plan');
  });

  it('plantilla sin pg conserva el query y fuerza la pestaña plan; quita "paralelo"', () => {
    montar('/institucional/horarios/plantilla?paralelo=3&tab=gestion');
    const destino = screen.getByTestId('loc').textContent;
    expect(destino).toContain('/institucional/horarios/armado');
    expect(destino).toContain('tab=plan');
    expect(destino).not.toContain('paralelo=');
  });

  it('paralelo/:id/gestion con ?pg= va al detalle de la oferta', () => {
    montar('/institucional/horarios/paralelo/4/gestion?pg=7');
    expect(screen.getByTestId('loc').textContent).toContain('/institucional/oferta');
  });

  it('paralelo/:id/gestion sin pg va al armado con el paralelo', () => {
    montar('/institucional/horarios/paralelo/4/gestion');
    const destino = screen.getByTestId('loc').textContent;
    expect(destino).toContain('/institucional/horarios/armado');
    expect(destino).toContain('paralelo=4');
    expect(destino).not.toContain('pg=');
  });
});
