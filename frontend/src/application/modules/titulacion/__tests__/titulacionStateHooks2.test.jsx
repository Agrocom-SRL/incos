import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const app = vi.hoisted(() => ({
  api: { notification: { success: vi.fn(), error: vi.fn() }, modal: { confirm: vi.fn() } },
}));
vi.mock('antd', async (orig) => {
  const actual = await orig();
  return { ...actual, App: Object.assign(({ children }) => children, { useApp: () => app.api }) };
});

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({ formPg: {}, formPas: {}, busqueda: {}, apis: {} }));
vi.mock('@application-titulacion/proyectos-grado/hooks/context/useProyectoGradoFormContext', () => ({ useProyectoGradoFormContext: () => ctx.formPg }));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiaFormContext', () => ({ usePasantiaFormContext: () => ctx.formPas }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useBuscarEstudiantesTit', () => ({ useBuscarEstudiantesTit: () => ctx.busqueda }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useGetMiProyectoGrado', () => ({ useGetMiProyectoGrado: () => ctx.apis.mi }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useAvancesProyectoApi', () => ({ useAvancesProyectoApi: () => ctx.apis.avances }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi', () => ({ useBitacoraProyectoApi: () => ctx.apis.bitacora }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useActaDefensaApi', () => ({ useActaDefensaApi: () => ctx.apis.acta }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useModalidadesGradoApi', () => ({ useModalidadesGradoApi: () => ctx.apis.modalidades }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useRegistrarMiProyectoGradoApi', () => ({ useRegistrarMiProyectoGradoApi: () => ctx.apis.registrar }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useExportFormularioModalidadPdf', () => ({ useExportFormularioModalidadPdf: () => ctx.apis.formulario }));

import { useProyectoGradoFormPage } from '../proyectos-grado/hooks/state/useProyectoGradoFormPage';
import { useMiProyectoGradoPage } from '../proyectos-grado/hooks/state/useMiProyectoGradoPage';
import { usePasantiaFormPage } from '../pasantias/hooks/state/usePasantiaFormPage';

beforeEach(() => {
  vi.clearAllMocks();
  router.location = { pathname: '/', state: null };
  ctx.busqueda = { estudiantes: [{ id: 1, carreraId: 7, carreraNombre: 'Sis' }], loading: false, buscar: vi.fn() };
});

describe('useProyectoGradoFormPage', () => {
  const base = (over = {}) => ({
    proyectoId: null, proyecto: null, loadingProyecto: false, errorProyecto: null, saving: false,
    guardarProyecto: vi.fn().mockResolvedValue({ success: true, data: { proyectoGrado: { id: 4 } } }),
    modalidadOptions: [], modalidadById: { 1: { codigo: 'PSP' } }, loadingModalidades: false,
    carreras: [], loadingCarreras: false, carrerasDisponible: true, ...over,
  });

  it('alta individual: fuerza al titular como único estudiante', async () => {
    ctx.formPg = base();
    const { result } = renderHook(() => useProyectoGradoFormPage('create'));
    expect(result.current.pageTitle).toBe('Nuevo proyecto de grado');
    expect(result.current.modalidadGrupal).toBe(false);
    expect(result.current.estudianteOptions).toEqual([{ value: 1, carreraId: 7, carreraNombre: 'Sis' }]);
    act(() => result.current.handleEstudianteChange(1, { carreraId: 7 }));
    expect(result.current.form.getFieldValue('carreraId')).toBe(7);
    act(() => result.current.handleEstudianteChange(1, {}));
    result.current.form.validateFields = vi.fn().mockResolvedValue({ titulo: ' T ', estudianteId: 1, integranteIds: [2, 3] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.formPg.guardarProyecto).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ titulo: 'T', estudianteIds: [1] }) });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('4'), expect.objectContaining({ replace: true }));
  });

  it('edición: incluye integrantes y reporta errores', async () => {
    ctx.formPg = base({
      proyectoId: 4,
      proyecto: { titulo: 'X', integrantes: [{ estudianteId: 9, rol: 'TITULAR', estado: 'ACTIVO' }, { estudianteId: null }] },
      errorProyecto: 'Carga',
      guardarProyecto: vi.fn().mockResolvedValue({ success: false, error: 'Mal' }),
    });
    const { result } = renderHook(() => useProyectoGradoFormPage('edit'));
    await waitFor(() => expect(result.current.form.getFieldValue('titulo')).toBe('X'));
    expect(result.current.estudianteOptions.map((o) => o.value)).toEqual([1, 9]);
    expect(result.current.error).toBe('Carga');
    result.current.form.validateFields = vi.fn().mockResolvedValue({ estudianteId: 9 });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Mal');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    act(() => result.current.handleVolver());
    ctx.formPg = base({ proyectoId: null });
    expect(renderHook(() => useProyectoGradoFormPage('edit')).result.current.isInvalidEditId).toBe(true);
    ctx.formPg = base({ guardarProyecto: vi.fn().mockResolvedValue({ success: true, data: {} }) });
    const sinId = renderHook(() => useProyectoGradoFormPage('create'));
    sinId.result.current.form.validateFields = vi.fn().mockResolvedValue({ estudianteId: 1 });
    await act(async () => {
      await sinId.result.current.handleSubmit();
    });
    expect(router.navigate).toHaveBeenLastCalledWith(expect.any(String), { state: expect.any(Object) });
  });
});

describe('usePasantiaFormPage', () => {
  const base = (over = {}) => ({
    pasantiaId: null, pasantia: null, loadingPasantia: false, errorPasantia: null, saving: false,
    guardarPasantia: vi.fn().mockResolvedValue({ success: true, data: { pasantia: { id: 8 } } }),
    empresaOptions: [], loadingEmpresas: false, docentes: [], loadingDocentes: false, docentesDisponible: false, ...over,
  });

  it('alta: arma secciones y guarda', async () => {
    ctx.formPas = base();
    const { result } = renderHook(() => usePasantiaFormPage('create'));
    expect(result.current.esConvalidacion).toBe(false);
    expect(Object.keys(result.current.formSections)).toEqual(['datosTramite', 'puesto', 'responsable']);
    expect(result.current.estudianteOptions).toHaveLength(1);
    act(() => result.current.onEstudianteChange(1));
    expect(result.current.form.getFieldValue('carreraId')).toBe(7);
    act(() => result.current.onEstudianteChange(null));
    expect(result.current.form.getFieldValue('carreraId')).toBeNull();
    result.current.form.validateFields = vi.fn().mockResolvedValue({ tipo: 'PASANTIA', estudianteId: 1 });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.formPas.guardarPasantia).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ tipo: 'PASANTIA', estudianteId: 1 }) });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('8'), expect.objectContaining({ replace: true }));
  });

  it('edición: carga la pasantía y completa estudiante', async () => {
    ctx.formPas = base({ pasantiaId: 8, pasantia: { tipo: 'PASANTIA', estudianteId: 99, estudianteNombre: 'Ana' }, errorPasantia: 'Carga', guardarPasantia: vi.fn().mockResolvedValue({ success: false }) });
    const { result } = renderHook(() => usePasantiaFormPage('edit'));
    await waitFor(() => expect(result.current.form.getFieldValue('tipo')).toBe('PASANTIA'));
    expect(result.current.estudianteOptions.map((o) => o.value)).toEqual([1, 99]);
    expect(result.current.error).toBe('Carga');
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('No se pudo guardar el trámite de pasantía');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    act(() => result.current.handleVolver());
    ctx.formPas = base({ pasantiaId: null });
    expect(renderHook(() => usePasantiaFormPage('edit')).result.current.isInvalidEditId).toBe(true);
    ctx.formPas = base({ guardarPasantia: vi.fn().mockResolvedValue({ success: true, data: {} }) });
    const sinId = renderHook(() => usePasantiaFormPage('create'));
    sinId.result.current.form.validateFields = vi.fn().mockResolvedValue({ tipo: 'CONVALIDACION' });
    await act(async () => {
      await sinId.result.current.handleSubmit();
    });
    expect(router.navigate).toHaveBeenLastCalledWith(expect.any(String), { state: expect.any(Object) });
  });
});

describe('useMiProyectoGradoPage', () => {
  const montarApis = (over = {}) => {
    ctx.apis = {
      mi: { proyecto: { id: 3 }, sinProyecto: false, loading: false, error: null, refetch: vi.fn() },
      avances: { avances: [], loading: false, descargandoId: null, subiendo: false, cargar: vi.fn(), subirAvance: vi.fn().mockResolvedValue({ success: true }), descargarArchivo: vi.fn().mockResolvedValue({ success: true }) },
      bitacora: { entradas: [], loading: false, cargar: vi.fn(), confirmarEntrada: vi.fn().mockResolvedValue({ success: true }) },
      acta: { actas: [], loading: false, error: null, cargar: vi.fn() },
      modalidades: { options: [{ value: 1, label: 'PSP' }, { value: 2, label: 'Tesis' }], modalidadById: { 1: { codigo: 'PSP' }, 2: { codigo: 'TES' } }, loading: false },
      registrar: { registrando: false, registrar: vi.fn().mockResolvedValue({ success: true }) },
      formulario: { descargando: false, exportarPdf: vi.fn().mockResolvedValue({ success: true }) },
      ...over,
    };
  };

  it('carga avances, bitácora y acta del proyecto y excluye modalidades grupales', () => {
    montarApis();
    const { result } = renderHook(() => useMiProyectoGradoPage());
    expect(ctx.apis.avances.cargar).toHaveBeenCalledWith(3);
    expect(ctx.apis.bitacora.cargar).toHaveBeenCalledWith(3);
    expect(ctx.apis.acta.cargar).toHaveBeenCalledWith(3);
    expect(result.current.registro.modalidadOptions).toEqual([{ value: 2, label: 'Tesis' }]);
    expect(result.current.breadcrumbItems).toHaveLength(3);
  });

  it('sin proyecto no carga relaciones', () => {
    montarApis({ mi: { proyecto: null, sinProyecto: true, loading: false, error: null, refetch: vi.fn() } });
    renderHook(() => useMiProyectoGradoPage());
    expect(ctx.apis.avances.cargar).not.toHaveBeenCalled();
  });

  it('registra el proyecto propio', async () => {
    montarApis();
    ctx.apis.registrar.registrar.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Mal' });
    const { result } = renderHook(() => useMiProyectoGradoPage());
    result.current.registro.form.validateFields = vi.fn().mockResolvedValue({ titulo: ' T ', objetivos: ' ', modalidadId: '2' });
    await act(async () => {
      await result.current.registro.submit();
    });
    expect(ctx.apis.registrar.registrar).toHaveBeenCalledWith({ titulo: 'T', objetivos: undefined, modalidadId: 2 });
    expect(ctx.apis.mi.refetch).toHaveBeenCalled();
    await act(async () => {
      await result.current.registro.submit();
    });
    expect(app.api.notification.error).toHaveBeenCalled();
  });

  it('exporta formulario, sube y descarga avances', async () => {
    montarApis();
    ctx.apis.formulario.exportarPdf.mockResolvedValue({ success: false, error: 'No' });
    const { result } = renderHook(() => useMiProyectoGradoPage());
    await act(async () => {
      await result.current.formularioModalidad.exportar();
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(1);
    act(() => result.current.setUploadOpen(true));
    let r;
    await act(async () => {
      r = await result.current.handleSubirAvance({});
    });
    expect(r.success).toBe(false);
    await act(async () => {
      await result.current.handleSubirAvance({ file: 'f', titulo: 't' });
    });
    expect(result.current.uploadOpen).toBe(false);
    expect(ctx.apis.avances.cargar).toHaveBeenCalledTimes(2);
    ctx.apis.avances.subirAvance.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.handleSubirAvance({ file: 'f' });
    });
    ctx.apis.avances.descargarArchivo.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.handleDescargarAvance({ id: 1 });
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(3);
  });

  it('confirma entradas de la bitácora', async () => {
    montarApis();
    ctx.apis.bitacora.confirmarEntrada.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => useMiProyectoGradoPage());
    await act(async () => {
      await result.current.handleConfirmarEntrada({});
    });
    expect(ctx.apis.bitacora.confirmarEntrada).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.handleConfirmarEntrada({ id: 4 });
    });
    expect(ctx.apis.bitacora.confirmarEntrada).toHaveBeenCalledWith(3, 4);
    expect(ctx.apis.bitacora.cargar).toHaveBeenCalledTimes(2);
    await act(async () => {
      await result.current.handleConfirmarEntrada({ id: 5 });
    });
    expect(result.current.confirmandoId).toBeNull();
    expect(app.api.notification.error).toHaveBeenCalled();
  });
});
