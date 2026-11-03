import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const nav = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), isView: vi.fn() }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => nav.params,
  useNavigate: () => nav.navigate,
}));
vi.mock('@navigation/hooks/useRouteViewMode.js', () => ({ useRouteViewMode: () => ({ isView: nav.isView }) }));

const auth = vi.hoisted(() => ({ hasPermiso: vi.fn(), ajusteEditar: false }));
vi.mock('@application-auth', async (orig) => ({ ...(await orig()), useAuth: () => ({ hasPermiso: auth.hasPermiso }) }));
vi.mock('@application-shared/hooks', async (orig) => ({
  ...(await orig()),
  useAcciones: () => ({ puedeEditar: auth.ajusteEditar }),
}));

const repo = vi.hoisted(() => ({
  obtenerCuadernoBimestre: vi.fn(),
  crearEvaluacionCuaderno: vi.fn(),
  editarEvaluacionCuaderno: vi.fn(),
  eliminarEvaluacionCuaderno: vi.fn(),
  resetearNotasEvaluacionCuaderno: vi.fn(),
}));
vi.mock('@infrastructure/repositories/CalificacionRepository.js', () => ({ default: repo }));

const ctxMock = vi.hoisted(() => ({ cargar: vi.fn() }));
vi.mock('../../utils/cargarContextoCursoRegistro.js', () => ({ cargarContextoCursoRegistro: ctxMock.cargar }));

const cache = vi.hoisted(() => ({
  aplicar: vi.fn((estudiantes) => estudiantes),
  limpiar: vi.fn(),
  guardar: vi.fn(),
}));
vi.mock('../../utils/cuadernoLocalCache.js', () => ({
  aplicarNotasCacheAEstudiantes: cache.aplicar,
  clearNotasEvaluacionCache: cache.limpiar,
  saveEvaluacionesCache: cache.guardar,
}));

import { useCuadernoCurso } from '../useCuadernoCurso';

const registro = (over = {}) => ({
  docente: { id: 1, bimestreVigente: 2 },
  curso: { id: 5, materia: 'Matemática', paralelo: 'A', turno: 'MAÑANA', carrera: 'Sistemas', estudiantes: 2 },
  estudiantesBase: [{ id: 10, nombre: 'Ana' }, { id: 11, nombre: 'Beto' }],
  bimestreVigente: 2,
  bimestresCalendario: [
    { numero: 1, reabierto: false, editable: false },
    { numero: 2, reabierto: false, editable: true },
  ],
  gestionFechas: { fechaFin: '2026-12-01' },
  ...over,
});

const cuadernoOk = {
  success: true,
  data: { evaluaciones: [{ id: 100, nombre: 'Examen' }], notas: [], reabierto: false },
};

const montar = async () => {
  const hook = renderHook(() => useCuadernoCurso());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  nav.params = { asignacionId: '5', n: '2' };
  nav.isView.mockReturnValue(false);
  auth.hasPermiso.mockReturnValue(true);
  auth.ajusteEditar = false;
  ctxMock.cargar.mockResolvedValue(registro());
  repo.obtenerCuadernoBimestre.mockResolvedValue(cuadernoOk);
  cache.aplicar.mockImplementation((estudiantes) => estudiantes);
});

describe('useCuadernoCurso - carga', () => {
  it('compone curso, evaluaciones y estudiantes del bimestre de la URL', async () => {
    const { result } = await montar();
    expect(repo.obtenerCuadernoBimestre).toHaveBeenCalledWith('5', 2);
    expect(cache.guardar).toHaveBeenCalledWith('5', 2, cuadernoOk.data.evaluaciones);
    expect(result.current.curso).toMatchObject({ id: 5, materia: 'Matemática', carreraColor: '#196b45' });
    expect(result.current.evaluaciones).toHaveLength(1);
    expect(result.current.estudiantes.map((e) => e.id)).toEqual([10, 11]);
    expect(result.current).toMatchObject({
      bimestreActivo: 2, bimestreVigente: 2, gestionFechaFin: '2026-12-01', cursoId: '5', reabierto: false,
    });
    expect(result.current.tituloPagina).toMatch(/^Cuaderno · /);
    expect(result.current.volverPath).toContain('/5/notas');
    expect(result.current.breadcrumbItems).toBeTruthy();
  });

  it('sin bimestre en la URL usa el vigente del registro', async () => {
    nav.params = { asignacionId: '5' };
    const { result } = await montar();
    expect(repo.obtenerCuadernoBimestre).toHaveBeenCalledWith('5', 2);
    expect(result.current.bimestreActivo).toBe(2);
  });

  it('error del cuaderno se expone y deja el estado vacío', async () => {
    repo.obtenerCuadernoBimestre.mockResolvedValue({ success: false, error: 'falló API' });
    const { result } = await montar();
    expect(result.current.error).toBe('falló API');
    expect(result.current.curso).toBeNull();
    expect(result.current.estudiantes).toEqual([]);
  });

  it('curso inexistente redirige a mis cursos', async () => {
    ctxMock.cargar.mockRejectedValue(Object.assign(new Error('x'), { code: 'CURSO_NOT_FOUND' }));
    await montar();
    expect(nav.navigate).toHaveBeenCalledWith('/academico/calificaciones/mis-cursos', { replace: true });
  });

  it('cambiar de bimestre por URL recarga el cuaderno solicitado', async () => {
    const hook = await montar();
    nav.params = { asignacionId: '5', n: '1' };
    hook.rerender();
    await waitFor(() => expect(repo.obtenerCuadernoBimestre).toHaveBeenCalledWith('5', 1));
    await waitFor(() => expect(hook.result.current.bimestreActivo).toBe(1));
    expect(hook.result.current.isRefetching).toBe(false);
  });

  it('refetch vuelve a cargar contexto y cuaderno', async () => {
    const { result } = await montar();
    await act(() => result.current.refetch());
    expect(ctxMock.cargar).toHaveBeenCalledTimes(2);
    expect(repo.obtenerCuadernoBimestre).toHaveBeenCalledTimes(2);
  });
});

describe('useCuadernoCurso - permisos', () => {
  it('bimestre vigente con permisos habilita todas las acciones', async () => {
    const { result } = await montar();
    expect(result.current).toMatchObject({
      modoEdicion: true, puedeCrearEvaluacion: true, puedeEditarEvaluacion: true,
      puedeEliminarEvaluacion: true, puedeEditarNotas: true, puedeGuardarBimestre: true,
    });
  });

  it('bimestre cerrado no editable bloquea todo', async () => {
    nav.params = { asignacionId: '5', n: '1' };
    const { result } = await montar();
    expect(result.current.modoEdicion).toBe(false);
    expect(result.current.puedeEditarNotas).toBe(false);
  });

  it('bimestre reabierto lo habilita al ajuste administrativo sin permisos de docente', async () => {
    nav.params = { asignacionId: '5', n: '1' };
    ctxMock.cargar.mockResolvedValue(registro({
      bimestresCalendario: [{ numero: 1, reabierto: true }, { numero: 2, editable: true }],
    }));
    auth.hasPermiso.mockReturnValue(false);
    auth.ajusteEditar = true;
    const { result } = await montar();
    expect(result.current.reabierto).toBe(true);
    expect(result.current.puedeCrearEvaluacion).toBe(true);
    expect(result.current.puedeEliminarEvaluacion).toBe(false);
  });

  it('sin ningún permiso el modo edición es falso', async () => {
    auth.hasPermiso.mockReturnValue(false);
    const { result } = await montar();
    expect(result.current.modoEdicion).toBe(false);
  });
});

describe('useCuadernoCurso - evaluaciones', () => {
  it('crearEvaluacion agrega la nueva y persiste en caché', async () => {
    repo.crearEvaluacionCuaderno.mockResolvedValue({ success: true, data: { evaluacion: { id: 200 } } });
    const { result } = await montar();
    let nueva;
    await act(async () => { nueva = await result.current.crearEvaluacion({ nombre: 'Q' }); });
    expect(repo.crearEvaluacionCuaderno).toHaveBeenCalledWith('5', 2, { nombre: 'Q' });
    expect(nueva).toEqual({ id: 200 });
    expect(result.current.evaluaciones.map((e) => e.id)).toEqual([100, 200]);
  });

  it('crearEvaluacion lanza si la API rechaza', async () => {
    repo.crearEvaluacionCuaderno.mockResolvedValue({ success: false });
    const { result } = await montar();
    await expect(result.current.crearEvaluacion({})).rejects.toThrow('No se pudo crear la evaluación');
  });

  it('editarEvaluacion mezcla los cambios en la existente', async () => {
    repo.editarEvaluacionCuaderno.mockResolvedValue({ success: true, data: { nombre: 'Final' } });
    const { result } = await montar();
    let editada;
    await act(async () => { editada = await result.current.editarEvaluacion(100, { nombre: 'Final' }); });
    expect(editada).toEqual({ id: 100, nombre: 'Final' });
    expect(result.current.evaluaciones[0].nombre).toBe('Final');
  });

  it('editarEvaluacion lanza con el mensaje por defecto', async () => {
    repo.editarEvaluacionCuaderno.mockResolvedValue({ success: false });
    const { result } = await montar();
    await expect(result.current.editarEvaluacion(100, {})).rejects.toThrow('No se pudo actualizar la evaluación');
  });

  it('eliminarEvaluacion quita la evaluación, sus notas y limpia la caché', async () => {
    repo.eliminarEvaluacionCuaderno.mockResolvedValue({ success: true });
    repo.obtenerCuadernoBimestre.mockResolvedValue({
      success: true,
      data: { evaluaciones: [{ id: 100 }], notas: [{ estudianteId: 10, evaluacionId: 100, nota: 50 }] },
    });
    const { result } = await montar();
    await act(async () => { await result.current.eliminarEvaluacion(100); });
    expect(cache.limpiar).toHaveBeenCalledWith('5', 2, 100);
    expect(result.current.evaluaciones).toEqual([]);
    expect(result.current.estudiantes.every((e) => e.notas[100] === undefined)).toBe(true);
  });

  it('eliminarEvaluacion lanza si la API falla', async () => {
    repo.eliminarEvaluacionCuaderno.mockResolvedValue({ success: false, error: 'bloqueada' });
    const { result } = await montar();
    await expect(result.current.eliminarEvaluacion(100)).rejects.toThrow('bloqueada');
    expect(cache.limpiar).not.toHaveBeenCalled();
  });

  it('resetearNotasEvaluacion limpia las notas y valida la respuesta', async () => {
    repo.resetearNotasEvaluacionCuaderno.mockResolvedValueOnce({ success: true });
    const { result } = await montar();
    await act(async () => { await result.current.resetearNotasEvaluacion(100); });
    expect(cache.limpiar).toHaveBeenCalledWith('5', 2, 100);
    repo.resetearNotasEvaluacionCuaderno.mockResolvedValueOnce({ success: false });
    await expect(result.current.resetearNotasEvaluacion(100)).rejects.toThrow('No se pudieron restablecer las notas');
  });
});
