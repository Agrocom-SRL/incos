import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from 'antd';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  http: { post: vi.fn() },
  docente: { obtenerMisEstudiantes: vi.fn() },
  porId: { inscripcion: null, loading: false, error: null, getInscripcionById: vi.fn(), refetch: vi.fn() },
  app: null,
  activar: { activarCursado: vi.fn(), activating: false },
  inscApi: { inscripciones: [], loading: false, error: null, refetch: vi.fn() },
  del: vi.fn(),
  exportar: vi.fn(),
  carreras: { carreras: [], loading: false },
  permisos: {},
  listCtx: {},
  showMessage: vi.fn(),
  tableArgs: null,
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@api-client', () => ({ default: R.http }));
vi.mock('@infrastructure/repositories/DocenteRepository.js', () => ({ default: R.docente }));
vi.mock('../hooks/api/useGetInscripcionById', () => ({ useGetInscripcionById: () => R.porId }));
vi.mock('../hooks/api/useActivarCursadoInscripcion', () => ({ useActivarCursadoInscripcion: () => R.activar }));
vi.mock('@application-matricula/registro/hooks/api/useInscripcionesApi', () => ({
  useInscripcionesApi: () => R.inscApi,
  inscripcionesListFetchParams: () => ({ params: { page: 1 } }),
}));
vi.mock('@application-matricula/registro/hooks/api/useDeleteInscripcion', () => ({ useDeleteInscripcion: () => ({ deleteInscripcion: R.del, loading: false }) }));
vi.mock('../hooks/features/useExportListaInscritosPorCarreraExcel', () => ({ useExportListaInscritosPorCarreraExcel: () => ({ exportar: R.exportar, loading: false }) }));
vi.mock('@application-shared/hooks', () => ({ useCarrerasCatalogApi: () => R.carreras }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), useMessage: () => R.showMessage }));
vi.mock('@/presentation/hooks/usePermiso.js', () => ({ usePermiso: (codigo) => R.permisos[codigo] ?? false }));
vi.mock('../hooks/context/useInscripcionesListContext', () => ({ useInscripcionesListContext: () => R.listCtx }));
vi.mock('@matricula/registro/config', () => ({
  createInscripcionesTableColumns: (...args) => ((R.tableArgs = args), ['cols']),
}));

import { useGenerateBoletaInscripcion } from '../hooks/features/useGenerateBoletaInscripcion';
import { mapMisEstudianteRow, useMisEstudiantesDocente } from '../hooks/features/useMisEstudiantesDocente';
import { useInscripcionesData } from '../hooks/state/useInscripcionesData';
import { useInscripcionNuevaPeriodos } from '../hooks/features/useInscripcionNuevaPeriodos';
import { useInscripcionNuevaPageData } from '../hooks/features/useInscripcionNuevaPageData';
import { useMatriculaDetail, useMatriculaDetailPage } from '../hooks/state/matricula-detail';
import { useMatriculaDetailFetch } from '../hooks/state/matricula-detail/useMatriculaDetailFetch';
import { useMatriculaDetailNavigation } from '../hooks/state/matricula-detail/useMatriculaDetailNavigation';
import { useMatriculaDetailBoleta } from '../hooks/state/matricula-detail/useMatriculaDetailBoleta';
import { useMatriculaDetailEntity } from '../hooks/state/matricula-detail/useMatriculaDetailEntity';
import { useMatriculaDetailSchedules } from '../hooks/state/matricula-detail/useMatriculaDetailSchedules';
import { useMatriculaDetailActivation } from '../hooks/state/matricula-detail/useMatriculaDetailActivation';
import { useMatriculaListExport } from '../hooks/state/matricula-list/useMatriculaListExport';
import { useMatriculaListFilters } from '../hooks/state/matricula-list/useMatriculaListFilters';
import { useMatriculaListTable } from '../hooks/state/matricula-list/useMatriculaListTable';
import { useMatriculaListPage } from '../hooks/state/matricula-list';

const appWrapper = ({ children }) => (
  <MemoryRouter>
    <App>{children}</App>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  R.app = { modal: { confirm: vi.fn() }, message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } };
  R.porId = { inscripcion: null, loading: false, error: null, getInscripcionById: vi.fn(), refetch: vi.fn() };
  R.inscApi = { inscripciones: [], loading: false, error: null, refetch: vi.fn() };
  R.carreras = { carreras: [{ id: 1, nombre: 'Sistemas', codigo: 'SIS', colorHex: '#123456' }, { id: 2, nombre: 'Redes' }], loading: false };
  R.permisos = {};
  R.listCtx = { inscripciones: [{ id: 1 }], searchText: 'x', refetch: vi.fn(), deleteInscripcion: vi.fn() };
});
afterEach(() => vi.useRealTimers());

describe('useGenerateBoletaInscripcion', () => {
  it('rechaza sin id de estudiante', async () => {
    const { result } = renderHook(() => useGenerateBoletaInscripcion());
    let r;
    await act(async () => {
      r = await result.current.generateBoletaInscripcion(null);
    });
    expect(r.success).toBe(false);
    expect(result.current.error).toBe('ID del estudiante requerido');
  });

  it('genera la boleta y descarga el archivo con la ruta normalizada', async () => {
    R.http.post.mockResolvedValue({ data: { success: true, data: { filePath: './uploads//boleta.pdf', fileName: 'b.pdf' } } });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { result } = renderHook(() => useGenerateBoletaInscripcion());
    let r;
    await act(async () => {
      r = await result.current.generateBoletaInscripcion(4);
    });
    expect(r.success).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    expect(R.http.post.mock.calls[0][2]).toEqual({ timeout: 60000 });
    expect(result.current.loading).toBe(false);
    click.mockRestore();
  });

  it('devuelve el error del servidor', async () => {
    R.http.post.mockRejectedValue(new Error('Caída'));
    const { result } = renderHook(() => useGenerateBoletaInscripcion());
    let r;
    await act(async () => {
      r = await result.current.generateBoletaInscripcion(4);
    });
    expect(r.success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});

describe('useMisEstudiantesDocente', () => {
  it('mapea una fila del backend', () => {
    expect(mapMisEstudianteRow(null)).toBeNull();
    const f = mapMisEstudianteRow({ estudianteId: 1, ofertaCursoId: 2, nombres: 'Ana', apellidoPaterno: 'Pérez', materiaSigla: 'MAT' });
    expect(f).toMatchObject({ id: 1, rowKey: '1-2', nombreCompleto: 'Pérez Ana', materiaSigla: 'MAT', ci: null });
    expect(mapMisEstudianteRow({}).rowKey).toBe('e-c');
  });

  it('carga, filtra por texto y refresca', async () => {
    R.docente.obtenerMisEstudiantes.mockResolvedValue({
      success: true,
      data: {
        gestion: { anio: 2026, nombre: 'Gestión 2026' },
        estudiantes: [
          { estudianteId: 1, ofertaCursoId: 1, nombres: 'Ana', apellidoPaterno: 'Pérez', carreraNombre: 'Sistemas' },
          { estudianteId: 2, ofertaCursoId: 1, nombres: 'Luis', apellidoPaterno: 'Gómez', ci: '555' },
        ],
      },
    });
    const { result } = renderHook(() => useMisEstudiantesDocente());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalEstudiantes).toBe(2);
    expect(result.current.gestion).toEqual({ anio: 2026, nombre: 'Gestión 2026' });
    act(() => result.current.setSearchText(' sistemas '));
    expect(result.current.estudiantes).toHaveLength(1);
    act(() => result.current.setSearchText('555'));
    expect(result.current.estudiantes[0].estudianteId).toBe(2);
    act(() => result.current.setSearchText(''));
    await act(async () => result.current.refetch());
    expect(R.docente.obtenerMisEstudiantes).toHaveBeenCalledTimes(2);
  });

  it('errores y modo deshabilitado', async () => {
    R.docente.obtenerMisEstudiantes.mockResolvedValue({ success: false, error: { message: 'Sin permiso' } });
    const { result } = renderHook(() => useMisEstudiantesDocente());
    await waitFor(() => expect(result.current.error).toBe('Sin permiso'));
    expect(result.current.estudiantes).toEqual([]);
    R.docente.obtenerMisEstudiantes.mockResolvedValue({ success: false, error: 'Texto' });
    await act(async () => result.current.refetch());
    expect(result.current.error).toBe('Texto');
    R.docente.obtenerMisEstudiantes.mockResolvedValue({ success: true, data: { estudiantes: 'x' } });
    await act(async () => result.current.refetch());
    expect(result.current.gestion).toEqual({ anio: null, nombre: null });
    R.docente.obtenerMisEstudiantes.mockClear();
    const off = renderHook(() => useMisEstudiantesDocente(false));
    await act(async () => off.result.current.refetch());
    expect(R.docente.obtenerMisEstudiantes).not.toHaveBeenCalled();
  });
});

describe('useInscripcionesData', () => {
  it('sincroniza con la API sin reemplazar si los ids no cambian y administra la lista', async () => {
    const a = [{ id: 1 }, { id: 2 }];
    const { result, rerender } = renderHook(() => useInscripcionesData());
    expect(result.current.inscripciones).toEqual([]);
    R.inscApi = { ...R.inscApi, inscripciones: a };
    rerender();
    expect(result.current.inscripciones).toBe(a);
    R.inscApi = { ...R.inscApi, inscripciones: [{ id: 1 }, { id: 2 }] };
    rerender();
    expect(result.current.inscripciones).toBe(a);
    R.inscApi = { ...R.inscApi, inscripciones: [{ id: 3 }] };
    rerender();
    expect(result.current.inscripciones).toEqual([{ id: 3 }]);

    act(() => result.current.addInscripcion({ id: 4 }));
    act(() => result.current.addInscripcion({ id: 4 }));
    act(() => result.current.updateInscripcion({ id: 3, x: 1 }));
    expect(result.current.inscripciones).toEqual([{ id: 4 }, { id: 3, x: 1 }]);
    act(() => result.current.removeInscripcion(4));
    R.del.mockResolvedValue({ success: true });
    await act(async () => {
      await result.current.deleteInscripcion(3);
    });
    expect(result.current.inscripciones).toEqual([]);
    R.del.mockResolvedValue({ success: false });
    act(() => result.current.addInscripcion({ id: 9 }));
    await act(async () => {
      await result.current.deleteInscripcion(9);
    });
    expect(result.current.inscripciones).toHaveLength(1);
    await act(async () => result.current.refetch());
    expect(R.inscApi.refetch).toHaveBeenLastCalledWith({ params: { page: 1 } });
    await act(async () => result.current.refetch({ params: { page: 3 } }));
    expect(R.inscApi.refetch).toHaveBeenLastCalledWith({ params: { page: 3 } });
  });
});

describe('periodos y datos de página del wizard', () => {
  const contexto = { periodos: [{ id: 2, numero: 2 }, { id: 1, numero: 1, nombre: 'Primero' }, { id: 3 }] };

  it('ordena los periodos y selecciona los que tienen materias marcadas', () => {
    const sel = { 2: [5], 1: [], 9: 'x', 3: [7] };
    const { result } = renderHook(() => useInscripcionNuevaPeriodos({ contexto, selectedMateriaIdsByPeriod: sel }));
    expect(result.current.periodos.map((p) => p.nombre)).toEqual(['Periodo 3', 'Primero', 'Periodo 2']);
    expect(result.current.selectedPeriodIds).toEqual([3, 2]);
    expect(result.current.selectedPeriod.id).toBe(3);
    const vacio = renderHook(() => useInscripcionNuevaPeriodos()).result.current;
    expect(vacio).toMatchObject({ periodos: [], selectedPeriod: null, periodosDisabledByTraspaso: null });
  });

  it('bloquea periodos según el año cursado en traspaso', () => {
    const r = (tipo, anio) => renderHook(() => useInscripcionNuevaPeriodos({ tipoAdmision: tipo, anioCursadoTraspaso: anio })).result.current.periodosDisabledByTraspaso;
    expect(r('TRASPASO', 'primero')).toEqual({ 1: true, 2: false, 3: false });
    expect(r('TRASPASO', 'SEGUNDO')).toEqual({ 1: true, 2: true, 3: false });
    expect(r('TRASPASO', 'TERCERO')).toBeNull();
    expect(r('TRASPASO', null)).toBeNull();
    expect(r('ANTIGUO', 'PRIMERO')).toBeNull();
  });

  it('título y migas según el modo', () => {
    expect(renderHook(() => useInscripcionNuevaPageData()).result.current.pageTitle).toBe('Inscribir estudiantes nuevos');
    const e = renderHook(() => useInscripcionNuevaPageData({ mode: 'editar' })).result.current;
    expect(e.pageTitle).toBe('Editar inscripción');
    expect(e.breadcrumbItems.at(-1).title).toBe('Editar inscripción');
  });
});

describe('detalle de matrícula', () => {
  const inscripcion = {
    enrollment: { id: 5, tipoInscripcion: 'ANTIGUO', studentId: 8 },
    student: { id: 8, nombres: 'Ana', apellidoPaterno: 'Pérez' },
    career: { nombre: 'Sistemas' },
    priorEnrollmentHistories: [{ a: 1 }],
    subjectEnrollments: [
      {
        id: 1,
        status: 'INSCRITO',
        materiaSigla: 'MAT',
        materiaNombre: 'Matemática',
        paralelo: { nombre: 'A', turno: 'MAÑANA' },
        docente: { nombreCompleto: 'Prof' },
        horarios: [{ id: 9, horario: { dia: 'LUNES', horaInicio: '08:00', horaFin: '09:30' }, aula: { codigo: 'A1' } }, { horario: {} }],
      },
      { id: 2, status: 'CURSANDO', paralelo: { turno: 'NOCHE' }, horarios: [{ dia: 'MARTES', horaInicio: '19:00', horaFin: '20:00' }] },
      { id: 3, status: 'X' },
    ],
  };

  it('fetch: carga por id (texto) y recarga con él', async () => {
    const { result } = renderHook(() => useMatriculaDetailFetch(5));
    expect(result.current.inscripcionId).toBe('5');
    expect(R.porId.getInscripcionById).toHaveBeenCalledWith('5');
    await act(async () => result.current.refetch());
    expect(R.porId.refetch).toHaveBeenCalledWith('5');
    const sin = renderHook(() => useMatriculaDetailFetch(null));
    await act(async () => sin.result.current.refetch());
    expect(R.porId.getInscripcionById).toHaveBeenCalledTimes(1);
  });

  it('navegación: volver a la ficha del estudiante, a la lista y editar', () => {
    const wrapper = (state) => ({ children }) => <MemoryRouter initialEntries={[{ pathname: '/', state }]}>{children}</MemoryRouter>;
    const a = renderHook(() => useMatriculaDetailNavigation('5', inscripcion), { wrapper: wrapper({ studentId: 3 }) });
    act(() => a.result.current.handleVolverAtras());
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/3');
    const b = renderHook(() => useMatriculaDetailNavigation('5', inscripcion), { wrapper: wrapper(undefined) });
    act(() => b.result.current.handleVolverAtras());
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/8');
    const c = renderHook(() => useMatriculaDetailNavigation('5', null), { wrapper: wrapper(undefined) });
    act(() => c.result.current.handleVolverAtras());
    expect(R.navigate).toHaveBeenLastCalledWith('/matricula/listar');
    act(() => c.result.current.handleEditar());
    expect(R.navigate).toHaveBeenLastCalledWith('/inscripciones/5/editar');
    const d = renderHook(() => useMatriculaDetailNavigation(null, null), { wrapper: wrapper(undefined) });
    R.navigate.mockClear();
    act(() => d.result.current.handleEditar());
    expect(R.navigate).not.toHaveBeenCalled();
    expect(d.result.current.breadcrumbItems).toHaveLength(3);
  });

  it('entidad: tipo, edición, estado del historial y avatar', () => {
    const e = renderHook(() => useMatriculaDetailEntity(inscripcion)).result.current;
    expect(e).toMatchObject({ tipoInscripcion: 'ANTIGUO', canEdit: true, nombreCompleto: 'Ana Pérez', avatarText: 'AP' });
    expect(e.historialEstadoInfo.color).toBe('success');
    const sin = renderHook(() => useMatriculaDetailEntity(undefined)).result.current;
    expect(sin).toMatchObject({ canEdit: false, avatarText: 'IN', subjectEnrollments: [] });
    expect(sin.historialEstadoInfo.color).toBe('warning');
    expect(renderHook(() => useMatriculaDetailEntity({ requiereHistorialPrevio: false })).result.current.historialEstadoInfo.color).toBe('default');
    expect(renderHook(() => useMatriculaDetailEntity({ historialPrevioEstado: 'REGISTRADO', enrollment: { tipo_inscripcion: 'NUEVO' } })).result.current.tipoInscripcion).toBe('NUEVO');
  });

  it('horarios: arma los bloques por curso y ajusta el rango con turno noche', () => {
    const { result } = renderHook(() => useMatriculaDetailSchedules(inscripcion.subjectEnrollments, inscripcion.career));
    expect(result.current.courseSchedules).toHaveLength(2);
    expect(result.current.courseSchedules[0]).toMatchObject({ cursoId: 1, cursoCodigo: 'MAT', carrera: 'Sistemas', paralelo: 'A', turno: 'MAÑANA', docente: 'Prof' });
    expect(result.current.courseSchedules[0].bloques).toEqual([{ cursoHorarioId: 9, dia: 'LUNES', horaInicio: '08:00', horaFin: '09:30', aula: 'A1', orden: 1 }]);
    expect(result.current.sabadoRangeInscripcion.end).toBeGreaterThanOrEqual(22 * 60);
    expect(result.current.gridRangeInscripcion.start).toBeLessThanOrEqual(result.current.gridRangeInscripcion.end);
    const vacio = renderHook(() => useMatriculaDetailSchedules(undefined, null)).result.current;
    expect(vacio.courseSchedules).toEqual([]);
    expect(vacio.gridRangeInscripcion).toBeDefined();
    const uno = renderHook(() => useMatriculaDetailSchedules([{ id: 1, paralelo: { turno: 'TARDE' }, horarios: [{ horario: { dia: 'LUNES', horaInicio: '14:00' } }] }], null)).result.current;
    expect(uno.courseSchedules[0].carrera).toBeNull();
  });

  it('activación del cursado pide confirmación y refresca', async () => {
    const refetch = vi.fn();
    const { result } = renderHook(() => useMatriculaDetailActivation({ inscripcionId: '5', subjectEnrollments: inscripcion.subjectEnrollments, refetch }));
    expect(result.current).toMatchObject({ puedeActivar: true, estadoCursado: 'CURSANDO' });
    const solo = renderHook(() => useMatriculaDetailActivation({ inscripcionId: '5', subjectEnrollments: [{ status: 'INSCRITO' }] }));
    expect(solo.result.current.estadoCursado).toBe('INSCRITO');
    const vacio = renderHook(() => useMatriculaDetailActivation({}));
    expect(vacio.result.current).toMatchObject({ estadoCursado: null, puedeActivar: false });
    act(() => vacio.result.current.handleActivarCursado());
    expect(R.app.modal.confirm).not.toHaveBeenCalled();

    act(() => result.current.handleActivarCursado());
    const { onOk } = R.app.modal.confirm.mock.calls[0][0];
    R.activar.activarCursado.mockResolvedValueOnce({ success: true });
    await act(async () => onOk());
    expect(R.activar.activarCursado).toHaveBeenCalledWith('5');
    expect(R.app.message.success).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
    R.activar.activarCursado.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => onOk());
    expect(R.app.message.error).toHaveBeenCalledWith('No');
    R.activar.activarCursado.mockResolvedValueOnce({ success: false });
    await act(async () => onOk());
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo activar el cursado.');
  });

  it('boleta: valida el estudiante y refleja los resultados', async () => {
    const sin = renderHook(() => useMatriculaDetailBoleta(null));
    await act(async () => sin.result.current.handleDownloadOrGenerateBoleta());
    expect(R.app.message.error).toHaveBeenCalledWith(expect.stringMatching(/ID del estudiante/));
    expect(R.http.post).not.toHaveBeenCalled();

    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    R.http.post.mockResolvedValue({ data: { success: true, data: {} } });
    const con = renderHook(() => useMatriculaDetailBoleta({ student: { id: 8 }, formularioInscripcion: { filePath: '/a.pdf' } }));
    expect(con.result.current.boletaInscripcion).toEqual({ filePath: '/a.pdf' });
    await act(async () => con.result.current.handleDownloadOrGenerateBoleta());
    expect(R.app.message.success).toHaveBeenCalledWith('Boleta de inscripción descargada correctamente');

    R.http.post.mockRejectedValue(new Error('Caída'));
    await act(async () => con.result.current.handleDownloadOrGenerateBoleta());
    expect(R.app.message.error).toHaveBeenCalled();
    click.mockRestore();
  });
});

describe('listado de matrículas', () => {
  it('exportación: permisos, carrera elegida y avisos', async () => {
    R.permisos = { 'matricula.inscribir': true };
    const { result } = renderHook(() => useMatriculaListExport());
    expect(result.current.puedeExportarLista).toBe(true);
    expect(result.current.carreraSelectOptions[1]).toMatchObject({ value: 2, color: '#1677ff' });
    await act(async () => result.current.handleExportLista());
    expect(R.showMessage).toHaveBeenLastCalledWith('warning', 'Seleccione una carrera para exportar');
    act(() => result.current.setSelectedCarreraId(1));
    expect(result.current.carreraColor).toBe('#123456');
    R.exportar.mockResolvedValueOnce({ success: true });
    await act(async () => result.current.handleExportLista());
    expect(R.exportar).toHaveBeenCalledWith({ carreraId: 1 });
    expect(R.showMessage).toHaveBeenLastCalledWith('success', 'Archivo generado');
    R.exportar.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.handleExportLista());
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'No se pudo exportar');
    R.exportar.mockResolvedValueOnce({ success: false, error: 'Sin datos' });
    await act(async () => result.current.handleExportLista());
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Sin datos');
    R.permisos = {};
    expect(renderHook(() => useMatriculaListExport()).result.current.puedeExportarLista).toBe(false);
    R.carreras = {};
    expect(renderHook(() => useMatriculaListExport()).result.current.carreraSelectOptions).toEqual([]);
  });

  it('filtros: limpia el paralelo al cambiar de carrera', () => {
    const rows = [
      { carrera: { id: 1 }, paralelo: { id: 10 }, tipoInscripcion: 'NUEVO' },
      { carrera: { id: 2 }, paralelo: { id: 20 }, tipoInscripcion: 'ANTIGUO' },
    ];
    const { result } = renderHook(() => useMatriculaListFilters(rows));
    expect(result.current.paralelosForCarrera).toHaveLength(2);
    act(() => result.current.setFilter('paraleloId', 20));
    act(() => result.current.setFilter('carreraId', 1));
    expect(result.current.filters).toMatchObject({ carreraId: 1, paraleloId: null });
    expect(result.current.paralelosForCarrera.map((p) => p.id)).toEqual([10]);
    expect(result.current.filteredRows).toHaveLength(1);
    expect(result.current.hasActiveFilters).toBe(true);
    act(() => result.current.setFilter('carreraId', 1));
    act(() => result.current.setFilter('tipoInscripcion', undefined));
    act(() => result.current.clearFilters());
    expect(result.current.hasActiveFilters).toBe(false);
    expect(renderHook(() => useMatriculaListFilters()).result.current.filteredRows).toEqual([]);
  });

  it('tabla: toma el contexto de la lista y navega a la inscripción nueva', () => {
    const { result } = renderHook(() => useMatriculaListTable(), { wrapper: appWrapper });
    expect(result.current.inscripciones).toEqual([{ id: 1 }]);
    expect(result.current.tableColumns).toEqual(['cols']);
    expect(R.tableArgs[0]).toBe(R.navigate);
    expect(R.tableArgs[3]).toHaveProperty('isSmall');
    act(() => result.current.handleNuevaInscripcion());
    expect(R.navigate).toHaveBeenCalledWith('/matricula/nueva');
    expect(result.current.breadcrumbItems).toHaveLength(2);
    R.listCtx = {};
    const vacia = renderHook(() => useMatriculaListTable(), { wrapper: appWrapper });
    expect(vacia.result.current).toMatchObject({ inscripciones: [], loading: false, error: null, totalBeforeFilters: 0 });
    const page = renderHook(() => useMatriculaListPage(), { wrapper: appWrapper });
    expect(page.result.current).toHaveProperty('handleExportLista');
    expect(page.result.current).toHaveProperty('handleNuevaInscripcion');
  });
});

describe('composición del detalle', () => {
  it('useMatriculaDetail reúne fetch, navegación, entidad, horarios y activación', () => {
    R.porId.inscripcion = { enrollment: { id: 5 }, student: { id: 8 }, subjectEnrollments: [] };
    const { result } = renderHook(() => useMatriculaDetail(5), { wrapper: appWrapper });
    expect(result.current).toMatchObject({ inscripcionId: '5', courseSchedules: [], puedeActivar: false });
    expect(result.current).toHaveProperty('handleEditar');
    expect(result.current).toHaveProperty('handleDownloadOrGenerateBoleta');
    const alias = renderHook(() => useMatriculaDetailPage(5), { wrapper: appWrapper });
    expect(alias.result.current.inscripcionId).toBe('5');
  });
});
