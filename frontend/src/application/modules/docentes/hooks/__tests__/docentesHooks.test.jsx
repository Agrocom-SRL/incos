import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/docentes/listar', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('@api-client', () => ({ default: http }));

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }) }));

const repo = vi.hoisted(() => ({ obtenerMisDatos: vi.fn() }));
vi.mock('@infrastructure/repositories/DocenteRepository.js', () => ({ default: repo }));

const geo = vi.hoisted(() => ({ value: {} }));
vi.mock('@application-matricula/admision/hooks/api', () => ({ useStudentGeographicApi: () => geo.value }));

const apiDoc = vi.hoisted(() => ({ value: {} }));
vi.mock('@application-docentes/hooks/api', () => ({ useGetDocenteById: () => apiDoc.value }));

const listCtx = vi.hoisted(() => ({ value: {} }));
vi.mock('@application-docentes/hooks/context/useDocentesListContext', () => ({ useDocentesListContext: () => listCtx.value }));

import { docenteListMapper, mapDocentesList } from '../../mappers/docenteListMapper';
import { mapDocenteDetailFromApi } from '../../mappers/docenteDetailMapper';
import { useDocenteColorApi } from '../api/useDocenteColorApi';
import { useMiDocenteId } from '../api/useMiDocenteId';
import { useDocenteDetail } from '../state/useDocenteDetail';
import { useDocentesListPage } from '../state/useDocentesListPage';
import { useDocentesDetailPage } from '../state/useDocentesDetailPage';
import { useDocentesFormPage } from '../state/useDocentesFormPage';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/docentes/listar', state: null };
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('mappers de docentes', () => {
  it('docenteListMapper normaliza campos y estadísticas', () => {
    expect(docenteListMapper(null)).toBeNull();
    const d = docenteListMapper({
      id: 1, firstName: 'Juan', lastName: 'Pérez', motherLastName: 'Gómez', ci: '123', expedition: 'LP',
      hireDate: new Date('2026-01-02T00:00:00Z'), color_hex: 'ff0000',
      teachingStats: { totalAsignaciones: 2, conflictos: { curso: 1, horario: 1 } },
    });
    expect(d.nombreCompleto).toBe('Pérez Gómez Juan');
    expect(d.ciCompleto).toBe('123 LP');
    expect(d.colorHex).toBe('#ff0000');
    expect(d.fechaContratacion).toBe('2026-01-02T00:00:00.000Z');
    expect(d.teachingStats).toMatchObject({ hasAsignaciones: true });
    expect(d.teachingStats.conflictos).toEqual({ curso: 1, horario: 1, aula: 0, total: 2, hasConflictos: true });
    const vacio = docenteListMapper({ id: 2, nombreCompleto: 'X', ciCompleto: '9' });
    expect(vacio).toMatchObject({ nombreCompleto: 'X', ciCompleto: '9', fechaContratacion: null, maxHorasSemana: null });
    expect(mapDocentesList(null)).toEqual([]);
    expect(mapDocentesList([{ id: 1 }, null])).toHaveLength(1);
  });
  it('mapDocenteDetailFromApi', () => {
    expect(mapDocenteDetailFromApi(null)).toBeNull();
    expect(mapDocenteDetailFromApi({})).toEqual({ profile: {}, assignments: [], courseSchedules: [], access: { tieneAcceso: false } });
    expect(mapDocenteDetailFromApi({ profile: { a: 1 }, assignments: [1] }).profile).toEqual({ a: 1 });
  });
});

describe('api de docentes', () => {
  it('useDocenteColorApi: paleta y guardado, con errores', async () => {
    const { result } = renderHook(() => useDocenteColorApi());
    http.get.mockResolvedValueOnce({ data: { success: true, data: ['#fff'] } });
    expect(await result.current.fetchColoresSugeridos()).toEqual({ success: true, data: ['#fff'] });
    http.get.mockResolvedValueOnce({ data: { success: false, error: 'No' } });
    expect(await result.current.fetchColoresSugeridos()).toEqual({ success: false, error: 'No' });
    http.get.mockRejectedValueOnce(new Error('Red'));
    expect((await result.current.fetchColoresSugeridos()).success).toBe(false);
    http.put.mockResolvedValueOnce({ data: { success: true, data: { ok: 1 } } });
    expect((await result.current.updateDocenteColor(3, '#000')).success).toBe(true);
    expect(http.put).toHaveBeenCalledWith(expect.stringContaining('3'), { color_hex: '#000' });
    http.put.mockResolvedValueOnce({ data: { success: false } });
    expect((await result.current.updateDocenteColor(3, '#000')).error).toBe('Error en la respuesta del servidor');
    http.put.mockRejectedValueOnce(new Error('Red'));
    expect((await result.current.updateDocenteColor(3, '#000')).success).toBe(false);
  });
  it('useMiDocenteId', async () => {
    repo.obtenerMisDatos.mockResolvedValueOnce({ success: true, data: { id: 5 } });
    const { result } = renderHook(() => useMiDocenteId());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.docenteId).toBe(5);
    repo.obtenerMisDatos.mockResolvedValueOnce({ success: true, data: {} });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/identificar/);
    repo.obtenerMisDatos.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('Red');
  });
});

describe('useDocenteDetail', () => {
  const base = (docente = null) => ({ docente, loading: false, error: null, getDocenteById: vi.fn(), refetch: vi.fn() });
  it('consulta el docente y calcula iniciales', () => {
    apiDoc.value = base({ profile: { nombreCompleto: 'Ana María López' }, assignments: [1], courseSchedules: [2], access: { tieneAcceso: true } });
    const { result } = renderHook(() => useDocentesDetailPage('4'));
    expect(apiDoc.value.getDocenteById).toHaveBeenCalledWith(4);
    expect(result.current).toMatchObject({ docenteId: 4, iniciales: 'AM', nombreCompleto: 'Ana María López', access: { tieneAcceso: true } });
  });
  it('sin datos usa valores por defecto y no consulta con id inválido', () => {
    apiDoc.value = base();
    const { result } = renderHook(() => useDocenteDetail(undefined));
    expect(apiDoc.value.getDocenteById).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ docenteId: null, iniciales: 'D', nombreCompleto: 'Docente', assignments: [] });
  });
  it('navegación', async () => {
    apiDoc.value = base({ profile: {} });
    router.location = { pathname: '/', state: { returnListPath: '/lista', gestionReturnPath: '/gestion', menuSidebarKey: 'K' } };
    const { result } = renderHook(() => useDocenteDetail(4));
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/gestion', { state: { menuSidebarKey: 'K' } });
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenCalledWith('/docentes/4/editar', { state: { menuSidebarKey: 'DOC-LIST', returnListPath: '/lista' } });
    act(() => result.current.handleAsignacionAcademica());
    expect(router.navigate).toHaveBeenLastCalledWith(expect.stringContaining('4'), { state: { menuSidebarKey: 'K', returnListPath: '/docentes/4' } });
    await result.current.refetch();
    expect(apiDoc.value.refetch).toHaveBeenCalledWith(4);
    const sin = renderHook(() => useDocenteDetail('x'));
    router.navigate.mockClear();
    act(() => sin.result.current.handleEditar());
    act(() => sin.result.current.handleAsignacionAcademica());
    await sin.result.current.refetch();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

describe('useDocentesListPage', () => {
  it('expone columnas, búsqueda y alta', () => {
    const setSearchText = vi.fn();
    listCtx.value = { docentes: [{ id: 1 }], setSearchText, refetch: vi.fn(), deleteDocente: vi.fn(), tablePagination: { total: 1 } };
    const { result } = renderHook(() => useDocentesListPage());
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
    result.current.handleSearchChange({ target: { value: 'x' } });
    expect(setSearchText).toHaveBeenCalledWith('x');
    act(() => result.current.handleNuevoDocente());
    expect(router.navigate).toHaveBeenCalledWith('/docentes/registrar', { state: { menuSidebarKey: 'DOC-LIST', returnListPath: '/docentes/listar' } });
    listCtx.value = { setSearchText };
    expect(renderHook(() => useDocentesListPage()).result.current).toMatchObject({ docentes: [], loading: false, searchText: '' });
  });
});

describe('useDocentesFormPage', () => {
  const montarGeo = () => {
    geo.value = {
      provinciasResidencia: [{ id: 1, nombre: 'Andrés' }], municipiosResidencia: [{ id: 2, nombre: 'Santa Cruz' }],
      loadProvincias: vi.fn().mockResolvedValue(undefined), loadMunicipios: vi.fn().mockResolvedValue(undefined),
    };
  };
  beforeEach(() => {
    montarGeo();
    http.get.mockResolvedValue({ data: { data: [{ id: 1, nombre: 'Soltero' }] } });
  });

  it('alta: carga catálogos y arma opciones', async () => {
    const { result } = renderHook(() => useDocentesFormPage('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pageTitle).toBe('Registrar docente');
    expect(result.current.finishLabel).toBe('Registrar docente');
    expect(result.current.resolveOptions('estadosCivilesDocente')).toEqual([{ value: 1, label: 'Soltero' }]);
    expect(result.current.resolveOptions('generosDocente').length).toBeGreaterThan(0);
    expect(result.current.resolveOptions('expedicionesDocente').length).toBeGreaterThan(0);
    expect(result.current.resolveOptions('docenteProvinciasResidencia')).toEqual([{ value: 1, label: 'Andrés' }]);
    expect(result.current.resolveOptions('docenteMunicipiosResidencia')).toEqual([{ value: 2, label: 'Santa Cruz' }]);
    expect(result.current.resolveOptions('otro')).toEqual([]);
    expect(result.current.wizardInitialValues).toMatchObject({ activo: true, maxHorasSemana: 20 });
    expect(result.current.wizardSteps.length).toBeGreaterThan(1);
  });

  it('alta: crea el docente y navega a su ficha', async () => {
    const crear = vi.fn().mockResolvedValue({ success: true, data: { id: 31 } });
    casos.crearDocente = () => ({ ejecutar: crear });
    const { result } = renderHook(() => useDocentesFormPage('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    result.current.form.getFieldsValue = vi.fn().mockReturnValue({ ci: ' 123 ', nombres: ' Ana ', celular: '7', fechaNacimiento: { format: () => '1990-01-02' }, aniosExperiencia: '5', anioEgreso: '' });
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(crear).toHaveBeenCalledWith(expect.objectContaining({ ci: '123', nombres: 'Ana', fechaNacimiento: '1990-01-02', aniosExperiencia: 5, anioEgreso: null, maxHorasSemana: 20, activo: true }));
    expect(router.navigate).toHaveBeenCalledWith('/docentes/31', expect.any(Object));
  });

  it('alta: errores de backend y de validación', async () => {
    casos.crearDocente = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: 'CI duplicado' }) });
    const { result } = renderHook(() => useDocentesFormPage('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    result.current.form.getFieldsValue = vi.fn().mockReturnValue({});
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(result.current.error).toBe('CI duplicado');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(result.current.error).toMatch(/Revise los campos/);
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/docentes/listar', undefined);
  });

  it('validación previa solo en el primer paso', async () => {
    const { result } = renderHook(() => useDocentesFormPage('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const f = { validateFields: vi.fn().mockResolvedValue({}) };
    await result.current.onValidateBeforeNext(1, f);
    expect(f.validateFields).toHaveBeenCalled();
    f.validateFields.mockClear();
    await result.current.onValidateBeforeNext(2, f);
    expect(f.validateFields).not.toHaveBeenCalled();
  });

  it('edición: carga el perfil y actualiza', async () => {
    router.params = { id: '8' };
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'K' } };
    casos.obtenerDocentePorId = () => ({
      ejecutar: vi.fn().mockResolvedValue({ success: true, data: { profile: { ci: '99', expedicion: 'lp', nombres: 'Ana', genero: 'f', residenciaProvinciaId: 3, residenciaDepartamentoId: 7, fechaNacimiento: '1990-05-06', registroActivo: false } } }),
    });
    const actualizar = vi.fn().mockResolvedValue({ success: true, data: {} });
    casos.actualizarDocente = () => ({ ejecutar: actualizar });
    const { result } = renderHook(() => useDocentesFormPage('edit'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.wizardInitialValues).toMatchObject({ ci: '99', expedicion: 'LP', genero: 'F', activo: false });
    expect(result.current.wizardInitialValues.residenciaProvinciaId).toBeUndefined();
    expect(result.current.pageTitle).toBe('Editar docente');
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    result.current.form.getFieldsValue = vi.fn().mockReturnValue({ ci: '99', nombres: 'Ana' });
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(actualizar).toHaveBeenCalledWith(8, expect.objectContaining({ ci: '99' }));
    expect(router.navigate).toHaveBeenCalledWith('/docentes/8', { state: { returnListPath: '/lista', menuSidebarKey: 'K' } });
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'K' } });
  });

  it('edición: error de carga y id inválido', async () => {
    router.params = { id: '8' };
    casos.obtenerDocentePorId = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: 'No existe' }) });
    const a = renderHook(() => useDocentesFormPage('edit'), { wrapper });
    await waitFor(() => expect(a.result.current.error).toBe('No existe'));
    router.params = { id: 'x' };
    const b = renderHook(() => useDocentesFormPage('edit'), { wrapper });
    expect(b.result.current.isInvalidEditId).toBe(true);
  });
});
