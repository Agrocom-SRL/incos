import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const app = vi.hoisted(() => ({
  api: {
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
    notification: { success: vi.fn(), error: vi.fn() },
    modal: { confirm: vi.fn() },
  },
}));
vi.mock('antd', async (orig) => {
  const actual = await orig();
  return { ...actual, App: Object.assign(({ children }) => children, { useApp: () => app.api }) };
});

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/titulacion/x', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({
  listaPas: {}, empresasLista: {}, empresaDetalle: {}, empresaForm: {}, seguimiento: {}, listaProy: {}, acta: {},
  misPas: {}, misTut: {}, bitacora: {}, mutaciones: {}, seguimientosApi: {}, empMut: {}, exportar: {}, miPasantia: {},
}));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiasListContext', () => ({ usePasantiasListContext: () => ctx.listaPas }));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiasEmpresasListContext', () => ({ usePasantiasEmpresasListContext: () => ctx.empresasLista }));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiaEmpresaDetailContext', () => ({ usePasantiaEmpresaDetailContext: () => ctx.empresaDetalle }));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiaEmpresaFormContext', () => ({ usePasantiaEmpresaFormContext: () => ctx.empresaForm }));
vi.mock('@application-titulacion/proyectos-grado/hooks/context/useSeguimientoTutoriaDocentesContext', () => ({ useSeguimientoTutoriaDocentesContext: () => ctx.seguimiento }));
vi.mock('@application-titulacion/proyectos-grado/hooks/context/useProyectosGradoListContext', () => ({ useProyectosGradoListContext: () => ctx.listaProy }));
vi.mock('@application-titulacion/proyectos-grado/hooks/context/useRegistrarActaDefensaContext', () => ({ useRegistrarActaDefensaContext: () => ctx.acta }));
vi.mock('@application-titulacion/pasantias/hooks/api/useMisPasantiasApi', () => ({ useMisPasantiasApi: () => ctx.misPas }));
vi.mock('@application-titulacion/pasantias/hooks/api/useSeguimientosPasantiaApi', () => ({ useSeguimientosPasantiaApi: () => ctx.seguimientosApi }));
vi.mock('@application-titulacion/pasantias/hooks/api/usePasantiaEmpresaMutations', () => ({ usePasantiaEmpresaMutations: () => ctx.empMut }));
vi.mock('@application-titulacion/pasantias/hooks/api/useGetMiPasantia', () => ({ useGetMiPasantia: () => ctx.miPasantia }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useMisTutoradosApi', () => ({ useMisTutoradosApi: () => ctx.misTut }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi', () => ({ useBitacoraProyectoApi: () => ctx.bitacora }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useProyectoGradoMutations', () => ({ useProyectoGradoMutations: () => ctx.mutaciones }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useExportAvanceTutoriaCarreraPdf', () => ({ useExportAvanceTutoriaCarreraPdf: () => ctx.exportar }));

const cols = vi.hoisted(() => ({ pas: null, tut: null }));
vi.mock('@titulacion/pasantias/config/misPasantiasTableColumns', () => ({
  createMisPasantiasTableColumns: (h) => {
    cols.pas = h;
    return [{ key: 'x' }];
  },
}));
vi.mock('@titulacion/proyectos-grado/config/misTutoradosTableColumns', () => ({
  createMisTutoradosTableColumns: (h) => {
    cols.tut = h;
    return [{ key: 'x' }];
  },
}));

import { useMiPasantiaPage } from '../pasantias/hooks/state/useMiPasantiaPage';
import { usePasantiasListPage } from '../pasantias/hooks/state/usePasantiasListPage';
import { useMisPasantiasSupervisadasPage } from '../pasantias/hooks/state/useMisPasantiasSupervisadasPage';
import { usePasantiasEmpresasListPage } from '../pasantias/hooks/state/usePasantiasEmpresasListPage';
import { usePasantiaEmpresaDetailPage } from '../pasantias/hooks/state/usePasantiaEmpresaDetailPage';
import { usePasantiaEmpresaFormPage } from '../pasantias/hooks/state/usePasantiaEmpresaFormPage';
import { useSeguimientoTutoriaDocentesPage } from '../proyectos-grado/hooks/state/useSeguimientoTutoriaDocentesPage';
import { useProyectosGradoListPage } from '../proyectos-grado/hooks/state/useProyectosGradoListPage';
import { useRegistrarActaDefensaPage } from '../proyectos-grado/hooks/state/useRegistrarActaDefensaPage';
import { useMisTutoradosPage } from '../proyectos-grado/hooks/state/useMisTutoradosPage';

beforeEach(() => {
  vi.clearAllMocks();
  router.location = { pathname: '/titulacion/x', state: null };
});

describe('listados de pasantías', () => {
  it('mi pasantía expone el estado de la consulta', () => {
    ctx.miPasantia = { pasantia: { id: 1 }, informes: [], seguimientos: [], sinPasantia: false, loading: false, error: null, refetch: vi.fn() };
    const { result } = renderHook(() => useMiPasantiaPage());
    expect(result.current.pasantia.id).toBe(1);
    expect(result.current.breadcrumbItems).toHaveLength(3);
  });

  it('listado: filtros, opciones y acciones', async () => {
    const eliminar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce(undefined);
    ctx.listaPas = {
      pasantias: [
        { id: 1, gestionId: 1, gestionLabel: '2025', carreraId: 1, carreraNombre: 'Sistemas', tipo: 'PASANTIA', estado: 'EN_CURSO' },
        { id: 2, gestionId: 2, carreraId: 2, carreraCodigo: 'CON', tipo: 'CONVALIDACION', estado: 'SOLICITADA' },
        { id: 3, gestionId: 1, carreraId: 1, tipo: 'PASANTIA', estado: 'SOLICITADA' },
      ],
      setSearchText: vi.fn(), refetch: vi.fn(), tablePagination: {}, eliminarPasantia: eliminar,
    };
    const { result } = renderHook(() => usePasantiasListPage());
    expect(result.current.pasantias).toHaveLength(3);
    expect(result.current.gestionOptions.map((o) => o.label)).toEqual(['Gestión 2', '2025']);
    expect(result.current.carreraOptions.map((o) => o.label)).toEqual(['CON', 'Sistemas']);
    act(() => result.current.setFiltro('tipo', 'PASANTIA'));
    expect(result.current.pasantias).toHaveLength(2);
    act(() => result.current.setFiltro('estado', 'SOLICITADA'));
    act(() => result.current.setFiltro('gestionId', 1));
    act(() => result.current.setFiltro('carreraId', 1));
    expect(result.current.pasantias.map((p) => p.id)).toEqual([3]);
    act(() => result.current.setFiltro('tipo', undefined));
    expect(result.current.filtros.tipo).toBeNull();
    result.current.handleSearchChange({ target: { value: 'a' } });
    expect(ctx.listaPas.setSearchText).toHaveBeenCalledWith('a');
    act(() => result.current.handleRegistrar());
    act(() => result.current.handleVerEmpresas());
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
    expect(result.current.tipoOptions).toHaveLength(2);
  });

  it('mis pasantías supervisadas: búsqueda, drawer y guardado', async () => {
    const guardar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'X' });
    const refetch = vi.fn();
    ctx.misPas = { pasantias: [{ id: 1, estudianteNombre: 'Ana', empresaNombre: 'Embol' }, { id: 2, estudianteNombre: 'Beto', carreraNombre: 'Sis' }], loading: false, error: null, refetch };
    ctx.seguimientosApi = { guardarSeguimiento: guardar };
    const { result } = renderHook(() => useMisPasantiasSupervisadasPage());
    expect(result.current.pasantias).toHaveLength(2);
    act(() => result.current.handleSearchChange({ target: { value: 'embol' } }));
    expect(result.current.pasantias.map((p) => p.id)).toEqual([1]);
    await act(async () => {
      await result.current.handleGuardarSeguimiento({});
    });
    expect(guardar).not.toHaveBeenCalled();
    act(() => cols.pas.onVerPasantia({ id: 9 }));
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('9'), { state: expect.any(Object) });
    act(() => cols.pas.onRegistrarSeguimiento({ id: 1, estudianteNombre: 'Ana' }));
    expect(result.current.seguimientoDrawer.open).toBe(true);
    await act(async () => {
      await result.current.handleGuardarSeguimiento({ nivel: 'ALTO' });
    });
    expect(guardar).toHaveBeenCalledWith(1, null, { nivel: 'ALTO' });
    expect(app.api.notification.success).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
    expect(result.current.seguimientoDrawer.open).toBe(false);
    act(() => cols.pas.onRegistrarSeguimiento({ id: 1, estudianteNombre: 'Ana' }));
    await act(async () => {
      await result.current.handleGuardarSeguimiento({});
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.cerrarSeguimiento());
    expect(result.current.seguimientoDrawer.pasantia).toBeNull();
  });
});

describe('empresas de pasantía', () => {
  it('lista: búsqueda, cambio de estado y navegación', async () => {
    const cambiar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const refetch = vi.fn();
    ctx.empresasLista = {
      empresas: [{ id: 1, nombre: 'Embol', nit: '123' }, { id: 2, nombre: 'Otra', sectorActividad: 'Comercio' }],
      cambiarEstadoEmpresa: cambiar, eliminarEmpresa: vi.fn(), refetch,
    };
    router.location = { pathname: '/', state: { returnListPath: '/pasantias' } };
    const { result } = renderHook(() => usePasantiasEmpresasListPage());
    expect(result.current.empresas).toHaveLength(2);
    act(() => result.current.handleSearchChange({ target: { value: 'comercio' } }));
    expect(result.current.empresas.map((e) => e.id)).toEqual([2]);
    expect(result.current.breadcrumbItems[2].href).toBe('/pasantias');
    act(() => result.current.handleRegistrar());
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenLastCalledWith('/pasantias', expect.any(Object));
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
  });

  it('detalle: editar y eliminar con confirmación', async () => {
    const eliminar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'No' });
    ctx.empresaDetalle = { empresaId: 4, empresa: { nombre: 'Embol' }, loading: false, error: null, refetch: vi.fn() };
    ctx.empMut = { eliminarEmpresa: eliminar };
    const { result } = renderHook(() => usePasantiaEmpresaDetailPage());
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('4'), expect.any(Object));
    act(() => result.current.handleEliminar());
    const opts = app.api.modal.confirm.mock.calls[0][0];
    expect(opts.content).toContain('Embol');
    await act(async () => {
      await opts.onOk();
    });
    expect(eliminar).toHaveBeenCalledWith(4);
    expect(app.api.notification.success).toHaveBeenCalled();
    await act(async () => {
      await opts.onOk();
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.handleVolver());
    ctx.empresaDetalle = { empresaId: null };
    app.api.modal.confirm.mockClear();
    const sin = renderHook(() => usePasantiaEmpresaDetailPage());
    act(() => sin.result.current.handleEliminar());
    act(() => sin.result.current.handleEditar());
    expect(app.api.modal.confirm).not.toHaveBeenCalled();
  });

  it('formulario: alta y edición', async () => {
    ctx.empresaForm = { empresaId: null, empresa: null, loadingEmpresa: false, errorEmpresa: null, saving: false, guardarEmpresa: vi.fn().mockResolvedValue({ success: true }) };
    const { result } = renderHook(() => usePasantiaEmpresaFormPage('create'));
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: ' Embol ', enFuncionamiento: true });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.empresaForm.guardarEmpresa).toHaveBeenCalledWith({ empresaId: null, payload: expect.objectContaining({ nombre: 'Embol' }) });
    expect(router.navigate).toHaveBeenCalled();
    expect(Object.keys(result.current.formSections)).toEqual(['datosEmpresa', 'contacto']);

    ctx.empresaForm = { empresaId: 4, empresa: { nombre: 'Embol', nit: '9' }, loadingEmpresa: false, errorEmpresa: 'Carga', saving: false, guardarEmpresa: vi.fn().mockResolvedValue({ success: false, error: 'Mal' }) };
    const e = renderHook(() => usePasantiaEmpresaFormPage('edit'));
    await waitFor(() => expect(e.result.current.form.getFieldValue('nombre')).toBe('Embol'));
    expect(e.result.current.error).toBe('Carga');
    e.result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await e.result.current.handleSubmit();
    });
    expect(e.result.current.error).toBe('Mal');
    e.result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await e.result.current.handleSubmit();
    });
    expect(e.result.current.error).toBe('Revise los campos obligatorios');
    ctx.empresaForm = { empresaId: 4, empresa: null, loadingEmpresa: false, errorEmpresa: null, saving: false, guardarEmpresa: vi.fn() };
    expect(renderHook(() => usePasantiaEmpresaFormPage('edit')).result.current.error).toMatch(/No se encontró/);
    ctx.empresaForm = { empresaId: null, empresa: null, saving: false, guardarEmpresa: vi.fn() };
    expect(renderHook(() => usePasantiaEmpresaFormPage('edit')).result.current.isInvalidEditId).toBe(true);
  });
});

describe('proyectos de grado', () => {
  it('seguimiento de tutorías: periodo y exportación', async () => {
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    ctx.seguimiento = {
      seguimiento: null, loading: false, error: null, exportar, exportando: false,
      carreras: [{ id: 1, nombre: 'Sis' }], loadingCarreras: false, docentes: [], loadingDocentes: false,
      docenteId: 3, setDocenteId: vi.fn(), carreraId: 1, setCarreraId: vi.fn(),
      periodo: { year: () => 2026, month: () => 4 }, setPeriodo: vi.fn(),
    };
    const { result } = renderHook(() => useSeguimientoTutoriaDocentesPage());
    expect(result.current.carreraOptions).toEqual([{ value: 1, label: 'Sis' }]);
    await act(async () => {
      await result.current.handleExportar();
      await result.current.handleExportar();
    });
    expect(exportar).toHaveBeenCalledWith({ docenteId: 3, carreraId: 1, anio: 2026, mes: 5 });
    expect(app.api.message.error).toHaveBeenCalledTimes(1);
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/titulacion/proyectos-grado');
    ctx.seguimiento = { ...ctx.seguimiento, periodo: null };
    const b = renderHook(() => useSeguimientoTutoriaDocentesPage());
    await act(async () => {
      await b.result.current.handleExportar();
    });
    expect(exportar).toHaveBeenLastCalledWith(expect.objectContaining({ anio: undefined, mes: undefined }));
    router.location = { pathname: '/', state: { returnListPath: '/ret' } };
    const c = renderHook(() => useSeguimientoTutoriaDocentesPage());
    act(() => c.result.current.handleVolver());
    expect(router.navigate).toHaveBeenLastCalledWith('/ret');
  });

  it('listado de proyectos: filtros y acciones', async () => {
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    ctx.exportar = { exportar, exportando: false };
    const eliminar = vi.fn().mockResolvedValue({ success: true });
    ctx.listaProy = {
      proyectos: [
        { id: 1, carreraId: 1, carreraNombre: 'Sis', modalidadId: 1, estado: 'PERFIL' },
        { id: 2, carreraId: 2, carreraCodigo: 'CON', modalidadId: 2, estado: 'APROBADO' },
        { id: 3, carreraId: 3, modalidadId: 1, estado: 'PERFIL' },
      ],
      setSearchText: vi.fn(), refetch: vi.fn(), tablePagination: {}, eliminarProyecto: eliminar,
    };
    const { result } = renderHook(() => useProyectosGradoListPage());
    expect(result.current.carreraOptions.map((o) => o.label)).toEqual(['Carrera 3', 'CON', 'Sis']);
    expect(result.current.estadoOptions).toHaveLength(10);
    act(() => result.current.setFiltro('modalidadId', 1));
    act(() => result.current.setFiltro('estado', 'PERFIL'));
    act(() => result.current.setFiltro('carreraId', 3));
    expect(result.current.proyectos.map((p) => p.id)).toEqual([3]);
    act(() => result.current.setFiltro('carreraId', null));
    expect(result.current.proyectos).toHaveLength(2);
    await act(async () => {
      await result.current.handleExportarAvanceCarrera();
      await result.current.handleExportarAvanceCarrera();
    });
    expect(app.api.message.error).toHaveBeenCalledTimes(1);
    act(() => result.current.handleRegistrar());
    act(() => result.current.handleIrSeguimientoTutoriaDocentes());
    expect(router.navigate).toHaveBeenCalledTimes(2);
    result.current.handleSearchChange({ target: { value: 'z' } });
    expect(ctx.listaProy.setSearchText).toHaveBeenCalledWith('z');
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
    expect(result.current.modalidadOptions).toEqual([]);
  });

  it('acta de defensa: construye el payload y navega', async () => {
    const registrar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Mal' });
    ctx.acta = {
      proyectoId: 5, proyecto: { integrantes: [{ estudianteId: 1, estado: 'ACTIVO' }, { estudianteId: 2, estado: 'BAJA' }] },
      loading: false, error: null,
      docentesCatalogo: { docentes: [{ value: 1 }], loading: false, disponible: true },
      registrarActaDefensa: { registrar, saving: false },
    };
    const { result } = renderHook(() => useRegistrarActaDefensaPage());
    expect(result.current.integrantesActivos).toHaveLength(1);
    expect(result.current.form.getFieldValue('tribunal')).toHaveLength(3);
    const fecha = { format: () => '2026-05-06' };
    result.current.form.validateFields = vi.fn().mockResolvedValue({
      fechaDefensa: fecha, horaInicio: { format: () => '10:00' }, tribunal: [{ docenteId: 1, cargo: ' Presidente ' }, { docenteId: 2, cargo: '' }],
      calificaciones: { 1: 88 }, numeroActa: 7,
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(registrar).toHaveBeenCalledWith(5, {
      fechaDefensa: '2026-05-06', horaInicio: '10:00', horaConclusion: undefined,
      tribunal: [{ docenteId: 1, cargo: 'Presidente' }, { docenteId: 2, cargo: undefined }],
      calificaciones: [{ estudianteId: 1, calificacionFinal: 88 }], numeroActa: 7,
    });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('5'), { state: expect.objectContaining({ activeTab: 'acta-defensa' }) });
    result.current.form.validateFields = vi.fn().mockResolvedValue({ fechaDefensa: fecha, horaInicio: { format: () => '10:00' }, horaConclusion: { format: () => '11:00' } });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.submitError).toBe('Mal');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.submitError).toBe('Revise los campos obligatorios');
    act(() => result.current.handleVolver());
    expect(result.current.docentes).toHaveLength(1);
    ctx.acta = { ...ctx.acta, proyecto: null };
    expect(renderHook(() => useRegistrarActaDefensaPage()).result.current.integrantesActivos).toEqual([]);
  });

  it('mis tutorados: búsqueda, bitácora y aprobación final', async () => {
    const crear = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const aprobar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const refetch = vi.fn();
    ctx.misTut = { proyectos: [{ id: 1, titulo: 'Sistema', integrantesResumen: 'Ana' }, { id: 2, titulo: 'Otro', carreraNombre: 'Sis' }], loading: false, error: null, refetch };
    ctx.bitacora = { crearEntrada: crear };
    ctx.mutaciones = { aprobarEtapa: aprobar };
    const { result } = renderHook(() => useMisTutoradosPage());
    act(() => result.current.handleSearchChange({ target: { value: 'ana' } }));
    expect(result.current.proyectos.map((p) => p.id)).toEqual([1]);
    await act(async () => {
      await result.current.handleGuardarBitacora({});
    });
    expect(crear).not.toHaveBeenCalled();
    act(() => cols.tut.onVerProyecto({ id: 7 }));
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('7'), { state: expect.any(Object) });
    act(() => cols.tut.onRegistrarBitacora({ id: 1, titulo: 'Sistema' }));
    expect(result.current.bitacoraDrawer.open).toBe(true);
    await act(async () => {
      await result.current.handleGuardarBitacora({ actividad: 'x' });
    });
    expect(crear).toHaveBeenCalledWith(1, { actividad: 'x' });
    expect(refetch).toHaveBeenCalledTimes(1);
    act(() => cols.tut.onRegistrarBitacora({ id: 1, titulo: 'Sistema' }));
    await act(async () => {
      await result.current.handleGuardarBitacora({});
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.cerrarBitacora());
    expect(result.current.bitacoraDrawer.open).toBe(false);

    act(() => cols.tut.onAprobacionFinal({ id: 1, titulo: 'Sistema' }));
    const opts = app.api.modal.confirm.mock.calls[0][0];
    await act(async () => {
      await opts.onOk();
    });
    expect(aprobar).toHaveBeenCalledWith(1, { estado: 'APROBADO' });
    expect(refetch).toHaveBeenCalledTimes(2);
    await act(async () => {
      await opts.onOk();
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(2);
  });
});
