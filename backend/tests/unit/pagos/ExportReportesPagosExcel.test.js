import { describe, it, expect, jest } from '@jest/globals';
import { ExportBecasPorCarreraReporteExcelUseCase } from '../../../src/application/use-cases/pagos/ExportBecasPorCarreraReporteExcelUseCase.js';
import { ExportCuentasPorCobrarReporteExcelUseCase } from '../../../src/application/use-cases/pagos/ExportCuentasPorCobrarReporteExcelUseCase.js';

describe.each([
  ['Becas', ExportBecasPorCarreraReporteExcelUseCase, 'getBecasPorCarreraReporteUseCase', 'becasReporteExcelGenerator', 'generarPlanillaBecasPorCarrera', 'planilla_becas_por_carrera_'],
  ['CuentasPorCobrar', ExportCuentasPorCobrarReporteExcelUseCase, 'getCuentasPorCobrarReporteUseCase', 'cuentasPorCobrarReporteExcelGenerator', 'generarPlanillaCuentasPorCobrar', 'cuentas_por_cobrar_'],
])('Export%sReporteExcelUseCase', (_n, Clase, getKey, genKey, metodo, prefijo) => {
  const crear = (reporte, buffer = Buffer.from('x')) => {
    const get = { execute: jest.fn().mockResolvedValue(reporte) };
    const generador = { [metodo]: jest.fn().mockResolvedValue(buffer) };
    const logger = { info: jest.fn() };
    return { useCase: new Clase({ [getKey]: get, [genKey]: generador, logger }), get, generador, logger };
  };

  it('pide el reporte de la gestión y arma el nombre con el año', async () => {
    const { useCase, get, generador } = crear({ gestion: { id: 2, anio: 2026 }, filas: [1], carreras: [1] });
    const r = await useCase.execute({ gestionId: 2 });
    expect(get.execute).toHaveBeenCalledWith({ gestionId: 2 });
    const datos = generador[metodo].mock.calls[0][0];
    expect(datos.fechaEmision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.fileName).toBe(`${prefijo}2026.xlsx`);
    expect(r.mimeType).toContain('spreadsheetml');
  });

  it('sin año usa el id; sin gestión usa "gestion"; convierte buffers no Buffer', async () => {
    const a = crear({ gestion: { id: 7 } }, new Uint8Array([1]));
    const r1 = await a.useCase.execute();
    expect(r1.fileName).toBe(`${prefijo}7.xlsx`);
    expect(Buffer.isBuffer(r1.buffer)).toBe(true);
    const b = crear({});
    expect((await b.useCase.execute({})).fileName).toBe(`${prefijo}gestion.xlsx`);
  });

  it('el logger es opcional', async () => {
    const get = { execute: jest.fn().mockResolvedValue({}) };
    const useCase = new Clase({ [getKey]: get, [genKey]: { [metodo]: jest.fn().mockResolvedValue(Buffer.from('')) } });
    await expect(useCase.execute()).resolves.toBeDefined();
  });
});
