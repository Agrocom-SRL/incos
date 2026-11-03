/**
 * usePlanBuilder: builder en borrador de asignaturas/prerrequisitos de un periodo.
 * Nada viaja al backend hasta guardarCambios(), que aplica el diff en orden seguro.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({
  params: { id: '1', periodoId: '2' },
  navigate: vi.fn(),
  location: { pathname: '/', state: null },
}));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const api = vi.hoisted(() => ({ detalle: {}, materias: { materias: [], loading: false } }));
vi.mock('@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi', () => ({
  usePlanEstudiosDetalleApi: () => api.detalle,
}));
vi.mock('@application-configuracion/academico/hooks/api/useMateriasApi', () => ({
  useMateriasApi: () => api.materias,
}));

import { usePlanBuilder } from '../academico/hooks/state/usePlanBuilder';

const wrapper = ({ children }) => <App>{children}</App>;
const ok = (data = {}, extra = {}) => ({ success: true, data, ...extra });

const PERIODOS = [
  { id: 1, numero: 1, nombre: '1º Año', asignaturas: [{ id: 101, materia_id: 1, horas_semanales: 4, materia: { sigla: 'MAT', nombre: 'Matemática' } }] },
  { id: 2, numero: 2, nombre: '2º Año', asignaturas: [{ id: 102, materia_id: 2, horas_semanales: 6, materia: { sigla: 'FIS', nombre: 'Física' } }] },
  { id: 3, numero: 3, nombre: '3º Año', asignaturas: [{ id: 103, materia_id: 5, horas_semanales: 2, materia: { sigla: 'POS', nombre: 'Posterior' } }] },
];
const PRERREQS = [{ id: 50, asignatura_id: 102, prerrequisito_id: 101 }];
const MATERIAS = [
  { id: 1, sigla: 'MAT', nombre: 'Matemática' },
  { id: 2, sigla: 'FIS', nombre: 'Física' },
  { id: 3, sigla: 'QUI', nombre: 'Química' },
  { id: 4, sigla: 'OFF', nombre: 'Inactiva', activo: false },
  { id: 5, sigla: 'POS', nombre: 'Posterior' },
];

const armarApi = (over = {}) => {
  api.detalle = {
    fetchPlanById: vi.fn().mockResolvedValue(ok({ id: 1, nombre_plan: 'Plan', horas_semana: 10 }, { prerrequisitos: PRERREQS })),
    fetchMatriz: vi.fn().mockResolvedValue(ok({ periodos: PERIODOS })),
    eliminarPeriodo: vi.fn().mockResolvedValue({ success: true }),
    crearAsignaturaPlan: vi.fn().mockResolvedValue(ok({ id: 900 })),
    actualizarAsignatura: vi.fn().mockResolvedValue({ success: true }),
    eliminarAsignaturaPlan: vi.fn().mockResolvedValue({ success: true }),
    crearPrerrequisito: vi.fn().mockResolvedValue({ success: true }),
    eliminarPrerrequisito: vi.fn().mockResolvedValue({ success: true }),
    ...over,
  };
  api.materias = { materias: MATERIAS, loading: false };
};

const montar = async () => {
  const hook = renderHook(() => usePlanBuilder(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};
const catalogo = (hook, sigla) => hook.result.current.materiasCatalogo.find((m) => m.sigla === sigla);

beforeEach(() => {
  vi.clearAllMocks();
  router.params = { id: '1', periodoId: '2' };
  router.location = { pathname: '/', state: null };
  armarApi();
});

describe('usePlanBuilder - carga y derivados', () => {
  it('construye el borrador del periodo con sus prerrequisitos y horas', async () => {
    const { result } = await montar();
    expect(result.current.periodoNombre).toBe('2º Año');
    expect(result.current.tienePeriodosAnteriores).toBe(true);
    expect(result.current.draftFilas).toHaveLength(1);
    expect(result.current.draftFilas[0]).toMatchObject({
      asignaturaId: 102, sigla: 'FIS', horas: 6,
      prereqs: [{ id: 50, prerrequisitoId: 101, sigla: 'MAT', periodoNombre: '1º Año' }],
    });
    expect(result.current).toMatchObject({ horasAsignadas: 6, horasSemana: 10, horasDisponibles: 4, hayCambios: false });
    expect(result.current.breadcrumbItems.at(-1).title).toBe('2º Año');
  });

  it('el catálogo oculta inactivas y materias de periodos posteriores; marca prerrequisitos válidos', async () => {
    const hook = await montar();
    const siglas = hook.result.current.materiasCatalogo.map((m) => m.sigla);
    expect(siglas).toEqual(['MAT', 'FIS', 'QUI']);
    expect(catalogo(hook, 'MAT')).toMatchObject({ esPrerrequisitoValido: true, enPeriodoActual: false });
    expect(catalogo(hook, 'FIS')).toMatchObject({ enPeriodoActual: true, asignadaEn: null });
    expect(catalogo(hook, 'QUI').asignadaEn).toBeNull();
  });

  it('ids inválidos no consultan al backend', async () => {
    router.params = { id: '1', periodoId: 'x' };
    const { result } = await montar();
    expect(result.current.isInvalidId).toBe(true);
    expect(api.detalle.fetchPlanById).not.toHaveBeenCalled();
  });

  it('error de plan o de matriz se expone', async () => {
    armarApi({ fetchMatriz: vi.fn().mockResolvedValue({ success: false, error: 'sin matriz' }) });
    const { result } = await montar();
    expect(result.current.error).toBe('sin matriz');
    expect(result.current.plan).toBeNull();
  });

  it('periodo inexistente en el plan se marca como no encontrado', async () => {
    router.params = { id: '1', periodoId: '99' };
    const { result } = await montar();
    expect(result.current.periodoNoEncontrado).toBe(true);
    expect(result.current.periodoNombre).toBe('');
  });

  it('handleVolver navega a la ficha con el estado de retorno', async () => {
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'CFG' } };
    const { result } = await montar();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('/plan/1'), { state: { returnListPath: '/lista', menuSidebarKey: 'CFG' } });
  });
});

describe('usePlanBuilder - mutaciones del borrador', () => {
  it('agregarMateria añade una fila con horas acotadas al cupo y marca cambios', async () => {
    const hook = await montar();
    let agregada;
    act(() => { agregada = hook.result.current.agregarMateria(catalogo(hook, 'QUI')); });
    expect(agregada).toBe(true);
    const nueva = hook.result.current.draftFilas.at(-1);
    expect(nueva).toMatchObject({ key: 'new-3', asignaturaId: null, materiaId: 3, horas: 4 });
    expect(hook.result.current.hayCambios).toBe(true);
    expect(hook.result.current.horasDisponibles).toBe(0);
  });

  it('agregarMateria rechaza materia ya presente y periodo sin cupo', async () => {
    const hook = await montar();
    expect(hook.result.current.agregarMateria(catalogo(hook, 'FIS'))).toBe(false);
    act(() => { hook.result.current.agregarMateria(catalogo(hook, 'QUI')); });
    let segunda;
    act(() => { segunda = hook.result.current.agregarMateria({ id: 8, sigla: 'X', enPeriodoActual: false, asignadaEn: null }); });
    expect(segunda).toBe(false);
    expect(hook.result.current.draftFilas).toHaveLength(2);
  });

  it('cambiarHoras ignora null; quitarFila elimina; descartarCambios restaura', async () => {
    const hook = await montar();
    act(() => hook.result.current.cambiarHoras('srv-102', null));
    expect(hook.result.current.hayCambios).toBe(false);
    act(() => hook.result.current.cambiarHoras('srv-102', 3));
    expect(hook.result.current.draftFilas[0].horas).toBe(3);
    expect(hook.result.current.hayCambios).toBe(true);
    act(() => hook.result.current.quitarFila('srv-102'));
    expect(hook.result.current.draftFilas).toEqual([]);
    act(() => hook.result.current.descartarCambios());
    expect(hook.result.current.draftFilas).toHaveLength(1);
    expect(hook.result.current.hayCambios).toBe(false);
  });

  it('agregarPrerrequisito valida la materia y evita duplicados', async () => {
    const hook = await montar();
    act(() => hook.result.current.quitarPrerrequisito('srv-102', 'srv-prereq-50'));
    expect(hook.result.current.draftFilas[0].prereqs).toEqual([]);
    let r;
    act(() => { r = hook.result.current.agregarPrerrequisito('srv-102', catalogo(hook, 'QUI')); });
    expect(r).toBe(false);
    act(() => { r = hook.result.current.agregarPrerrequisito('srv-102', catalogo(hook, 'MAT')); });
    expect(r).toBe(true);
    act(() => { hook.result.current.agregarPrerrequisito('srv-102', catalogo(hook, 'MAT')); });
    expect(hook.result.current.draftFilas[0].prereqs).toHaveLength(1);
    expect(hook.result.current.draftFilas[0].prereqs[0]).toMatchObject({ id: null, prerrequisitoId: 101 });
  });

  it('moverPrerrequisito traslada entre filas y bloquea repetidos', async () => {
    const hook = await montar();
    act(() => { hook.result.current.agregarMateria(catalogo(hook, 'QUI')); });
    act(() => hook.result.current.moverPrerrequisito('srv-102', 'new-3', 'srv-prereq-50'));
    const [fis, qui] = hook.result.current.draftFilas;
    expect(fis.prereqs).toEqual([]);
    expect(qui.prereqs).toMatchObject([{ id: null, prerrequisitoId: 101, key: 'new-prereq-101' }]);
    // mismo origen y destino: sin cambios
    const antes = hook.result.current.draftFilas;
    act(() => hook.result.current.moverPrerrequisito('new-3', 'new-3', 'new-prereq-101'));
    expect(hook.result.current.draftFilas).toBe(antes);
  });
});

describe('usePlanBuilder - guardarCambios', () => {
  it('sin cambios aplica solo la recarga; con cambios ejecuta el diff completo', async () => {
    const hook = await montar();
    act(() => hook.result.current.cambiarHoras('srv-102', 3));
    act(() => { hook.result.current.agregarMateria(catalogo(hook, 'QUI')); });
    act(() => { hook.result.current.agregarPrerrequisito('new-3', catalogo(hook, 'MAT')); });
    let ok1;
    await act(async () => { ok1 = await hook.result.current.guardarCambios(); });
    expect(ok1).toBe(true);
    expect(api.detalle.actualizarAsignatura).toHaveBeenCalledWith(102, { horas_semanales: 3 });
    expect(api.detalle.crearAsignaturaPlan).toHaveBeenCalledWith({ plan_estudio_id: 1, periodo_id: 2, materia_id: 3, horas_semanales: 4 });
    expect(api.detalle.crearPrerrequisito).toHaveBeenCalledWith({ plan_estudio_id: 1, asignatura_id: 900, prerrequisito_id: 101 });
    expect(api.detalle.fetchPlanById).toHaveBeenCalledTimes(2);
    expect(hook.result.current.guardando).toBe(false);
  });

  it('baja de una asignatura elimina primero sus prerrequisitos', async () => {
    const hook = await montar();
    act(() => hook.result.current.quitarFila('srv-102'));
    await act(async () => { await hook.result.current.guardarCambios(); });
    const orden = [
      api.detalle.eliminarPrerrequisito.mock.invocationCallOrder[0],
      api.detalle.eliminarAsignaturaPlan.mock.invocationCallOrder[0],
    ];
    expect(api.detalle.eliminarPrerrequisito).toHaveBeenCalledWith(50);
    expect(api.detalle.eliminarAsignaturaPlan).toHaveBeenCalledWith(102);
    expect(orden[0]).toBeLessThan(orden[1]);
  });

  it('quitar un prerrequisito de una fila conservada solo borra el prerrequisito', async () => {
    const hook = await montar();
    act(() => hook.result.current.quitarPrerrequisito('srv-102', 'srv-prereq-50'));
    await act(async () => { await hook.result.current.guardarCambios(); });
    expect(api.detalle.eliminarPrerrequisito).toHaveBeenCalledWith(50);
    expect(api.detalle.eliminarAsignaturaPlan).not.toHaveBeenCalled();
  });

  it('si el alta no devuelve id resuelve la asignatura releyendo la matriz', async () => {
    api.detalle.crearAsignaturaPlan.mockResolvedValue(ok(null));
    const hook = await montar();
    act(() => hook.result.current.cambiarHoras('srv-102', 2));
    act(() => { hook.result.current.agregarMateria(catalogo(hook, 'QUI')); });
    act(() => { hook.result.current.agregarPrerrequisito('new-3', catalogo(hook, 'MAT')); });
    api.detalle.fetchMatriz.mockResolvedValue(ok({
      periodos: [PERIODOS[0], { ...PERIODOS[1], asignaturas: [...PERIODOS[1].asignaturas, { id: 777, materia_id: 3, materia: { sigla: 'QUI' } }] }],
    }));
    await act(async () => { await hook.result.current.guardarCambios(); });
    expect(api.detalle.crearPrerrequisito).toHaveBeenCalledWith(expect.objectContaining({ asignatura_id: 777 }));
  });

  it('un fallo de la API aborta, devuelve false y recarga el servidor', async () => {
    api.detalle.actualizarAsignatura.mockResolvedValue({ success: false, error: 'tope' });
    const hook = await montar();
    act(() => hook.result.current.cambiarHoras('srv-102', 2));
    let res;
    await act(async () => { res = await hook.result.current.guardarCambios(); });
    expect(res).toBe(false);
    expect(api.detalle.fetchPlanById).toHaveBeenCalledTimes(2);
    expect(hook.result.current.guardando).toBe(false);
  });
});

describe('usePlanBuilder - eliminar periodo', () => {
  it('elimina el periodo y vuelve a la ficha', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.handleEliminarPeriodo(); });
    expect(api.detalle.eliminarPeriodo).toHaveBeenCalledWith(2);
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('/plan/1'), expect.any(Object));
    expect(result.current.guardando).toBe(false);
  });

  it('si falla no navega', async () => {
    api.detalle.eliminarPeriodo.mockResolvedValue({ success: false, error: 'con datos' });
    const { result } = await montar();
    await act(async () => { await result.current.handleEliminarPeriodo(); });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(result.current.guardando).toBe(false);
  });
});
