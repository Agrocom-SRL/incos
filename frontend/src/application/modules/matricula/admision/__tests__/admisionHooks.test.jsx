import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  http: { post: vi.fn() },
  casos: {},
  downloadBlob: vi.fn(),
  downloadFile: vi.fn(),
  app: null,
  porId: { student: null, loading: false, error: null, getStudentById: vi.fn(), refetch: vi.fn() },
  acta: { generateActaCompromiso: vi.fn(), loading: false },
  decl: { generateDeclaracionJurada: vi.fn(), loading: false },
  pagosCtx: null,
  estado: { estadoAporte: null, loading: false, refetch: vi.fn() },
  estApi: { estudiantes: [], loading: false, error: null, refetch: vi.fn() },
  del: vi.fn(),
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@api-client', () => ({ default: R.http }));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob, downloadFile: R.downloadFile }));
vi.mock('@navigation-services/routeMapper', () => ({ MENU_SIDEBAR_KEY_MAT_APORTES: 'aportes' }));
vi.mock('@application-matricula/admision/hooks/api', () => ({ useGetStudentById: () => R.porId }));
vi.mock('../hooks/features', () => ({
  useGenerateActaCompromiso: () => R.acta,
  useGenerateDeclaracionJurada: () => R.decl,
}));
vi.mock('@application-pagos/hooks', () => ({
  usePagosContextOptional: () => R.pagosCtx,
  useEstadoAporteRegistro: () => R.estado,
}));
vi.mock('@application-matricula/admision/mappers', () => ({ mapEstudianteDetail: (x) => x }));
vi.mock('@application-matricula/admision/hooks/api/useEstudiantesApi', () => ({
  useEstudiantesApi: () => R.estApi,
  estudiantesListFetchParams: () => ({ params: { page: 1 } }),
}));
vi.mock('@application-matricula/admision/hooks/api/useDeleteStudent', () => ({ useDeleteStudent: () => ({ deleteStudent: R.del, loading: false }) }));

import { useStudentDetail } from '../hooks/state/useStudentDetail';
import { useStudentData } from '../hooks/state/useStudentData';
import { useGenerateActaCompromiso } from '../hooks/features/useGenerateActaCompromiso';
import { useGenerateDeclaracionJurada } from '../hooks/features/useGenerateDeclaracionJurada';
import { useExportEstadisticaInscritosExcel } from '../hooks/features/useExportEstadisticaInscritosExcel';
import { useScholarshipsSection } from '../hooks/features/useScholarshipsSection';

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(R.casos).forEach((k) => delete R.casos[k]);
  R.app = { message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } };
  R.porId = { student: null, loading: false, error: null, getStudentById: vi.fn(), refetch: vi.fn() };
  R.pagosCtx = null;
  R.estado = { estadoAporte: null, loading: false, refetch: vi.fn() };
  R.estApi = { estudiantes: [], loading: false, error: null, refetch: vi.fn() };
});

describe('useStudentDetail', () => {
  const alumno = {
    student: { nombreCompleto: 'Ana Pérez', tipoAdmision: 'NUEVO' },
    inscripcion: { enrollment: { id: 5 }, career: { code: 'SIS', name: 'Sistemas' }, management: { name: 'Gestión', year: 2026 } },
    actaCompromiso: { filePath: '/a.pdf', fileName: 'a.pdf' },
    tieneDocumentosFaltantes: true,
  };

  it('carga el estudiante y deriva datos de la ficha', () => {
    R.porId.student = alumno;
    const { result } = renderHook(() => useStudentDetail(3));
    expect(R.porId.getStudentById).toHaveBeenCalledWith(3);
    expect(result.current).toMatchObject({
      avatarInitials: 'AP',
      hasInscripcion: true,
      tieneDocumentosFaltantesFlag: true,
      profileSubtitle: 'SIS - Sistemas · Gestión (2026)',
      access: { tieneAcceso: false },
      catalogs: {},
    });
    result.current.refetch();
    expect(R.porId.refetch).toHaveBeenCalledWith(3);
    expect(result.current.breadcrumbItems).toHaveLength(3);
  });

  it('sin datos: iniciales, subtítulo y sin carga', () => {
    const { result } = renderHook(() => useStudentDetail(null));
    expect(R.porId.getStudentById).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ student: null, avatarInitials: '?', profileSubtitle: 'Estudiante', hasInscripcion: false });
    R.porId.student = { student: { nombres: 'Luis' }, inscripcion: { career: { name: 'Redes' } } };
    const b = renderHook(() => useStudentDetail(1));
    expect(b.result.current.avatarInitials).toBe('LU');
    expect(b.result.current.profileSubtitle).toBe('Redes');
  });

  it('registrar pago: sin id, aporte cubierto, pago existente más reciente o formulario nuevo', () => {
    const sin = renderHook(() => useStudentDetail(null));
    act(() => sin.result.current.handleRegistrarPago());
    expect(R.app.message.warning).toHaveBeenCalled();

    R.estado.estadoAporte = { saldo_pendiente: 0, cabecera: { id: 40 } };
    const cubierto = renderHook(() => useStudentDetail(3));
    act(() => cubierto.result.current.handleRegistrarPago());
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/40', { state: { studentId: 3, menuSidebarKey: 'aportes' } });
    act(() => cubierto.result.current.handleVerDetallePago());
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/40', expect.anything());

    R.estado.estadoAporte = null;
    R.pagosCtx = {
      pagos: [
        { id: 1, estudiante: { id: 3 } },
        { id: 9, studentId: 3 },
        { id: 12, student_id: 99 },
        { id: 0, estudianteId: 3 },
      ],
    };
    const conPagos = renderHook(() => useStudentDetail(3));
    act(() => conPagos.result.current.handleRegistrarPago());
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/9', expect.anything());
    act(() => conPagos.result.current.handleVerDetallePago());

    R.pagosCtx = { pagos: [{ id: 5, estudiante_id: 77 }] };
    const otro = renderHook(() => useStudentDetail(3));
    act(() => otro.result.current.handleRegistrarPago());
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/registrar', { state: { studentId: 3, menuSidebarKey: 'aportes' } });
  });

  it('desempata pagos por fecha de creación', () => {
    R.pagosCtx = { pagos: [{ id: 4, student: { id: 3 }, createdAt: '2026-01-01' }, { id: 4, student: { id: 3 }, createdAt: '2026-02-01' }] };
    const { result } = renderHook(() => useStudentDetail(3));
    act(() => result.current.handleRegistrarPago());
    expect(R.navigate).toHaveBeenLastCalledWith('/pagos/4', expect.anything());
  });

  it('generar acta y declaración: mensajes de éxito y de error', async () => {
    R.porId.student = { student: { tipoAdmision: 'ANTIGUO' } };
    const { result } = renderHook(() => useStudentDetail(3));
    R.acta.generateActaCompromiso.mockResolvedValueOnce({ success: true });
    await act(async () => result.current.handleGenerateActaCompromiso());
    expect(R.app.message.success).toHaveBeenCalledWith(expect.stringMatching(/Acta de compromiso/));
    for (const [error, esperado] of [
      ['Texto', 'Texto'],
      [{ message: 'Con mensaje' }, 'Con mensaje'],
      [{ code: 'E1' }, 'E1: Error desconocido'],
    ]) {
      R.acta.generateActaCompromiso.mockResolvedValueOnce({ success: false, error });
      await act(async () => result.current.handleGenerateActaCompromiso());
      expect(R.app.message.error).toHaveBeenLastCalledWith(esperado);
    }
    R.acta.generateActaCompromiso.mockResolvedValueOnce({ success: false, message: 'Msg' });
    await act(async () => result.current.handleGenerateActaCompromiso());
    expect(R.app.message.error).toHaveBeenLastCalledWith('Msg');
    R.acta.generateActaCompromiso.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.handleGenerateActaCompromiso());
    expect(R.app.message.error).toHaveBeenLastCalledWith('Error al generar el acta de compromiso');

    R.decl.generateDeclaracionJurada.mockResolvedValueOnce({ success: true });
    await act(async () => result.current.handleGenerateDeclaracionJurada());
    expect(R.decl.generateDeclaracionJurada).toHaveBeenCalledWith(3, { tipoAdmision: 'ANTIGUO' });
    for (const [error, esperado] of [
      ['Texto', 'Texto'],
      [{ message: 'Con mensaje' }, 'Con mensaje'],
      [{ code: 'E2' }, 'E2: Error desconocido'],
    ]) {
      R.decl.generateDeclaracionJurada.mockResolvedValueOnce({ success: false, error });
      await act(async () => result.current.handleGenerateDeclaracionJurada());
      expect(R.app.message.error).toHaveBeenLastCalledWith(esperado);
    }
    R.decl.generateDeclaracionJurada.mockResolvedValueOnce({ success: false, message: 'Msg' });
    await act(async () => result.current.handleGenerateDeclaracionJurada());
    R.decl.generateDeclaracionJurada.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.handleGenerateDeclaracionJurada());
    expect(R.app.message.error).toHaveBeenLastCalledWith('Error al generar la declaración jurada');

    const sin = renderHook(() => useStudentDetail(null));
    await act(async () => sin.result.current.handleGenerateActaCompromiso());
    await act(async () => sin.result.current.handleGenerateDeclaracionJurada());
    expect(R.app.message.error).toHaveBeenLastCalledWith('ID de estudiante no disponible');
  });

  it('descarga del acta, ver inscripción y nueva inscripción', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    R.porId.student = { student: {}, actaCompromiso: { filePath: '/a.pdf', fileName: 'a.pdf' }, inscripcion: { enrollment: { id: 7 } } };
    const { result } = renderHook(() => useStudentDetail(3));
    act(() => result.current.handleDownloadActaCompromiso());
    expect(R.downloadFile).toHaveBeenCalledWith('/a.pdf', 'a.pdf');
    R.downloadFile.mockImplementationOnce(() => {
      throw new Error('x');
    });
    act(() => result.current.handleDownloadActaCompromiso());
    expect(R.app.message.error).toHaveBeenCalled();
    act(() => result.current.handleVerInscripcion());
    expect(R.navigate).toHaveBeenLastCalledWith('/inscripciones/7', { state: { studentId: 3 } });
    act(() => result.current.handleNuevaInscripcion());
    expect(R.navigate).toHaveBeenLastCalledWith('/inscripciones/7', { state: { studentId: 3 } });

    R.porId.student = { student: {} };
    const b = renderHook(() => useStudentDetail(3));
    act(() => b.result.current.handleDownloadActaCompromiso());
    act(() => b.result.current.handleVerInscripcion());
    act(() => b.result.current.handleNuevaInscripcion());
    expect(R.navigate).toHaveBeenLastCalledWith('/matricula/nueva', { state: { studentId: 3 } });
  });
});

describe('useStudentData', () => {
  it('copia la lista de la API solo si trae filas y administra altas, cambios y bajas', async () => {
    const { result, rerender } = renderHook(() => useStudentData());
    R.estApi = { ...R.estApi, estudiantes: [{ id: 1 }, { id: 2 }] };
    rerender();
    expect(result.current.estudiantes).toHaveLength(2);
    R.estApi = { ...R.estApi, estudiantes: [] };
    rerender();
    expect(result.current.estudiantes).toHaveLength(2);
    act(() => result.current.addStudent({ id: 3 }));
    act(() => result.current.addStudent({ id: 3 }));
    act(() => result.current.updateStudent({ id: 1, x: 1 }));
    expect(result.current.estudiantes.map((e) => e.id)).toEqual([3, 1, 2]);
    act(() => result.current.removeStudent(2));
    R.del.mockResolvedValue({ success: true });
    await act(async () => result.current.deleteStudent(1));
    R.del.mockResolvedValue({ success: false });
    await act(async () => result.current.deleteStudent(3));
    expect(result.current.estudiantes.map((e) => e.id)).toEqual([3]);
    await act(async () => result.current.refetch());
    expect(R.estApi.refetch).toHaveBeenLastCalledWith({ params: { page: 1 } });
    await act(async () => result.current.refetch({ params: { page: 2 } }));
    expect(R.estApi.refetch).toHaveBeenLastCalledWith({ params: { page: 2 } });
  });
});

describe('generación de documentos del estudiante', () => {
  it.each([
    ['acta de compromiso', useGenerateActaCompromiso, 'generateActaCompromiso', 'ID de estudiante requerido'],
    ['declaración jurada', useGenerateDeclaracionJurada, 'generateDeclaracionJurada', 'ID de estudiante requerido'],
  ])('%s: valida el id, descarga el PDF y reporta errores', async (_n, useHook, fn, msg) => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { result } = renderHook(() => useHook());
    let r;
    await act(async () => {
      r = await result.current[fn](null);
    });
    expect(r).toEqual({ success: false, error: msg });
    R.http.post.mockResolvedValueOnce({ data: { success: true, data: { filePath: '../uploads//x.pdf', fileName: 'x.pdf' } } });
    await act(async () => {
      r = await result.current[fn](4, { tipoAdmision: 'NUEVO' });
    });
    expect(r.success).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    if (fn === 'generateDeclaracionJurada') expect(R.http.post.mock.calls[0][1]).toEqual({ tipoAdmision: 'NUEVO' });
    R.http.post.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await act(async () => {
      await result.current[fn](4);
    });
    expect(click).toHaveBeenCalledTimes(1);
    R.http.post.mockRejectedValueOnce(new Error('Caída'));
    await act(async () => {
      r = await result.current[fn](4);
    });
    expect(r.success).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
    click.mockRestore();
  });
});

describe('exportación y becas de la ficha', () => {
  it('exporta la estadística de inscritos', async () => {
    const { result } = renderHook(() => useExportEstadisticaInscritosExcel());
    expect(await result.current.exportar()).toEqual({ success: false, error: 'No se pudo inicializar la exportación' });
    const ejecutar = vi.fn().mockResolvedValue({ success: true, blob: 'B' });
    R.casos.exportarEstadisticaInscritosExcel = () => ({ ejecutar });
    let r;
    await act(async () => {
      r = await result.current.exportar({ a: 1 });
    });
    expect(r.success).toBe(true);
    expect(R.downloadBlob).toHaveBeenCalledWith('B', 'estadistica_inscritos.xlsx');
    ejecutar.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.exportar();
    });
    expect(r.error).toBe('No se pudo generar el archivo');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    await act(async () => {
      r = await result.current.exportar();
    });
    expect(r.error).toBe('Caída');
    ejecutar.mockRejectedValueOnce({});
    await act(async () => {
      r = await result.current.exportar();
    });
    expect(r.error).toBe('Error al exportar');
  });

  it('resume las becas para la sección', () => {
    const { result } = renderHook(() => useScholarshipsSection([
      { id: 1, scholarshipName: 'Excelencia', scholarshipCode: 'EXC', managementYear: 2026, state: 'ACTIVA', scholarshipPercentage: 50, documentsComplete: true },
      { scholarshipCode: 'X', estado: 'PENDIENTE', fechaSolicitud: '2026-01-01', documentosCompletos: false },
    ]));
    expect(result.current[0]).toMatchObject({ key: 1, scholarshipName: 'Excelencia', estado: 'ACTIVA', pct: 50, managementLabel: 2026, docsOk: true, itemName: 'la beca Excelencia' });
    expect(result.current[0].itemDetails).toHaveLength(3);
    expect(result.current[1]).toMatchObject({ key: 1, scholarshipName: 'Beca 2', estado: 'PENDIENTE', requestDate: '2026-01-01', docsOk: false, itemName: 'la beca X' });
    expect(renderHook(() => useScholarshipsSection()).result.current).toEqual([]);
    expect(renderHook(() => useScholarshipsSection([{}])).result.current[0].itemName).toBe('la beca asignada');
  });
});
