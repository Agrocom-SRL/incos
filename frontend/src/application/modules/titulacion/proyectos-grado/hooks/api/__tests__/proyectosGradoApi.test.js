import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => {
  const auto = () =>
    new Proxy({}, { get: (t, p) => (p in t ? t[p] : (t[p] = vi.fn())) });
  return { pg: auto(), est: auto(), carrera: auto(), docente: auto(), downloadBlob: vi.fn() };
});

vi.mock('@implementations/ProyectoGradoRepository', () => ({ default: R.pg }));
vi.mock('@infrastructure/repositories/EstudianteRepository.js', () => ({ default: R.est }));
vi.mock('@implementations/CarreraRepository', () => ({ default: R.carrera }));
vi.mock('@implementations/DocenteRepository', () => ({ default: R.docente }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));

import { useActaDefensaApi } from '../useActaDefensaApi';
import { useAnularActaDefensa } from '../useAnularActaDefensa';
import { useAvancesProyectoApi } from '../useAvancesProyectoApi';
import { useBitacoraProyectoApi } from '../useBitacoraProyectoApi';
import { useBuscarEstudiantesTit } from '../useBuscarEstudiantesTit';
import { useCarrerasCatalogoTitApi } from '../useCarrerasCatalogoTitApi';
import { useDictamenesProyectoApi } from '../useDictamenesProyectoApi';
import { useDocentesCatalogoTitApi } from '../useDocentesCatalogoTitApi';
import { useDocentesConTutoriaCatalogApi } from '../useDocentesConTutoriaCatalogApi';
import { useEstudiantesElegiblesModalidadApi } from '../useEstudiantesElegiblesModalidadApi';
import { useExportActaDefensaPdf } from '../useExportActaDefensaPdf';
import { useExportAvanceTutoriaCarreraPdf } from '../useExportAvanceTutoriaCarreraPdf';
import { useExportFormularioModalidadPdf } from '../useExportFormularioModalidadPdf';
import { useExportSeguimientoTutoriaDocentesExcel } from '../useExportSeguimientoTutoriaDocentesExcel';
import { useGetMiProyectoGrado } from '../useGetMiProyectoGrado';
import { useGetProyectoGrado } from '../useGetProyectoGrado';
import { useMisTutoradosApi } from '../useMisTutoradosApi';
import { useModalidadesGradoApi } from '../useModalidadesGradoApi';
import { useProyectoGradoMutations } from '../useProyectoGradoMutations';
import { useProyectosGradoApi } from '../useProyectosGradoApi';
import { useRegistrarActaDefensa } from '../useRegistrarActaDefensa';
import { useRegistrarMiProyectoGradoApi } from '../useRegistrarMiProyectoGradoApi';
import { useSeguimientoTutoriaDocentesApi } from '../useSeguimientoTutoriaDocentesApi';

beforeEach(() => {
  vi.clearAllMocks();
});

// Patrón común de los hooks "cargar(id) -> lista": id inválido, éxito y error.
const probarCarga = async ({ nombre, hook, repoFn, dataKey, lista, errorEsperado, propiedad }) => {
  const { result } = renderHook(() => hook());
  let r;
  await act(async () => {
    r = await result.current.cargar(null);
  });
  expect(r.success, `${nombre} id nulo`).toBe(false);
  R.pg[repoFn].mockResolvedValueOnce({ success: true, data: { [dataKey]: lista } });
  await act(async () => {
    await result.current.cargar(1);
  });
  expect(result.current[propiedad], `${nombre} éxito`).toHaveLength(1);
  R.pg[repoFn].mockResolvedValueOnce({ success: false });
  await act(async () => {
    await result.current.cargar(1);
  });
  expect(result.current[propiedad]).toEqual([]);
  expect(result.current.error).toBe(errorEsperado);
};

describe('cargas de listas por proyecto', () => {
  it('actas de defensa', async () => {
    await probarCarga({ nombre: 'actas', hook: useActaDefensaApi, repoFn: 'obtenerActasDefensa', dataKey: 'actasDefensa', lista: [{ id: 1 }], errorEsperado: 'No se pudo cargar el acta de defensa del proyecto', propiedad: 'actas' });
  });
  it('bitácora', async () => {
    await probarCarga({ nombre: 'bitácora', hook: useBitacoraProyectoApi, repoFn: 'obtenerBitacora', dataKey: 'bitacoraEntradas', lista: [{ id: 1 }], errorEsperado: 'No se pudo cargar el cronograma de progreso del proyecto', propiedad: 'entradas' });
    const { result } = renderHook(() => useBitacoraProyectoApi());
    result.current.crearEntrada(1, { a: 1 });
    result.current.actualizarEntrada(1, 2, { b: 1 });
    result.current.confirmarEntrada(1, 2);
    expect(R.pg.crearBitacoraEntrada).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.pg.actualizarBitacoraEntrada).toHaveBeenCalledWith(1, 2, { b: 1 });
    expect(R.pg.confirmarBitacoraEntrada).toHaveBeenCalledWith(1, 2);
  });
  it('avances: carga, subida y descarga', async () => {
    await probarCarga({ nombre: 'avances', hook: useAvancesProyectoApi, repoFn: 'obtenerAvances', dataKey: 'avances', lista: [{ id: 1 }], errorEsperado: 'No se pudieron cargar los avances del proyecto', propiedad: 'avances' });
    const { result } = renderHook(() => useAvancesProyectoApi());
    R.pg.subirAvance.mockResolvedValue({ success: true });
    await act(async () => {
      await result.current.subirAvance(1, { file: new Blob(['x']), titulo: 'T', descripcion: 'D' });
    });
    const fd = R.pg.subirAvance.mock.calls[0][1];
    expect(fd.get('titulo')).toBe('T');
    expect(fd.get('descripcion')).toBe('D');
    const blob = new Blob(['x']);
    R.pg.descargarAvanceArchivo.mockResolvedValueOnce({ success: true, blob });
    let r;
    await act(async () => {
      r = await result.current.descargarArchivo(1, { id: 5, nombreArchivo: 'a.pdf' });
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'a.pdf');
    expect(r.success).toBe(true);
    R.pg.descargarAvanceArchivo.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.descargarArchivo(1, { id: 5 });
    });
    expect(r.error).toMatch(/descargar el archivo/);
  });
  it('dictámenes', async () => {
    await probarCarga({ nombre: 'dictámenes', hook: useDictamenesProyectoApi, repoFn: 'obtenerDictamenes', dataKey: 'dictamenes', lista: [{ id: 1 }], errorEsperado: 'No se pudieron cargar los dictámenes del proyecto', propiedad: 'dictamenes' });
    const { result } = renderHook(() => useDictamenesProyectoApi());
    const blob = new Blob(['x']);
    R.pg.descargarDictamenArchivo.mockResolvedValueOnce({ success: true, blob, fileName: 'd.pdf' });
    await act(async () => {
      await result.current.descargarDictamen(1, { id: 2 });
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'd.pdf');
    R.pg.descargarDictamenArchivo.mockResolvedValueOnce({ success: false, error: 'No' });
    let r;
    await act(async () => {
      r = await result.current.descargarDictamen(1, { id: 2 });
    });
    expect(r.error).toBe('No');
  });
});

describe('acciones puntuales', () => {
  it('anular y registrar acta delegan en el repositorio', async () => {
    R.pg.anularActaDefensa.mockResolvedValue({ success: true });
    R.pg.registrarActaDefensa.mockResolvedValue({ success: true });
    const a = renderHook(() => useAnularActaDefensa());
    await act(async () => {
      await a.result.current.anular(1, 2, 'motivo');
    });
    expect(R.pg.anularActaDefensa).toHaveBeenCalledWith(1, 2, 'motivo');
    const b = renderHook(() => useRegistrarActaDefensa());
    await act(async () => {
      await b.result.current.registrar(1, { x: 1 });
    });
    expect(R.pg.registrarActaDefensa).toHaveBeenCalledWith(1, { x: 1 });
    expect(b.result.current.saving).toBe(false);
  });
  it('exportaciones validan, descargan y reportan error', async () => {
    const blob = new Blob(['x']);
    const acta = renderHook(() => useExportActaDefensaPdf());
    expect((await acta.result.current.exportarPdf(null, 1)).success).toBe(false);
    R.pg.exportarActaDefensaPdf.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await acta.result.current.exportarPdf(1, { id: 4 });
    });
    expect(R.pg.exportarActaDefensaPdf).toHaveBeenCalledWith(1, 4);
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'acta_defensa.pdf');
    R.pg.exportarActaDefensaPdf.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await acta.result.current.exportarPdf(1, 4)).error).toMatch(/acta de defensa/);
    });

    const form = renderHook(() => useExportFormularioModalidadPdf());
    expect((await form.result.current.exportarPdf(null)).error).toBe('Proyecto no especificado');
    R.pg.exportarFormularioModalidadPdf.mockResolvedValueOnce({ success: true, blob, fileName: 'f.pdf' });
    await act(async () => {
      await form.result.current.exportarPdf(1);
    });
    R.pg.exportarFormularioModalidadPdf.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await form.result.current.exportarPdf(1)).error).toMatch(/formulario/);
    });

    const carrera = renderHook(() => useExportAvanceTutoriaCarreraPdf());
    R.pg.exportarAvanceTutoriaCarreraPdf.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await carrera.result.current.exportar({ gestionId: 1 });
    });
    expect(R.pg.exportarAvanceTutoriaCarreraPdf).toHaveBeenCalledWith({ gestionId: 1, carreraId: undefined });
    R.pg.exportarAvanceTutoriaCarreraPdf.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      expect((await carrera.result.current.exportar()).error).toBe('No');
    });

    const excel = renderHook(() => useExportSeguimientoTutoriaDocentesExcel());
    R.pg.exportarSeguimientoTutoriaDocentesExcel.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await excel.result.current.exportar({ mes: 3 });
    });
    expect(R.downloadBlob).toHaveBeenLastCalledWith(blob, 'seguimiento_tutoria_docentes.xlsx');
    R.pg.exportarSeguimientoTutoriaDocentesExcel.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await excel.result.current.exportar()).error).toMatch(/seguimiento/);
    });
  });
  it('mutaciones del proyecto', async () => {
    const { result } = renderHook(() => useProyectoGradoMutations());
    await act(async () => {
      await result.current.guardarProyecto({ id: 1, payload: { a: 1 } });
      await result.current.guardarProyecto({ payload: { b: 1 } });
    });
    expect(R.pg.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.pg.crear).toHaveBeenCalledWith({ b: 1 });
    result.current.eliminarProyecto(3);
    result.current.asignarTutor(3, { tutorId: 4, observaciones: 'o' });
    result.current.aprobarEtapa(3, { estado: 'X' });
    result.current.agregarIntegrante(3, { e: 1 });
    result.current.actualizarIntegrante(3, 5, { r: 1 });
    expect(R.pg.eliminar).toHaveBeenCalledWith(3);
    expect(R.pg.asignarTutor).toHaveBeenCalledWith(3, { tutorId: 4, observaciones: 'o' });
    expect(R.pg.aprobarEtapa).toHaveBeenCalledWith(3, { estado: 'X' });
    expect(R.pg.agregarIntegrante).toHaveBeenCalledWith(3, { e: 1 });
    expect(R.pg.actualizarIntegrante).toHaveBeenCalledWith(3, 5, { r: 1 });
    result.current.asignarTutor(3);
  });
  it('registrar mi proyecto', async () => {
    const { result } = renderHook(() => useRegistrarMiProyectoGradoApi());
    R.pg.registrarMiProyecto.mockResolvedValueOnce({ success: true, data: { proyectoGrado: { id: 1, titulo: 'T' } } });
    let r;
    await act(async () => {
      r = await result.current.registrar({ a: 1 });
    });
    expect(r.proyecto.titulo).toBe('T');
    R.pg.registrarMiProyecto.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.registrar({});
    });
    expect(r.error).toMatch(/modalidad de grado/);
  });
});

describe('consultas de proyectos', () => {
  it('lista de proyectos', async () => {
    const { result } = renderHook(() => useProyectosGradoApi());
    R.pg.obtenerTodos.mockResolvedValueOnce({ success: true, data: { proyectosGrado: [{ id: 1 }] }, pagination: { total: 1 } });
    expect(await result.current.fetch({})).toMatchObject({ success: true, pagination: { total: 1 } });
    R.pg.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await result.current.fetch()).error).toBe('Error al cargar los proyectos de grado');
  });
  it('un proyecto', async () => {
    const { result } = renderHook(() => useGetProyectoGrado());
    let r;
    await act(async () => {
      r = await result.current.cargar('');
    });
    expect(r.success).toBe(false);
    R.pg.obtenerPorId.mockResolvedValueOnce({ success: true, data: { proyectoGrado: { id: 1, titulo: 'T' } } });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.proyecto.titulo).toBe('T');
    R.pg.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.refetch(1);
    });
    expect(r.error).toMatch(/proyecto de grado/);
  });
  it('mi proyecto: con proyecto, sin proyecto y con error', async () => {
    R.pg.obtenerMiProyecto.mockResolvedValueOnce({ success: true, data: { proyectoGrado: { id: 1 } } });
    const a = renderHook(() => useGetMiProyectoGrado());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.proyecto.id).toBe(1);
    R.pg.obtenerMiProyecto.mockResolvedValueOnce({ success: false, errorDetails: { code: 'NOT_FOUND' } });
    await act(async () => {
      await a.result.current.refetch();
    });
    expect(a.result.current.sinProyecto).toBe(true);
    R.pg.obtenerMiProyecto.mockResolvedValueOnce({ success: false, error: 'No tiene proyecto asignado' });
    await act(async () => {
      await a.result.current.refetch();
    });
    expect(a.result.current.sinProyecto).toBe(true);
    R.pg.obtenerMiProyecto.mockResolvedValueOnce({ success: false, error: 'Falla' });
    await act(async () => {
      await a.result.current.refetch();
    });
    expect(a.result.current.error).toBe('Falla');
    R.pg.obtenerMiProyecto.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await a.result.current.refetch();
    });
    expect(a.result.current.error).toBe('Red');
    R.pg.obtenerMiProyecto.mockResolvedValueOnce({ success: true, data: null });
    await act(async () => {
      await a.result.current.refetch();
    });
    expect(a.result.current.sinProyecto).toBe(true);
  });
  it('mis tutorados', async () => {
    R.pg.obtenerMisTutorados.mockResolvedValueOnce({ success: true, data: { misTutorados: [{ id: 1 }] } });
    const { result } = renderHook(() => useMisTutoradosApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.proyectos).toHaveLength(1);
    R.pg.obtenerMisTutorados.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/proyectos tutorados/);
    R.pg.obtenerMisTutorados.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('Red');
  });
  it('modalidades de grado', async () => {
    R.pg.obtenerModalidades.mockResolvedValueOnce({ success: true, data: { modalidadesGrado: [{ id: 1, codigo: 'PSP', nombre: 'Proyecto' }, { id: 2, nombre: 'Otra' }] } });
    const { result } = renderHook(() => useModalidadesGradoApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual([{ value: 1, label: 'PSP · Proyecto' }, { value: 2, label: 'Otra' }]);
    expect(result.current.modalidadById[2].nombre).toBe('Otra');
    R.pg.obtenerModalidades.mockResolvedValueOnce({ success: false });
    const b = renderHook(() => useModalidadesGradoApi());
    await waitFor(() => expect(b.result.current.error).toMatch(/modalidades/));
  });
  it('seguimiento de tutorías y catálogo de docentes con tutoría', async () => {
    R.pg.obtenerSeguimientoTutoriaDocentes.mockResolvedValue({ success: true, data: { seguimientoTutoriaDocentes: { anio: 2026, docentes: [{ docenteId: 1, docenteNombre: 'Ana' }, { docenteId: 2 }, {}] } } });
    const { result } = renderHook(() => useSeguimientoTutoriaDocentesApi({ anio: 2026 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seguimiento.docentes).toHaveLength(2);
    const cat = renderHook(() => useDocentesConTutoriaCatalogApi());
    await waitFor(() => expect(cat.result.current.loading).toBe(false));
    expect(cat.result.current.docentes).toEqual([{ value: 1, label: 'Ana' }, { value: 2, label: 'Docente 2' }]);
    R.pg.obtenerSeguimientoTutoriaDocentes.mockResolvedValue({ success: false, error: 'No' });
    const err = renderHook(() => useSeguimientoTutoriaDocentesApi());
    await waitFor(() => expect(err.result.current.error).toBe('No'));
    R.pg.obtenerSeguimientoTutoriaDocentes.mockRejectedValue(new Error('Red'));
    const exc = renderHook(() => useSeguimientoTutoriaDocentesApi());
    await waitFor(() => expect(exc.result.current.error).toBe('Red'));
    // Bug corregido: si la consulta lanza, el catálogo termina de cargar vacío (antes quedaba colgado).
    const catErr = renderHook(() => useDocentesConTutoriaCatalogApi());
    await waitFor(() => expect(catErr.result.current.loading).toBe(false));
    expect(catErr.result.current.docentes).toEqual([]);
  });
  it('estudiantes elegibles', async () => {
    const sin = renderHook(() => useEstudiantesElegiblesModalidadApi());
    expect(sin.result.current.estudiantes).toEqual([]);
    R.pg.obtenerEstudiantesElegibles.mockResolvedValueOnce({ success: true, data: { estudiantesElegibles: [{ estudianteId: 1 }] } });
    const { result } = renderHook(() => useEstudiantesElegiblesModalidadApi({ carreraId: 2, gestionId: 3 }));
    await waitFor(() => expect(result.current.estudiantes).toHaveLength(1));
    R.pg.obtenerEstudiantesElegibles.mockResolvedValueOnce({ success: false });
    const err = renderHook(() => useEstudiantesElegiblesModalidadApi({ carreraId: 2 }));
    await waitFor(() => expect(err.result.current.error).toMatch(/elegibles/));
    R.pg.obtenerEstudiantesElegibles.mockRejectedValueOnce(new Error('Red'));
    const exc = renderHook(() => useEstudiantesElegiblesModalidadApi({ carreraId: 2 }));
    await waitFor(() => expect(exc.result.current.error).toBe('Red'));
  });
});

describe('catálogos y búsqueda', () => {
  it('carreras y docentes', async () => {
    R.carrera.obtenerTodos.mockResolvedValueOnce({ success: true, data: { carreras: [{ id: 1, codigo: 'SIS', nombre: 'Sistemas' }, { id: 2 }, {}] } });
    const c = renderHook(() => useCarrerasCatalogoTitApi());
    await waitFor(() => expect(c.result.current.loading).toBe(false));
    expect(c.result.current.carreras).toEqual([{ value: 1, label: 'SIS · Sistemas' }, { value: 2, label: 'Carrera 2' }]);
    R.carrera.obtenerTodos.mockResolvedValueOnce({ success: false });
    const c2 = renderHook(() => useCarrerasCatalogoTitApi());
    await waitFor(() => expect(c2.result.current.loading).toBe(false));
    expect(c2.result.current.disponible).toBe(false);
    R.docente.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1, nombres: 'Ana', apellidoPaterno: 'López' }, { id: 2, nombreCompleto: 'Beto' }] });
    const d = renderHook(() => useDocentesCatalogoTitApi());
    await waitFor(() => expect(d.result.current.loading).toBe(false));
    expect(d.result.current.docentes.map((x) => x.label)).toEqual(['López Ana', 'Beto']);
    R.docente.obtenerTodos.mockResolvedValueOnce({ success: false });
    const d2 = renderHook(() => useDocentesCatalogoTitApi());
    await waitFor(() => expect(d2.result.current.loading).toBe(false));
    expect(d2.result.current.disponible).toBe(false);
  });
  it('búsqueda de estudiantes con debounce', async () => {
    vi.useFakeTimers();
    R.est.buscar.mockResolvedValue({ success: true, data: { student: [{ id: 1, nombres: 'Juan', apellidoPaterno: 'Pérez', carreraNombre: 'Sis' }, {}] } });
    const { result } = renderHook(() => useBuscarEstudiantesTit());
    act(() => result.current.buscar('j'));
    expect(R.est.buscar).not.toHaveBeenCalled();
    act(() => result.current.buscar('ju'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(R.est.buscar).toHaveBeenCalledWith('ju', { params: { limit: 25 } });
    expect(result.current.estudiantes).toEqual([expect.objectContaining({ id: 1, nombreCompleto: 'Pérez Juan', carreraNombre: 'Sis' })]);
    R.est.buscar.mockResolvedValue({ success: false, errorDetails: { code: 'NOT_FOUND' } });
    act(() => result.current.buscar('zz'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.error).toBeNull();
    R.est.buscar.mockResolvedValue({ success: false, error: 'Falla' });
    act(() => result.current.buscar('zz'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.error).toBe('Falla');
    act(() => result.current.limpiar());
    expect(result.current.estudiantes).toEqual([]);
    vi.useRealTimers();
  });
});
