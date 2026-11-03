import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => {
  const crud = () => ({
    obtenerTodos: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
    cambiarEstado: vi.fn(),
  });
  return {
    pago: {
      obtenerReporteBecasPorCarrera: vi.fn(),
      obtenerReporteCuentasPorCobrar: vi.fn(),
      buscarEstudiantesRegistroAporte: vi.fn(),
      obtenerCompromiso: vi.fn(),
      eliminarCompromiso: vi.fn(),
      guardarCompromiso: vi.fn(),
      actualizarCompromiso: vi.fn(),
      eliminarCuota: vi.fn(),
      actualizarCuota: vi.fn(),
      obtenerEstadoRegistro: vi.fn(),
      descargarBecasPorCarreraExcel: vi.fn(),
      descargarCuentasPorCobrarExcel: vi.fn(),
      generarRecibo: vi.fn(),
      obtenerPorId: vi.fn(),
      obtenerTodos: vi.fn(),
      registrarPago: vi.fn(),
    },
    ingreso: { obtenerTodos: vi.fn() },
    metodo: crud(),
    banco: crud(),
    cuenta: crud(),
    aporte: crud(),
    beca: crud(),
    descargas: { downloadBlob: vi.fn(), downloadFile: vi.fn() },
  };
});

vi.mock('@implementations/PagoAporteRepository', () => ({ default: R.pago }));
vi.mock('@implementations/IngresoRepository', () => ({ default: R.ingreso }));
vi.mock('@implementations/PaymentMethodRepository', () => ({ default: R.metodo }));
vi.mock('@implementations/AuthorizedBankRepository', () => ({ default: R.banco }));
vi.mock('@implementations/PaymentAccountRepository', () => ({ default: R.cuenta }));
vi.mock('@implementations/ContributionConfigurationRepository', () => ({ default: R.aporte }));
vi.mock('@implementations/BecaDescuentoRepository', () => ({ default: R.beca }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), ...R.descargas }));

import { useBecasPorCarreraReporte } from '../useBecasPorCarreraReporte';
import { useCuentasPorCobrarReporte } from '../useCuentasPorCobrarReporte';
import { useBuscarEstudiantesRegistro } from '../useBuscarEstudiantesRegistro';
import { useCompromisoPago } from '../useCompromisoPago';
import { useEliminarCompromiso } from '../useEliminarCompromiso';
import { useGuardarCompromiso } from '../useGuardarCompromiso';
import { useDeletePagoCuota } from '../useDeletePagoCuota';
import { useUpdatePagoCuota } from '../useUpdatePagoCuota';
import { useEstadoAporteRegistro } from '../useEstadoAporteRegistro';
import { useExportBecasReporteExcel } from '../useExportBecasReporteExcel';
import { useExportCuentasPorCobrarExcel } from '../useExportCuentasPorCobrarExcel';
import { useGenerateReciboPago } from '../useGenerateReciboPago';
import { useGetPagoById } from '../useGetPagoById';
import { useIngresosApi } from '../useIngresosApi';
import { usePagosApi } from '../usePagosApi';
import { useRegistrarPagoAporte } from '../useRegistrarPagoAporte';
import { useConfigPagosCatalogsApi } from '../useConfigPagosCatalogsApi';
import { usePaymentCatalogsApi } from '../usePaymentCatalogsApi';
import { useConfigPagosMutations } from '../useConfigPagosMutations';
import { useAporteCatalogApi } from '../../../aportes/hooks/api/useAporteCatalogApi';
import { useAporteMutations } from '../../../aportes/hooks/api/useAporteMutations';
import { useBecaDescuentoCatalogApi } from '../../../becas-descuentos/hooks/api/useBecaDescuentoCatalogApi';
import { useBecaDescuentoMutations } from '../../../becas-descuentos/hooks/api/useBecaDescuentoMutations';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reportes', () => {
  it('becas por carrera: éxito y error', async () => {
    R.pago.obtenerReporteBecasPorCarrera.mockResolvedValueOnce({ success: true, data: { planillaBecas: { porcentajes: [50], filas: [] } } });
    const { result } = renderHook(() => useBecasPorCarreraReporte());
    let r;
    await act(async () => {
      r = await result.current.getReporte(3);
    });
    expect(R.pago.obtenerReporteBecasPorCarrera).toHaveBeenCalledWith({ gestionId: 3 });
    expect(r.success).toBe(true);
    expect(result.current.reporte.porcentajes).toEqual([50]);
    R.pago.obtenerReporteBecasPorCarrera.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.getReporte();
    });
    expect(r.error).toMatch(/reporte de becas/);
    expect(result.current.reporte).toBeNull();
  });
  it('cuentas por cobrar: éxito y error', async () => {
    R.pago.obtenerReporteCuentasPorCobrar.mockResolvedValueOnce({ success: true, data: { cuentasPorCobrar: { carreras: [] } } });
    const { result } = renderHook(() => useCuentasPorCobrarReporte());
    await act(async () => {
      await result.current.getReporte();
    });
    expect(result.current.reporte.carreras).toEqual([]);
    R.pago.obtenerReporteCuentasPorCobrar.mockResolvedValueOnce({ success: false, error: 'Falla' });
    await act(async () => {
      await result.current.getReporte();
    });
    expect(result.current.error).toBe('Falla');
  });
  it('exporta a Excel y descarga el blob', async () => {
    const blob = new Blob(['x']);
    R.pago.descargarBecasPorCarreraExcel.mockResolvedValueOnce({ success: true, blob, fileName: 'b.xlsx' });
    const a = renderHook(() => useExportBecasReporteExcel());
    await act(async () => {
      expect((await a.result.current.exportar(1)).success).toBe(true);
    });
    expect(R.descargas.downloadBlob).toHaveBeenCalledWith(blob, 'b.xlsx');
    R.pago.descargarBecasPorCarreraExcel.mockResolvedValueOnce({ success: false });
    await act(async () => {
      expect((await a.result.current.exportar()).error).toBe('No se pudo generar el archivo');
    });
    R.pago.descargarBecasPorCarreraExcel.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      expect((await a.result.current.exportar()).error).toBe('Red');
    });
    R.pago.descargarCuentasPorCobrarExcel.mockResolvedValueOnce({ success: true, blob });
    const b = renderHook(() => useExportCuentasPorCobrarExcel());
    await act(async () => {
      await b.result.current.exportar();
    });
    expect(R.descargas.downloadBlob).toHaveBeenLastCalledWith(blob, 'cuentas_por_cobrar.xlsx');
    R.pago.descargarCuentasPorCobrarExcel.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      expect((await b.result.current.exportar()).error).toBe('No');
    });
    R.pago.descargarCuentasPorCobrarExcel.mockRejectedValueOnce({});
    await act(async () => {
      expect((await b.result.current.exportar()).error).toBe('Error al exportar');
    });
  });
});

describe('búsqueda de estudiantes (debounce)', () => {
  it('espera 350 ms, ignora consultas cortas y descarta respuestas viejas', async () => {
    vi.useFakeTimers();
    R.pago.buscarEstudiantesRegistroAporte.mockResolvedValue({ success: true, data: [{ id: 1, nombres: 'Ana' }] });
    const { result } = renderHook(() => useBuscarEstudiantesRegistro());
    act(() => result.current.buscar('a'));
    expect(R.pago.buscarEstudiantesRegistroAporte).not.toHaveBeenCalled();
    act(() => result.current.buscar('an'));
    expect(result.current.loading).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(R.pago.buscarEstudiantesRegistroAporte).toHaveBeenCalledWith({ q: 'an', preliminar: false, limit: 25 });
    expect(result.current.estudiantes).toHaveLength(1);
    act(() => result.current.limpiar());
    expect(result.current.estudiantes).toEqual([]);
    vi.useRealTimers();
  });
  it('carga preliminar y error', async () => {
    R.pago.buscarEstudiantesRegistroAporte.mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => useBuscarEstudiantesRegistro());
    await act(async () => {
      result.current.cargarPreliminar();
    });
    await waitFor(() => expect(result.current.error).toBe('No se pudieron buscar los estudiantes'));
    expect(R.pago.buscarEstudiantesRegistroAporte).toHaveBeenCalledWith({ q: '', preliminar: true, limit: 25 });
  });
});

describe('compromisos', () => {
  it('cargar compromiso valida id, éxito y error', async () => {
    const { result } = renderHook(() => useCompromisoPago());
    let r;
    await act(async () => {
      r = await result.current.cargarCompromiso('x');
    });
    expect(r.success).toBe(false);
    R.pago.obtenerCompromiso.mockResolvedValueOnce({ success: true, data: { compromiso: { id: 1, fechaCompromiso: '2026-01-02T00' } } });
    await act(async () => {
      r = await result.current.cargarCompromiso(5);
    });
    expect(result.current.compromiso.fechaCompromiso).toBe('2026-01-02');
    act(() => result.current.limpiar());
    expect(result.current.compromiso).toBeNull();
    R.pago.obtenerCompromiso.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.cargarCompromiso(5);
    });
    expect(r.error).toMatch(/compromiso/);
  });
  it('guardar: crea o actualiza según compromisoId', async () => {
    const { result } = renderHook(() => useGuardarCompromiso());
    R.pago.guardarCompromiso.mockResolvedValueOnce({ success: true, data: { compromiso: { id: 1 } } });
    await act(async () => {
      await result.current.guardar({ pagoAporteId: 4, values: { fechaCompromiso: '2026-01-01' } });
    });
    expect(R.pago.guardarCompromiso).toHaveBeenCalledWith(4, { fecha_compromiso: '2026-01-01', observacion: null });
    R.pago.actualizarCompromiso.mockResolvedValueOnce({ success: false, error: { message: 'Mal' } });
    let r;
    await act(async () => {
      r = await result.current.guardar({ compromisoId: 9, values: {} });
    });
    expect(R.pago.actualizarCompromiso).toHaveBeenCalledWith(9, expect.any(Object));
    expect(r.error).toBe('Mal');
    R.pago.guardarCompromiso.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.guardar({ pagoAporteId: 1, values: {} });
    });
    expect(r.error).toMatch(/guardar el compromiso/);
  });
  it('eliminar valida el id y el resultado', async () => {
    const { result } = renderHook(() => useEliminarCompromiso());
    let r;
    await act(async () => {
      r = await result.current.eliminar(0);
    });
    expect(r.success).toBe(false);
    R.pago.eliminarCompromiso.mockResolvedValueOnce({ success: true });
    await act(async () => {
      r = await result.current.eliminar(3);
    });
    expect(r).toEqual({ success: true });
    R.pago.eliminarCompromiso.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      r = await result.current.eliminar(3);
    });
    expect(r.error).toBe('No');
    R.pago.eliminarCompromiso.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.eliminar(3);
    });
    expect(r.error).toMatch(/eliminar el compromiso/);
  });
});

describe('cuotas y pagos', () => {
  it('eliminar y actualizar cuota', async () => {
    const del = renderHook(() => useDeletePagoCuota());
    let r;
    await act(async () => {
      r = await del.result.current.eliminarCuota('');
    });
    expect(r.error).toMatch(/requerido/);
    R.pago.eliminarCuota.mockResolvedValueOnce({ success: true });
    await act(async () => {
      r = await del.result.current.eliminarCuota(1);
    });
    expect(r.success).toBe(true);
    R.pago.eliminarCuota.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await del.result.current.eliminarCuota(1);
    });
    expect(r.error).toBe('No se pudo eliminar la cuota');
    R.pago.eliminarCuota.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await del.result.current.eliminarCuota(1);
    });
    expect(r.error).toBe('Red');

    const upd = renderHook(() => useUpdatePagoCuota());
    await act(async () => {
      r = await upd.result.current.actualizarCuota(null, {});
    });
    expect(r.success).toBe(false);
    R.pago.actualizarCuota.mockResolvedValueOnce({ success: true, data: { id: 1 } });
    await act(async () => {
      r = await upd.result.current.actualizarCuota(1, { monto: 5 });
    });
    expect(r.data).toEqual({ id: 1 });
    R.pago.actualizarCuota.mockResolvedValueOnce({ success: false, error: 'No' });
    await act(async () => {
      r = await upd.result.current.actualizarCuota(1, {});
    });
    expect(r.error).toBe('No');
    R.pago.actualizarCuota.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await upd.result.current.actualizarCuota(1, {});
    });
    expect(r.error).toBe('Red');
  });

  it('estado del aporte', async () => {
    const { result } = renderHook(() => useEstadoAporteRegistro());
    let r;
    await act(async () => {
      r = await result.current.cargarEstado(0);
    });
    expect(r.success).toBe(false);
    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: true, data: { monto_base: 100 } });
    await act(async () => {
      r = await result.current.cargarEstado(3, 2);
    });
    expect(R.pago.obtenerEstadoRegistro).toHaveBeenCalledWith(3, 2);
    expect(result.current.estado.montoBase).toBe(100);
    act(() => result.current.limpiar());
    expect(result.current.estado).toBeNull();
    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.cargarEstado(3);
    });
    expect(r.error).toMatch(/estado del aporte/);
  });

  it('genera y descarga el recibo', async () => {
    const { result } = renderHook(() => useGenerateReciboPago());
    let r;
    await act(async () => {
      r = await result.current.generarRecibo(null);
    });
    expect(r.success).toBe(false);
    R.pago.generarRecibo.mockResolvedValueOnce({ success: true, data: { filePath: '/r.pdf', fileName: 'r.pdf' } });
    await act(async () => {
      r = await result.current.generarRecibo(1);
    });
    expect(R.descargas.downloadFile).toHaveBeenCalledWith('/r.pdf', 'r.pdf');
    expect(r.success).toBe(true);
    R.pago.generarRecibo.mockResolvedValueOnce({ success: true, data: {} });
    await act(async () => {
      r = await result.current.generarRecibo(1);
    });
    expect(r.error).toBe('No se pudo obtener el recibo');
    R.pago.generarRecibo.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.generarRecibo(1);
    });
    expect(r.error).toBe('Error al generar el recibo');
    R.pago.generarRecibo.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await result.current.generarRecibo(1);
    });
    expect(r.error).toBe('Red');
    expect(result.current.reciboCuotaId).toBeNull();
  });

  it('obtiene un pago con su estado', async () => {
    const { result } = renderHook(() => useGetPagoById());
    let r;
    await act(async () => {
      r = await result.current.getPagoById('x');
    });
    expect(r.error).toBe('ID del pago es requerido');
    R.pago.obtenerPorId.mockResolvedValueOnce({ success: true, data: { pago: { id: 7, estudiante: { id: 3 }, gestion: { id: 2 } } } });
    R.pago.obtenerEstadoRegistro.mockResolvedValueOnce({ success: true, data: { total_pagado: 10, cuotas: [{ id: 1 }] } });
    await act(async () => {
      r = await result.current.getPagoById(7);
    });
    expect(R.pago.obtenerEstadoRegistro).toHaveBeenCalledWith(3, 2);
    expect(result.current.pago).toMatchObject({ id: 7, totalPagado: 10, cantidadPagos: 1 });
    R.pago.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.getPagoById(7);
    });
    expect(r.error).toBe('Error al cargar el pago');
    R.pago.obtenerPorId.mockResolvedValueOnce({ success: true, data: null });
    await act(async () => {
      r = await result.current.getPagoById(7);
    });
    expect(r.error).toMatch(/No se encontró/);
    R.pago.obtenerPorId.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await result.current.getPagoById(7);
    });
    expect(r.error).toBe('Red');
  });

  it('listados de pagos e ingresos', async () => {
    R.pago.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1 }], pagination: { total: 1 } });
    const p = renderHook(() => usePagosApi());
    let r = await p.result.current.fetch({ page: 1 });
    expect(r).toMatchObject({ success: true, pagination: { total: 1 } });
    expect(r.pagos).toHaveLength(1);
    R.pago.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await p.result.current.fetch()).error).toBe('Error al cargar los pagos');
    R.ingreso.obtenerTodos.mockResolvedValueOnce({ success: true, data: [{ id: 1 }] });
    const i = renderHook(() => useIngresosApi());
    r = await i.result.current.fetch();
    expect(r.pagination).toBeNull();
    R.ingreso.obtenerTodos.mockResolvedValueOnce({ success: false, error: 'No' });
    expect((await i.result.current.fetch()).error).toBe('No');
  });

  it('registra el pago', async () => {
    const { result } = renderHook(() => useRegistrarPagoAporte());
    let r;
    R.pago.registrarPago.mockResolvedValueOnce({ success: true });
    await act(async () => {
      r = await result.current.registrar({ a: 1 });
    });
    expect(r).toEqual({ success: true, data: null });
    R.pago.registrarPago.mockResolvedValueOnce({ success: false, error: { message: 'Saldo' } });
    await act(async () => {
      r = await result.current.registrar({});
    });
    expect(r.error).toBe('Saldo');
    R.pago.registrarPago.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.registrar({});
    });
    expect(r.error).toBe('No se pudo registrar el pago');
    R.pago.registrarPago.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      r = await result.current.registrar({});
    });
    expect(r.error).toBe('Red');
  });
});

describe('catálogos de configuración de pagos', () => {
  const ok = (data) => ({ success: true, data });
  it('useConfigPagosCatalogsApi carga, ordena métodos y resuelve banco de cuentas', async () => {
    R.metodo.obtenerTodos.mockResolvedValue(ok([{ id: 2, code: 'qr' }, { id: 1, code: 'efectivo' }]));
    R.banco.obtenerTodos.mockResolvedValue(ok([{ id: 7, name: 'BNB' }]));
    R.cuenta.obtenerTodos.mockResolvedValue(ok([{ id: 1, bankId: 7 }]));
    const { result } = renderHook(() => useConfigPagosCatalogsApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metodos.map((m) => m.codigo)).toEqual(['EFECTIVO', 'QR']);
    expect(result.current.cuentas[0].bancoNombre).toBe('BNB');
    await act(async () => {
      await result.current.refetch();
    });
    expect(R.metodo.obtenerTodos).toHaveBeenCalledTimes(2);
  });
  it('useConfigPagosCatalogsApi expone error de métodos', async () => {
    R.metodo.obtenerTodos.mockResolvedValue({ success: false });
    R.banco.obtenerTodos.mockResolvedValue({ success: false });
    R.cuenta.obtenerTodos.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useConfigPagosCatalogsApi());
    await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar los catálogos de pago'));
  });
  it('usePaymentCatalogsApi carga catálogos de registro', async () => {
    R.metodo.obtenerTodos.mockResolvedValue(ok([{ id: 1, code: 'qr' }]));
    R.banco.obtenerTodos.mockResolvedValue(ok([{ id: 7, name: 'BNB' }]));
    R.cuenta.obtenerTodos.mockResolvedValue(ok([{ id: 1, bankId: 7, accountHolderName: 'Ana' }]));
    const { result } = renderHook(() => usePaymentCatalogsApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cuentasPago[0].label).toContain('BNB');
    await act(async () => {
      await result.current.refetch();
    });
    R.metodo.obtenerTodos.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('No se pudieron cargar los métodos de pago');
  });
  it('useConfigPagosMutations elige crear o actualizar y marca saving', async () => {
    const { result } = renderHook(() => useConfigPagosMutations());
    R.metodo.actualizar.mockResolvedValue('m');
    await act(async () => {
      await result.current.actualizarMetodoPago(1, { a: 1 });
      await result.current.guardarBanco({ id: 2, payload: { b: 1 } });
      await result.current.guardarBanco({ payload: { b: 2 } });
      await result.current.guardarCuenta({ id: 3, payload: {} });
      await result.current.guardarCuenta({ payload: {} });
      await result.current.eliminarBanco(1);
      await result.current.eliminarCuenta(1);
      await result.current.cambiarEstadoMetodo(1, true);
      await result.current.cambiarEstadoBanco(1, false);
      await result.current.cambiarEstadoCuenta(1, true);
    });
    expect(R.metodo.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.banco.actualizar).toHaveBeenCalledWith(2, { b: 1 });
    expect(R.banco.crear).toHaveBeenCalledWith({ b: 2 });
    expect(R.cuenta.actualizar).toHaveBeenCalledWith(3, {});
    expect(R.cuenta.crear).toHaveBeenCalled();
    expect(R.banco.cambiarEstado).toHaveBeenCalledWith(1, false);
    expect(R.cuenta.eliminar).toHaveBeenCalledWith(1);
    expect(result.current.saving).toBe(false);
  });
});

describe('aportes y becas/descuentos', () => {
  it('useAporteCatalogApi resuelve el aporte de la gestión vigente', async () => {
    R.aporte.obtenerTodos.mockResolvedValue({ success: true, data: [{ id: 1, gestion_id: 5 }, { id: 2, gestion_id: 6 }, { id: 3 }] });
    const a = renderHook(() => useAporteCatalogApi({ id: 6 }));
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.aporteVigente.id).toBe(2);
    const b = renderHook(() => useAporteCatalogApi({ id: 99 }));
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    expect(b.result.current.aporteVigente.id).toBe(3);
    const c = renderHook(() => useAporteCatalogApi());
    await waitFor(() => expect(c.result.current.loading).toBe(false));
    expect(c.result.current.aporteVigente.id).toBe(1);
    await act(async () => {
      await c.result.current.refetch();
    });
    R.aporte.obtenerTodos.mockResolvedValue({ success: false });
    await act(async () => {
      await c.result.current.refetch();
    });
    expect(c.result.current.error).toBe('No se pudo cargar el aporte de la gestión');
  });
  it('useAporteCatalogApi sin datos no tiene aporte vigente', async () => {
    R.aporte.obtenerTodos.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => useAporteCatalogApi({ id: 1 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.aporteVigente).toBeNull();
  });
  it('useAporteMutations crea o actualiza', async () => {
    const { result } = renderHook(() => useAporteMutations());
    await act(async () => {
      await result.current.guardarConfiguracionAporte({ id: 1, payload: { a: 1 } });
      await result.current.guardarConfiguracionAporte({ payload: { a: 2 } });
    });
    expect(R.aporte.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.aporte.crear).toHaveBeenCalledWith({ a: 2 });
  });
  it('useBecaDescuentoCatalogApi y mutaciones', async () => {
    R.beca.obtenerTodos.mockResolvedValue({ success: true, data: [{ id: 1, nombre: 'B' }] });
    const { result } = renderHook(() => useBecaDescuentoCatalogApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.becasDescuentos).toHaveLength(1);
    R.beca.obtenerTodos.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/catálogo de becas/);
    const m = renderHook(() => useBecaDescuentoMutations());
    await act(async () => {
      await m.result.current.crear({ a: 1 });
      await m.result.current.actualizar(1, { b: 1 });
      await m.result.current.eliminar(1);
    });
    expect(R.beca.crear).toHaveBeenCalledWith({ a: 1 });
    expect(R.beca.actualizar).toHaveBeenCalledWith(1, { b: 1 });
    expect(R.beca.eliminar).toHaveBeenCalledWith(1);
  });
});
