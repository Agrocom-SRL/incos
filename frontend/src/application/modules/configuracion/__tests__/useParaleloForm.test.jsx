/**
 * useParaleloForm: ABM de paralelo maestro con select dinámico carrera → plan → periodo.
 * API HTTP, casos de uso y hooks de carreras/planes se simulan.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { App, Form } from 'antd';

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

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@api-client', () => ({ default: http }));
const handlers = vi.hoisted(() => ({ handleErrorResponse: vi.fn() }));
vi.mock('@api/responseHandler', () => ({
  handleSuccessResponse: (r) => r,
  handleErrorResponse: handlers.handleErrorResponse,
}));

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({
  useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }),
}));

const apis = vi.hoisted(() => ({
  carreras: { carreras: [], loading: false, error: null },
  planes: { planes: [], loading: false },
}));
vi.mock('@application-configuracion/academico/hooks/api/useCarrerasApi', () => ({ useCarrerasApi: () => apis.carreras }));
vi.mock('@application-configuracion/academico/hooks/api/usePlanesEstudiosApi', () => ({ usePlanesEstudiosApi: () => apis.planes }));

import { useParaleloForm } from '../recursos/hooks/state/useParaleloForm';

// Form.useWatch solo notifica con la instancia conectada a un <Form> y campos registrados: arnés mínimo.
const CAMPOS = ['carrera_id', 'plan_estudio_id', 'periodo_id', 'nombre', 'turno', 'descripcion'];
const renderHook = (callback) => {
  const result = { current: null };
  const registrar = (valor) => { result.current = valor; };
  const Arnes = () => {
    const valor = callback();
    registrar(valor);
    return (
      <Form form={valor.form}>
        {CAMPOS.map((name) => <Form.Item key={name} name={name} noStyle><input /></Form.Item>)}
      </Form>
    );
  };
  render(<App><Arnes /></App>);
  return { result };
};
const registrar = (nombre, ejecutar) => {
  casos[nombre] = () => ({ ejecutar });
  return ejecutar;
};
const PERIODOS_RESP = { success: true, data: { periodos: [{ id: 21, numero: 1, nombre: '1º Año' }, { id: 22, numero: 2, nombre: '2º Año' }] } };

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/', state: null };
  Object.keys(casos).forEach((k) => delete casos[k]);
  apis.carreras = { carreras: [{ id: 1, codigo: 'SIS', nombre: 'Sistemas' }, { id: 2, nombre: 'Contaduría' }], loading: false, error: null };
  apis.planes = {
    planes: [
      { id: 10, carrera_id: 1, nombre_plan: 'Plan 2020', vigente: false, activo: true },
      { id: 11, carrera_id: 1, nombre_plan: 'Plan 2026', vigente: true, activo: true },
      { id: 12, carrera_id: 1, nombre_plan: 'Plan inactivo', vigente: false, activo: false },
      { id: 20, carrera_id: 2, vigente: true, activo: true },
    ],
    loading: false,
  };
  http.get.mockResolvedValue(PERIODOS_RESP);
});

const montar = async (mode = 'create') => {
  const hook = renderHook(() => useParaleloForm(mode));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('useParaleloForm - modo crear', () => {
  it('título, permiso y opciones de carreras', async () => {
    const { result } = await montar();
    expect(result.current).toMatchObject({ pageTitle: 'Nuevo paralelo', permisoAccion: 'CREAR', isInvalidEditId: false });
    expect(result.current.resolveOptions('carreras')).toEqual([
      { value: 1, label: 'SIS — Sistemas' },
      { value: 2, label: 'Contaduría' },
    ]);
    expect(result.current.resolveOptions('otro')).toEqual([]);
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Nuevo paralelo');
  });

  it('elegir carrera con un único plan activo lo selecciona y carga sus periodos', async () => {
    const { result } = await montar();
    act(() => result.current.form.setFieldValue('carrera_id', 2));
    await waitFor(() => expect(result.current.periodos).toHaveLength(2));
    expect(http.get).toHaveBeenCalledWith(expect.stringContaining('20'));
    expect(result.current.planSeleccionado.id).toBe(20);
    expect(result.current.resolveOptions('periodos')).toBe(result.current.periodos);
    expect(result.current.sinPlanActivo).toBe(false);
  });

  it('con varios planes activos ordena vigente primero y exige elegir uno', async () => {
    const { result } = await montar();
    act(() => result.current.form.setFieldValue('carrera_id', 1));
    await waitFor(() => expect(result.current.planesDisponibles.map((p) => p.id)).toEqual([11, 10]));
    expect(result.current.planSeleccionado).toBeNull();
    expect(result.current.resolveOptions('planes')).toEqual([
      { value: 11, label: 'Plan 2026 · Vigente' },
      { value: 10, label: 'Plan 2020 · Activo' },
    ]);
    act(() => result.current.form.setFieldValue('plan_estudio_id', 10));
    await waitFor(() => expect(result.current.planSeleccionado?.id).toBe(10));
  });

  it('carrera sin planes activos activa sinPlanActivo', async () => {
    apis.planes = { planes: [], loading: false };
    const { result } = await montar();
    act(() => result.current.form.setFieldValue('carrera_id', 1));
    await waitFor(() => expect(result.current.sinPlanActivo).toBe(true));
  });

  it('si el endpoint de periodos viene vacío usa el detalle del plan', async () => {
    http.get
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: { plan_estudio: { periodos: [{ id: 31, numero: 1 }] } } });
    const { result } = await montar();
    act(() => result.current.form.setFieldValue('carrera_id', 2));
    await waitFor(() => expect(result.current.periodos).toHaveLength(1));
    expect(result.current.periodos[0]).toMatchObject({ value: 31, label: '1º año' });
  });

  it('un error al cargar periodos se reporta y deja la lista vacía', async () => {
    http.get.mockRejectedValue(new Error('red'));
    const { result } = await montar();
    act(() => result.current.form.setFieldValue('carrera_id', 2));
    await waitFor(() => expect(handlers.handleErrorResponse).toHaveBeenCalled());
    expect(result.current.periodos).toEqual([]);
  });

  it('crear: valida, llama al caso de uso y navega al detalle', async () => {
    const crear = registrar('crearParalelo', vi.fn().mockResolvedValue({ success: true, data: { paralelo: { id: 9 } } }));
    casos.crearParalelo = () => ({ ejecutar: crear });
    const { result } = await montar();
    result.current.form.validateFields = vi.fn().mockResolvedValue({ carrera_id: 1, periodo_id: 21, nombre: ' A ', turno: 'MAÑANA', descripcion: '' });
    await act(async () => { await result.current.handleSubmit(); });
    expect(crear).toHaveBeenCalledWith({ carrera_id: 1, periodo_id: 21, nombre: 'A', turno: 'MAÑANA', descripcion: null, activo: true });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('9'), { state: expect.any(Object) });
    expect(result.current.submitLoading).toBe(false);
  });

  it('crear: error del caso de uso queda en estado; validación fallida es silenciosa', async () => {
    const crear = vi.fn().mockResolvedValue({ success: false, error: 'Duplicado' });
    casos.crearParalelo = () => ({ ejecutar: crear });
    const { result } = await montar();
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: 'A' });
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.error).toBe('Duplicado');
    expect(router.navigate).not.toHaveBeenCalled();
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.error).toBeNull();
    expect(crear).toHaveBeenCalledTimes(1);
  });

  it('crear sin id devuelto vuelve al listado', async () => {
    casos.crearParalelo = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: true, data: {} }) });
    const { result } = await montar();
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: 'A' });
    await act(async () => { await result.current.handleSubmit(); });
    expect(router.navigate).toHaveBeenCalledWith(expect.any(String), undefined);
  });

  it('handleVolver conserva la clave del menú del estado', async () => {
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'CFG' } };
    const { result } = await montar();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/lista', { state: { menuSidebarKey: 'CFG' } });
  });
});

describe('useParaleloForm - modo editar', () => {
  beforeEach(() => {
    router.params = { id: '7' };
  });

  it('hidrata el formulario con carrera, plan único y periodo asignado', async () => {
    const obtener = registrar('obtenerParaleloPorId', vi.fn().mockResolvedValue({
      success: true, data: { paralelo: { id: 7, carreraId: 2, periodoId: 22, nombre: 'B', turno: 'TARDE' } },
    }));
    const { result } = await montar('edit');
    expect(obtener).toHaveBeenCalledWith(7);
    expect(result.current).toMatchObject({ pageTitle: 'Editar paralelo', permisoAccion: 'EDITAR', error: null });
    await waitFor(() => expect(result.current.form.getFieldValue('periodo_id')).toBe(22));
    expect(result.current.form.getFieldValue('nombre')).toBe('B');
    expect(result.current.form.getFieldValue('plan_estudio_id')).toBe(20);
  });

  it('con varios planes activos resuelve cuál contiene el periodo asignado', async () => {
    registrar('obtenerParaleloPorId', vi.fn().mockResolvedValue({ success: true, data: { carrera_id: 1, periodo_id: 22, nombre: 'C' } }));
    http.get.mockImplementation(async (url) => (String(url).includes('11')
      ? { success: true, data: { periodos: [{ id: 99, numero: 1 }] } }
      : PERIODOS_RESP));
    const { result } = await montar('edit');
    await waitFor(() => expect(result.current.form.getFieldValue('plan_estudio_id')).toBe(10));
    await waitFor(() => expect(result.current.form.getFieldValue('periodo_id')).toBe(22));
  });

  it('error de carga se expone', async () => {
    registrar('obtenerParaleloPorId', vi.fn().mockResolvedValue({ success: false, error: 'No existe' }));
    const { result } = await montar('edit');
    expect(result.current.error).toBe('No existe');
  });

  it('id inválido no consulta', async () => {
    router.params = { id: 'abc' };
    const obtener = registrar('obtenerParaleloPorId', vi.fn());
    const { result } = await montar('edit');
    expect(result.current.isInvalidEditId).toBe(true);
    expect(obtener).not.toHaveBeenCalled();
  });

  it('espera a que terminen de cargar los planes antes de consultar', async () => {
    apis.planes = { planes: [], loading: true };
    const obtener = registrar('obtenerParaleloPorId', vi.fn().mockResolvedValue({ success: true, data: { carrera_id: 2 } }));
    renderHook(() => useParaleloForm('edit'));
    await new Promise((r) => setTimeout(r, 20));
    expect(obtener).not.toHaveBeenCalled();
  });

  it('actualizar pasa el id y navega a la ficha', async () => {
    registrar('obtenerParaleloPorId', vi.fn().mockResolvedValue({ success: true, data: { carrera_id: 2, periodo_id: 22 } }));
    const actualizar = vi.fn().mockResolvedValue({ success: true, data: { paralelo: { id: 7 } } });
    casos.actualizarParalelo = () => ({ ejecutar: actualizar });
    const { result } = await montar('edit');
    result.current.form.validateFields = vi.fn().mockResolvedValue({ carrera_id: 2, periodo_id: 22, nombre: 'B' });
    await act(async () => { await result.current.handleSubmit(); });
    expect(actualizar).toHaveBeenCalledWith(7, expect.objectContaining({ nombre: 'B' }));
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('7'), expect.any(Object));
  });
});
