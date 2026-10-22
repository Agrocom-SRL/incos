import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const repo = vi.hoisted(() => ({
  registrarPago: vi.fn(),
  descargarComprobante: vi.fn(),
  descargarFormularioPdf: vi.fn(),
  descargarReciboPdf: vi.fn(),
}));
const download = vi.hoisted(() => vi.fn());
vi.mock('@implementations/InscripcionCapacitacionRepository', () => ({ default: repo }));
vi.mock('@application/utils', () => ({ downloadBlob: download }));

import { useInscripcionCapacitacionMutations } from '../useInscripcionCapacitacionMutations';

const payload = { concepto: 'CURSO', monto: 100, metodoPagoId: 1 };

describe('useInscripcionCapacitacionMutations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registrarPago sin archivo envía JSON', async () => {
    repo.registrarPago.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    await act(async () => {
      await result.current.registrarPago(3, payload);
    });
    expect(repo.registrarPago).toHaveBeenCalledWith(3, payload);
  });

  it('registrarPago con comprobante envía multipart', async () => {
    repo.registrarPago.mockResolvedValue({ success: true });
    const file = new File(['x'], 'dep.png');
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    await act(async () => {
      await result.current.registrarPago(3, payload, file);
    });
    const body = repo.registrarPago.mock.calls[0][1];
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('comprobante')).toBe(file);
    expect(body.get('concepto')).toBe('CURSO');
  });

  it('descargarComprobante dispara la descarga con el nombre del servidor', async () => {
    const blob = new Blob(['x']);
    repo.descargarComprobante.mockResolvedValue({ success: true, blob, fileName: 'dep.pdf' });
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    let res;
    await act(async () => {
      res = await result.current.descargarComprobante(3, 9);
    });
    expect(download).toHaveBeenCalledWith(blob, 'dep.pdf');
    expect(res.success).toBe(true);
  });

  it('descargarComprobante propaga el error sin descargar', async () => {
    repo.descargarComprobante.mockResolvedValue({ success: false, error: 'Sin comprobante' });
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    let res;
    await act(async () => {
      res = await result.current.descargarComprobante(3, 9);
    });
    expect(download).not.toHaveBeenCalled();
    expect(res).toEqual({ success: false, error: 'Sin comprobante' });
  });

  it('descargarFormularioPdf guarda el PDF con el nombre del servidor', async () => {
    const blob = new Blob(['pdf']);
    repo.descargarFormularioPdf.mockResolvedValue({ success: true, blob, fileName: 'form.pdf' });
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    let res;
    await act(async () => {
      res = await result.current.descargarFormularioPdf(3);
    });
    expect(repo.descargarFormularioPdf).toHaveBeenCalledWith(3);
    expect(download).toHaveBeenCalledWith(blob, 'form.pdf');
    expect(res.success).toBe(true);
  });

  it('descargarReciboPdf usa un nombre por defecto y propaga el error sin descargar', async () => {
    const blob = new Blob(['pdf']);
    repo.descargarReciboPdf.mockResolvedValueOnce({ success: true, blob });
    const { result } = renderHook(() => useInscripcionCapacitacionMutations());
    await act(async () => {
      await result.current.descargarReciboPdf(3, 9);
    });
    expect(repo.descargarReciboPdf).toHaveBeenCalledWith(3, 9);
    expect(download).toHaveBeenCalledWith(blob, 'recibo_pago_9.pdf');

    download.mockClear();
    repo.descargarReciboPdf.mockResolvedValueOnce({ success: false, error: 'Pago inexistente' });
    let res;
    await act(async () => {
      res = await result.current.descargarReciboPdf(3, 99);
    });
    expect(download).not.toHaveBeenCalled();
    expect(res).toEqual({ success: false, error: 'Pago inexistente' });
  });
});
