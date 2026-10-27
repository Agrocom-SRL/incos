import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  showMessage: vi.fn(),
  create: { createAsignarBeca: vi.fn(), loading: false, error: 'eC', validationErrors: ['vC'] },
  becasApi: { becasAsignadas: null, loading: false, error: null, refetch: vi.fn() },
  delBeca: vi.fn(),
  becasDesc: { becasDescuentos: [], loading: false, error: null, refetch: vi.fn(), selectedBecaDescuento: { id: 3 }, handleSelectBeca: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), useMessage: () => R.showMessage }));
vi.mock('@navigation-services/routeMapper', () => ({ MENU_SIDEBAR_KEY_MAT_APORTES: 'aportes' }));
vi.mock('@application-matricula/becas/hooks/api/useCreateAsignarBeca', () => ({ useCreateAsignarBeca: () => R.create }));
vi.mock('@application-matricula/admision/hooks/api/useDeleteBecaAsignada', () => ({
  useDeleteBecaAsignada: () => ({ deleteBecaAsignada: R.delBeca, loading: false }),
}));
vi.mock('@application-matricula/becas/hooks/api/useBecasAsignadasApi', () => ({
  useBecasAsignadasApi: () => R.becasApi,
  becasAsignadasListFetchParams: () => ({ params: { page: 1 } }),
}));
vi.mock('@application-matricula/becas/hooks/features/useAsignarBecaBecasDescuentos', () => ({ useAsignarBecaBecasDescuentos: () => R.becasDesc }));

import { useAsignarBecaFormHandlers } from '../hooks/features/useAsignarBecaFormHandlers';
import { useAsignarBecaPageData } from '../hooks/features/useAsignarBecaPageData';
import { useBecasData } from '../hooks/state/useBecasData';
import { useAsignarBecaData } from '../hooks/state/useAsignarBecaData';

const conRuta = (state) => ({ children }) => (
  <MemoryRouter initialEntries={[{ pathname: '/becas', state }]}>{children}</MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  R.create.createAsignarBeca.mockResolvedValue({ success: true, data: {} });
  R.delBeca.mockResolvedValue({ success: true });
  R.becasApi = { becasAsignadas: null, loading: false, error: null, refetch: vi.fn() };
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('useAsignarBecaFormHandlers', () => {
  const beca = { id: 3 };

  it('exige estudiante y beca antes de enviar', async () => {
    const sinEstudiante = renderHook(() => useAsignarBecaFormHandlers(null, { selectedBecaDescuento: beca }), { wrapper: conRuta() });
    let r;
    await act(async () => {
      r = await sinEstudiante.result.current.handleFinish({});
    });
    expect(r.error).toBe('Debe seleccionar un estudiante');
    const sinBeca = renderHook(() => useAsignarBecaFormHandlers(1), { wrapper: conRuta() });
    await act(async () => {
      r = await sinBeca.result.current.handleFinish({});
    });
    expect(r.error).toBe('Debe seleccionar una beca o descuento');
    expect(R.showMessage).toHaveBeenCalledTimes(2);
    expect(R.create.createAsignarBeca).not.toHaveBeenCalled();
  });

  it('asigna la beca y vuelve a donde indica la ruta, o a registrar pago', async () => {
    const vuelta = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), {
      wrapper: conRuta({ returnTo: '/estudiantes/1', returnState: { studentId: 1 } }),
    });
    await act(async () => vuelta.result.current.handleFinish({ observaciones: 'ok' }));
    expect(R.create.createAsignarBeca).toHaveBeenCalledWith({ student_id: 1, beca_descuento_id: 3, observaciones: 'ok' });
    expect(R.showMessage).toHaveBeenCalledWith('success', 'Beca asignada correctamente');
    expect(R.navigate).toHaveBeenCalledWith('/estudiantes/1', { replace: true, state: { studentId: 1 } });
    expect(vuelta.result.current.asignarBecaResult.success).toBe(true);

    const sinEstado = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), { wrapper: conRuta({ returnTo: '/x' }) });
    await act(async () => sinEstado.result.current.handleFinish());
    expect(R.navigate).toHaveBeenLastCalledWith('/x', { replace: true, state: { studentId: 1 } });

    const sinRuta = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), { wrapper: conRuta() });
    await act(async () => sinRuta.result.current.handleFinish({}, { id: 8 }));
    expect(R.create.createAsignarBeca).toHaveBeenLastCalledWith(expect.objectContaining({ beca_descuento_id: 8, observaciones: null }));
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/registrar', { replace: true, state: { studentId: 1, menuSidebarKey: 'aportes' } });
  });

  it('beca del 100 % lleva directo al pago generado', async () => {
    R.create.createAsignarBeca.mockResolvedValue({ success: true, data: { esBeca100: true, pagoAporteId: 77 } });
    const { result } = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), { wrapper: conRuta({ returnState: { menuSidebarKey: 'm' } }) });
    await act(async () => result.current.handleFinish({}));
    expect(R.navigate).toHaveBeenCalledWith('/pagos/77', { replace: true, state: { studentId: 1, fromBeca100: true, menuSidebarKey: 'm' } });
    const sinClave = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), { wrapper: conRuta() });
    await act(async () => sinClave.result.current.handleFinish({}));
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/77', expect.objectContaining({ state: expect.objectContaining({ menuSidebarKey: 'aportes' }) }));
  });

  it('errores del servicio se muestran sin navegar', async () => {
    const { result } = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca }), { wrapper: conRuta() });
    R.create.createAsignarBeca.mockResolvedValueOnce({ success: false, error: { message: 'Duplicada' } });
    await act(async () => result.current.handleFinish({}));
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Duplicada');
    R.create.createAsignarBeca.mockResolvedValueOnce({ success: false, error: {} });
    await act(async () => result.current.handleFinish({}));
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Error al asignar la beca');
    R.create.createAsignarBeca.mockResolvedValueOnce({ success: false, error: 'Texto' });
    await act(async () => result.current.handleFinish({}));
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Texto');
    expect(R.navigate).not.toHaveBeenCalled();
    expect(result.current.asignarBecaResult).toBeNull();
    expect(result.current.error).toBe('eC');
    expect(result.current.validationErrors).toEqual(['vC']);
  });

  it('edición: elimina la asignación actual y luego crea la nueva', async () => {
    const edit = { id: 5, observations: 'previa' };
    const { result } = renderHook(() => useAsignarBecaFormHandlers(1, { selectedBecaDescuento: beca, editBecaAsignada: edit }), { wrapper: conRuta() });
    expect(result.current.form.getFieldValue('observaciones')).toBe('previa');
    await act(async () => result.current.handleFinish({ observaciones: 'nueva' }));
    expect(R.delBeca).toHaveBeenCalledWith(5);
    expect(R.showMessage).toHaveBeenCalledWith('success', 'Asignación de beca actualizada correctamente');
    R.delBeca.mockResolvedValueOnce({ success: false, error: 'No se pudo' });
    let r;
    await act(async () => {
      r = await result.current.handleFinish({});
    });
    expect(r.success).toBe(false);
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'No se pudo');
    R.create.createAsignarBeca.mockResolvedValueOnce({ success: false, error: {} });
    await act(async () => result.current.handleFinish({}));
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Error al actualizar la asignación de beca');
  });

  it('los valores del formulario se leen con tolerancia a fallos', () => {
    const { result } = renderHook(() => useAsignarBecaFormHandlers(1), { wrapper: conRuta() });
    expect(result.current.getFormValues()).toEqual({});
  });
});

describe('useAsignarBecaPageData', () => {
  const render = (options, state) => renderHook(() => useAsignarBecaPageData(options), { wrapper: conRuta(state) }).result.current;

  it('título y migas según el modo', () => {
    expect(render({}).pageTitle).toBe('Asignar beca');
    expect(render({ studentName: 'Ana' }).pageTitle).toBe('Asignar beca - Ana');
    expect(render({ studentName: 'Ana', isEditMode: true }).pageTitle).toBe('Editar asignación de beca - Ana');
    expect(render({ isEditMode: true }).breadcrumbItems.at(-1).title).toBe('Editar asignación de beca');
  });

  it('volver respeta el origen, en orden de prioridad', () => {
    const volver = (options, state) => {
      const r = render(options, state);
      act(() => r.handleVolver());
      return R.navigate.mock.calls.at(-1);
    };
    expect(volver({ studentId: 1 }, { returnTo: '/a', returnState: { z: 1 } })).toEqual(['/a', { state: { z: 1 } }]);
    expect(volver({ studentId: 1 }, { returnTo: '/a' })).toEqual(['/a', { state: { studentId: 1 } }]);
    expect(volver({}, { returnTo: '/a' })).toEqual(['/a', { state: undefined }]);
    expect(volver({}, { returnSelectionPath: '/sel', menuSidebarKey: 'k' })).toEqual(['/sel', { state: { menuSidebarKey: 'k' } }]);
    expect(volver({}, { returnListPath: '/lista' })).toEqual(['/lista', { state: undefined }]);
    expect(volver({ studentId: 4 }, {})).toEqual(['/estudiantes/4']);
    expect(volver({}, {})).toEqual(['/estudiantes/listar']);
  });
});

describe('useBecasData', () => {
  it('toma becas de la respuesta paginada o de una lista simple', async () => {
    const { result, rerender } = renderHook(() => useBecasData());
    R.becasApi = { ...R.becasApi, becasAsignadas: { becas: [{ id: 1 }, { id: 2 }], total: 2, page: 1, limit: 10, totalPages: 1 } };
    rerender();
    expect(result.current.becas).toHaveLength(2);
    expect(result.current.pagination).toEqual({ total: 2, page: 1, limit: 10, totalPages: 1 });
    R.becasApi = { ...R.becasApi, becasAsignadas: { becas: [{ id: 1 }] } };
    rerender();
    expect(result.current.pagination).toEqual({ total: 0, page: 1, limit: 50, totalPages: 0 });
    R.becasApi = { ...R.becasApi, becasAsignadas: [{ id: 9 }] };
    rerender();
    expect(result.current.becas).toEqual([{ id: 9 }]);
    R.becasApi = { ...R.becasApi, becasAsignadas: { otra: 1 } };
    rerender();
    expect(result.current.becas).toEqual([{ id: 9 }]);
  });

  it('altas, cambios, bajas, borrado remoto y recarga', async () => {
    const { result } = renderHook(() => useBecasData());
    act(() => result.current.addBeca({ id: 1 }));
    act(() => result.current.addBeca({ id: 1 }));
    act(() => result.current.addBeca({ id: 2 }));
    act(() => result.current.updateBeca({ id: 1, x: 1 }));
    expect(result.current.becas).toEqual([{ id: 2 }, { id: 1, x: 1 }]);
    act(() => result.current.removeBeca(2));
    await act(async () => result.current.deleteBeca(1));
    expect(R.delBeca).toHaveBeenCalledWith(1);
    expect(result.current.becas).toEqual([]);
    R.delBeca.mockResolvedValueOnce({ success: false });
    act(() => result.current.addBeca({ id: 5 }));
    await act(async () => result.current.deleteBeca(5));
    expect(result.current.becas).toHaveLength(1);
    await act(async () => result.current.refetch());
    expect(R.becasApi.refetch).toHaveBeenLastCalledWith({ params: { page: 1 } });
    await act(async () => result.current.refetch({ params: { page: 2 } }));
    expect(R.becasApi.refetch).toHaveBeenLastCalledWith({ params: { page: 2 } });
  });
});

describe('useAsignarBecaData', () => {
  it('compone página, formulario y becas, y envía la beca elegida', async () => {
    const { result } = renderHook(() => useAsignarBecaData(1, { studentName: 'Ana' }), { wrapper: conRuta({ returnTo: '/x' }) });
    expect(result.current).toMatchObject({ studentId: 1, isEditMode: false, pageTitle: 'Asignar beca - Ana' });
    expect(result.current.becasDescuentosData.selectedBecaDescuento).toEqual({ id: 3 });
    await act(async () => result.current.handleFinish({ observaciones: 'x' }));
    expect(R.create.createAsignarBeca).toHaveBeenCalledWith(expect.objectContaining({ beca_descuento_id: 3 }));
    const edit = renderHook(() => useAsignarBecaData(1, { editBecaAsignada: { id: 4, scholarshipId: 3 } }), { wrapper: conRuta() });
    expect(edit.result.current.isEditMode).toBe(true);
  });
});
