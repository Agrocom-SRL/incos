import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/docentes/supervision', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@api-client', () => ({ default: http }));

const R = vi.hoisted(() => ({
  ficha: { exportarPdf: vi.fn(), actualizar: vi.fn(), crear: vi.fn(), obtenerTodos: vi.fn(), obtenerPorId: vi.fn(), obtenerMisFichas: vi.fn() },
  downloadBlob: vi.fn(),
}));
vi.mock('@implementations/FichaSeguimientoRepository', () => ({ default: R.ficha }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));

const ctx = vi.hoisted(() => ({ detail: {}, form: {}, list: {} }));
vi.mock('@application-docentes/supervision/hooks/context/useFichaSeguimientoDetailContext', () => ({ useFichaSeguimientoDetailContext: () => ctx.detail }));
vi.mock('@application-docentes/supervision/hooks/context/useFichaSeguimientoFormContext', () => ({ useFichaSeguimientoFormContext: () => ctx.form }));
vi.mock('@application-docentes/supervision/hooks/context/useFichasSeguimientoListContext', () => ({ useFichasSeguimientoListContext: () => ctx.list }));

import {
  mapFichaSeguimiento,
  mapFichasSeguimientoList,
  mapFichaSeguimientoDetail,
  mapFormValuesToFichaPayload,
  mapFichaToFormValues,
} from '../mappers/fichaSeguimientoMapper';
import { getDocsCompletosPillClass, formatResultadoFichaLabel } from '../utils/fichaSeguimientoPills';
import { fichaSeguimientoDetallePath, fichaSeguimientoEditarPath, fichaSeguimientoRegistrarPath } from '../config/paths';
import { useAsignacionesCatalogoDocApi } from '../hooks/api/useAsignacionesCatalogoDocApi';
import { useExportarFichaPdf } from '../hooks/api/useExportarFichaPdf';
import { useFichaSeguimientoMutations } from '../hooks/api/useFichaSeguimientoMutations';
import { useFichasSeguimientoApi } from '../hooks/api/useFichasSeguimientoApi';
import { useGetFichaSeguimiento } from '../hooks/api/useGetFichaSeguimiento';
import { useMisFichasSeguimientoApi } from '../hooks/api/useMisFichasSeguimientoApi';
import { useFichaSeguimientoDetailPage } from '../hooks/state/useFichaSeguimientoDetailPage';
import { useFichaSeguimientoFormPage } from '../hooks/state/useFichaSeguimientoFormPage';
import { useFichasSeguimientoListPage } from '../hooks/state/useFichasSeguimientoListPage';
import { useMisFichasSeguimientoSection } from '../hooks/state/useMisFichasSeguimientoSection';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  router.location = { pathname: '/docentes/supervision', state: null };
});

describe('mappers y utilidades', () => {
  it('mapFichaSeguimiento y listados', () => {
    expect(mapFichaSeguimiento(null)).toBeNull();
    const f = mapFichaSeguimiento({ id: 1, fechaSeguimiento: '2026-03-04', asignaturaSigla: 'MAT', asignaturaNombre: 'Mate', carreraCodigo: 'SIS', paraleloNombre: 'A', paraleloPeriodoNombre: '1°', docenteNombre: ' ', docsPresentados: '3' });
    expect(f).toMatchObject({ fechaLabel: '04/03/2026', asignaturaLabel: 'MAT · Mate', cursoParaleloLabel: '1° · A', carreraParaleloLabel: 'SIS · A', docenteNombre: null, docsPresentados: 3, docsCompletos: '0/4', claseObservada: 'PRESENCIAL' });
    expect(mapFichaSeguimiento({ id: 2, fechaSeguimiento: 'zz' }).fechaLabel).toBeNull();
    expect(mapFichasSeguimientoList(null)).toEqual([]);
    expect(mapFichasSeguimientoList([{ id: 1 }, null])).toHaveLength(1);
    expect(mapFichaSeguimientoDetail(undefined)).toBeNull();
    expect(mapFichaSeguimientoDetail({ id: 1, obsRecursos: ' PPT ', tienePlanBimestral: true })).toMatchObject({ obsRecursos: 'PPT', tienePlanBimestral: true, obsExposicion: null });
  });
  it('payload y valores del formulario', () => {
    expect(mapFormValuesToFichaPayload()).toMatchObject({ asignacionDocenteId: null, fechaSeguimiento: null, obsRecursos: null });
    const p = mapFormValuesToFichaPayload({ asignacionDocenteId: '4', fechaSeguimiento: '2026-02-01', obsRecursos: ' PPT ', estudiantesAsistentes: '12', tienePlanBimestral: false });
    expect(p).toMatchObject({ asignacionDocenteId: 4, fechaSeguimiento: '2026-02-01', obsRecursos: 'PPT', estudiantesAsistentes: 12, tienePlanBimestral: false });
    const v = mapFichaToFormValues({ asignacionDocenteId: 4, fechaSeguimiento: '2026-02-01', obsRecursos: 'x' });
    expect(v.asignacionDocenteId).toBe(4);
    expect(v.fechaSeguimiento.format('YYYY-MM-DD')).toBe('2026-02-01');
    const vacio = mapFichaToFormValues(null);
    expect(vacio.obsRecursos).toBe('');
    expect(vacio.fechaSeguimiento).toBeTruthy();
  });
  it('pills y paths', () => {
    expect(getDocsCompletosPillClass(4)).toMatch(/success/);
    expect(getDocsCompletosPillClass(2)).toMatch(/warning/);
    expect(getDocsCompletosPillClass(0)).toMatch(/danger/);
    expect(formatResultadoFichaLabel({ docsPresentados: 3 })).toBe('docs 3/4');
    expect(formatResultadoFichaLabel({ docsCompletos: '4/4', estudiantesAsistentes: 10 })).toBe('docs 4/4 · asistencia 10/—');
    expect(formatResultadoFichaLabel()).toBe('docs 0/4');
    expect(fichaSeguimientoDetallePath(3)).toBe('/docentes/supervision/3');
    expect(fichaSeguimientoEditarPath(3)).toBe('/docentes/supervision/3/editar');
    expect(fichaSeguimientoRegistrarPath).toBe('/docentes/supervision/registrar');
  });
});

describe('hooks api de supervisión', () => {
  it('catálogo de asignaciones', async () => {
    http.get.mockResolvedValueOnce({ data: { success: true, data: { asignaciones: [{ id: 1, materia_sigla: 'MAT', materia_nombre: 'Mate', paralelo_nombre: 'A', docente_nombre: 'Ana', docente_id: 4 }, { id: 2 }, { sinId: true }] } } });
    const { result } = renderHook(() => useAsignacionesCatalogoDocApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual([{ value: 1, label: 'MAT Mate · A · Ana' }, { value: 2, label: 'Curso 2' }]);
    expect(result.current.asignacionById[1].docenteId).toBe(4);
    expect(result.current.disponible).toBe(true);
  });
  it('catálogo no disponible por error o respuesta inválida', async () => {
    http.get.mockRejectedValueOnce(new Error('403'));
    const a = renderHook(() => useAsignacionesCatalogoDocApi());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.disponible).toBe(false);
    http.get.mockResolvedValueOnce({ data: { success: true, data: { otra: 1 } } });
    const b = renderHook(() => useAsignacionesCatalogoDocApi());
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    expect(b.result.current.asignaciones).toEqual([]);
  });
  it('exportar PDF', async () => {
    const { result } = renderHook(() => useExportarFichaPdf());
    expect((await result.current.exportarPdf(null)).success).toBe(false);
    const blob = new Blob(['x']);
    R.ficha.exportarPdf.mockResolvedValueOnce({ success: true, blob, fileName: 'f.pdf' });
    let r;
    await act(async () => {
      r = await result.current.exportarPdf(3);
    });
    expect(r.success).toBe(true);
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'f.pdf');
    R.ficha.exportarPdf.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.exportarPdf(3);
    });
    expect(r.error).toMatch(/generar el PDF/);
    R.ficha.exportarPdf.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await result.current.exportarPdf(3);
    });
    expect(r.error).toBe('Red');
  });
  it('mutaciones y listados', async () => {
    const m = renderHook(() => useFichaSeguimientoMutations());
    await act(async () => {
      await m.result.current.guardarFicha({ id: 1, payload: { a: 1 } });
      await m.result.current.guardarFicha({ payload: { b: 1 } });
    });
    expect(R.ficha.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.ficha.crear).toHaveBeenCalledWith({ b: 1 });
    R.ficha.obtenerTodos.mockResolvedValueOnce({ success: true, data: { fichasSeguimiento: [{ id: 1 }] }, pagination: { total: 1 } });
    const l = renderHook(() => useFichasSeguimientoApi());
    expect(await l.result.current.fetch({ page: 1 })).toMatchObject({ success: true, pagination: { total: 1 } });
    R.ficha.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 2 }] });
    expect((await l.result.current.fetch()).data).toHaveLength(1);
    R.ficha.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await l.result.current.fetch()).error).toMatch(/fichas de seguimiento/);
  });
  it('obtener una ficha', async () => {
    const { result } = renderHook(() => useGetFichaSeguimiento());
    let r;
    await act(async () => {
      r = await result.current.cargar('');
    });
    expect(r.success).toBe(false);
    R.ficha.obtenerPorId.mockResolvedValueOnce({ success: true, data: { fichaSeguimiento: { id: 1, obsRecursos: 'x' } } });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.ficha.obsRecursos).toBe('x');
    R.ficha.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.refetch(1);
    });
    expect(result.current.ficha).toBeNull();
    expect(r.error).toMatch(/No se pudo cargar/);
  });
  it('mis fichas con y sin autoFetch', async () => {
    R.ficha.obtenerMisFichas.mockResolvedValue({ success: true, data: { fichasSeguimiento: [{ id: 1 }] } });
    const { result } = renderHook(() => useMisFichasSeguimientoApi({ autoFetch: true }));
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(result.current.fichas).toHaveLength(1);
    R.ficha.obtenerMisFichas.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.cargar();
    });
    expect(result.current.error).toMatch(/sus fichas/);
    const manual = renderHook(() => useMisFichasSeguimientoApi());
    expect(manual.result.current.cargado).toBe(false);
  });
});

describe('hooks de estado de supervisión', () => {
  it('ficha de detalle: navegación y exportación', async () => {
    const exportarPdf = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    ctx.detail = { fichaId: 5, ficha: { id: 5 }, loading: false, error: null, descargandoPdf: false, exportarPdf };
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'K' } };
    const { result } = renderHook(() => useFichaSeguimientoDetailPage(), { wrapper });
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/lista', { state: { menuSidebarKey: 'K' } });
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenCalledWith('/docentes/supervision/5/editar', { state: { returnListPath: '/lista', menuSidebarKey: 'K' } });
    await act(async () => {
      await result.current.handleExportarPdf();
      await result.current.handleExportarPdf();
    });
    expect(exportarPdf).toHaveBeenCalledWith(5);
    ctx.detail = { ...ctx.detail, fichaId: null };
    router.navigate.mockClear();
    const sin = renderHook(() => useFichaSeguimientoDetailPage(), { wrapper });
    act(() => sin.result.current.handleEditar());
    await act(async () => {
      await sin.result.current.handleExportarPdf();
    });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('formulario: alta', async () => {
    ctx.form = { fichaId: null, ficha: null, loadingFicha: false, errorFicha: null, saving: false, guardarFicha: vi.fn().mockResolvedValue({ success: true, data: { fichaSeguimiento: { id: 9 } } }), asignacionOptions: [{ value: 1, label: 'x' }], loadingAsignaciones: false, asignacionesDisponible: true };
    const { result } = renderHook(() => useFichaSeguimientoFormPage('create'), { wrapper });
    expect(result.current.pageTitle).toBe('Registrar ficha de seguimiento');
    expect(Object.keys(result.current.formSections)).toEqual(['datosObservacion', 'documentacion', 'cantidadEstudiantes', 'estructuraClase', 'otrasObservaciones']);
    result.current.form.validateFields = vi.fn().mockResolvedValue({ asignacionDocenteId: 1, fechaSeguimiento: '2026-01-01' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.form.guardarFicha).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ asignacionDocenteId: 1 }) });
    expect(router.navigate).toHaveBeenCalledWith('/docentes/supervision/9', expect.objectContaining({ replace: true }));
  });
  it('formulario: edición con errores', async () => {
    ctx.form = { fichaId: 5, ficha: { id: 5, obsRecursos: 'PPT' }, loadingFicha: false, errorFicha: 'Carga mal', saving: false, guardarFicha: vi.fn().mockResolvedValue({ success: false, error: 'Mal' }), asignacionOptions: [], loadingAsignaciones: false, asignacionesDisponible: false };
    const { result } = renderHook(() => useFichaSeguimientoFormPage('edit'), { wrapper });
    await waitFor(() => expect(result.current.form.getFieldValue('obsRecursos')).toBe('PPT'));
    expect(result.current.error).toBe('Carga mal');
    expect(result.current.permisoAccion).toBe('EDITAR');
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Mal');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    ctx.form.guardarFicha.mockResolvedValue({ success: true, data: {} });
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(router.navigate).toHaveBeenCalledWith('/docentes/supervision/5', expect.objectContaining({ replace: false }));
    act(() => result.current.handleVolver());
    ctx.form = { ...ctx.form, fichaId: null };
    expect(renderHook(() => useFichaSeguimientoFormPage('edit'), { wrapper }).result.current.isInvalidEditId).toBe(true);
  });
  it('listado y sección de mis fichas', async () => {
    const setSearchText = vi.fn();
    ctx.list = { fichas: [{ id: 1 }], setSearchText, refetch: vi.fn(), tablePagination: {} };
    const { result } = renderHook(() => useFichasSeguimientoListPage());
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
    result.current.handleSearchChange({ target: { value: 'z' } });
    expect(setSearchText).toHaveBeenCalledWith('z');
    result.current.handleRegistrar();
    expect(router.navigate).toHaveBeenCalledWith('/docentes/supervision/registrar', { state: expect.objectContaining({ menuSidebarKey: 'DOC-SUPERVISION' }) });

    R.ficha.obtenerMisFichas.mockResolvedValue({ success: true, data: [{ id: 3 }] });
    const sec = renderHook(() => useMisFichasSeguimientoSection({ enabled: true }));
    await waitFor(() => expect(sec.result.current.fichas).toHaveLength(1));
    act(() => sec.result.current.verFicha({ id: 3 }));
    expect(sec.result.current.fichaSeleccionada.id).toBe(3);
    act(() => sec.result.current.cerrarFicha());
    expect(sec.result.current.fichaSeleccionada).toBeNull();
    const off = renderHook(() => useMisFichasSeguimientoSection());
    expect(off.result.current.fichas).toEqual([]);
  });
});
