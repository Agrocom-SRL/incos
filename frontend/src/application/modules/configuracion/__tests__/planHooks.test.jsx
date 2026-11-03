/**
 * Hooks del plan de estudio (CFG Académico): formulario ABM (usePlanForm) y
 * ficha-hub (usePlanDetallePage). La API y el hook de clonado se simulan.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({
  params: {},
  navigate: vi.fn(),
  location: { pathname: '/', state: null },
}));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

// Objetos estables: si cambiaran de referencia en cada render, los efectos de carga entrarían en bucle.
const api = vi.hoisted(() => ({
  detalle: {},
  carreras: { carreras: [], loading: false, error: null },
  nuevaVersion: { creandoVersion: false, crearNuevaVersion: vi.fn() },
}));
vi.mock('@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi', () => ({
  usePlanEstudiosDetalleApi: () => api.detalle,
}));
vi.mock('@application-configuracion/academico/hooks/api/useCarrerasApi', () => ({
  useCarrerasApi: () => api.carreras,
}));
vi.mock('@application-configuracion/academico/hooks/state/usePlanNuevaVersion', () => ({
  usePlanNuevaVersion: () => api.nuevaVersion,
}));

import { usePlanForm } from '../academico/hooks/state/usePlanForm';
import { usePlanDetallePage } from '../academico/hooks/state/usePlanDetallePage';

const wrapper = ({ children }) => <App>{children}</App>;
const ok = (data, extra = {}) => ({ success: true, data, ...extra });

const armarApi = (over = {}) => {
  api.detalle = {
    fetchPlanById: vi.fn().mockResolvedValue(ok({ id: 5, nombre_plan: 'Plan 2026', carrera_id: 2, duracion_anios: 3, vigente: false })),
    fetchMatriz: vi.fn().mockResolvedValue(ok({ periodos: [], plan: { carrera: { id: 2, codigo: 'sis', colorHex: '#112233' } } })),
    crearPlan: vi.fn().mockResolvedValue(ok({ id: 9 })),
    actualizarPlan: vi.fn().mockResolvedValue(ok({ id: 5 })),
    crearPeriodo: vi.fn().mockResolvedValue({ success: true }),
    eliminarPeriodo: vi.fn().mockResolvedValue({ success: true }),
    marcarVigente: vi.fn().mockResolvedValue({ success: true }),
    ...over,
  };
  api.carreras = { carreras: [{ id: 2 }], loading: false, error: null };
  api.nuevaVersion = { creandoVersion: false, crearNuevaVersion: vi.fn() };
};

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/', state: null };
  armarApi();
});

describe('usePlanForm', () => {
  const montar = async (mode, valores) => {
    const hook = renderHook(() => usePlanForm(mode), { wrapper });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    if (valores) hook.result.current.form.validateFields = vi.fn().mockResolvedValue(valores);
    return hook;
  };
  const enviar = (hook) => act(async () => { await hook.result.current.handleSubmit(); });

  it('modo crear: sin carga, título, permiso y carreras', async () => {
    const { result } = await montar('create');
    expect(result.current).toMatchObject({ isEditMode: false, permisoAccion: 'CREAR', pageTitle: 'Nuevo plan de estudio', carreras: [{ id: 2 }] });
    expect(api.detalle.fetchPlanById).not.toHaveBeenCalled();
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Nuevo plan de estudio');
    expect(result.current.resolveOptions()).toEqual([]);
    expect(result.current.formSections).toBeTruthy();
  });

  it('modo editar: carga el plan por id', async () => {
    router.params = { id: '5' };
    const { result } = await montar('edit');
    expect(api.detalle.fetchPlanById).toHaveBeenCalledWith(5);
    expect(result.current.form.getFieldValue('nombrePlan')).toBe('Plan 2026');
    expect(result.current).toMatchObject({ permisoAccion: 'EDITAR', error: null });
  });

  it('modo editar: id inválido no consulta', async () => {
    router.params = { id: 'abc' };
    const { result } = await montar('edit');
    expect(result.current.isInvalidEditId).toBe(true);
    expect(api.detalle.fetchPlanById).not.toHaveBeenCalled();
  });

  it('modo editar: error de carga queda en estado', async () => {
    router.params = { id: '5' };
    armarApi({ fetchPlanById: vi.fn().mockResolvedValue({ success: false, error: 'No existe' }) });
    const { result } = await montar('edit');
    expect(result.current.error).toBe('No existe');
  });

  it('el error de carreras se propaga y el loading de carreras se suma', async () => {
    api.carreras = { carreras: undefined, loading: true, error: 'sin carreras' };
    const { result } = renderHook(() => usePlanForm('create'), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('sin carreras');
    expect(result.current.carreras).toEqual([]);
  });

  it('alta: crea el plan, genera un periodo por año y navega a la ficha', async () => {
    const hook = await montar('create', { carreraId: 2, nombrePlan: ' Nuevo ', duracionAnios: 3 });
    await enviar(hook);
    expect(api.detalle.crearPlan).toHaveBeenCalledWith(expect.objectContaining({ nombre_plan: 'Nuevo', duracion_anios: 3 }));
    expect(api.detalle.crearPeriodo.mock.calls.map((c) => c[1])).toEqual([
      { numero: 1, nombre: '1º Año' }, { numero: 2, nombre: '2º Año' }, { numero: 3, nombre: '3º Año' },
    ]);
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('/plan/9'), expect.objectContaining({ replace: true }));
    expect(hook.result.current.submitLoading).toBe(false);
  });

  it('alta: si fallan periodos igual navega (se avisa por notificación)', async () => {
    api.detalle.crearPeriodo.mockResolvedValue({ success: false });
    const hook = await montar('create', { nombrePlan: 'P', duracionAnios: 2 });
    await enviar(hook);
    expect(api.detalle.crearPeriodo).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('error al guardar deja el mensaje y no navega', async () => {
    api.detalle.crearPlan.mockResolvedValue({ success: false, error: 'Duplicado' });
    const hook = await montar('create', { nombrePlan: 'P', duracionAnios: 2 });
    await enviar(hook);
    expect(hook.result.current.error).toBe('Duplicado');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(api.detalle.crearPeriodo).not.toHaveBeenCalled();
  });

  it('validación fallida pide revisar campos', async () => {
    const hook = await montar('create');
    hook.result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await enviar(hook);
    expect(hook.result.current.error).toBe('Revise los campos obligatorios');
    expect(api.detalle.crearPlan).not.toHaveBeenCalled();
  });

  it('edición: reducir la duración con asignaturas cargadas se bloquea antes de guardar', async () => {
    router.params = { id: '5' };
    api.detalle.fetchMatriz.mockResolvedValue(ok({
      periodos: [{ id: 1, numero: 1, asignaturas: [] }, { id: 2, numero: 2, nombre: 'Seg', asignaturas: [{ id: 1 }] }],
    }));
    const hook = await montar('edit', { nombrePlan: 'P', duracionAnios: 1 });
    await enviar(hook);
    expect(hook.result.current.error).toMatch(/No se puede reducir la duración a 1 año\(s\): Seg/);
    expect(api.detalle.actualizarPlan).not.toHaveBeenCalled();
  });

  it('edición: si no se puede leer la matriz, no guarda', async () => {
    router.params = { id: '5' };
    api.detalle.fetchMatriz.mockResolvedValue({ success: false });
    const hook = await montar('edit', { nombrePlan: 'P', duracionAnios: 2 });
    await enviar(hook);
    expect(hook.result.current.error).toBe('No se pudieron verificar los periodos actuales del plan');
    expect(api.detalle.actualizarPlan).not.toHaveBeenCalled();
  });

  it('edición: sincroniza periodos (elimina sobrantes, crea faltantes) y navega sin reemplazar', async () => {
    router.params = { id: '5' };
    api.detalle.fetchMatriz.mockResolvedValue(ok({
      periodos: [{ id: 11, numero: 1, asignaturas: [] }, { id: 13, numero: 3, asignaturas: [] }],
    }));
    const hook = await montar('edit', { nombrePlan: 'P', duracionAnios: 2 });
    await enviar(hook);
    expect(api.detalle.actualizarPlan).toHaveBeenCalledWith(5, expect.objectContaining({ duracion_anios: 2 }));
    expect(api.detalle.eliminarPeriodo).toHaveBeenCalledWith(13);
    expect(api.detalle.crearPeriodo).toHaveBeenCalledWith(5, { numero: 2, nombre: '2º Año' });
    expect(api.detalle.crearPeriodo).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('/plan/5'), expect.objectContaining({ replace: false }));
  });

  it('edición sin cambios de duración no toca los periodos', async () => {
    router.params = { id: '5' };
    api.detalle.fetchMatriz.mockResolvedValue(ok({ periodos: [{ id: 1, numero: 1 }, { id: 2, numero: 2 }] }));
    const hook = await montar('edit', { nombrePlan: 'P', duracionAnios: 2 });
    await enviar(hook);
    expect(api.detalle.eliminarPeriodo).not.toHaveBeenCalled();
    expect(api.detalle.crearPeriodo).not.toHaveBeenCalled();
  });

  it('handleVolver prefiere la ficha de retorno y conserva la clave del menú', async () => {
    router.location = { pathname: '/', state: { returnDetailPath: '/ficha', returnListPath: '/lista', menuSidebarKey: 'CFG' } };
    const { result } = await montar('create');
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/ficha', { state: { menuSidebarKey: 'CFG' } });
  });

  it('handleVolver sin retorno explícito vuelve al listado de planes', async () => {
    const { result } = await montar('create');
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/configuracion/academico?tab=planes', undefined);
  });
});

describe('usePlanDetallePage', () => {
  const montar = async () => {
    const hook = renderHook(() => usePlanDetallePage(), { wrapper });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  };

  beforeEach(() => {
    router.params = { id: '5' };
  });

  it('carga plan y matriz en paralelo y deriva ficha y avatar', async () => {
    api.detalle.fetchPlanById.mockResolvedValue(ok({ id: 5, nombre_plan: 'Plan 2026', vigente: true }, { prerrequisitos: [{ id: 1 }] }));
    const { result } = await montar();
    expect(api.detalle.fetchPlanById).toHaveBeenCalledWith(5);
    expect(api.detalle.fetchMatriz).toHaveBeenCalledWith(5);
    expect(result.current.plan).toMatchObject({ id: 5, nombrePlan: 'Plan 2026', vigente: true });
    expect(result.current.prerrequisitos).toEqual([{ id: 1 }]);
    expect(result.current.carrera).toMatchObject({ codigo: 'sis' });
    expect(result.current.avatarInitials).toBe('SI');
    expect(result.current.avatarColor).toBeTruthy();
    expect(result.current.planMetaRaw).toMatchObject({ id: 5 });
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Plan 2026');
    expect(result.current.error).toBeNull();
  });

  it('id inválido no consulta', async () => {
    router.params = { id: '0' };
    const { result } = await montar();
    expect(result.current.isInvalidId).toBe(true);
    expect(api.detalle.fetchPlanById).not.toHaveBeenCalled();
  });

  it('error del detalle limpia el estado y lo expone', async () => {
    api.detalle.fetchPlanById.mockResolvedValue({ success: false, error: 'No existe' });
    const { result } = await montar();
    expect(result.current.error).toBe('No existe');
    expect(result.current.plan).toBeNull();
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Detalle de plan');
  });

  it('si la matriz falla conserva el plan y vacía periodos y carrera', async () => {
    api.detalle.fetchMatriz.mockResolvedValue({ success: false });
    const { result } = await montar();
    expect(result.current.plan).toBeTruthy();
    expect(result.current.periodos).toEqual([]);
    expect(result.current.carrera).toBeNull();
    expect(result.current.planMetaRaw).toBeNull();
    expect(result.current.avatarInitials).toBe('PL');
  });

  it('navegación: volver, editar y editar periodo llevan el estado de retorno', async () => {
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'CFG' } };
    const { result } = await montar();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'CFG' } });
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenLastCalledWith(
      expect.stringContaining('/plan/5/editar'),
      { state: expect.objectContaining({ returnListPath: '/lista', returnDetailPath: expect.stringContaining('/plan/5') }) },
    );
    act(() => result.current.handleEditarPeriodo(7));
    expect(router.navigate).toHaveBeenLastCalledWith(expect.stringContaining('/plan/5/periodo/7/asignaturas'), expect.any(Object));
    const llamadas = router.navigate.mock.calls.length;
    act(() => result.current.handleEditarPeriodo(null));
    expect(router.navigate).toHaveBeenCalledTimes(llamadas);
  });

  it('handlePublicar marca vigente y recarga', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.handlePublicar(); });
    expect(api.detalle.marcarVigente).toHaveBeenCalledWith(5);
    expect(api.detalle.fetchPlanById).toHaveBeenCalledTimes(2);
    expect(result.current.publicando).toBe(false);
  });

  it('handlePublicar con error no recarga y libera el botón', async () => {
    api.detalle.marcarVigente.mockResolvedValue({ success: false, error: 'No' });
    const { result } = await montar();
    await act(async () => { await result.current.handlePublicar(); });
    expect(api.detalle.fetchPlanById).toHaveBeenCalledTimes(1);
    expect(result.current.publicando).toBe(false);
  });

  it('handleNuevaVersion delega en el hook de clonado con el id del plan', async () => {
    const { result } = await montar();
    act(() => result.current.handleNuevaVersion());
    expect(api.nuevaVersion.crearNuevaVersion).toHaveBeenCalledWith(5);
  });

  it('refetch recarga plan y matriz', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.refetch(); });
    expect(api.detalle.fetchMatriz).toHaveBeenCalledTimes(2);
  });
});
