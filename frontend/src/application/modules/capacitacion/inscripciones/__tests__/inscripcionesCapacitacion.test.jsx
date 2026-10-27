import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  ins: {
    crear: vi.fn(), obtenerPorId: vi.fn(), obtenerTodos: vi.fn(), actualizarRequisitos: vi.fn(), adjuntarComprobante: vi.fn(),
    eliminar: vi.fn(), anular: vi.fn(),
  },
  part: { obtenerTodos: vi.fn() },
  curso: { obtenerTodos: vi.fn() },
  downloadBlob: vi.fn(),
  app: null,
  ctxList: {},
  ctxDetail: {},
  tableArgs: null,
  req: { current: null },
  list: { ret: null, config: null },
  mut: {},
  api: { inscripcion: null, loading: false, error: null, cargar: vi.fn() },
  cursoApi: { curso: null, loading: false, error: null, cargar: vi.fn() },
  catalogos: { metodosPago: [{ id: 1, codigo: 'EFECTIVO' }], cuentasPago: [], loading: false, error: null },
  real: {},
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@implementations/InscripcionCapacitacionRepository', () => ({ default: R.ins }));
vi.mock('@implementations/ParticipanteCapacitacionRepository', () => ({ default: R.part }));
vi.mock('@implementations/CursoCapacitacionRepository', () => ({ default: R.curso }));
vi.mock('@application/utils', async (orig) => ({
  ...(await orig()),
  downloadBlob: R.downloadBlob,
  useServerPaginatedList: (config) => ((R.list.config = config), R.list.ret),
}));
vi.mock('@application-capacitacion/inscripciones/hooks/context/useInscripcionesCapacitacionListContext', () => ({ useInscripcionesCapacitacionListContext: () => R.ctxList }));
vi.mock('@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext', () => ({ useInscripcionCapacitacionDetailContext: () => R.ctxDetail }));
vi.mock('@application-capacitacion/inscripciones/hooks/state/useInscripcionRequisitosRapido', () => ({ useInscripcionRequisitosRapido: (a) => ((R.req.current = a), { abierto: !!a.inscripcionId }) }));
vi.mock('@capacitacion/inscripciones/config/inscripcionesTableColumns', () => ({ createInscripcionesCapTableColumns: (a) => ((R.tableArgs = a), ['cols']) }));
vi.mock('@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations', async (orig) => {
  const real = await orig();
  return { useInscripcionCapacitacionMutations: (...a) => (R.real.mut ? real.useInscripcionCapacitacionMutations(...a) : R.mut) };
});
vi.mock('@application-capacitacion/inscripciones/hooks/api/useGetInscripcionCapacitacion', async (orig) => {
  const real = await orig();
  return { useGetInscripcionCapacitacion: (...a) => (R.real.get ? real.useGetInscripcionCapacitacion(...a) : R.api) };
});
vi.mock('@application-capacitacion/inscripciones/hooks/api/useBuscarParticipantes', async (orig) => {
  const real = await orig();
  return { useBuscarParticipantes: (...a) => (R.real.buscar ? real.useBuscarParticipantes(...a) : { participantes: [1], loading: false, error: null, buscar: 'b', limpiar: 'l' }) };
});
vi.mock('@application-capacitacion/inscripciones/hooks/api/useParticipantesSugeridosApi', async (orig) => {
  const real = await orig();
  return { useParticipantesSugeridosApi: (...a) => (R.real.sugeridos ? real.useParticipantesSugeridosApi(...a) : { sugeridos: [2], loadingSugeridos: false, errorSugeridos: null, cargarSugeridos: 's' }) };
});
vi.mock('@application-capacitacion/inscripciones/hooks/api/useCursosCapacitacionOptions', async (orig) => {
  const real = await orig();
  return { useCursosCapacitacionOptions: (...a) => (R.real.cursos ? real.useCursosCapacitacionOptions(...a) : { cursos: [3], loading: false, error: null }) };
});
vi.mock('@application-capacitacion/inscripciones/hooks/api/useInscripcionesCapacitacionApi', async (orig) => {
  const real = await orig();
  return { useInscripcionesCapacitacionApi: (...a) => (R.real.listApi ? real.useInscripcionesCapacitacionApi(...a) : { fetch: 'fetchIns' }) };
});
vi.mock('@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion', () => ({ useGetCursoCapacitacion: () => R.cursoApi }));
vi.mock('@application-finanzas/hooks/api/usePaymentCatalogsApi', () => ({ usePaymentCatalogsApi: () => R.catalogos }));

import { useInscripcionesCapacitacionListPage } from '../hooks/state/useInscripcionesCapacitacionListPage';
import { useInscripcionCapRegistrarPagoPage } from '../hooks/state/useInscripcionCapRegistrarPagoPage';
import { useBuscarParticipantes } from '../hooks/api/useBuscarParticipantes';
import { useCursosCapacitacionOptions } from '../hooks/api/useCursosCapacitacionOptions';
import { useGetInscripcionCapacitacion } from '../hooks/api/useGetInscripcionCapacitacion';
import { useInscripcionesCapacitacionApi } from '../hooks/api/useInscripcionesCapacitacionApi';
import { useParticipantesSugeridosApi } from '../hooks/api/useParticipantesSugeridosApi';
import { useInscripcionCapacitacionMutations } from '../hooks/api/useInscripcionCapacitacionMutations';
import { InscribirParticipanteProvider } from '../providers/InscribirParticipanteProvider';
import { InscripcionCapacitacionDetailProvider } from '../providers/InscripcionCapacitacionDetailProvider';
import { InscripcionesCapacitacionListProvider } from '../providers/InscripcionesCapacitacionListProvider';
import { InscribirParticipanteContext } from '../context/InscribirParticipanteContext';
import { InscripcionCapacitacionDetailContext } from '../context/InscripcionCapacitacionDetailContext';
import { InscripcionesCapacitacionListContext } from '../context/InscripcionesCapacitacionListContext';

const conRuta = (state, pathname = '/capacitacion/inscripciones') => ({ children }) => (
  <MemoryRouter initialEntries={[{ pathname, state }]}>{children}</MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  R.real = {};
  R.app = {
    message: { success: vi.fn(), error: vi.fn(), loading: vi.fn(() => vi.fn()) },
    notification: { success: vi.fn(), error: vi.fn() },
  };
  R.ctxList = {
    inscripciones: [{ id: 1 }], searchText: 'q', setSearchText: vi.fn(), refetch: vi.fn(), tablePagination: {},
    eliminarInscripcion: vi.fn(), descargarFormularioPdf: vi.fn(),
  };
  R.api = { inscripcion: null, loading: false, error: null, cargar: vi.fn().mockResolvedValue({ success: true }) };
  R.cursoApi = { curso: null, loading: false, error: null, cargar: vi.fn() };
});
afterEach(() => vi.useRealTimers());

describe('useInscripcionesCapacitacionListPage', () => {
  it('expone el listado y navega para inscribir', () => {
    const { result } = renderHook(() => useInscripcionesCapacitacionListPage(), { wrapper: conRuta() });
    expect(result.current).toMatchObject({ inscripciones: [{ id: 1 }], searchText: 'q', tableColumns: ['cols'], requisitosRapido: { abierto: false } });
    act(() => result.current.handleInscribir());
    expect(R.navigate).toHaveBeenCalledWith(expect.any(String), { state: expect.objectContaining({ returnListPath: '/capacitacion/inscripciones' }) });
    act(() => result.current.handleSearchChange({ target: { value: 'z' } }));
    expect(R.ctxList.setSearchText).toHaveBeenCalledWith('z');
    expect(result.current.breadcrumbItems).toHaveLength(3);
    R.ctxList = {};
    expect(renderHook(() => useInscripcionesCapacitacionListPage(), { wrapper: conRuta() }).result.current).toMatchObject({ inscripciones: [], loading: false, error: null, searchText: '' });
  });

  it('eliminar, descargar formulario y requisitos rápidos', async () => {
    const { result } = renderHook(() => useInscripcionesCapacitacionListPage(), { wrapper: conRuta() });
    const { deleteFn, onDescargarFormulario, onGestionarRequisitos } = R.tableArgs;
    expect(await deleteFn(null)).toEqual({ success: false, error: 'Inscripción inválida' });
    R.ctxList.eliminarInscripcion.mockResolvedValueOnce({ success: true });
    expect(await deleteFn(2)).toEqual({ success: true });
    R.ctxList.eliminarInscripcion.mockResolvedValueOnce(undefined);
    expect((await deleteFn(2)).error).toBe('No se pudo eliminar la inscripción');

    R.ctxList.descargarFormularioPdf.mockResolvedValueOnce({ success: true });
    await act(async () => onDescargarFormulario(2));
    expect(R.app.message.error).not.toHaveBeenCalled();
    R.ctxList.descargarFormularioPdf.mockResolvedValueOnce({ success: false, error: 'Sin PDF' });
    await act(async () => onDescargarFormulario(2));
    expect(R.app.message.error).toHaveBeenLastCalledWith('Sin PDF');
    R.ctxList.descargarFormularioPdf.mockResolvedValueOnce(undefined);
    await act(async () => onDescargarFormulario(2));
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo descargar el formulario de inscripción');

    act(() => onGestionarRequisitos(9));
    expect(result.current.requisitosRapido).toEqual({ abierto: true });
    expect(R.req.current.onGuardado).toBe(R.ctxList.refetch);
    act(() => result.current.handleCerrarRequisitos());
    expect(result.current.requisitosRapido).toEqual({ abierto: false });
  });
});

describe('useInscripcionCapRegistrarPagoPage', () => {
  const detalle = (extra = {}) => ({
    inscripcionId: 6,
    inscripcion: { saldoMatricula: 50, saldoCurso: 200, pagoCursoExterno: false },
    loading: false, error: null, refetch: vi.fn(), registrarPago: vi.fn().mockResolvedValue({ success: true }), registrandoPago: false,
    metodosPago: [{ id: 1, codigo: 'EFECTIVO' }, { id: 2, codigo: 'TRANSFERENCIA' }], cuentasPago: [], loadingCatalogos: false, errorCatalogos: null,
    ...extra,
  });

  it('prepara conceptos, migas y concepto sugerido', () => {
    R.ctxDetail = detalle();
    const { result } = renderHook(() => useInscripcionCapRegistrarPagoPage(), { wrapper: conRuta({ returnListPath: '/l', menuSidebarKey: 'k' }) });
    expect(result.current).toMatchObject({ isInvalidInscripcionId: false, pageTitle: 'Registrar pago', cursoExterno: false });
    expect(result.current.conceptoOptions.length).toBeGreaterThan(0);
    expect(result.current.saldosPorConcepto).toBeTruthy();
    expect(result.current.form.getFieldValue('concepto')).toBeTruthy();
    expect(result.current.breadcrumbItems).toHaveLength(5);
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('6'), { state: { returnListPath: '/l', menuSidebarKey: 'k' } });
    act(() => result.current.handleMetodoPagoChange(2));
    expect(result.current.metodoPagoId).toBe(2);
    expect(result.current.reglasMetodo).toBeTruthy();
    R.ctxDetail = detalle({ inscripcionId: null, inscripcion: null });
    const sin = renderHook(() => useInscripcionCapRegistrarPagoPage(), { wrapper: conRuta() });
    expect(sin.result.current.isInvalidInscripcionId).toBe(true);
    act(() => sin.result.current.handleVolver());
  });

  it('registra el pago: valida el monto, notifica y vuelve al detalle', async () => {
    R.ctxDetail = detalle({ error: 'ficha' });
    const { result } = renderHook(() => useInscripcionCapRegistrarPagoPage(), { wrapper: conRuta() });
    expect(result.current.error).toBe('ficha');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('Revise los campos obligatorios');

    result.current.form.validateFields = vi.fn().mockResolvedValue({ concepto: 'CURSO', monto: 'x', metodoPagoId: 1 });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('Indique un monto válido para el pago');
    expect(R.app.notification.error).toHaveBeenCalled();

    result.current.form.validateFields = vi.fn().mockResolvedValue({ concepto: 'CURSO', monto: 80, metodoPagoId: 1, observaciones: ' ok ', comprobante: [{ originFileObj: 'F' }] });
    R.ctxDetail.registrarPago.mockResolvedValueOnce({ success: false, error: 'Excede' });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('Excede');
    await act(async () => result.current.handleSubmit());
    expect(R.ctxDetail.registrarPago).toHaveBeenLastCalledWith(expect.objectContaining({ monto: 80, observaciones: 'ok' }), 'F');
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Pago registrado' }));
    expect(R.ctxDetail.refetch).toHaveBeenCalled();
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('6'), expect.objectContaining({ replace: true }));
    R.ctxDetail.registrarPago.mockResolvedValueOnce(undefined);
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('No se pudo registrar el pago');
  });
});

describe('API de inscripciones de capacitación', () => {
  it('búsqueda con debounce: ignora consultas cortas y respuestas obsoletas', async () => {
    R.real.buscar = true;
    vi.useFakeTimers();
    R.part.obtenerTodos.mockResolvedValue({ success: true, data: [{ id: 1, nombres: 'Ana' }] });
    const { result } = renderHook(() => useBuscarParticipantes());
    act(() => result.current.buscar('a'));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(R.part.obtenerTodos).not.toHaveBeenCalled();
    act(() => result.current.buscar(' an '));
    act(() => result.current.buscar('ana'));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(R.part.obtenerTodos).toHaveBeenCalledTimes(1);
    expect(R.part.obtenerTodos).toHaveBeenCalledWith({ params: { search: 'ana', page: 1, limit: 20 } });
    expect(result.current.participantes).toHaveLength(1);
    R.part.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    act(() => result.current.buscar('zz'));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.error).toBe('Mal');
    expect(result.current.participantes).toEqual([]);
    R.part.obtenerTodos.mockResolvedValueOnce({ success: false });
    act(() => result.current.buscar('yy'));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.error).toBe('No se pudieron buscar los participantes');
    act(() => result.current.limpiar());
    expect(result.current.error).toBeNull();
    act(() => result.current.buscar(null));
    act(() => result.current.buscar('pendiente'));
  });

  it('cursos a los que se puede inscribir', async () => {
    R.real.cursos = true;
    R.curso.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, titulo: 'A', estado: 'ABIERTO' }, { id: 2, titulo: 'B', estado: 'CANCELADO' }, { id: 3, titulo: 'C', estado: 'EN_CURSO' }] });
    const { result } = renderHook(() => useCursosCapacitacionOptions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cursos.map((c) => c.id)).toEqual([1, 3]);
    R.curso.obtenerTodos.mockResolvedValueOnce({ success: false });
    const b = renderHook(() => useCursosCapacitacionOptions());
    await waitFor(() => expect(b.result.current.error).toBe('No se pudieron cargar los cursos disponibles'));
    const off = renderHook(() => useCursosCapacitacionOptions({ enabled: false }));
    expect(off.result.current.cursos).toEqual([]);
    R.curso.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Sin acceso' });
    const c = renderHook(() => useCursosCapacitacionOptions());
    await waitFor(() => expect(c.result.current.error).toBe('Sin acceso'));
  });

  it('una inscripción por id', async () => {
    R.real.get = true;
    const { result } = renderHook(() => useGetInscripcionCapacitacion());
    await act(async () => result.current.cargar(null));
    expect(result.current.error).toBe('ID de la inscripción es requerido');
    R.ins.obtenerPorId.mockResolvedValueOnce({ success: true, data: { inscripcionCapacitacion: { id: 2 } } });
    let r;
    await act(async () => {
      r = await result.current.cargar(2);
    });
    expect(r.success).toBe(true);
    expect(result.current.inscripcion).toMatchObject({ id: 2 });
    R.ins.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.cargar(2));
    expect(result.current.error).toBe('No se pudo cargar la inscripción');
    expect(result.current.inscripcion).toBeNull();
  });

  it('listado y sugeridos', async () => {
    R.real.listApi = true;
    R.real.sugeridos = true;
    const { result } = renderHook(() => useInscripcionesCapacitacionApi());
    R.ins.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1 }], pagination: { total: 1 } });
    expect(await result.current.fetch({ a: 1 })).toMatchObject({ success: true, pagination: { total: 1 } });
    R.ins.obtenerTodos.mockResolvedValueOnce({ success: true, data: [] });
    expect((await result.current.fetch()).pagination).toBeNull();
    R.ins.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await result.current.fetch()).error).toBe('Error al cargar las inscripciones');
    R.ins.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    expect((await result.current.fetch()).error).toBe('Mal');

    const s = renderHook(() => useParticipantesSugeridosApi());
    R.part.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, nombres: 'Ana' }] });
    await act(async () => s.result.current.cargarSugeridos());
    expect(R.part.obtenerTodos).toHaveBeenCalledWith({ params: { sinInscripcionActiva: true, limit: 10, page: 1 } });
    expect(s.result.current.sugeridos).toHaveLength(1);
    R.part.obtenerTodos.mockResolvedValueOnce({ success: false });
    await act(async () => s.result.current.cargarSugeridos());
    expect(s.result.current.errorSugeridos).toBe('No se pudieron cargar los participantes sugeridos');
    R.part.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    await act(async () => s.result.current.cargarSugeridos());
    expect(s.result.current.errorSugeridos).toBe('Mal');
  });

  it('mutaciones: inscribir, requisitos, comprobantes, PDFs y anulaciones', async () => {
    R.real.mut = true;
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    R.ins.crear.mockResolvedValue({ success: true });
    await act(async () => result.current.inscribir({ a: 1 }));
    expect(R.ins.crear).toHaveBeenCalledWith({ a: 1 });
    R.ins.actualizarRequisitos.mockResolvedValue({ success: true });
    await act(async () => result.current.actualizarRequisitos(1, [{ id: 1 }]));
    expect(R.ins.actualizarRequisitos).toHaveBeenCalledWith(1, [{ id: 1 }]);
    R.ins.adjuntarComprobante.mockResolvedValue({ success: true });
    await act(async () => result.current.adjuntarComprobante(1, 2, 'F'));
    expect(R.ins.adjuntarComprobante).toHaveBeenCalledWith(1, 2, 'F');
    R.ins.anular.mockResolvedValue({ success: true });
    await act(async () => result.current.anularInscripcion(1, { motivo: 'x' }));
    expect(R.ins.anular).toHaveBeenCalledWith(1, { motivo: 'x' });
    result.current.eliminarInscripcion(1);
    expect(R.ins.eliminar).toHaveBeenCalledWith(1);
    expect(result.current).toMatchObject({ inscribiendo: false, anulando: false, guardandoRequisitos: false, subiendoComprobante: false });
  });
});

describe('providers de inscripciones de capacitación', () => {
  const valor = (Provider, Context, props) =>
    renderHook(() => useContext(Context), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <Provider {...props}>{children}</Provider>
        </MemoryRouter>
      ),
    }).result;

  it('inscribir participante junta búsqueda, sugeridos, cursos y catálogos', () => {
    R.mut = { inscribir: vi.fn(), inscribiendo: true };
    const r = valor(InscribirParticipanteProvider, InscribirParticipanteContext, {});
    expect(r.current).toMatchObject({
      participantes: [1], buscarParticipantes: 'b', limpiarBusqueda: 'l', sugeridos: [2], cargarSugeridos: 's', cursos: [3],
      inscribiendo: true, metodosPago: R.catalogos.metodosPago,
    });
  });

  it('listado: arma la petición paginada', () => {
    R.mut = { eliminarInscripcion: vi.fn(), descargarFormularioPdf: vi.fn() };
    R.list.ret = { rows: [{ id: 1 }], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn() };
    const r = valor(InscripcionesCapacitacionListProvider, InscripcionesCapacitacionListContext, {});
    expect(r.current.inscripciones).toEqual([{ id: 1 }]);
    expect(R.list.config.buildRequest({ page: 1, limit: 10, search: '' })).toEqual({ params: { page: 1, limit: 10, search: undefined } });
  });

  it('detalle: cada acción exige id válido y recarga tras guardar', async () => {
    R.mut = {
      registrarPago: vi.fn().mockResolvedValue({ success: true }),
      actualizarInscripcion: vi.fn().mockResolvedValue({ success: true }),
      actualizarPago: vi.fn().mockResolvedValue({ success: true }),
      anularPago: vi.fn().mockResolvedValue({ success: true }),
      anularInscripcion: vi.fn().mockResolvedValue({ success: true }),
      actualizarRequisitos: vi.fn().mockResolvedValue({ success: true }),
      adjuntarComprobante: vi.fn().mockResolvedValue({ success: true }),
      descargarComprobante: vi.fn().mockResolvedValue({ success: true }),
      descargarFormularioPdf: vi.fn().mockResolvedValue({ success: true }),
      descargarReciboPdf: vi.fn().mockResolvedValue({ success: true }),
    };
    const ok = valor(InscripcionCapacitacionDetailProvider, InscripcionCapacitacionDetailContext, { inscripcionId: '6' });
    const c = ok.current;
    expect(R.api.cargar).toHaveBeenCalledWith(6);
    expect(c.inscripcionId).toBe(6);
    await act(async () => c.refetch());
    await act(async () => c.registrarPago({ a: 1 }, 'F'));
    expect(R.mut.registrarPago).toHaveBeenCalledWith(6, { a: 1 }, 'F');
    R.api.cargar.mockClear();
    await act(async () => c.guardarRequisitos([1]));
    await act(async () => c.adjuntarComprobantePago(2, 'F'));
    await act(async () => c.actualizarInscripcion({ x: 1 }));
    await act(async () => c.actualizarPago(2, { x: 1 }));
    await act(async () => c.anularPago(2, 'motivo'));
    await act(async () => c.anularInscripcion({ y: 1 }));
    expect(R.api.cargar).toHaveBeenCalledTimes(6);
    await act(async () => c.descargarComprobantePago(2));
    await act(async () => c.descargarFormularioPdf());
    await act(async () => c.descargarReciboPdfPago(2));
    expect(R.mut.descargarComprobante).toHaveBeenCalledWith(6, 2);
    expect(R.mut.descargarFormularioPdf).toHaveBeenCalledWith(6);
    expect(R.mut.descargarReciboPdf).toHaveBeenCalledWith(6, 2);

    R.mut.actualizarRequisitos.mockResolvedValueOnce({ success: false });
    R.api.cargar.mockClear();
    await act(async () => c.guardarRequisitos([1]));
    expect(R.api.cargar).not.toHaveBeenCalled();
  });

  it('detalle con id inválido responde con error sin llamar a nada', async () => {
    R.mut = { registrarPago: vi.fn() };
    const bad = valor(InscripcionCapacitacionDetailProvider, InscripcionCapacitacionDetailContext, { inscripcionId: 'x' });
    const c = bad.current;
    expect(c.error).toBe('Identificador de inscripción inválido');
    const invalida = { success: false, error: 'Inscripción inválida' };
    expect(await c.refetch()).toEqual({ success: false });
    for (const accion of [
      () => c.registrarPago({}),
      () => c.guardarRequisitos([]),
      () => c.adjuntarComprobantePago(1, 'F'),
      () => c.descargarComprobantePago(1),
      () => c.descargarFormularioPdf(),
      () => c.descargarReciboPdfPago(1),
      () => c.actualizarInscripcion({}),
      () => c.actualizarPago(1, {}),
      () => c.anularPago(1, 'm'),
      () => c.anularInscripcion({}),
    ]) {
      expect(await accion()).toEqual(invalida);
    }
    expect(R.mut.registrarPago).not.toHaveBeenCalled();
  });
});
