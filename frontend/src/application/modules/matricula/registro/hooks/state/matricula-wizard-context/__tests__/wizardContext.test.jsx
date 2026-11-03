import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  downloadFile: vi.fn(),
  ctxHook: vi.fn(),
  contexto: { contexto: null, loading: false, error: null, getMatriculaContexto: vi.fn() },
  enrichArgs: null,
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@application/utils/fileDownload', () => ({ downloadFile: R.downloadFile }));
vi.mock('@navigation-services/routeMapper', () => ({ MENU_SIDEBAR_KEY_MAT_APORTES: 'aportes' }));
vi.mock('../../../context/useInscripcionesNuevaContext', () => ({ useInscripcionesNuevaContext: () => R.ctxHook() }));
vi.mock('../../../api/useGetMatriculaContexto', () => ({ useGetMatriculaContexto: () => R.contexto }));
vi.mock('@application-utils/hooks', () => ({
  useEnrichWizardSteps: (...args) => {
    R.enrichArgs = args;
    return 'enriquecidos';
  },
}));
vi.mock('@matricula/registro/config', () => ({ createInscripcionNuevaWizardSteps: (meta) => [{ meta }] }));
vi.mock('../../../features/enrichers/wizardEnrichers', () => ({ matriculaWizardEnrichers: ['E'] }));

import { step0EnrichmentStrategy } from '../step0EnrichmentStrategy';
import { useMatriculaWizardPageNavigation } from '../../matricula-wizard-page/useMatriculaWizardPageNavigation';
import { useMatriculaWizardPageContext } from '../../matricula-wizard-page/useMatriculaWizardPageContext';
import { useMatriculaWizardContexto } from '../useMatriculaWizardContexto';
import { useMatriculaWizardMateriasSelection } from '../useMatriculaWizardMateriasSelection';
import { useMatriculaWizardEnrichment } from '../useMatriculaWizardEnrichment';
import { useMatriculaWizardFormInstance } from '../../../features/matricula-wizard-form/useMatriculaWizardFormInstance';

beforeEach(() => {
  vi.clearAllMocks();
  R.contexto = { contexto: null, loading: false, error: null, getMatriculaContexto: vi.fn() };
});

describe('step0EnrichmentStrategy', () => {
  const step = { config: { buscarEstudiante: { fields: [{ type: 'input' }, { type: 'list', name: 'l' }] } } };

  it('solo actúa en el paso 0 con estudiante preseleccionado', () => {
    expect(step0EnrichmentStrategy(step, 1, [], { hasPreselectedStudent: true })).toBeNull();
    expect(step0EnrichmentStrategy(step, 0, [], {})).toBeNull();
    expect(step0EnrichmentStrategy(step, 0, [], undefined)).toBeNull();
  });

  it('muestra el estudiante elegido en modo alta y modo edición', () => {
    const alta = step0EnrichmentStrategy(step, 0, [], { hasPreselectedStudent: true, studentSearch: { selectedStudent: { id: 1 } } });
    expect(alta.title).toBe('Estudiante a inscribir');
    const campo = alta.config.buscarEstudiante.fields[0];
    expect(campo).toMatchObject({ items: [{ id: 1 }], loading: false, onSelect: null, selectedItem: { id: 1 } });
    const edicion = step0EnrichmentStrategy(step, 0, [], { hasPreselectedStudent: true, isEditMode: true, studentSearch: {} });
    expect(edicion.title).toBe('Estudiante de la inscripción');
    expect(edicion.config.buscarEstudiante.fields[0]).toMatchObject({ items: [], loading: true });
    const conError = step0EnrichmentStrategy(step, 0, [], { hasPreselectedStudent: true, studentSearch: { error: 'x' } });
    expect(conError.config.buscarEstudiante.fields[0].loading).toBe(false);
    expect(step0EnrichmentStrategy({}, 0, [], { hasPreselectedStudent: true }).config.buscarEstudiante.fields).toEqual([]);
  });
});

describe('useMatriculaWizardPageNavigation', () => {
  afterEach(() => vi.useRealTimers());
  const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

  it('descarga el formulario de inscripción tras 3 segundos y tolera fallos', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const resultado = { success: true, data: { formularioInscripcion: { filePath: '/f.pdf', fileName: 'f.pdf' } } };
    renderHook(() => useMatriculaWizardPageNavigation({ inscripcionResult: resultado }), { wrapper });
    expect(R.downloadFile).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(R.downloadFile).toHaveBeenCalledWith('/f.pdf', 'f.pdf');
    R.downloadFile.mockImplementationOnce(() => {
      throw new Error('x');
    });
    renderHook(() => useMatriculaWizardPageNavigation({ inscripcionResult: { ...resultado } }), { wrapper });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(console.error).toHaveBeenCalled();
    renderHook(() => useMatriculaWizardPageNavigation({ inscripcionResult: { success: true, data: { formularioInscripcion: {} } } }), { wrapper });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(R.downloadFile).toHaveBeenCalledTimes(2);
  });

  it('ir a registrar pago y volver', () => {
    const clear = vi.fn();
    const { result } = renderHook(
      () => useMatriculaWizardPageNavigation({ paymentRequiredStudentId: 5, clearPaymentRequiredDialog: clear, studentIdFromState: 8 }),
      { wrapper },
    );
    act(() => result.current.handleGoToRegistrarPago());
    expect(clear).toHaveBeenCalled();
    expect(R.navigate).toHaveBeenCalledWith('/pagos/registrar', { state: { studentId: 5, menuSidebarKey: 'aportes' } });
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/8');
    const sin = renderHook(() => useMatriculaWizardPageNavigation({ clearPaymentRequiredDialog: clear }), { wrapper });
    act(() => sin.result.current.handleGoToRegistrarPago());
    expect(R.navigate).toHaveBeenCalledTimes(2);
    act(() => sin.result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/matricula/listar');
  });
});

describe('useMatriculaWizardPageContext', () => {
  const render = (state, ctx) => {
    R.ctxHook.mockReturnValue(ctx);
    return renderHook(() => useMatriculaWizardPageContext(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={[{ pathname: '/', state }]}>{children}</MemoryRouter>,
    }).result.current;
  };

  it('toma los datos de edición del contexto o del state de la ruta', () => {
    expect(render({ mode: 'editar', tipoAdmision: 'NUEVO', studentId: 2 }, {}).editData).toMatchObject({ tipoAdmision: 'NUEVO' });
    expect(render({ mode: 'otro' }, {}).editData).toBeNull();
    expect(render({}, { editData: { id: 1 } }).editData).toEqual({ id: 1 });
  });

  it('deriva el tipo de admisión', () => {
    const a = render({ studentId: 3 }, { studentSearch: { selectedStudent: { tipoAdmision: 'nuevo' } } });
    expect(a).toMatchObject({ isNuevoEstudiante: true, isTraspasoOrTransitabilidad: false, studentIdFromState: 3 });
    expect(render({}, { editData: { tipoAdmision: 'TRASPASO' } }).isTraspasoOrTransitabilidad).toBe(true);
    expect(render(undefined, {})).toMatchObject({ isNuevoEstudiante: false, studentIdFromState: null });
  });
});

describe('useMatriculaWizardContexto', () => {
  it('no consulta sin estudiante y carrera; consulta al tenerlos', () => {
    renderHook(() => useMatriculaWizardContexto());
    expect(R.contexto.getMatriculaContexto).not.toHaveBeenCalled();
    const { result } = renderHook(() =>
      useMatriculaWizardContexto({ selectedStudent: { id: 1, careerId: 2 }, editData: { inscripcionId: 9 } }),
    );
    expect(R.contexto.getMatriculaContexto).toHaveBeenCalledWith({ estudianteId: 1, carreraId: 2, planEstudioId: undefined, excluirInscripcionId: 9 });
    act(() => result.current.refetchContexto());
    expect(R.contexto.getMatriculaContexto).toHaveBeenCalledTimes(2);
    renderHook(() => useMatriculaWizardContexto({ selectedStudent: { id: 1 } })).result.current.refetchContexto();
  });

  it('elegir un plan relanza la consulta y cambiar de estudiante lo reinicia', () => {
    const { result, rerender } = renderHook((p) => useMatriculaWizardContexto(p), { initialProps: { selectedStudent: { id: 1 }, selectedCarreraId: 4 } });
    act(() => result.current.onSelectPlan('7'));
    expect(result.current.planSeleccionadoId).toBe(7);
    expect(R.contexto.getMatriculaContexto).toHaveBeenLastCalledWith(expect.objectContaining({ planEstudioId: 7 }));
    rerender({ selectedStudent: { id: 2 }, selectedCarreraId: 4 });
    expect(result.current.planSeleccionadoId).toBeNull();
    act(() => result.current.onSelectPlan(null));
    expect(result.current.planSeleccionadoId).toBeNull();
  });

  it('deriva si es nuevo en el sistema y cuándo mostrar el selector de plan', () => {
    const r = (selectedStudent, ctx = null) => {
      R.contexto.contexto = ctx;
      return renderHook(() => useMatriculaWizardContexto({ selectedStudent })).result.current;
    };
    expect(r({ esNuevoSistema: true }).esNuevoSistema).toBe(true);
    expect(r({ totalInscripciones: 0 }).esNuevoSistema).toBe(true);
    expect(r({ totalInscripciones: 3 })).toMatchObject({ esNuevoSistema: false, tieneHistorialSistema: true });
    expect(r(null).esNuevoSistema).toBeNull();
    const ctx = { estudiante: { esNuevoSistema: 1, tipoAdmision: 'ANTIGUO' }, plan: { id: 5 }, planes: [{ id: 5 }, { id: 6 }] };
    expect(r({}, ctx)).toMatchObject({ mostrarSelectorPlan: true, planFijoMotivo: null, planEstudioId: 5 });
    expect(r({}, { ...ctx, estudiante: { esNuevoSistema: 1, tipoAdmision: 'NUEVO' } })).toMatchObject({ mostrarSelectorPlan: false, planFijoMotivo: 'ADMISION_NUEVA' });
    expect(r({}, { ...ctx, planes: [{ id: 5 }] })).toMatchObject({ planFijoMotivo: 'PLAN_UNICO' });
  });
});

describe('useMatriculaWizardMateriasSelection', () => {
  const contexto = {
    estudiante: { id: 1, tipoAdmision: 'NUEVO', esNuevoSistema: true },
    plan: { id: 2 },
    periodos: [{ id: 10, numero: 1, asignaturas: [{ materiaId: 1, sigla: 'A' }, { materiaId: 2, sigla: 'B' }] }, { id: 20, numero: 2, asignaturas: [{ materiaId: 3, sigla: 'C' }] }],
  };

  it('siembra la selección inicial del contexto y la poda al marcar', () => {
    const { result } = renderHook(() => useMatriculaWizardMateriasSelection({ contexto, tipoAdmision: 'NUEVO', esNuevoSistema: true }));
    expect(result.current.selectedMateriaIdsByPeriod).toEqual({ 10: [1, 2] });
    act(() => result.current.handleToggleMaterias(20, [3]));
    expect(result.current.selectedMateriaIdsByPeriod).toEqual({ 10: [1, 2] });
    act(() => result.current.handleToggleMaterias(10, null));
    expect(result.current.selectedMateriaIdsByPeriod[10]).toEqual([]);
  });

  it('en edición parte de lo guardado y no poda', () => {
    const editData = { materiaIdsByPeriod: { 10: ['1'], 20: [], 30: 'x' } };
    const { result } = renderHook(() => useMatriculaWizardMateriasSelection({ editData, contexto }));
    expect(result.current.selectedMateriaIdsByPeriod).toEqual({ 10: [1] });
    act(() => result.current.handleToggleMaterias(99, [5]));
    expect(result.current.selectedMateriaIdsByPeriod[99]).toEqual([5]);
    const vacio = renderHook(() => useMatriculaWizardMateriasSelection());
    act(() => vacio.result.current.handleToggleMaterias(1, [2]));
    expect(vacio.result.current.selectedMateriaIdsByPeriod).toEqual({ 1: [2] });
    const editVacio = { materiaIdsByPeriod: { 1: [] } };
    const sinDatos = renderHook(() => useMatriculaWizardMateriasSelection({ editData: editVacio }));
    expect(sinDatos.result.current.selectedMateriaIdsByPeriod).toEqual({});
  });
});

describe('useMatriculaWizardEnrichment', () => {
  const datos = () => ({
    studentSearch: { students: [], searchStudent: vi.fn(), onSelectStudent: vi.fn() },
    carrerasData: { carreras: [{ id: 1 }], onSelectCarrera: vi.fn() },
    periodosData: { periodos: [], selectedPeriodIds: undefined },
    paralelosData: { paralelos: [], onSelectParalelo: vi.fn() },
  });

  it('arma el contexto de enriquecimiento y delega las selecciones', () => {
    const d = datos();
    const { result } = renderHook(() => useMatriculaWizardEnrichment({ ...d, tipoAdmision: 'ANTIGUO', esNuevoSistema: true, carreraIdForParalelos: 3, hasPreselectedStudent: true }));
    expect(result.current.enrichedWizardSteps).toBe('enriquecidos');
    expect(result.current.wizardStepMeta.order).toContain('historial');
    const [steps, enrichers, ctx, strategy] = R.enrichArgs;
    expect(steps[0].meta).toBe(result.current.wizardStepMeta);
    expect(enrichers).toEqual(['E']);
    expect(strategy).toBeTypeOf('function');
    expect(ctx).toMatchObject({ carreraIdForParalelos: 3, hasPreselectedStudent: true, periodosData: { selectedPeriodIds: [] } });
    ctx.onSearchStudent('x');
    ctx.onSearchStudent();
    expect(d.studentSearch.searchStudent).toHaveBeenCalledWith('x');
    expect(d.studentSearch.searchStudent).toHaveBeenLastCalledWith('');
    ctx.onSelectStudent({ id: 1 });
    ctx.onSelectStudent(null);
    expect(d.studentSearch.onSelectStudent).toHaveBeenCalledTimes(1);
    result.current.handleSelectCarrera(1);
    result.current.handleSelectCarrera(99);
    expect(d.carrerasData.onSelectCarrera).toHaveBeenCalledWith({ id: 1 });
    expect(d.carrerasData.onSelectCarrera).toHaveBeenCalledTimes(1);
    result.current.handleSelectParalelo({ id: 5 });
    result.current.handleSelectParalelo(null);
    expect(d.paralelosData.onSelectParalelo).toHaveBeenCalledTimes(1);
  });

  it('tolera datos sin manejadores', () => {
    const { result } = renderHook(() =>
      useMatriculaWizardEnrichment({ studentSearch: {}, carrerasData: {}, periodosData: {}, paralelosData: {} }),
    );
    expect(() => {
      R.enrichArgs[2].onSearchStudent('a');
      R.enrichArgs[2].onSelectStudent({ id: 1 });
      result.current.handleSelectCarrera(1);
      result.current.handleSelectParalelo({ id: 1 });
    }).not.toThrow();
  });
});

describe('useMatriculaWizardFormInstance', () => {
  it('refleja estudiante, paralelo y periodo en el formulario', () => {
    const { result } = renderHook(() =>
      useMatriculaWizardFormInstance({ selectedStudent: { id: 1 }, selectedParalelo: { id: 2 }, selectedPeriod: { id: 3 } }),
    );
    expect(result.current.getFormValues()).toMatchObject({ student_id: 1, parallel_id: 2, periodo_id: 3, periodo: 3 });
    const vacio = renderHook(() => useMatriculaWizardFormInstance({}));
    expect(vacio.result.current.getFormValues()).toEqual({});
  });
});
