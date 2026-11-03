import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  horario: { crear: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(), obtenerPorId: vi.fn(), obtenerTodos: vi.fn() },
  grupo: { obtenerTodos: vi.fn() },
  cursosFetch: vi.fn(),
  list: { ret: null, config: null },
  ctxHorarios: {},
  ctxGrupos: {},
  tableArgs: null,
  gruposTableArgs: null,
  mut: { saving: false, guardarHorario: vi.fn(), eliminarHorario: vi.fn() },
  get: { horario: null, loading: false, error: null, cargar: vi.fn() },
  real: {},
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@implementations/HorarioCapacitacionRepository', () => ({ default: R.horario }));
vi.mock('@implementations/GrupoCapacitacionRepository', () => ({ default: R.grupo }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), useServerPaginatedList: (config) => ((R.list.config = config), R.list.ret) }));
vi.mock('@application-capacitacion/cursos/hooks/api/useCursosCapacitacionApi', () => ({ useCursosCapacitacionApi: () => ({ fetch: R.cursosFetch }) }));
vi.mock('@application-capacitacion/grupos/hooks/context/useHorariosListContext', () => ({ useHorariosListContext: () => R.ctxHorarios }));
vi.mock('@application-capacitacion/grupos/hooks/context/useGruposListContext', () => ({ useGruposListContext: () => R.ctxGrupos }));
vi.mock('@capacitacion/grupos/config/horariosTableColumns', () => ({ createHorariosTableColumns: (a) => ((R.tableArgs = a), ['h']) }));
vi.mock('@capacitacion/grupos/config/gruposTableColumns', () => ({ createGruposTableColumns: (a) => ((R.gruposTableArgs = a), ['g']) }));
vi.mock('@application-capacitacion/grupos/hooks/api/useHorarioMutations', async (orig) => {
  const real = await orig();
  return { useHorarioMutations: (...a) => (R.real.mut ? real.useHorarioMutations(...a) : R.mut) };
});
vi.mock('@application-capacitacion/grupos/hooks/api/useGetHorarioCapacitacion', async (orig) => {
  const real = await orig();
  return { useGetHorarioCapacitacion: (...a) => (R.real.get ? real.useGetHorarioCapacitacion(...a) : R.get) };
});
vi.mock('@application-capacitacion/grupos/hooks/api/useGruposApi', async (orig) => {
  const real = await orig();
  return { useGruposApi: (...a) => (R.real.api ? real.useGruposApi(...a) : { fetch: 'fetchGrupos' }) };
});
vi.mock('@application-capacitacion/grupos/hooks/api/useCursosFiltroGrupos', async (orig) => {
  const real = await orig();
  return { useCursosFiltroGrupos: (...a) => (R.real.filtro ? real.useCursosFiltroGrupos(...a) : { options: [{ value: 1 }], loading: false }) };
});
vi.mock('@application-capacitacion/grupos/hooks/api/useHorariosApi', async (orig) => {
  const real = await orig();
  return { useHorariosApi: (...a) => (R.real.api ? real.useHorariosApi(...a) : { fetch: 'fetchHorarios' }) };
});

import { useHorariosListPage } from '../hooks/state/useHorariosListPage';
import { useGruposListPage } from '../hooks/state/useGruposListPage';
import { useHorarioMutations } from '../hooks/api/useHorarioMutations';
import { useGetHorarioCapacitacion } from '../hooks/api/useGetHorarioCapacitacion';
import { useCursosFiltroGrupos } from '../hooks/api/useCursosFiltroGrupos';
import { useGruposApi } from '../hooks/api/useGruposApi';
import { useHorariosApi } from '../hooks/api/useHorariosApi';
import { GruposListProvider } from '../providers/GruposListProvider';
import { HorarioFormProvider } from '../providers/HorarioFormProvider';
import { HorariosListProvider } from '../providers/HorariosListProvider';
import { GruposListContext } from '../context/GruposListContext';
import { HorarioFormContext } from '../context/HorarioFormContext';
import { HorariosListContext } from '../context/HorariosListContext';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

beforeEach(() => {
  vi.clearAllMocks();
  R.real = {};
  R.get = { horario: null, loading: false, error: null, cargar: vi.fn() };
  R.mut = { saving: false, guardarHorario: vi.fn(), eliminarHorario: vi.fn() };
  R.ctxHorarios = { horarios: [{ id: 1 }], searchText: 'q', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn(), eliminarHorario: vi.fn() };
  R.ctxGrupos = { grupos: [{ id: 1 }], setSearchText: vi.fn(), estado: 'ACTIVO', setEstado: vi.fn(), cursoId: 2, setCursoId: vi.fn(), cursosOptions: [{ value: 2 }] };
});

describe('listados de grupos y horarios', () => {
  it('horarios: edita con el estado de navegación y elimina con validación', async () => {
    const { result } = renderHook(() => useHorariosListPage(), { wrapper });
    expect(result.current).toMatchObject({ horarios: [{ id: 1 }], searchText: 'q', tableColumns: ['h'] });
    R.tableArgs.onEditar({ id: 8 });
    expect(R.navigate).toHaveBeenCalledWith(expect.stringContaining('8'), { state: expect.any(Object) });
    expect(await R.tableArgs.deleteFn(null)).toEqual({ success: false, error: 'Horario inválido' });
    R.ctxHorarios.eliminarHorario.mockResolvedValueOnce({ success: true });
    expect(await R.tableArgs.deleteFn(2)).toEqual({ success: true });
    R.ctxHorarios.eliminarHorario.mockResolvedValueOnce(undefined);
    expect((await R.tableArgs.deleteFn(2)).error).toBe('No se pudo eliminar el horario');
    act(() => result.current.handleSearchChange({ target: { value: 'z' } }));
    expect(R.ctxHorarios.setSearchText).toHaveBeenCalledWith('z');
    R.ctxHorarios = {};
    expect(renderHook(() => useHorariosListPage(), { wrapper }).result.current).toMatchObject({ horarios: [], loading: false, error: null, searchText: '' });
  });

  it('grupos: ver y editar el curso, y filtros', () => {
    const { result } = renderHook(() => useGruposListPage(), { wrapper });
    expect(result.current).toMatchObject({ grupos: [{ id: 1 }], estado: 'ACTIVO', cursoId: 2, tableColumns: ['g'] });
    R.gruposTableArgs.onVerCurso({ cursoId: 5 });
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('5'), { state: expect.objectContaining({ menuSidebarKey: expect.any(String) }) });
    R.gruposTableArgs.onEditarGrupo({ cursoId: 5 });
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('5'), { state: expect.objectContaining({ initialStep: expect.anything() }) });
    act(() => result.current.handleSearchChange({ target: { value: 'g' } }));
    expect(R.ctxGrupos.setSearchText).toHaveBeenCalledWith('g');
    R.ctxGrupos = { setSearchText: vi.fn() };
    expect(renderHook(() => useGruposListPage(), { wrapper }).result.current).toMatchObject({ grupos: [], cursosOptions: [], loadingCursos: false });
  });
});

describe('API de grupos y horarios', () => {
  it('mutaciones de horario', async () => {
    R.real.mut = true;
    const { result } = renderHook(() => useHorarioMutations());
    R.horario.crear.mockResolvedValue({ success: true });
    await act(async () => result.current.guardarHorario({ id: null, payload: { a: 1 } }));
    expect(R.horario.crear).toHaveBeenCalledWith({ a: 1 });
    await act(async () => result.current.guardarHorario({ id: 3, payload: { b: 1 } }));
    expect(R.horario.actualizar).toHaveBeenCalledWith(3, { b: 1 });
    result.current.eliminarHorario(3);
    expect(R.horario.eliminar).toHaveBeenCalledWith(3);
    expect(result.current.saving).toBe(false);
  });

  it('obtener un horario', async () => {
    R.real.get = true;
    const { result } = renderHook(() => useGetHorarioCapacitacion());
    await act(async () => result.current.cargar(''));
    expect(result.current.error).toBe('Se requiere el ID del horario');
    R.horario.obtenerPorId.mockResolvedValueOnce({ success: true, data: { horario: { id: 4, dia: 'LUNES' } } });
    let r;
    await act(async () => {
      r = await result.current.cargar(4);
    });
    expect(r.success).toBe(true);
    expect(result.current.horario).toBeTruthy();
    R.horario.obtenerPorId.mockResolvedValueOnce({ success: false, error: 'No existe' });
    await act(async () => result.current.cargar(4));
    expect(result.current.error).toBe('No existe');
    expect(result.current.horario).toBeNull();
    R.horario.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.cargar(4));
    expect(result.current.error).toBe('No se pudo cargar el horario');
  });

  it('listados de grupos y horarios', async () => {
    R.real.api = true;
    const g = renderHook(() => useGruposApi()).result.current;
    R.grupo.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, nombre: 'A' }] });
    const rg = await g.fetch();
    expect(rg).toMatchObject({ success: true, pagination: null });
    expect(rg.grupos).toHaveLength(1);
    R.grupo.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await g.fetch()).error).toBe('Error al cargar los grupos');
    R.grupo.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    expect((await g.fetch()).error).toBe('Mal');

    const h = renderHook(() => useHorariosApi()).result.current;
    R.horario.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, dia: 'LUNES' }] });
    expect((await h.fetch({ a: 1 })).horarios).toHaveLength(1);
    R.horario.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await h.fetch()).error).toBe('Error al cargar los horarios');
  });

  it('filtro de cursos para grupos', async () => {
    R.real.filtro = true;
    R.cursosFetch.mockResolvedValueOnce({ success: true, data: [{ id: 1, titulo: 'Excel' }] });
    const { result } = renderHook(() => useCursosFiltroGrupos());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual([{ value: 1, label: 'Excel' }]);
    expect(R.cursosFetch).toHaveBeenCalledWith({ params: { page: 1, limit: 10000 } });
    R.cursosFetch.mockResolvedValueOnce({ success: false });
    const b = renderHook(() => useCursosFiltroGrupos());
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    expect(b.result.current.options).toEqual([]);
    R.cursosFetch.mockResolvedValueOnce({ success: true, data: [] });
    renderHook(() => useCursosFiltroGrupos()).unmount();
  });
});

describe('providers de grupos y horarios', () => {
  const valor = (Provider, Context, props) =>
    renderHook(() => useContext(Context), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <Provider {...props}>{children}</Provider>
        </MemoryRouter>
      ),
    }).result;

  beforeEach(() => {
    R.list.ret = { rows: [{ id: 1 }], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn() };
  });

  it('grupos: filtros por estado y curso en la petición', () => {
    const r = valor(GruposListProvider, GruposListContext, {});
    expect(r.current).toMatchObject({ grupos: [{ id: 1 }], cursosOptions: [{ value: 1 }], estado: null });
    act(() => r.current.setEstado('ACTIVO'));
    act(() => r.current.setCursoId(3));
    expect(R.list.config.extra).toEqual({ estado: 'ACTIVO', cursoId: 3 });
    expect(R.list.config.buildRequest({ search: '', extra: R.list.config.extra })).toEqual({ params: { search: undefined, estado: 'ACTIVO', cursoId: 3 } });
  });

  it('horarios: lista y formulario', () => {
    const l = valor(HorariosListProvider, HorariosListContext, {});
    expect(l.current.horarios).toEqual([{ id: 1 }]);
    expect(R.list.config.buildRequest({ search: 'x' })).toEqual({ params: { search: 'x' } });
    const f = valor(HorarioFormProvider, HorarioFormContext, { horarioId: '6' });
    expect(R.get.cargar).toHaveBeenCalledWith(6);
    expect(f.current.horarioId).toBe(6);
    R.get.cargar.mockClear();
    const sin = valor(HorarioFormProvider, HorarioFormContext, {});
    expect(sin.current).toMatchObject({ horarioId: null, loadingHorario: false });
    expect(R.get.cargar).not.toHaveBeenCalled();
  });
});
