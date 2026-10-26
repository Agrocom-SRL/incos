import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => {
  const auto = () => new Proxy({}, { get: (t, p) => (p in t ? t[p] : (t[p] = vi.fn())) });
  return {
    alerta: auto(), panel: auto(), sesion: auto(), asistencia: auto(), avance: auto(), desercion: auto(),
    http: { get: vi.fn() }, casos: {}, downloadBlob: vi.fn(),
  };
});
vi.mock('@implementations/AlertaRiesgoRepository', () => ({ default: R.alerta }));
vi.mock('@implementations/PanelAcompanamientoRepository', () => ({ default: R.panel }));
vi.mock('@implementations/SesionRefuerzoRepository', () => ({ default: R.sesion }));
vi.mock('@infrastructure/repositories/AsistenciaRepository.js', () => ({ default: R.asistencia }));
vi.mock('@infrastructure/repositories/AvanceAcademicoRepository.js', () => ({ default: R.avance }));
vi.mock('@infrastructure/repositories/DesercionRepository.js', () => ({ default: R.desercion }));
vi.mock('@api-client', () => ({ default: R.http }));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));

import { useAlertasRiesgoApi } from '../acompanamiento/alertas/hooks/api/useAlertasRiesgoApi';
import { useGetAlertaEstudiante } from '../acompanamiento/alertas/hooks/api/useGetAlertaEstudiante';
import { useMisAlumnosEnRiesgoApi } from '../acompanamiento/alertas/hooks/api/useMisAlumnosEnRiesgoApi';
import { useExportarPanelPdf } from '../acompanamiento/panel/hooks/api/useExportarPanelPdf';
import { usePanelAcompanamientoApi } from '../acompanamiento/panel/hooks/api/usePanelAcompanamientoApi';
import { useAsignacionesCatalogoAcaApi } from '../acompanamiento/sesiones/hooks/api/useAsignacionesCatalogoAcaApi';
import { useAulasCatalogoAcaApi } from '../acompanamiento/sesiones/hooks/api/useAulasCatalogoAcaApi';
import { useGetSesionRefuerzo } from '../acompanamiento/sesiones/hooks/api/useGetSesionRefuerzo';
import { useSesionRefuerzoMutations } from '../acompanamiento/sesiones/hooks/api/useSesionRefuerzoMutations';
import { useSesionesRefuerzoApi } from '../acompanamiento/sesiones/hooks/api/useSesionesRefuerzoApi';
import { useBulkAsistenciaApi } from '../asistencia/hooks/api/useBulkAsistenciaApi';
import { useExportConsolidadoAsistenciaExcel } from '../asistencia/hooks/api/useExportConsolidadoAsistenciaExcel';
import { useInscripcionVigenteApi } from '../asistencia/hooks/api/useInscripcionVigenteApi';
import { useRegistroCierreApi } from '../asistencia/hooks/api/useRegistroCierreApi';
import { useSesionEspecialApi } from '../asistencia/hooks/api/useSesionEspecialApi';
import { useExportAvanceAcademicoExcel } from '../avance/hooks/api/useExportAvanceAcademicoExcel';
import { useExportDesercionExcel } from '../avance/hooks/api/useExportDesercionExcel';

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(R.casos).forEach((k) => delete R.casos[k]);
});

describe('acompañamiento: alertas y panel', () => {
  it('lista de alertas', async () => {
    const { result } = renderHook(() => useAlertasRiesgoApi());
    R.alerta.obtenerAlertas.mockResolvedValueOnce({ success: true, data: { alertasRiesgo: [{ estudianteNombre: 'A' }] }, pagination: { total: 1 } });
    expect(await result.current.fetch({})).toMatchObject({ success: true, pagination: { total: 1 } });
    R.alerta.obtenerAlertas.mockResolvedValueOnce({ success: false });
    expect((await result.current.fetch()).error).toMatch(/alertas de riesgo/);
  });
  it('detalle de alerta por estudiante', async () => {
    const { result } = renderHook(() => useGetAlertaEstudiante());
    let r;
    await act(async () => {
      r = await result.current.cargar(null);
    });
    expect(r.success).toBe(false);
    R.alerta.obtenerAlertaEstudiante.mockResolvedValueOnce({ success: true, data: { alertaEstudiante: { estudianteId: 1, nombreCompleto: 'Ana' } } });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.detalle.estudianteNombre).toBe('Ana');
    act(() => result.current.limpiar());
    expect(result.current.detalle).toBeNull();
    R.alerta.obtenerAlertaEstudiante.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.error).toMatch(/detalle del estudiante/);
  });
  it('mis alumnos en riesgo', async () => {
    R.alerta.obtenerMisAlumnos.mockResolvedValueOnce({ success: true, data: [{ estudianteNombre: 'A' }] });
    const { result } = renderHook(() => useMisAlumnosEnRiesgoApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.alertas).toHaveLength(1);
    R.alerta.obtenerMisAlumnos.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/alumnos en riesgo/);
    R.alerta.obtenerMisAlumnos.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.cargar();
    });
    expect(result.current.error).toBe('Red');
    const manual = renderHook(() => useMisAlumnosEnRiesgoApi({ autoFetch: false }));
    expect(manual.result.current.loading).toBe(false);
  });
  it('panel y exportación', async () => {
    R.panel.obtenerPanel.mockResolvedValueOnce({ success: true, data: { panelAcompanamiento: { gestionId: 3 } } });
    const { result } = renderHook(() => usePanelAcompanamientoApi({ gestionId: 3 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.panel.gestionId).toBe(3);
    R.panel.obtenerPanel.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/panel de acompañamiento/);
    R.panel.obtenerPanel.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('Red');
    const exp = renderHook(() => useExportarPanelPdf());
    const blob = new Blob(['x']);
    R.panel.exportarPanel.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await exp.result.current.exportar({ gestionId: 3 });
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'panel_acompanamiento.pdf');
    R.panel.exportarPanel.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await exp.result.current.exportar()).error).toBe('No se pudo exportar el panel');
    });
  });
});

describe('acompañamiento: sesiones', () => {
  it('catálogos de cursos y aulas', async () => {
    R.http.get.mockResolvedValueOnce({ data: { success: true, data: { asignaciones: [{ id: 1, materiaNombre: 'Mate', paraleloNombre: 'A', docenteNombre: 'Ana', materiaId: 3 }, { id: 2 }, {}] } } });
    const a = renderHook(() => useAsignacionesCatalogoAcaApi());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.options).toEqual([{ value: 1, label: 'Mate · A — Ana' }, { value: 2, label: 'Curso 2' }]);
    expect(a.result.current.asignacionById[1].materiaId).toBe(3);
    R.http.get.mockRejectedValueOnce(new Error('403'));
    const b = renderHook(() => useAsignacionesCatalogoAcaApi());
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    expect(b.result.current.disponible).toBe(false);

    R.http.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 1, codigo: 'A1', nombre: 'Uno' }, { id: 2 }, {}] } });
    const c = renderHook(() => useAulasCatalogoAcaApi());
    await waitFor(() => expect(c.result.current.loading).toBe(false));
    expect(c.result.current.aulas).toEqual([{ value: 1, label: 'A1 · Uno' }, { value: 2, label: 'Aula 2' }]);
    R.http.get.mockRejectedValueOnce(new Error('x'));
    const d = renderHook(() => useAulasCatalogoAcaApi());
    await waitFor(() => expect(d.result.current.disponible).toBe(false));
  });
  it('una sesión, mutaciones y listado', async () => {
    const g = renderHook(() => useGetSesionRefuerzo());
    let r;
    await act(async () => {
      r = await g.result.current.cargar('');
    });
    expect(r.success).toBe(false);
    R.sesion.obtenerPorId.mockResolvedValueOnce({ success: true, data: { sesionRefuerzo: { id: 1, estudiantes: [] } } });
    await act(async () => {
      await g.result.current.cargar(1);
    });
    expect(g.result.current.sesion.id).toBe(1);
    R.sesion.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await g.result.current.refetch(1);
    });
    expect(r.error).toMatch(/sesión de refuerzo/);

    const m = renderHook(() => useSesionRefuerzoMutations());
    await act(async () => {
      await m.result.current.guardarSesion({ id: 1, payload: { a: 1 } });
      await m.result.current.guardarSesion({ payload: { b: 1 } });
      await m.result.current.registrarEstudiantes(1, [2]);
    });
    expect(R.sesion.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.sesion.crear).toHaveBeenCalledWith({ b: 1 });
    expect(R.sesion.registrarEstudiantes).toHaveBeenCalledWith(1, [2]);
    m.result.current.eliminarSesion(1);
    expect(R.sesion.eliminar).toHaveBeenCalledWith(1);

    const l = renderHook(() => useSesionesRefuerzoApi());
    R.sesion.obtenerTodos.mockResolvedValueOnce({ success: true, data: { sesionesRefuerzo: [{ id: 1 }] } });
    expect((await l.result.current.fetch()).success).toBe(true);
    R.sesion.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await l.result.current.fetch()).error).toMatch(/sesiones de refuerzo/);
  });
});

describe('asistencia: acciones', () => {
  it('use cases de asistencia', async () => {
    const guardar = vi.fn().mockResolvedValue({ success: true });
    R.casos.guardarPlanillaAsistencia = () => ({ ejecutar: guardar });
    const b = renderHook(() => useBulkAsistenciaApi());
    await act(async () => {
      await b.result.current.guardar(3, { dias: [1] });
    });
    expect(guardar).toHaveBeenCalledWith(3, { dias: [1] });

    const cerrar = vi.fn().mockResolvedValue({ success: true });
    const reabrir = vi.fn().mockResolvedValue({ success: true });
    R.casos.cerrarRegistroAsistencia = () => ({ ejecutar: cerrar });
    R.casos.reabrirRegistroAsistencia = () => ({ ejecutar: reabrir });
    const c = renderHook(() => useRegistroCierreApi());
    await act(async () => {
      await c.result.current.cerrar(3, { bimestre: 1, fecha: 'x' });
      await c.result.current.reabrir(3, { bimestre: 1 });
    });
    expect(cerrar).toHaveBeenCalledWith(3, { bimestre: 1, fecha: 'x' });
    expect(reabrir).toHaveBeenCalledWith(3, { bimestre: 1, fecha: undefined });
    expect(c.result.current.procesando).toBe(false);

    const crear = vi.fn().mockResolvedValue({ success: true });
    const eliminar = vi.fn().mockResolvedValue({ success: true });
    R.casos.crearSesionEspecialAsistencia = () => ({ ejecutar: crear });
    R.casos.eliminarSesionEspecialAsistencia = () => ({ ejecutar: eliminar });
    const s = renderHook(() => useSesionEspecialApi());
    await act(async () => {
      await s.result.current.crear(3);
      await s.result.current.eliminar(3, '2026-05-01');
    });
    expect(crear).toHaveBeenCalledWith(3, {});
    expect(eliminar).toHaveBeenCalledWith(3, '2026-05-01');
  });
  it('inscripción vigente de licencia', async () => {
    const ejecutar = vi.fn()
      .mockResolvedValueOnce({ success: true, data: { inscripcion: { id: 1 } } })
      .mockResolvedValueOnce({ success: false })
      .mockRejectedValueOnce(new Error('Red'));
    R.casos.obtenerInscripcionVigenteLicencia = () => ({ ejecutar });
    const { result } = renderHook(() => useInscripcionVigenteApi());
    let r;
    await act(async () => {
      r = await result.current.consultarInscripcion(4);
    });
    expect(r.inscripcion).toEqual({ id: 1 });
    await act(async () => {
      r = await result.current.consultarInscripcion(4);
    });
    expect(r.error).toMatch(/inscripción vigente/);
    await act(async () => {
      r = await result.current.consultarInscripcion(4);
    });
    expect(r.error).toBe('Red');
    act(() => result.current.limpiarInscripcion());
    expect(result.current.error).toBeNull();
  });
});

describe('exportaciones a Excel', () => {
  const blob = new Blob(['x']);
  it('consolidado de asistencia', async () => {
    const { result } = renderHook(() => useExportConsolidadoAsistenciaExcel());
    expect((await result.current.exportar()).error).toMatch(/paralelo/);
    R.asistencia.descargarConsolidadoExcel.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.exportar({ paraleloGestionId: 3, bimestre: 2 });
    });
    expect(R.asistencia.descargarConsolidadoExcel).toHaveBeenCalledWith({ paraleloGestionId: 3, bimestre: 2 });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'consolidado_asistencia.xlsx');
    R.asistencia.descargarConsolidadoExcel.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await result.current.exportar({ paraleloGestionId: 3 })).error).toBe('No se pudo generar el archivo');
    });
    R.asistencia.descargarConsolidadoExcel.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      expect((await result.current.exportar({ paraleloGestionId: 3 })).error).toBe('Red');
    });
  });
  it.each([
    ['avance', useExportAvanceAcademicoExcel, () => R.avance.descargarAvanceExcel, 'avance_academico.xlsx'],
    ['deserción', useExportDesercionExcel, () => R.desercion.descargarDesercionExcel, 'desercion.xlsx'],
  ])('%s', async (_n, hook, repo, archivo) => {
    const { result } = renderHook(() => hook());
    repo().mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      expect((await result.current.exportar()).success).toBe(true);
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, archivo);
    repo().mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      expect((await result.current.exportar()).error).toBe('No');
    });
    repo().mockRejectedValueOnce({});
    await act(async () => {
      expect((await result.current.exportar()).error).toBe('Error al exportar');
    });
  });
});
