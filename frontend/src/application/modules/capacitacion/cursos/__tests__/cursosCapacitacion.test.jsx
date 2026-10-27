import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  repo: {
    crear: vi.fn(), actualizar: vi.fn(), cambiarEstado: vi.fn(), eliminar: vi.fn(),
    abrirInscripciones: vi.fn(), cancelarCurso: vi.fn(), obtenerPorId: vi.fn(),
    obtenerTodos: vi.fn(), exportarInscritos: vi.fn(),
  },
  http: { get: vi.fn() },
  downloadBlob: vi.fn(),
  app: null,
  ctxForm: {},
  ctxDetail: {},
  ctxList: {},
  mut: { abrirInscripciones: vi.fn(), cancelarCurso: vi.fn() },
  exportar: vi.fn(),
  tableArgs: null,
  get: { curso: null, loading: false, error: null, cargar: vi.fn() },
  list: { ret: null, config: null },
  horarios: { horarios: [], loading: false, error: null, creando: false, crearHorario: vi.fn() },
  aulas: { aulas: [{ value: 1 }], loading: false, disponible: true },
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@implementations/CursoCapacitacionRepository', () => ({ default: R.repo }));
vi.mock('@api-client', () => ({ default: R.http }));
vi.mock('@application/utils', async (orig) => ({
  ...(await orig()),
  downloadBlob: R.downloadBlob,
  useServerPaginatedList: (config) => ((R.list.config = config), R.list.ret),
}));
vi.mock('@application-capacitacion/cursos/hooks/context/useCursoCapacitacionFormContext', () => ({ useCursoCapacitacionFormContext: () => R.ctxForm }));
vi.mock('@application-capacitacion/cursos/hooks/context/useCursoCapacitacionDetailContext', () => ({ useCursoCapacitacionDetailContext: () => R.ctxDetail }));
vi.mock('@application-capacitacion/cursos/hooks/context/useCursosCapacitacionListContext', () => ({ useCursosCapacitacionListContext: () => R.ctxList }));
vi.mock('@application-capacitacion/cursos/hooks/api/useCursoCapacitacionMutations', async (orig) => {
  const real = await orig();
  return { useCursoCapacitacionMutations: (...a) => (R.useRealMutations ? real.useCursoCapacitacionMutations(...a) : R.mut) };
});
vi.mock('@application-capacitacion/cursos/hooks/api/useExportarInscritosCapacitacionExcel', async (orig) => {
  const real = await orig();
  return { useExportarInscritosCapacitacionExcel: (...a) => (R.useRealExport ? real.useExportarInscritosCapacitacionExcel(...a) : { exportar: R.exportar }) };
});
vi.mock('@capacitacion/cursos/config/cursosTableColumns', () => ({ createCursosCapacitacionTableColumns: (a) => ((R.tableArgs = a), ['cols']) }));
vi.mock('@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion', async (orig) => {
  const real = await orig();
  return { useGetCursoCapacitacion: (...a) => (R.useRealGet ? real.useGetCursoCapacitacion(...a) : R.get) };
});
vi.mock('@application-capacitacion/cursos/hooks/api/useAulasCatalogoCapApi', async (orig) => {
  const real = await orig();
  return { useAulasCatalogoCapApi: (...a) => (R.useRealAulas ? real.useAulasCatalogoCapApi(...a) : R.aulas) };
});
vi.mock('@application-capacitacion/cursos/hooks/api/useHorariosCapacitacionApi', () => ({ useHorariosCapacitacionApi: () => R.horarios }));
vi.mock('@application-capacitacion/cursos/hooks/state/useCursoHorarioCrear', () => ({ useCursoHorarioCrear: () => ({ abrir: vi.fn() }) }));

import { useCursoCapacitacionFormPage } from '../hooks/state/useCursoCapacitacionFormPage';
import { useCursoCapacitacionDetailPage } from '../hooks/state/useCursoCapacitacionDetailPage';
import { useCursosCapacitacionListPage } from '../hooks/state/useCursosCapacitacionListPage';
import { useCursoCapacitacionMutations } from '../hooks/api/useCursoCapacitacionMutations';
import { useGetCursoCapacitacion } from '../hooks/api/useGetCursoCapacitacion';
import { useAulasCatalogoCapApi } from '../hooks/api/useAulasCatalogoCapApi';
import { useExportarInscritosCapacitacionExcel } from '../hooks/api/useExportarInscritosCapacitacionExcel';
import { useCursosCapacitacionApi } from '../hooks/api/useCursosCapacitacionApi';
import { CursoCapacitacionFormProvider } from '../providers/CursoCapacitacionFormProvider';
import { CursoCapacitacionDetailProvider } from '../providers/CursoCapacitacionDetailProvider';
import { CursosCapacitacionListProvider } from '../providers/CursosCapacitacionListProvider';
import { CursoCapacitacionFormContext } from '../context/CursoCapacitacionFormContext';
import { CursoCapacitacionDetailContext } from '../context/CursoCapacitacionDetailContext';
import { CursosCapacitacionListContext } from '../context/CursosCapacitacionListContext';

const conRuta = (state, pathname = '/capacitacion/cursos') => ({ children }) => (
  <MemoryRouter initialEntries={[{ pathname, state }]}>{children}</MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  R.useRealMutations = false;
  R.useRealGet = false;
  R.useRealAulas = false;
  R.useRealExport = false;
  R.app = {
    modal: { confirm: vi.fn() },
    notification: { success: vi.fn(), error: vi.fn() },
    message: { success: vi.fn(), error: vi.fn() },
  };
  R.get = { curso: null, loading: false, error: null, cargar: vi.fn().mockResolvedValue({ success: true }) };
  R.ctxForm = {
    cursoId: null, curso: null, loadingCurso: false, errorCurso: null, saving: false,
    guardarCurso: vi.fn().mockResolvedValue({ success: true, data: { id: 5 } }),
    aulas: [], loadingAulas: false, aulasDisponible: true, horariosCatalogo: [], loadingHorarios: false,
    errorHorarios: null, creandoHorario: false, crearHorario: vi.fn(),
  };
  R.ctxDetail = { cursoId: 4, curso: { estado: 'PROPUESTO' }, loading: false, error: null, refetch: vi.fn().mockResolvedValue({}) };
  R.mut = { abrirInscripciones: vi.fn(), cancelarCurso: vi.fn() };
});

describe('useCursoCapacitacionFormPage', () => {
  it('alta: título, migas, pasos del asistente y valores iniciales', () => {
    const { result } = renderHook(() => useCursoCapacitacionFormPage('create'), { wrapper: conRuta() });
    expect(result.current).toMatchObject({ pageTitle: 'Nuevo curso de capacitación', permisoAccion: 'CREAR', isEditMode: false, loading: false, initialStep: 0, isInvalidEditId: false });
    expect(result.current.wizardSteps.map((s) => s.title)).toEqual(['Datos del curso', 'Grupos y horarios', 'Requisitos de inscripción']);
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Nuevo curso de capacitación');
  });

  it('nueva edición a partir de un curso y edición con paso inicial', () => {
    R.ctxForm = { ...R.ctxForm, cursoId: 9, curso: { id: 9, titulo: 'T', grupos: [{ horarios: [] }] } };
    const nueva = renderHook(() => useCursoCapacitacionFormPage('create'), { wrapper: conRuta() });
    expect(nueva.result.current.pageTitle).toBe('Nueva edición del curso');
    const edit = renderHook(() => useCursoCapacitacionFormPage('edit'), { wrapper: conRuta({ initialStep: '2', returnListPath: '/x', menuSidebarKey: 'k' }) });
    expect(edit.result.current).toMatchObject({ pageTitle: 'Editar curso de capacitación', permisoAccion: 'EDITAR', initialStep: 2 });
    expect(edit.result.current.breadcrumbItems[2].href).toBe('/x');
    R.ctxForm = { ...R.ctxForm, cursoId: null };
    expect(renderHook(() => useCursoCapacitacionFormPage('edit'), { wrapper: conRuta() }).result.current.isInvalidEditId).toBe(true);
  });

  it('volver usa la ruta de retorno del estado', () => {
    const { result } = renderHook(() => useCursoCapacitacionFormPage('create'), { wrapper: conRuta({ returnListPath: '/lista', menuSidebarKey: 'k' }) });
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenCalledWith('/lista', { state: { menuSidebarKey: 'k' } });
  });

  it('validación por paso del asistente', async () => {
    const { result } = renderHook(() => useCursoCapacitacionFormPage('create'), { wrapper: conRuta() });
    await act(async () => {
      await expect(result.current.onValidateBeforeNext(1)).resolves.toBeUndefined();
    });
    act(() => result.current.form.setFieldsValue({ grupos: [{ nombre: '' }] }));
    await act(async () => {
      await expect(result.current.onValidateBeforeNext(2)).rejects.toThrow('Todos los grupos deben tener nombre');
    });
    act(() => result.current.handleValidationError({ errorFields: [] }));
    expect(result.current.stepError).toBe('Revise los campos obligatorios');
    act(() => result.current.handleValidationError(new Error('Otro')));
    expect(result.current.stepError).toBe('Otro');
    act(() => result.current.handleValidationError({}));
    expect(result.current.stepError).toBe('Revise los datos del paso actual');
  });

  it('guardar: grupo sin nombre, error del servicio y éxito con navegación al detalle', async () => {
    const { result } = renderHook(() => useCursoCapacitacionFormPage('create'), { wrapper: conRuta() });
    act(() => result.current.form.setFieldsValue({ titulo: 'Excel', grupos: [{ nombre: ' ' }] }));
    await act(async () => result.current.handleSubmit());
    expect(R.ctxForm.guardarCurso).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Todos los grupos deben tener nombre');
    expect(R.app.notification.error).toHaveBeenCalled();

    act(() => result.current.form.setFieldsValue({ grupos: [] }));
    R.ctxForm.guardarCurso.mockResolvedValueOnce({ success: false, error: 'Mal' });
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('Mal');
    R.ctxForm.guardarCurso.mockResolvedValueOnce(undefined);
    await act(async () => result.current.handleSubmit());
    expect(result.current.error).toBe('No se pudo guardar el curso de capacitación');

    await act(async () => result.current.handleSubmit());
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Curso creado' }));
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('5'), expect.objectContaining({ replace: true }));

    R.ctxForm.guardarCurso.mockResolvedValueOnce({ success: true, data: { cursoCapacitacion: {} } });
    await act(async () => result.current.handleSubmit());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ state: expect.anything() }));
  });
});

describe('useCursoCapacitacionDetailPage', () => {
  it('navegación hacia lista, edición y nueva edición', async () => {
    const { result } = renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta({ returnListPath: '/lista', menuSidebarKey: 'k' }) });
    expect(result.current).toMatchObject({ puedeAbrir: true, puedeCancelar: true });
    expect(result.current.breadcrumbItems[2].href).toBe('/lista');
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'k' } });
    act(() => result.current.handleEditar());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('4'), { state: { returnListPath: '/lista', menuSidebarKey: 'k' } });
    act(() => result.current.handleNuevaEdicion());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.any(String), { state: { cursoOrigenId: 4, returnListPath: '/lista', menuSidebarKey: 'k' } });
    R.ctxDetail = { ...R.ctxDetail, cursoId: null };
    const sin = renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() });
    R.navigate.mockClear();
    act(() => sin.result.current.handleEditar());
    act(() => sin.result.current.handleNuevaEdicion());
    act(() => sin.result.current.handleCancelarCurso());
    await act(async () => sin.result.current.handleAbrirInscripciones());
    expect(R.navigate).not.toHaveBeenCalled();
  });

  it('las transiciones dependen del estado del curso', () => {
    R.ctxDetail = { ...R.ctxDetail, curso: { estado: 'ABIERTO' } };
    expect(renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() }).result.current).toMatchObject({ puedeAbrir: false, puedeCancelar: true });
    R.ctxDetail = { ...R.ctxDetail, curso: { estado: 'CANCELADO' } };
    expect(renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() }).result.current).toMatchObject({ puedeAbrir: false, puedeCancelar: false });
    R.ctxDetail = { ...R.ctxDetail, curso: null };
    expect(renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() }).result.current.puedeCancelar).toBe(false);
  });

  it('abrir inscripciones notifica y refresca, o muestra el error', async () => {
    const { result } = renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() });
    R.mut.abrirInscripciones.mockResolvedValueOnce({ success: true });
    await act(async () => result.current.handleAbrirInscripciones());
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Inscripciones abiertas' }));
    expect(R.ctxDetail.refetch).toHaveBeenCalled();
    R.mut.abrirInscripciones.mockResolvedValueOnce({ success: false, error: 'Sin cupo' });
    await act(async () => result.current.handleAbrirInscripciones());
    expect(R.app.notification.error).toHaveBeenLastCalledWith(expect.objectContaining({ description: 'Sin cupo' }));
    R.mut.abrirInscripciones.mockResolvedValueOnce(undefined);
    await act(async () => result.current.handleAbrirInscripciones());
    expect(R.app.notification.error).toHaveBeenLastCalledWith(expect.objectContaining({ description: expect.stringMatching(/Intente/) }));
    expect(result.current.procesandoTransicion).toBe(false);
  });

  it('cancelar pide confirmación y ejecuta la transición', async () => {
    const { result } = renderHook(() => useCursoCapacitacionDetailPage(), { wrapper: conRuta() });
    act(() => result.current.handleCancelarCurso());
    const { onOk, okType } = R.app.modal.confirm.mock.calls[0][0];
    expect(okType).toBe('danger');
    R.mut.cancelarCurso.mockResolvedValueOnce({ success: true });
    await act(async () => onOk());
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Curso cancelado' }));
    R.mut.cancelarCurso.mockResolvedValueOnce({ success: false });
    await act(async () => onOk());
    expect(R.app.notification.error).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'No se pudo cancelar el curso' }));
  });
});

describe('useCursosCapacitacionListPage', () => {
  beforeEach(() => {
    R.ctxList = {
      cursos: [{ id: 1 }], loading: false, error: null, searchText: 'x', setSearchText: vi.fn(), refetch: vi.fn(), tablePagination: { current: 1 },
      cambiarEstadoCurso: vi.fn(), eliminarCurso: vi.fn(),
    };
  });

  it('expone el contexto y navega al registro con el estado de la lista', () => {
    const { result } = renderHook(() => useCursosCapacitacionListPage(), { wrapper: conRuta(undefined, '/capacitacion/cursos') });
    expect(result.current).toMatchObject({ cursos: [{ id: 1 }], searchText: 'x', tableColumns: ['cols'] });
    act(() => result.current.handleRegistrar());
    expect(R.navigate).toHaveBeenCalledWith(expect.any(String), { state: expect.objectContaining({ returnListPath: '/capacitacion/cursos' }) });
    act(() => result.current.handleSearchChange({ target: { value: 'abc' } }));
    expect(R.ctxList.setSearchText).toHaveBeenCalledWith('abc');
    expect(result.current.breadcrumbItems).toHaveLength(3);
    R.ctxList = {};
    const vacio = renderHook(() => useCursosCapacitacionListPage(), { wrapper: conRuta() });
    expect(vacio.result.current).toMatchObject({ cursos: [], loading: false, error: null, searchText: '' });
  });

  it('activar/desactivar, eliminar y exportar inscritos', async () => {
    const { result } = renderHook(() => useCursosCapacitacionListPage(), { wrapper: conRuta() });
    const { onToggleEstado, deleteFn, onExportarInscritos } = R.tableArgs;
    R.ctxList.cambiarEstadoCurso.mockResolvedValueOnce({ success: true });
    await act(async () => onToggleEstado({ id: 1, titulo: 'Excel' }, false));
    expect(R.app.message.success).toHaveBeenCalledWith('Se desactivó el curso «Excel»');
    expect(R.ctxList.refetch).toHaveBeenCalled();
    R.ctxList.cambiarEstadoCurso.mockResolvedValueOnce({ success: true });
    await act(async () => onToggleEstado({ id: 1, titulo: 'Excel' }, true));
    expect(R.app.message.success).toHaveBeenLastCalledWith('Se activó el curso «Excel»');
    R.ctxList.cambiarEstadoCurso.mockResolvedValueOnce({ success: false });
    await act(async () => onToggleEstado({ id: 1 }, true));
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo cambiar el estado del curso');

    expect(await deleteFn(null)).toEqual({ success: false, error: 'Curso inválido' });
    R.ctxList.eliminarCurso.mockResolvedValueOnce({ success: true });
    expect(await deleteFn(3)).toEqual({ success: true });
    R.ctxList.eliminarCurso.mockResolvedValueOnce(undefined);
    expect((await deleteFn(3)).error).toBe('No se pudo eliminar el curso');

    R.exportar.mockResolvedValueOnce({ success: true });
    await act(async () => onExportarInscritos({ id: 1 }));
    expect(R.app.message.error).toHaveBeenCalledTimes(1);
    R.exportar.mockResolvedValueOnce({ success: false, error: 'Sin inscritos' });
    await act(async () => onExportarInscritos({ id: 1 }));
    expect(R.app.message.error).toHaveBeenLastCalledWith('Sin inscritos');
    R.exportar.mockResolvedValueOnce({ success: false });
    await act(async () => onExportarInscritos({ id: 1 }));
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo exportar el listado de inscritos');
    expect(result.current.tableColumns).toEqual(['cols']);
  });
});

describe('hooks de API de cursos', () => {
  it('mutaciones: guardar crea o actualiza y las transiciones delegan en el repositorio', async () => {
    R.useRealMutations = true;
    const { result } = renderHook(() => useCursoCapacitacionMutations());
    R.repo.crear.mockResolvedValue({ success: true });
    R.repo.actualizar.mockResolvedValue({ success: true });
    await act(async () => result.current.guardarCurso({ id: null, payload: { a: 1 } }));
    expect(R.repo.crear).toHaveBeenCalledWith({ a: 1 });
    await act(async () => result.current.guardarCurso({ id: 4, payload: { b: 2 } }));
    expect(R.repo.actualizar).toHaveBeenCalledWith(4, { b: 2 });
    expect(result.current.saving).toBe(false);
    result.current.cambiarEstadoCurso(1, true);
    result.current.eliminarCurso(1);
    result.current.abrirInscripciones(1);
    result.current.cancelarCurso(1);
    expect(R.repo.cambiarEstado).toHaveBeenCalledWith(1, true);
    expect(R.repo.eliminar).toHaveBeenCalledWith(1);
    expect(R.repo.abrirInscripciones).toHaveBeenCalledWith(1);
    expect(R.repo.cancelarCurso).toHaveBeenCalledWith(1);
    R.repo.crear.mockRejectedValueOnce(new Error('x'));
    await act(async () => {
      await expect(result.current.guardarCurso({ id: null, payload: {} })).rejects.toThrow('x');
    });
    expect(result.current.saving).toBe(false);
  });

  it('obtener un curso: valida el id, mapea y reporta errores', async () => {
    R.useRealGet = true;
    const { result } = renderHook(() => useGetCursoCapacitacion());
    let r;
    await act(async () => {
      r = await result.current.cargar('');
    });
    expect(r.success).toBe(false);
    expect(result.current.error).toBe('Se requiere el ID del curso');
    R.repo.obtenerPorId.mockResolvedValueOnce({ success: true, data: { cursoCapacitacion: { id: 3, titulo: 'Excel' } } });
    await act(async () => {
      r = await result.current.cargar(3);
    });
    expect(r.success).toBe(true);
    expect(result.current.curso).toMatchObject({ id: 3, titulo: 'Excel' });
    R.repo.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.cargar(3);
    });
    expect(result.current.curso).toBeNull();
    expect(result.current.error).toBe('No se pudo cargar el curso de capacitación');
  });

  it('listado de cursos: incluye inactivos y mapea la respuesta', async () => {
    const { result } = renderHook(() => useCursosCapacitacionApi());
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, titulo: 'A' }], pagination: { total: 1 } });
    const r = await result.current.fetch({ params: { page: 2 } });
    expect(R.repo.obtenerTodos).toHaveBeenCalledWith({ params: { incluirInactivos: 'true', page: 2 } });
    expect(r).toMatchObject({ success: true, pagination: { total: 1 } });
    expect(r.cursosCapacitacion).toHaveLength(1);
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: true, data: [] });
    expect((await result.current.fetch()).pagination).toBeNull();
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await result.current.fetch()).error).toBe('Error al cargar los cursos de capacitación');
    R.repo.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'Mal' });
    expect((await result.current.fetch()).error).toBe('Mal');
  });

  it('exportar inscritos descarga el archivo y reporta errores', async () => {
    R.useRealExport = true;
    const { result } = renderHook(() => useExportarInscritosCapacitacionExcel());
    expect(await result.current.exportar(null)).toEqual({ success: false, error: 'Curso inválido' });
    R.repo.exportarInscritos.mockResolvedValueOnce({ success: true, blob: 'B' });
    expect(await result.current.exportar(1)).toEqual({ success: true });
    expect(R.downloadBlob).toHaveBeenCalledWith('B', 'inscritos_capacitacion.xlsx');
    R.repo.exportarInscritos.mockResolvedValueOnce({ success: false });
    expect((await result.current.exportar(1)).error).toBe('No se pudo generar el archivo');
    R.repo.exportarInscritos.mockRejectedValueOnce(new Error('Caída'));
    expect((await result.current.exportar(1)).error).toBe('Caída');
    R.repo.exportarInscritos.mockRejectedValueOnce({});
    expect((await result.current.exportar(1)).error).toBe('Error al exportar');
  });

  it('catálogo de aulas: arma opciones y marca la indisponibilidad', async () => {
    R.useRealAulas = true;
    R.http.get.mockResolvedValueOnce({ data: { success: true, data: { aulas: [{ id: 1, codigo: 'A1', nombre: 'Uno' }, { id: 2 }, { code: 'x' }, null] } } });
    const { result } = renderHook(() => useAulasCatalogoCapApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.aulas).toEqual([{ value: 1, label: 'A1 · Uno' }, { value: 2, label: 'Aula 2' }]);
    expect(result.current.buscarLabel('1')).toBe('A1 · Uno');
    expect(result.current.buscarLabel(99)).toBeNull();
    R.http.get.mockRejectedValueOnce(new Error('403'));
    const b = renderHook(() => useAulasCatalogoCapApi());
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    expect(b.result.current.disponible).toBe(false);
    R.http.get.mockResolvedValueOnce({ data: { success: true, data: 'no-lista' } });
    const c = renderHook(() => useAulasCatalogoCapApi());
    await waitFor(() => expect(c.result.current.loading).toBe(false));
    expect(c.result.current.disponible).toBe(false);
    R.http.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 5, name: 'N', code: 'C' }] } });
    const d = renderHook(() => useAulasCatalogoCapApi());
    await waitFor(() => expect(d.result.current.aulas).toHaveLength(1));
    expect(d.result.current.aulas[0].label).toBe('C · N');
  });
});

describe('providers de cursos', () => {
  const valor = (Provider, Context, props, getter) => {
    const { result } = renderHook(() => useContext(Context), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <Provider {...props}>{children}</Provider>
        </MemoryRouter>
      ),
    });
    return getter ? getter(result) : result;
  };

  it('formulario: carga el curso solo con id válido', () => {
    const a = valor(CursoCapacitacionFormProvider, CursoCapacitacionFormContext, { cursoId: '7' });
    expect(R.get.cargar).toHaveBeenCalledWith(7);
    expect(a.current).toMatchObject({ cursoId: 7, aulasDisponible: true });
    R.get.cargar.mockClear();
    const b = valor(CursoCapacitacionFormProvider, CursoCapacitacionFormContext, { cursoId: 'abc' });
    expect(R.get.cargar).not.toHaveBeenCalled();
    expect(b.current).toMatchObject({ cursoId: null, loadingCurso: false });
    expect(valor(CursoCapacitacionFormProvider, CursoCapacitacionFormContext, {}).current.cursoId).toBeNull();
  });

  it('detalle: id inválido da error y recarga solo si es válido', async () => {
    const a = valor(CursoCapacitacionDetailProvider, CursoCapacitacionDetailContext, { cursoId: '4' });
    expect(a.current).toMatchObject({ cursoId: 4, error: null });
    await act(async () => a.current.refetch());
    expect(R.get.cargar).toHaveBeenCalledTimes(2);
    const b = valor(CursoCapacitacionDetailProvider, CursoCapacitacionDetailContext, { cursoId: 'x' });
    expect(b.current.error).toBe('Identificador de curso inválido');
    expect(await b.current.refetch()).toEqual({ success: false });
  });

  it('listado: arma la petición paginada', () => {
    R.list.ret = { rows: [{ id: 1 }], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: {}, refetch: vi.fn() };
    const r = valor(CursosCapacitacionListProvider, CursosCapacitacionListContext, {});
    expect(r.current.cursos).toEqual([{ id: 1 }]);
    expect(R.list.config.buildRequest({ page: 1, limit: 10, search: '' })).toEqual({ params: { page: 1, limit: 10, search: undefined } });
  });
});
