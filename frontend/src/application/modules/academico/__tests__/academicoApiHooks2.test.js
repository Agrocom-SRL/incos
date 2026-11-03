import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => {
  const auto = () => new Proxy({}, { get: (t, p) => (p in t ? t[p] : (t[p] = vi.fn())) });
  return { casos: {}, calif: auto(), libro: auto(), est: auto(), downloadBlob: vi.fn() };
});
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@infrastructure/repositories/CalificacionRepository.js', () => ({ default: R.calif }));
vi.mock('@infrastructure/repositories/LibroRegistroRepository.js', () => ({ default: R.libro }));
vi.mock('@infrastructure/repositories/EstudianteRepository.js', () => ({ default: R.est }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));

import { useAbrirLibroApi } from '../libros/hooks/api/useAbrirLibroApi';
import { useCambiarEstadoFolioApi } from '../libros/hooks/api/useCambiarEstadoFolioApi';
import { useEditarFolioEstudianteApi } from '../libros/hooks/api/useEditarFolioEstudianteApi';
import { useEditarLibroApi } from '../libros/hooks/api/useEditarLibroApi';
import { useGenerarFoliosGestion } from '../libros/hooks/api/useGenerarFoliosGestion';
import { useProgramarNivelacion } from '../nivelaciones/hooks/api/useProgramarNivelacion';
import { useRegistrarDecisionAdministrativa } from '../nivelaciones/hooks/api/useRegistrarDecisionAdministrativa';
import { useRegistrarEventoHistorial } from '../nivelaciones/hooks/api/useRegistrarEventoHistorial';
import { useRegistrarResultadoNivelacion } from '../nivelaciones/hooks/api/useRegistrarResultadoNivelacion';
import { useExportBoletinEstudiante } from '../centralizador/hooks/api/useExportBoletinEstudiante';
import { useExportCentralizadorAnualExcel } from '../centralizador/hooks/api/useExportCentralizadorAnualExcel';
import { useExportCentralizadorExcel } from '../centralizador/hooks/api/useExportCentralizadorExcel';
import { useExportLibroExcel } from '../libros/hooks/api/useExportLibroExcel';
import { useBuscarEstudiantesHistorial } from '../historial/hooks/api/useBuscarEstudiantesHistorial';
import { useMiEstudianteId } from '../historial/hooks/api/useMiEstudianteId';

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(R.casos).forEach((k) => delete R.casos[k]);
});

// Hooks "use case" con { fn, loading, error }: éxito, rechazo y excepción.
const WRAPPERS = [
  ['abrirLibro', useAbrirLibroApi, 'abrirLibro', 'abrirLibro', [{ a: 1 }], 'No se pudo abrir el libro de registro', 'Error inesperado al abrir el libro de registro'],
  ['cambiarEstadoFolio', useCambiarEstadoFolioApi, 'cambiarEstadoFolio', 'cambiarEstadoFolio', [1, 2, { e: 'ANULADO' }], 'No se pudo cambiar el estado del folio', 'Error inesperado al cambiar el estado del folio'],
  ['editarFolioEstudiante', useEditarFolioEstudianteApi, 'editarFolioEstudiante', 'editarFolioEstudiante', [1, 2, 3, {}], 'No se pudo actualizar la fila del folio', 'Error inesperado al actualizar la fila del folio'],
  ['editarLibro', useEditarLibroApi, 'editarLibro', 'editarLibro', [1, {}], 'No se pudo actualizar el libro de registro', 'Error inesperado al actualizar el libro de registro'],
  ['generarFoliosGestion', useGenerarFoliosGestion, 'generarFoliosGestion', 'generarFoliosGestion', [1, {}], 'No se pudieron generar los folios de la gestión', 'Error inesperado al generar los folios de la gestión'],
  ['programar', useProgramarNivelacion, 'programar', 'programarNivelacion', [{}], 'No se pudo programar el examen de nivelación', 'Error inesperado al programar el examen de nivelación'],
  ['registrarDecision', useRegistrarDecisionAdministrativa, 'registrarDecision', 'registrarDecisionAdministrativaNivelacion', [{}], 'No se pudo registrar la decisión administrativa', 'Error inesperado al registrar la decisión administrativa'],
  ['registrarEvento', useRegistrarEventoHistorial, 'registrarEvento', 'registrarEventoHistorialNivelacion', [{}], 'No se pudo registrar el evento', 'Error inesperado al registrar el evento'],
  ['registrarResultado', useRegistrarResultadoNivelacion, 'registrarResultado', 'registrarResultadoNivelacion', [1, {}], 'No se pudo registrar el resultado del examen', 'Error inesperado al registrar el resultado del examen'],
];

describe.each(WRAPPERS)('%s', (_n, hook, fn, useCase, args, errorRechazo, errorExcepcion) => {
  it('devuelve éxito con los datos', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, data: { id: 1 } });
    R.casos[useCase] = () => ({ ejecutar });
    const { result } = renderHook(() => hook());
    let r;
    await act(async () => {
      r = await result.current[fn](...args);
    });
    expect(ejecutar).toHaveBeenCalledWith(...args);
    expect(r.success).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  it('propaga el rechazo del use case', async () => {
    R.casos[useCase] = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false }) });
    const { result } = renderHook(() => hook());
    let r;
    await act(async () => {
      r = await result.current[fn](...args);
    });
    expect(r).toMatchObject({ success: false, error: errorRechazo });
    expect(result.current.error).toBe(errorRechazo);
  });
  it('captura excepciones', async () => {
    R.casos[useCase] = () => ({ ejecutar: vi.fn().mockRejectedValue({}) });
    const { result } = renderHook(() => hook());
    let r;
    await act(async () => {
      r = await result.current[fn](...args);
    });
    expect(r.error).toBe(errorExcepcion);
  });
});

describe('exportaciones del centralizador y libros', () => {
  const blob = new Blob(['x']);
  it('boletín del estudiante', async () => {
    const { result } = renderHook(() => useExportBoletinEstudiante());
    expect((await result.current.exportar(null, 1)).success).toBe(false);
    R.calif.descargarBoletinEstudiante.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.exportar(1, 2);
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'Boletin.pdf');
    R.calif.descargarBoletinEstudiante.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await result.current.exportar(1, 2)).error).toBe('No se pudo generar el boletín');
    });
    R.calif.descargarBoletinEstudiante.mockRejectedValueOnce({});
    await act(async () => {
      expect((await result.current.exportar(1, 2)).error).toBe('Error al exportar el boletín');
    });
    expect(result.current.descargandoId).toBeNull();
  });
  it('centralizador anual', async () => {
    const { result } = renderHook(() => useExportCentralizadorAnualExcel());
    expect((await result.current.exportar(0)).error).toBe('Paralelo inválido');
    R.calif.descargarCentralizadorAnualExcel.mockResolvedValueOnce({ success: true, blob, fileName: 'a.xlsx' });
    await act(async () => {
      await result.current.exportar(3);
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'a.xlsx');
    R.calif.descargarCentralizadorAnualExcel.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      expect((await result.current.exportar(3)).error).toBe('No');
    });
    R.calif.descargarCentralizadorAnualExcel.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      expect((await result.current.exportar(3)).error).toBe('Red');
    });
  });
  it('centralizador por bimestre y por carrera', async () => {
    const { result } = renderHook(() => useExportCentralizadorExcel());
    expect((await result.current.exportar(3)).error).toMatch(/inválido/);
    expect((await result.current.exportarCarrera(null, 1)).error).toMatch(/inválido/);
    R.calif.descargarCentralizadorExcel.mockResolvedValueOnce({ success: true, blob });
    R.calif.descargarCentralizadorCarreraExcel.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.exportar(3, 1);
      await result.current.exportarCarrera(3, 1);
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'centralizador.xlsx');
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'centralizador_carrera.xlsx');
    R.calif.descargarCentralizadorExcel.mockResolvedValueOnce({ success: false });
    R.calif.descargarCentralizadorCarreraExcel.mockRejectedValueOnce({});
    await act(async () => {
      expect((await result.current.exportar(3, 1)).error).toBe('No se pudo generar el archivo');
      expect((await result.current.exportarCarrera(3, 1)).error).toBe('Error al exportar');
    });
    R.calif.descargarCentralizadorExcel.mockRejectedValueOnce(new Error('Red'));
    R.calif.descargarCentralizadorCarreraExcel.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      expect((await result.current.exportar(3, 1)).error).toBe('Red');
      expect((await result.current.exportarCarrera(3, 1)).error).toBe('No');
    });
  });
  it('libro de registro a Excel', async () => {
    const { result } = renderHook(() => useExportLibroExcel());
    expect((await result.current.exportar(null)).error).toBe('Libro inválido');
    R.libro.exportar.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.exportar(3, 2);
    });
    expect(R.libro.exportar).toHaveBeenCalledWith(3, 2);
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'libro_registro.xlsx');
    R.libro.exportar.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await result.current.exportar(3)).error).toBe('No se pudo generar el archivo');
    });
    R.libro.exportar.mockRejectedValueOnce({});
    await act(async () => {
      expect((await result.current.exportar(3)).error).toBe('Error al exportar');
    });
  });
});

describe('historial', () => {
  it('búsqueda con debounce', async () => {
    vi.useFakeTimers();
    R.est.buscar.mockResolvedValue({ success: true, data: { student: [{ id: 1, nombres: 'Juan', apellidoPaterno: 'Pérez' }, {}] } });
    const { result } = renderHook(() => useBuscarEstudiantesHistorial());
    act(() => result.current.buscar('j'));
    act(() => result.current.buscar('ju'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.estudiantes).toHaveLength(1);
    R.est.buscar.mockResolvedValue({ success: false, errorDetails: { code: 'NOT_FOUND' } });
    act(() => result.current.buscar('zz'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.error).toBeNull();
    R.est.buscar.mockResolvedValue({ success: false });
    act(() => result.current.buscar('zz'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.error).toMatch(/No se pudieron buscar/);
    act(() => result.current.limpiar());
    expect(result.current.estudiantes).toEqual([]);
    vi.useRealTimers();
  });
  it('mi estudiante id', async () => {
    R.est.obtenerMisDatos.mockResolvedValueOnce({ success: true, data: { student: { id: 9 } } });
    const { result } = renderHook(() => useMiEstudianteId());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.estudianteId).toBe(9);
    R.est.obtenerMisDatos.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('No');
    R.est.obtenerMisDatos.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('Red');
  });
});
