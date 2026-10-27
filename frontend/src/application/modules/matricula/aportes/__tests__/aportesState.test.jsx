import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const R = vi.hoisted(() => ({
  casos: {},
  downloadBlob: vi.fn(),
  features: {},
  becas: { scholarships: [], catalogs: {}, loading: false, error: null },
  estado: { estadoAporte: null, loading: false, error: null, refetch: vi.fn() },
  pagosApi: { pagos: [], loading: false, error: null, refetch: vi.fn() },
  del: vi.fn(),
  accounts: { current: null },
  methods: { current: null },
  configs: { current: null },
}));

vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));
vi.mock('../hooks/features', () => ({
  usePagosRegistrarPaymentAccounts: () => R.features.accounts,
  usePagosRegistrarAuthorizedBanks: () => R.features.banks,
  usePagosRegistrarPaymentMethods: () => R.features.methods,
  usePagosRegistrarContributionConfigurations: () => R.features.configs,
}));
vi.mock('@application-matricula/admision/hooks/api', () => ({ useGetStudentScholarships: () => R.becas }));
vi.mock('../hooks/api/useEstadoAporteRegistro', () => ({ useEstadoAporteRegistro: () => R.estado }));
vi.mock('../hooks/api/usePaymentAccountsApi', () => ({ usePaymentAccountsApi: () => R.accounts.current }));
vi.mock('../hooks/api/usePaymentMethodsApi', () => ({ usePaymentMethodsApi: () => R.methods.current }));
vi.mock('../hooks/api/useContributionConfigurationsApi', () => ({ useContributionConfigurationsApi: () => R.configs.current }));
vi.mock('@application-pagos/hooks/api/usePagosApi', () => ({ usePagosApi: () => R.pagosApi, pagosListFetchParams: () => ({ params: { page: 1 } }) }));
vi.mock('@application-pagos/hooks/api/useDeletePagoAporte', () => ({ useDeletePagoAporte: () => ({ deletePagoAporte: R.del, loading: false }) }));

import { usePagosRegistrarData } from '../hooks/state/usePagosRegistrarData';
import { usePagosData } from '../hooks/state/usePagosData';
import { usePagosRegistrarPaymentAccounts } from '../hooks/features/usePagosRegistrarPaymentAccounts';
import { usePagosRegistrarPaymentMethods } from '../hooks/features/usePagosRegistrarPaymentMethods';
import { usePagosRegistrarContributionConfigurations } from '../hooks/features/usePagosRegistrarContributionConfigurations';
import { useExportListaAportesPorCarreraExcel } from '../hooks/features/useExportListaAportesPorCarreraExcel';
import { mapPagosList, pagoListMapper } from '../mappers/pagosListMapper';

const feature = (extra = {}) => ({ loading: false, error: null, refetch: vi.fn(), ...extra });

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(R.casos).forEach((k) => delete R.casos[k]);
  R.features = {
    accounts: feature({ cuentasPago: [1], selectedCuentaPago: null, onSelectCuentaPago: vi.fn() }),
    banks: feature({ bancosAutorizados: [2], selectedBanco: null, onSelectBanco: vi.fn() }),
    methods: feature({ metodosPago: [3], selectedMetodoPago: null, onSelectMetodoPago: vi.fn() }),
    configs: feature({ configuracionAportes: [4], selectedConfiguracion: null, onSelectConfiguracion: vi.fn() }),
  };
  R.becas = { scholarships: [], catalogs: { a: 1 }, loading: false, error: null };
  R.estado = { estadoAporte: null, loading: false, error: null, refetch: vi.fn() };
  R.pagosApi = { pagos: [], loading: false, error: null, refetch: vi.fn() };
  R.del.mockResolvedValue({ success: true });
});

describe('usePagosRegistrarData', () => {
  it('detecta la beca activa por estado y porcentaje', () => {
    expect(renderHook(() => usePagosRegistrarData(1)).result.current.becaActiva).toBeNull();
    R.becas.scholarships = [{ estado: 'cerrada', porcentaje: 10 }, { state: 'active', porcentaje: 0 }, {}, { state: 'pendiente', scholarshipPercentage: 30 }];
    expect(renderHook(() => usePagosRegistrarData(1)).result.current.becaActiva).toEqual({ state: 'pendiente', scholarshipPercentage: 30 });
    R.becas.scholarships = 'x';
    expect(renderHook(() => usePagosRegistrarData(1)).result.current.becaActiva).toBeNull();
  });

  it('combina cargas y errores de todas las fuentes', () => {
    const base = renderHook(() => usePagosRegistrarData(1)).result.current;
    expect(base.loading).toBe(false);
    expect(base.error).toBeFalsy();
    R.features.banks.loading = true;
    expect(renderHook(() => usePagosRegistrarData(1)).result.current.loading).toBe(true);
    R.features.banks.loading = false;
    R.estado.error = 'sin estado';
    expect(renderHook(() => usePagosRegistrarData(1)).result.current.error).toBe('sin estado');
    expect(base.cuentasPago.cuentasPago).toEqual([1]);
    expect(base.configuracionAportes.configuracionAportes).toEqual([4]);
  });

  it('formulario y selección delegan en los hooks de característica', () => {
    const { result } = renderHook(() => usePagosRegistrarData(1));
    act(() => result.current.updateFormData('monto', 5));
    expect(result.current.formData).toEqual({ monto: 5 });
    act(() => result.current.setFormError('mal'));
    expect(result.current.error).toBe('mal');
    act(() => result.current.resetForm());
    expect(result.current.formData).toEqual({});
    expect(result.current.error).toBeFalsy();

    result.current.cuentasPago.onSelectCuentaPago({ id: 1 });
    result.current.bancosAutorizados.onSelectBanco({ id: 2 });
    result.current.metodosPago.onSelectMetodoPago({ id: 3 });
    result.current.configuracionAportes.onSelectConfiguracion({ id: 4 });
    result.current.cuentasPago.onSelectCuentaPago(null);
    expect(R.features.accounts.onSelectCuentaPago).toHaveBeenCalledTimes(1);
    expect(R.features.banks.onSelectBanco).toHaveBeenCalledWith({ id: 2 });
    expect(R.features.methods.onSelectMetodoPago).toHaveBeenCalledWith({ id: 3 });
    expect(R.features.configs.onSelectConfiguracion).toHaveBeenCalledWith({ id: 4 });
  });

  it('registra el aporte con el contrato del backend y refresca el estado', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, data: { id: 9 } });
    R.casos.registrarAporteVoluntario = () => ({ ejecutar });
    const { result } = renderHook(() => usePagosRegistrarData(5));
    let r;
    await act(async () => {
      r = await result.current.registrarPago({ amount: '40', paymentMethodId: 1, paymentDate: '2026-01-01', compromisoDias: '30' });
    });
    expect(r).toEqual({ success: true, data: { id: 9 } });
    expect(ejecutar).toHaveBeenCalledWith({
      student_id: 5,
      amount: 40,
      payment_method_id: 1,
      payment_account_id: null,
      payment_date: '2026-01-01',
      transaction_number: null,
      codigo_comprobante: null,
      descripcion: null,
      documentoRespaldo: null,
      compromiso_dias: 30,
    });
    expect(R.estado.refetch).toHaveBeenCalled();
    expect(result.current.pagoRegistrado).toEqual({ id: 9 });
  });

  it('registrar: errores del servicio, resultado vacío y excepción', async () => {
    const ejecutar = vi.fn();
    R.casos.registrarAporteVoluntario = () => ({ ejecutar });
    const { result } = renderHook(() => usePagosRegistrarData(5));
    const pago = (extra = {}) => act(async () => result.current.registrarPago({ studentId: 3, ...extra }));
    ejecutar.mockResolvedValueOnce({ success: false, error: { message: 'Saldo' } });
    await pago();
    expect(result.current.error).toBe('Saldo');
    expect(ejecutar.mock.calls[0][0].student_id).toBe(3);
    ejecutar.mockResolvedValueOnce({ success: false, error: 'Texto' });
    await pago();
    expect(result.current.error).toBe('Texto');
    ejecutar.mockResolvedValueOnce(null);
    await pago();
    expect(result.current.error).toBe('Error al registrar el pago');
    ejecutar.mockRejectedValueOnce(new Error('Caída'));
    await pago();
    expect(result.current.error).toBe('Caída');
    R.casos.registrarAporteVoluntario = () => null;
    await pago();
    expect(result.current.error).toMatch(/no encontrado/);
    expect(result.current.loading).toBe(false);
  });
});

describe('usePagosData', () => {
  it('copia la lista de la API solo cuando trae filas y administra altas, cambios y bajas', async () => {
    const { result, rerender } = renderHook(() => usePagosData());
    expect(result.current.pagos).toEqual([]);
    R.pagosApi = { ...R.pagosApi, pagos: [{ id: 1 }, { id: 2 }] };
    rerender();
    expect(result.current.pagos).toHaveLength(2);
    R.pagosApi = { ...R.pagosApi, pagos: [] };
    rerender();
    expect(result.current.pagos).toHaveLength(2);

    act(() => result.current.addPago({ id: 3 }));
    act(() => result.current.addPago({ id: 3 }));
    expect(result.current.pagos.map((p) => p.id)).toEqual([3, 1, 2]);
    act(() => result.current.updatePago({ id: 1, monto: 9 }));
    expect(result.current.pagos[1].monto).toBe(9);
    act(() => result.current.removePago(2));
    expect(result.current.pagos.map((p) => p.id)).toEqual([3, 1]);

    await act(async () => {
      await result.current.deletePago(1);
    });
    expect(result.current.pagos.map((p) => p.id)).toEqual([3]);
    R.del.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.deletePago(3);
    });
    expect(result.current.pagos).toHaveLength(1);
  });

  it('refetch usa parámetros por defecto o los recibidos', async () => {
    const { result } = renderHook(() => usePagosData());
    await act(async () => result.current.refetch());
    expect(R.pagosApi.refetch).toHaveBeenLastCalledWith({ params: { page: 1 } });
    await act(async () => result.current.refetch({ params: { page: 2 } }));
    expect(R.pagosApi.refetch).toHaveBeenLastCalledWith({ params: { page: 2 } });
  });
});

describe('hooks de característica de registro de pago', () => {
  it.each([
    ['cuenta', usePagosRegistrarPaymentAccounts, () => (R.accounts.current = { cuentasPago: [], loading: false, error: null, refetch: vi.fn() }), 'onSelectCuentaPago', 'selectedCuentaPago', { id: 1, nombre: 'N', numero: '1', extra: 1 }, { id: 1, nombre: 'N', numero: '1' }],
    ['método', usePagosRegistrarPaymentMethods, () => (R.methods.current = { metodosPago: [], loading: false, error: null, refetch: vi.fn() }), 'onSelectMetodoPago', 'selectedMetodoPago', { id: 2, nombre: 'QR', codigo: 'Q', extra: 1 }, { id: 2, nombre: 'QR', codigo: 'Q' }],
    ['configuración', usePagosRegistrarContributionConfigurations, () => (R.configs.current = { configuracionAportes: [], loading: false, error: null, refetch: vi.fn() }), 'onSelectConfiguracion', 'selectedConfiguracion', { id: 3, nombre: 'C', monto: 5, extra: 1 }, { id: 3, nombre: 'C', monto: 5 }],
  ])('selección de %s conserva solo los campos útiles', (_n, useHook, setup, onSelect, selected, entrada, esperado) => {
    setup();
    const { result } = renderHook(() => useHook());
    act(() => result.current[onSelect](null));
    act(() => result.current[onSelect]({ nombre: 'sin id' }));
    expect(result.current[selected]).toBeNull();
    act(() => result.current[onSelect](entrada));
    expect(result.current[selected]).toEqual(esperado);
    const prev = result.current[selected];
    act(() => result.current[onSelect]({ ...entrada, nombre: 'otro' }));
    expect(result.current[selected]).toBe(prev);
  });
});

describe('useExportListaAportesPorCarreraExcel', () => {
  it('descarga el archivo generado', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, blob: 'B', fileName: 'a.xlsx' });
    R.casos.exportarListaAportesPorCarreraExcel = () => ({ ejecutar });
    const { result } = renderHook(() => useExportListaAportesPorCarreraExcel());
    let r;
    await act(async () => {
      r = await result.current.exportar({ carreraId: 1 });
    });
    expect(r).toEqual({ success: true });
    expect(ejecutar).toHaveBeenCalledWith({ carreraId: 1 });
    expect(R.downloadBlob).toHaveBeenCalledWith('B', 'a.xlsx');
    ejecutar.mockResolvedValueOnce({ success: true, blob: 'B' });
    await act(async () => result.current.exportar());
    expect(R.downloadBlob).toHaveBeenLastCalledWith('B', 'lista_aportes.xlsx');
  });

  it('resuelve los errores sin lanzar', async () => {
    const { result } = renderHook(() => useExportListaAportesPorCarreraExcel());
    expect(await result.current.exportar()).toEqual({ success: false, error: 'No se pudo inicializar la exportación' });
    const ejecutar = vi.fn().mockResolvedValue({ success: false });
    R.casos.exportarListaAportesPorCarreraExcel = () => ({ ejecutar });
    let r;
    await act(async () => {
      r = await result.current.exportar();
    });
    expect(r.error).toBe('No se pudo generar el archivo');
    ejecutar.mockResolvedValueOnce({ success: false, error: 'Sin datos' });
    await act(async () => {
      r = await result.current.exportar();
    });
    expect(r.error).toBe('Sin datos');
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
});

describe('pagosListMapper', () => {
  it('arma el nombre completo del estudiante y descarta nulos', () => {
    expect(pagoListMapper(null)).toBeNull();
    expect(pagoListMapper({ id: 1 })).toEqual({ id: 1 });
    const p = pagoListMapper({ id: 1, student: { nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: 'Rojas' } });
    expect(p.estudiante.nombreCompleto).toBe('Pérez Rojas Ana');
    expect(pagoListMapper({ estudiante: { codigoEstudiante: 'E1' } }).estudiante.nombreCompleto).toBe('E1');
    expect(mapPagosList('x')).toEqual([]);
    expect(mapPagosList([{ id: 1 }, null])).toEqual([{ id: 1 }]);
  });
});
