import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  repo: { crear: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(), obtenerPorId: vi.fn(), obtenerTodos: vi.fn() },
  app: null,
  ctxDetail: {},
  ctxForm: {},
  ctxList: {},
  mut: { eliminarParticipante: vi.fn() },
  tableArgs: null,
  get: { participante: null, loading: false, error: null, cargar: vi.fn() },
  list: { ret: null, config: null },
  real: {},
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@implementations/ParticipanteCapacitacionRepository', () => ({ default: R.repo }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), useServerPaginatedList: (config) => ((R.list.config = config), R.list.ret) }));
vi.mock('@application-capacitacion/participantes/hooks/context/useParticipanteDetailContext', () => ({ useParticipanteDetailContext: () => R.ctxDetail }));
vi.mock('@application-capacitacion/participantes/hooks/context/useParticipanteFormContext', () => ({ useParticipanteFormContext: () => R.ctxForm }));
vi.mock('@application-capacitacion/participantes/hooks/context/useParticipantesListContext', () => ({ useParticipantesListContext: () => R.ctxList }));
vi.mock('@application-capacitacion/participantes/hooks/api/useParticipanteMutations', async (orig) => {
  const real = await orig();
  return { useParticipanteMutations: (...a) => (R.real.mut ? real.useParticipanteMutations(...a) : R.mut) };
});
vi.mock('@application-capacitacion/participantes/hooks/api/useGetParticipanteCapacitacion', async (orig) => {
  const real = await orig();
  return { useGetParticipanteCapacitacion: (...a) => (R.real.get ? real.useGetParticipanteCapacitacion(...a) : R.get) };
});
vi.mock('@capacitacion/participantes/config/participantesTableColumns', () => ({ createParticipantesTableColumns: (a) => ((R.tableArgs = a), ['cols']) }));

import { useParticipanteDetailPage } from '../hooks/state/useParticipanteDetailPage';
import { useParticipanteFormPage } from '../hooks/state/useParticipanteFormPage';
import { useParticipantesListPage } from '../hooks/state/useParticipantesListPage';
import { useParticipanteMutations } from '../hooks/api/useParticipanteMutations';
import { useGetParticipanteCapacitacion } from '../hooks/api/useGetParticipanteCapacitacion';
import { useParticipantesApi } from '../hooks/api/useParticipantesApi';
import { ParticipanteDetailProvider } from '../providers/ParticipanteDetailProvider';
import { ParticipanteFormProvider } from '../providers/ParticipanteFormProvider';
import { ParticipantesListProvider } from '../providers/ParticipantesListProvider';
import { ParticipanteDetailContext } from '../context/ParticipanteDetailContext';
import { ParticipanteFormContext } from '../context/ParticipanteFormContext';
import { ParticipantesListContext } from '../context/ParticipantesListContext';

const conRuta = (state, pathname = '/capacitacion/participantes') => ({ children }) => (
  <MemoryRouter initialEntries={[{ pathname, state }]}>{children}</MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  R.real = {};
  R.app = { modal: { confirm: vi.fn() }, notification: { success: vi.fn(), error: vi.fn() } };
  R.get = { participante: null, loading: false, error: null, cargar: vi.fn().mockResolvedValue({ success: true }) };
  R.ctxDetail = { participanteId: 3, participante: { nombreCompleto: 'Ana', inscripciones: [] }, loading: false, error: null, refetch: vi.fn() };
  R.ctxForm = { participanteId: null, participante: null, loadingParticipante: false, errorParticipante: null, saving: false, guardarParticipante: vi.fn().mockResolvedValue({ success: true }) };
  R.ctxList = { participantes: [{ id: 1 }], loading: false, error: null, searchText: 's', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn() };
  R.mut = { eliminarParticipante: vi.fn() };
});

describe('useParticipanteDetailPage', () => {
  it('navegación: volver, editar y ver una inscripción', () => {
    const { result } = renderHook(() => useParticipanteDetailPage(), { wrapper: conRuta({ returnListPath: '/lista', menuSidebarKey: 'k' }, '/detalle') });
    expect(result.current.breadcrumbItems[2].href).toBe('/lista');
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'k' } });
    act(() => result.current.handleEditar());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('3'), { state: { returnListPath: '/lista', menuSidebarKey: 'k' } });
    act(() => result.current.handleVerInscripcion({ id: 9 }));
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('9'), { state: { returnListPath: '/detalle', menuSidebarKey: 'k' } });
    R.ctxDetail = { ...R.ctxDetail, participanteId: null };
    const sin = renderHook(() => useParticipanteDetailPage(), { wrapper: conRuta() });
    R.navigate.mockClear();
    act(() => sin.result.current.handleEditar());
    act(() => sin.result.current.handleEliminar());
    expect(R.navigate).not.toHaveBeenCalled();
    expect(R.app.modal.confirm).not.toHaveBeenCalled();
  });

  it('eliminar: confirma con el aviso de inscripciones y navega al listado', async () => {
    R.ctxDetail = { ...R.ctxDetail, participante: { nombreCompleto: 'Ana', inscripciones: [{}, {}] } };
    const { result } = renderHook(() => useParticipanteDetailPage(), { wrapper: conRuta() });
    act(() => result.current.handleEliminar());
    const conf = R.app.modal.confirm.mock.calls[0][0];
    expect(conf.content).toMatch(/2 inscripción\(es\)/);
    R.mut.eliminarParticipante.mockResolvedValueOnce({ success: true });
    await act(async () => conf.onOk());
    expect(R.mut.eliminarParticipante).toHaveBeenCalledWith(3);
    expect(R.app.notification.success).toHaveBeenCalled();
    expect(R.navigate).toHaveBeenCalled();
    R.mut.eliminarParticipante.mockResolvedValueOnce({ success: false, error: 'Con pagos' });
    await act(async () => conf.onOk());
    expect(R.app.notification.error).toHaveBeenLastCalledWith(expect.objectContaining({ description: 'Con pagos' }));
    R.mut.eliminarParticipante.mockResolvedValueOnce(undefined);
    await act(async () => conf.onOk());
    expect(result.current.eliminando).toBe(false);
  });

  it('el texto de confirmación cubre participante sin inscripciones o desconocido', () => {
    R.ctxDetail = { ...R.ctxDetail, participante: { nombreCompleto: 'Luis' } };
    const a = renderHook(() => useParticipanteDetailPage(), { wrapper: conRuta() });
    act(() => a.result.current.handleEliminar());
    expect(R.app.modal.confirm.mock.calls[0][0].content).toBe('Se eliminará a «Luis». ¿Desea continuar?');
    R.ctxDetail = { ...R.ctxDetail, participante: null };
    const b = renderHook(() => useParticipanteDetailPage(), { wrapper: conRuta() });
    act(() => b.result.current.handleEliminar());
    expect(R.app.modal.confirm.mock.calls[1][0].content).toContain('este participante');
  });
});

describe('useParticipanteFormPage', () => {
  it('alta y edición: títulos, permisos y rutas de retorno', () => {
    const alta = renderHook(() => useParticipanteFormPage('create'), { wrapper: conRuta({ returnListPath: '/l', menuSidebarKey: 'k' }) });
    expect(alta.result.current).toMatchObject({ pageTitle: 'Nuevo participante', permisoAccion: 'CREAR', loading: false, isInvalidEditId: false });
    act(() => alta.result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/l', { state: { menuSidebarKey: 'k' } });
    R.ctxForm = { ...R.ctxForm, participanteId: 3, participante: { id: 3, nombres: 'Ana' }, loadingParticipante: true, errorParticipante: 'x' };
    const edit = renderHook(() => useParticipanteFormPage('edit'), { wrapper: conRuta() });
    expect(edit.result.current).toMatchObject({ pageTitle: 'Editar participante', permisoAccion: 'EDITAR', loading: true, error: 'x' });
    R.ctxForm = { ...R.ctxForm, participanteId: null };
    expect(renderHook(() => useParticipanteFormPage('edit'), { wrapper: conRuta() }).result.current.isInvalidEditId).toBe(true);
  });

  it('guardar: valida campos, notifica y vuelve al listado', async () => {
    const { result } = renderHook(() => useParticipanteFormPage('create'), { wrapper: conRuta() });
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('Revise los campos obligatorios');
    expect(R.ctxForm.guardarParticipante).not.toHaveBeenCalled();
    const valores = { nombres: 'Ana', apellidoPaterno: 'Pérez', ci: '123', celular: '7' };
    act(() => result.current.form.setFieldsValue(valores));
    result.current.form.validateFields = vi.fn().mockResolvedValue(valores);
    await act(async () => result.current.handleSubmit());
    expect(R.ctxForm.guardarParticipante).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ nombres: 'Ana' }) });
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Participante registrado' }));
    expect(R.navigate).toHaveBeenCalled();
    R.ctxForm.guardarParticipante.mockResolvedValueOnce({ success: false, error: 'CI repetido' });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('CI repetido');
    R.ctxForm.guardarParticipante.mockResolvedValueOnce(undefined);
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('No se pudo guardar el participante');
  });

  it('edición actualiza con el id del participante', async () => {
    R.ctxForm = { ...R.ctxForm, participanteId: 3, participante: { id: 3, nombres: 'Ana' } };
    const { result } = renderHook(() => useParticipanteFormPage('edit'), { wrapper: conRuta() });
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombres: 'Ana' });
    await act(async () => result.current.handleSubmit());
    expect(R.ctxForm.guardarParticipante).toHaveBeenCalledWith({ id: 3, payload: expect.anything() });
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Participante actualizado' }));
  });
});

describe('useParticipantesListPage', () => {
  it('expone el listado y navega con el estado de la lista', () => {
    const { result } = renderHook(() => useParticipantesListPage(), { wrapper: conRuta() });
    expect(result.current).toMatchObject({ participantes: [{ id: 1 }], searchText: 's', tableColumns: ['cols'] });
    act(() => result.current.handleNuevo());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.any(String), { state: { returnListPath: '/capacitacion/participantes', menuSidebarKey: expect.any(String) } });
    R.tableArgs.onVer({ id: 4 });
    R.tableArgs.onEditar({ id: 5 });
    expect(R.navigate).toHaveBeenCalledTimes(3);
    act(() => result.current.handleSearchChange({ target: { value: 'z' } }));
    expect(R.ctxList.setSearchText).toHaveBeenCalledWith('z');
    expect(result.current.breadcrumbItems).toHaveLength(3);
    R.ctxList = {};
    expect(renderHook(() => useParticipantesListPage(), { wrapper: conRuta() }).result.current).toMatchObject({ participantes: [], loading: false, error: null, searchText: '' });
  });

  it('eliminar valida el id y propaga el resultado', async () => {
    renderHook(() => useParticipantesListPage(), { wrapper: conRuta() });
    const { deleteFn } = R.tableArgs;
    expect(await deleteFn(null)).toEqual({ success: false, error: 'Participante inválido' });
    R.mut.eliminarParticipante.mockResolvedValueOnce({ success: true });
    expect(await deleteFn(2)).toEqual({ success: true });
    R.mut.eliminarParticipante.mockResolvedValueOnce(undefined);
    expect((await deleteFn(2)).error).toBe('No se pudo eliminar el participante');
  });
});

describe('API de participantes', () => {
  it('mutaciones', async () => {
    R.real.mut = true;
    const { result } = renderHook(() => useParticipanteMutations());
    R.repo.crear.mockResolvedValue({ success: true });
    await act(async () => result.current.guardarParticipante({ id: null, payload: { a: 1 } }));
    expect(R.repo.crear).toHaveBeenCalledWith({ a: 1 });
    await act(async () => result.current.guardarParticipante({ id: 2, payload: { b: 1 } }));
    expect(R.repo.actualizar).toHaveBeenCalledWith(2, { b: 1 });
    result.current.eliminarParticipante(2);
    expect(R.repo.eliminar).toHaveBeenCalledWith(2);
    expect(result.current.saving).toBe(false);
  });

  it('obtener por id', async () => {
    R.real.get = true;
    const { result } = renderHook(() => useGetParticipanteCapacitacion());
    let r;
    await act(async () => {
      r = await result.current.cargar(null);
    });
    expect(result.current.error).toBe('Se requiere el ID del participante');
    R.repo.obtenerPorId.mockResolvedValueOnce({ success: true, data: { participante: { id: 2, nombres: 'Ana' } } });
    await act(async () => {
      r = await result.current.cargar(2);
    });
    expect(r.success).toBe(true);
    expect(result.current.participante).toMatchObject({ id: 2 });
    R.repo.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.cargar(2);
    });
    expect(result.current.error).toBe('No se pudo cargar el participante');
    expect(result.current.participante).toBeNull();
  });

  it('listado', async () => {
    const { result } = renderHook(() => useParticipantesApi());
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, nombres: 'Ana' }], pagination: { total: 1 } });
    const r = await result.current.fetch({ params: { page: 1 } });
    expect(r).toMatchObject({ success: true, pagination: { total: 1 } });
    expect(r.participantes).toHaveLength(1);
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: true, data: [] });
    expect((await result.current.fetch()).pagination).toBeNull();
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await result.current.fetch()).error).toBe('Error al cargar los participantes');
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    expect((await result.current.fetch()).error).toBe('Mal');
  });
});

describe('providers de participantes', () => {
  const valor = (Provider, Context, props) =>
    renderHook(() => useContext(Context), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <Provider {...props}>{children}</Provider>
        </MemoryRouter>
      ),
    }).result;

  it('detalle', async () => {
    const a = valor(ParticipanteDetailProvider, ParticipanteDetailContext, { participanteId: '5' });
    expect(R.get.cargar).toHaveBeenCalledWith(5);
    expect(a.current.participanteId).toBe(5);
    await act(async () => a.current.refetch());
    expect(R.get.cargar).toHaveBeenCalledTimes(2);
    const b = valor(ParticipanteDetailProvider, ParticipanteDetailContext, { participanteId: 'x' });
    expect(b.current.error).toBe('Identificador de participante inválido');
    expect(await b.current.refetch()).toEqual({ success: false });
  });

  it('formulario', () => {
    const a = valor(ParticipanteFormProvider, ParticipanteFormContext, { participanteId: '5' });
    expect(a.current.participanteId).toBe(5);
    R.get.cargar.mockClear();
    const b = valor(ParticipanteFormProvider, ParticipanteFormContext, {});
    expect(b.current).toMatchObject({ participanteId: null, loadingParticipante: false });
    expect(R.get.cargar).not.toHaveBeenCalled();
  });

  it('listado', () => {
    R.list.ret = { rows: [{ id: 1 }], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn() };
    const r = valor(ParticipantesListProvider, ParticipantesListContext, {});
    expect(r.current.participantes).toEqual([{ id: 1 }]);
    expect(R.list.config.buildRequest({ page: 2, limit: 5, search: 'x' })).toEqual({ params: { page: 2, limit: 5, search: 'x' } });
  });
});
