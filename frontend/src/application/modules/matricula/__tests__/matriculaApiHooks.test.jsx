import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  casos: {},
  pago: { obtenerEstadoRegistro: vi.fn() },
  beca: { obtenerTodos: vi.fn() },
}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@infrastructure/repositories/PagoAporteRepository', () => ({ default: R.pago }));
vi.mock('@infrastructure/repositories/EstudianteBecaRepository', () => ({ default: R.beca }));

import { useCreateInscripcion } from '../registro/hooks/api/useCreateInscripcion';
import { useUpdateInscripcion } from '../registro/hooks/api/useUpdateInscripcion';
import { useDeleteInscripcion } from '../registro/hooks/api/useDeleteInscripcion';
import { useActivarCursadoInscripcion } from '../registro/hooks/api/useActivarCursadoInscripcion';
import { useSaveHistorialPrevio } from '../registro/hooks/api/useSaveHistorialPrevio';
import { useRegisterStudent } from '../nuevo/hooks/api/useRegisterStudent';
import { useUpdateStudent } from '../nuevo/hooks/api/useUpdateStudent';
import { useCreateAsignarBeca } from '../becas/hooks/api/useCreateAsignarBeca';
import { useDeleteBecaAsignada } from '../admision/hooks/api/useDeleteBecaAsignada';
import { useDeleteStudent } from '../admision/hooks/api/useDeleteStudent';
import { useDeletePagoAporte } from '../aportes/hooks/api/useDeletePagoAporte';
import { useEstadoAporteRegistro } from '../aportes/hooks/api/useEstadoAporteRegistro';
import { useGetStudentScholarships } from '../admision/hooks/api/useGetStudentScholarships';
import { useStudentCatalogApi } from '../admision/hooks/api/useStudentCatalogApi';
import { useStudentReferenceApi } from '../nuevo/hooks/api/useStudentReferenceApi';
import { useStudentGeographicApi } from '../admision/hooks/api/useStudentGeographicApi';
import { useGestionesApi } from '../nuevo/hooks/api/useGestionesApi';
import { useSearchStudent } from '../admision/hooks/api/useSearchStudent';

const caso = (nombre, ejecutar) => {
  R.casos[nombre] = vi.fn(() => ({ ejecutar }));
  return ejecutar;
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(R.casos).forEach((k) => delete R.casos[k]);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const llamar = async (fn, ...args) => {
  let r;
  await act(async () => {
    r = await fn(...args);
  });
  return r;
};

/** Mutaciones de eliminar: mismo contrato (id obligatorio, error de objeto/texto, excepción). */
describe.each([
  ['useDeleteInscripcion', useDeleteInscripcion, 'deleteInscripcion', 'eliminarInscripcion', 'ID de la inscripción es requerido', 'Error al eliminar inscripción'],
  ['useDeleteStudent', useDeleteStudent, 'deleteStudent', 'eliminarEstudiante', 'ID del estudiante es requerido', 'Error al eliminar estudiante'],
  ['useDeleteBecaAsignada', useDeleteBecaAsignada, 'deleteBecaAsignada', 'eliminarBecaAsignada', 'ID de la beca asignada es requerido', 'Error al eliminar beca asignada'],
  ['useDeletePagoAporte', useDeletePagoAporte, 'deletePagoAporte', 'eliminarPagoAporte', 'ID del pago es requerido', 'Error al eliminar pago'],
])('%s', (_n, useHook, fn, useCase, msgId, msgDefault) => {
  it('valida el id, ejecuta el caso de uso y expone el error', async () => {
    const { result } = renderHook(() => useHook());
    expect(await llamar(result.current[fn], null)).toEqual({ success: false, error: msgId });
    expect(result.current.error).toBe(msgId);

    const ejecutar = caso(useCase, vi.fn().mockResolvedValue({ success: true }));
    expect(await llamar(result.current[fn], 5)).toEqual({ success: true });
    expect(ejecutar).toHaveBeenCalledWith(5);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);

    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'Con detalle' } });
    await llamar(result.current[fn], '7');
    expect(result.current.error).toBe('Con detalle');
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current[fn], 7);
    expect(result.current.error).toBe(msgDefault);
    ejecutar.mockRejectedValueOnce(new Error('Red caída'));
    expect(await llamar(result.current[fn], 7)).toEqual({ success: false, error: 'Red caída' });
    ejecutar.mockRejectedValueOnce({});
    expect((await llamar(result.current[fn], 7)).error).toMatch(/inesperado/);
  });
});

describe('inscripciones: crear, actualizar, activar y guardar historial', () => {
  const conParalelo = { student_id: 1, parallel_id: 3 };

  it('crear valida los datos antes de llamar al caso de uso', async () => {
    const { result } = renderHook(() => useCreateInscripcion());
    const f = result.current.createInscripcion;
    expect((await llamar(f, null)).error).toMatch(/inscripción son requeridos/);
    expect((await llamar(f, {})).error).toMatch(/ID del estudiante/);
    expect((await llamar(f, { student_id: 1 })).error).toMatch(/parallel_id/);
    expect((await llamar(f, { student_id: 1, parallel_ids_by_period: {}, materia_ids_by_period: { 1: [] } })).success).toBe(false);
    expect(result.current.error).toMatch(/parallel_id/);
  });

  it('crear ejecuta con paralelo o con selección por periodo y propaga errores', async () => {
    const ejecutar = caso('crearInscripcion', vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }));
    const { result } = renderHook(() => useCreateInscripcion());
    expect((await llamar(result.current.createInscripcion, conParalelo)).success).toBe(true);
    const porPeriodo = { student_id: 1, parallel_ids_by_period: { 1: 2 }, materia_ids_by_period: { 1: [4] } };
    await llamar(result.current.createInscripcion, porPeriodo);
    expect(ejecutar).toHaveBeenLastCalledWith(porPeriodo);

    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'Pago pendiente' }, validationErrors: [{ field: 'x' }] });
    const r = await llamar(result.current.createInscripcion, conParalelo);
    expect(r.success).toBe(false);
    expect(result.current.error).toBe('Pago pendiente');
    expect(result.current.validationErrors).toEqual([{ field: 'x' }]);
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current.createInscripcion, conParalelo);
    expect(result.current.error).toBe('Error al crear inscripción');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(result.current.createInscripcion, conParalelo)).error).toBe('Caída');
  });

  it('actualizar valida id y datos, y devuelve errorDetails', async () => {
    const { result } = renderHook(() => useUpdateInscripcion());
    const f = result.current.updateInscripcion;
    expect((await llamar(f, null, {})).error).toMatch(/ID de la inscripción/);
    expect((await llamar(f, 1, null)).error).toMatch(/datos de la inscripción/);
    expect((await llamar(f, 1, {})).error).toMatch(/parallel_id/);
    const ejecutar = caso('actualizarInscripcion', vi.fn().mockResolvedValue({ success: true }));
    expect((await llamar(f, 1, { parallel_id: 2 })).success).toBe(true);
    expect(ejecutar).toHaveBeenCalledWith(1, { parallel_id: 2 });
    ejecutar.mockResolvedValueOnce({ success: false, error: 'Mal', validationErrors: ['v'], errorDetails: { code: 'X' } });
    expect(await llamar(f, 1, { parallel_id: 2 })).toMatchObject({ success: false, errorDetails: { code: 'X' } });
    expect(result.current.validationErrors).toEqual(['v']);
    ejecutar.mockResolvedValueOnce({ success: false });
    expect((await llamar(f, 1, { parallel_id: 2 })).errorDetails).toBeNull();
    expect(result.current.error).toBe('Error al actualizar inscripción');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(f, 1, { parallel_id: 2 })).error).toBe('Caída');
  });

  it('activar cursado', async () => {
    const { result } = renderHook(() => useActivarCursadoInscripcion());
    expect((await llamar(result.current.activarCursado, undefined)).error).toMatch(/ID de la inscripción/);
    const ejecutar = caso('activarCursadoInscripcion', vi.fn().mockResolvedValue({ success: true }));
    expect((await llamar(result.current.activarCursado, 3)).success).toBe(true);
    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'No' } });
    await llamar(result.current.activarCursado, 3);
    expect(result.current.error).toBe('No');
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current.activarCursado, 3);
    expect(result.current.error).toBe('Error al activar el cursado');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(result.current.activarCursado, 3)).error).toBe('Caída');
    expect(result.current.activating).toBe(false);
  });

  it('guardar historial previo', async () => {
    const { result } = renderHook(() => useSaveHistorialPrevio());
    const ejecutar = caso('guardarHistorialPrevioInscripcion', vi.fn().mockResolvedValue({ success: true }));
    expect((await llamar(result.current.saveHistorialPrevio, 1, [{ a: 1 }])).success).toBe(true);
    expect(ejecutar).toHaveBeenCalledWith(1, [{ a: 1 }]);
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current.saveHistorialPrevio, 1, []);
    expect(result.current.error).toBe('Error al guardar historial previo');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(result.current.saveHistorialPrevio, 1, [])).error).toBe('Caída');
  });
});

describe('estudiantes: registrar y actualizar', () => {
  const valido = { ci: '1', nombres: 'Ana', fechaNacimiento: '01-02-2000', generoId: 1, celular: '70000000', edad: 20 };

  it('registrar valida antes de llamar y normaliza la fecha', async () => {
    const { result } = renderHook(() => useRegisterStudent());
    const r = await llamar(result.current.registerStudent, {});
    expect(r.success).toBe(false);
    expect(r.validationErrors.length).toBeGreaterThan(0);
    expect(result.current.validationErrors).toHaveLength(r.validationErrors.length);

    const ejecutar = caso('crearEstudiante', vi.fn().mockResolvedValue({ success: true }));
    await llamar(result.current.registerStudent, valido);
    expect(ejecutar.mock.calls[0][0]).toMatchObject({ fechaNacimiento: '2000-02-01' });
    expect(ejecutar.mock.calls[0][0]).not.toHaveProperty('edad');
    await llamar(result.current.registerStudent, { ...valido, fechaNacimiento: { format: () => '1999-12-31' } });
    expect(ejecutar.mock.calls[1][0].fechaNacimiento).toBe('1999-12-31');
    await llamar(result.current.registerStudent, { ...valido, fechaNacimiento: new Date('2001-05-06T00:00:00Z') });
    expect(ejecutar.mock.calls[2][0].fechaNacimiento).toBe('2001-05-06');
  });

  it('guardado parcial vacía la documentación antes del paso de documentos', async () => {
    const ejecutar = caso('crearEstudiante', vi.fn().mockResolvedValue({ success: true }));
    const { result } = renderHook(() => useRegisterStudent());
    const base = { ...valido, documentacion: { doc_1: {} } };
    await llamar(result.current.registerStudent, base, 2, false, true);
    expect(ejecutar.mock.calls[0][0].documentacion).toEqual({});
    await llamar(result.current.registerStudent, { ...base, tipoAdmision: 'TRASPASO' }, 4, false, true);
    expect(ejecutar.mock.calls[1][0].documentacion).toEqual({});
    await llamar(result.current.registerStudent, base, 4, false, true);
    expect(ejecutar.mock.calls[2][0].documentacion).toEqual({ doc_1: {} });
  });

  it('registrar propaga errores del caso de uso', async () => {
    const ejecutar = caso('crearEstudiante', vi.fn());
    const { result } = renderHook(() => useRegisterStudent());
    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'CI duplicado' }, validationErrors: ['v'] });
    await llamar(result.current.registerStudent, valido);
    expect(result.current.error).toBe('CI duplicado');
    expect(result.current.validationErrors).toEqual(['v']);
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current.registerStudent, valido);
    expect(result.current.error).toBe('Error al registrar estudiante');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(result.current.registerStudent, valido)).error).toBe('Caída');
  });

  it('actualizar normaliza y propaga errores', async () => {
    const ejecutar = caso('actualizarEstudiante', vi.fn().mockResolvedValue({ success: true }));
    const { result } = renderHook(() => useUpdateStudent());
    await llamar(result.current.updateStudent, 9, { ...valido, tipoAdmision: 'TRANSITABILIDAD', documentacion: { doc_1: {} } }, 3, false, true);
    expect(ejecutar.mock.calls[0][0]).toBe(9);
    expect(ejecutar.mock.calls[0][1]).toMatchObject({ fechaNacimiento: '2000-02-01', documentacion: {} });
    await llamar(result.current.updateStudent, 9, { ...valido, fechaNacimiento: new Date('2001-05-06T00:00:00Z') });
    expect(ejecutar.mock.calls[1][1].fechaNacimiento).toBe('2001-05-06');
    await llamar(result.current.updateStudent, 9, { ...valido, fechaNacimiento: { format: () => '1999-01-01' } });
    expect(ejecutar.mock.calls[2][1].fechaNacimiento).toBe('1999-01-01');
    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'No' }, validationErrors: ['v'] });
    await llamar(result.current.updateStudent, 9, valido);
    expect(result.current.error).toBe('No');
    expect(result.current.validationErrors).toEqual(['v']);
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(result.current.updateStudent, 9, valido);
    expect(result.current.error).toBe('Error al actualizar estudiante');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(result.current.updateStudent, 9, valido)).error).toBe('Caída');
  });
});

describe('becas: asignar', () => {
  it('valida y ejecuta', async () => {
    const { result } = renderHook(() => useCreateAsignarBeca());
    const f = result.current.createAsignarBeca;
    expect((await llamar(f, null)).error).toMatch(/requeridos/);
    expect((await llamar(f, {})).error).toMatch(/estudiante/);
    expect((await llamar(f, { student_id: 1 })).error).toMatch(/beca\/descuento/);
    const ejecutar = caso('crearAsignarBeca', vi.fn().mockResolvedValue({ success: true }));
    expect((await llamar(f, { student_id: 1, beca_descuento_id: 2 })).success).toBe(true);
    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'Duplicada' }, validationErrors: ['v'] });
    await llamar(f, { student_id: 1, beca_descuento_id: 2 });
    expect(result.current.error).toBe('Duplicada');
    expect(result.current.validationErrors).toEqual(['v']);
    ejecutar.mockResolvedValueOnce({ success: false });
    await llamar(f, { student_id: 1, beca_descuento_id: 2 });
    expect(result.current.error).toBe('Error al crear asignación de beca');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    expect((await llamar(f, { student_id: 1, beca_descuento_id: 2 })).error).toBe('Caída');
  });
});

describe('lecturas con repositorio directo', () => {
  it('estado del aporte en el registro', async () => {
    const sin = renderHook(() => useEstadoAporteRegistro());
    expect(sin.result.current.estadoAporte).toBeNull();
    sin.result.current.refetch();
    expect(R.pago.obtenerEstadoRegistro).not.toHaveBeenCalled();

    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: true, data: { pagado: true } });
    const { result, rerender } = renderHook(({ s, g }) => useEstadoAporteRegistro(s, g), { initialProps: { s: '4', g: '2' } });
    await waitFor(() => expect(result.current.estadoAporte).toEqual({ pagado: true }));
    expect(R.pago.obtenerEstadoRegistro).toHaveBeenCalledWith(4, 2);

    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: false, error: 'Mal' });
    await act(async () => result.current.refetch());
    await waitFor(() => expect(result.current.error).toBe('Mal'));
    expect(result.current.estadoAporte).toBeNull();

    R.pago.obtenerEstadoRegistro.mockRejectedValueOnce(new Error('Caída'));
    await act(async () => result.current.refetch());
    await waitFor(() => expect(result.current.error).toBe('Caída'));

    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: false });
    rerender({ s: 5, g: null });
    await waitFor(() => expect(R.pago.obtenerEstadoRegistro).toHaveBeenLastCalledWith(5, null));
    await waitFor(() => expect(result.current.error).toMatch(/estado del aporte/));
    rerender({ s: null, g: null });
    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('becas del estudiante', async () => {
    const { result, rerender } = renderHook(({ id }) => useGetStudentScholarships(id), { initialProps: { id: null } });
    expect(result.current.scholarships).toEqual([]);
    R.beca.obtenerTodos.mockResolvedValueOnce({ success: true, data: { scholarships: [{ id: 1 }], catalogs: { scholarships: { 1: 'A' }, managements: {} } } });
    rerender({ id: 3 });
    await waitFor(() => expect(result.current.scholarships).toEqual([{ id: 1 }]));
    expect(R.beca.obtenerTodos).toHaveBeenCalledWith({ params: { studentId: 3 } });
    expect(result.current.catalogs.scholarships).toEqual({ 1: 'A' });

    R.beca.obtenerTodos.mockResolvedValueOnce({ success: true, data: { scholarships: 'x' } });
    await act(async () => result.current.refetch());
    expect(result.current.scholarships).toEqual([]);
    R.beca.obtenerTodos.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.getScholarships(3));
    expect(result.current.error).toMatch(/becas del estudiante/);
    R.beca.obtenerTodos.mockRejectedValueOnce(new Error('Caída'));
    await act(async () => result.current.refetch());
    expect(result.current.error).toBe('Caída');
    rerender({ id: null });
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.refetch()).toBeUndefined();
  });
});

describe('catálogos del estudiante', () => {
  it('carga catálogos del formulario y expone constantes', async () => {
    const ejecutar = caso('obtenerDatosRegistroEstudiante', vi.fn().mockResolvedValue({ success: true, data: { paises: [{ id: 1 }], idiomas: [{ id: 2 }], documentacion: [{ id: 3 }] } }));
    const { result } = renderHook(() => useStudentCatalogApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ejecutar).toHaveBeenCalledWith({ sequential: false });
    expect(result.current.paises).toEqual([{ id: 1 }]);
    expect(result.current.estadosCiviles).toEqual([]);
    expect(result.current.documentacionTraspaso).toEqual([]);
    expect(Array.isArray(result.current.generos)).toBe(true);

    ejecutar.mockResolvedValueOnce({ success: false, error: 'Mal' });
    await act(async () => result.current.refetch());
    expect(result.current.error).toBe('Mal');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    await act(async () => result.current.refetch());
    expect(result.current.error).toBe('Caída');
  });

  it('modo edición usa carga secuencial y falla sin mensaje', async () => {
    const ejecutar = caso('obtenerDatosRegistroEstudiante', vi.fn().mockResolvedValue({ success: false }));
    const { result } = renderHook(() => useStudentCatalogApi(5));
    await waitFor(() => expect(result.current.error).toBe('Error al cargar datos del formulario'));
    expect(ejecutar).toHaveBeenCalledWith({ sequential: true });
  });

  it('referencias: discapacidades y parentescos', async () => {
    const ejecutar = caso('obtenerDatosReferenciaFiltrados', vi.fn().mockResolvedValue({ success: true, data: [{ id: 1 }] }));
    const { result } = renderHook(() => useStudentReferenceApi());
    await llamar(result.current.loadDiscapacidades);
    expect(ejecutar).toHaveBeenCalledWith('discapacidades');
    await llamar(result.current.loadTiposParentesco);
    await waitFor(() => expect(result.current.tiposParentesco).toEqual([{ id: 1 }]));
    expect(result.current.discapacidades).toEqual([{ id: 1 }]);
    ejecutar.mockResolvedValue({ success: false, error: 'x' });
    await llamar(result.current.loadDiscapacidades);
    await llamar(result.current.loadTiposParentesco);
    await waitFor(() => expect(result.current.discapacidades).toEqual([]));
    ejecutar.mockRejectedValue(new Error('x'));
    await llamar(result.current.loadDiscapacidades);
    await llamar(result.current.loadTiposParentesco);
    expect(console.error).toHaveBeenCalled();
  });

  it('geográficos: departamentos, provincias y municipios por contexto', async () => {
    const ejecutar = caso('obtenerDatosGeograficosFiltrados', vi.fn(async (tipo) => ({ success: true, data: [{ id: tipo }] })));
    const { result } = renderHook(() => useStudentGeographicApi());
    await llamar(result.current.loadDepartamentos);
    await waitFor(() => expect(result.current.departamentos).toEqual([{ id: 'departamentos' }]));
    await llamar(result.current.loadProvincias, 1);
    await llamar(result.current.loadProvincias, 1, 'residencia');
    await llamar(result.current.loadProvincias, 1, 'segunda');
    await llamar(result.current.loadMunicipios, 2);
    await llamar(result.current.loadMunicipios, 2, 'residencia');
    await llamar(result.current.loadMunicipios, 2, 'segunda');
    await waitFor(() => expect(result.current.segundaMunicipios).toEqual([{ id: 'municipios' }]));
    expect(result.current.provincias).toEqual([{ id: 'provincias' }]);
    expect(result.current.provinciasResidencia).toHaveLength(1);
    expect(result.current.segundaProvincias).toHaveLength(1);
    expect(result.current.municipios).toHaveLength(1);
    expect(result.current.municipiosResidencia).toHaveLength(1);

    await llamar(result.current.loadProvincias, null);
    await llamar(result.current.loadMunicipios, null, 'segunda');
    await waitFor(() => expect(result.current.provincias).toEqual([]));
    expect(result.current.segundaMunicipios).toEqual([]);

    ejecutar.mockResolvedValue({ success: false, error: 'x' });
    await llamar(result.current.loadDepartamentos);
    await llamar(result.current.loadProvincias, 1);
    await llamar(result.current.loadMunicipios, 1);
    ejecutar.mockRejectedValue(new Error('x'));
    await llamar(result.current.loadDepartamentos);
    await llamar(result.current.loadProvincias, 1);
    await llamar(result.current.loadMunicipios, 1);
    await waitFor(() => expect(result.current.departamentos).toEqual([]));
  });

  it('gestiones: autocarga con filtro de vigente y búsqueda de estudiantes mapeada', async () => {
    const ejecutar = caso('obtenerTodasGestiones', vi.fn().mockResolvedValue({ success: true, data: [{ id: 1 }] }));
    const { result } = renderHook(() => useGestionesApi({ vigente: true }));
    await waitFor(() => expect(result.current.gestiones).toEqual([{ id: 1 }]));
    expect(ejecutar).toHaveBeenCalledWith({ params: { vigente: 1 } });
    renderHook(() => useGestionesApi({ vigente: false }));
    await waitFor(() => expect(ejecutar).toHaveBeenCalledWith({ params: { vigente: 0 } }));
    renderHook(() => useGestionesApi({ autoFetch: false }));

    const busca = caso('buscarEstudiante', vi.fn().mockResolvedValue({ success: true, data: [] }));
    const s = renderHook(() => useSearchStudent());
    const r = await llamar(s.result.current.searchStudent, 'perez');
    expect(busca).toHaveBeenCalledWith('perez');
    expect(r.success).toBe(true);
    expect(s.result.current.students).toEqual([]);
  });
});
