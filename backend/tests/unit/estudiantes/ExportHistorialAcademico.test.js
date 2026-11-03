import { describe, it, expect, jest } from '@jest/globals';
import { ExportHistorialAcademicoExcelUseCase } from '../../../src/application/use-cases/estudiantes/ExportHistorialAcademicoExcelUseCase.js';
import { ExportHistorialAcademicoPdfUseCase } from '../../../src/application/use-cases/estudiantes/ExportHistorialAcademicoPdfUseCase.js';

const logger = () => ({ info: jest.fn() });

describe.each([
  ['Excel', ExportHistorialAcademicoExcelUseCase, 'historialAcademicoExcelGenerator', 'xlsx', 'spreadsheetml'],
  ['PDF', ExportHistorialAcademicoPdfUseCase, 'historialAcademicoPdfGenerator', 'pdf', 'application/pdf'],
])('ExportHistorialAcademico%sUseCase', (_n, Clase, generadorKey, ext, mime) => {
  const crear = (payload) => {
    const getHistorialAcademicoUseCase = { execute: jest.fn().mockResolvedValue(payload) };
    const generador = { generarHistorialAcademico: jest.fn().mockResolvedValue(new Uint8Array([1, 2])) };
    const useCase = new Clase({ getHistorialAcademicoUseCase, [generadorKey]: generador, logger: logger() });
    return { useCase, getHistorialAcademicoUseCase, generador };
  };

  it('exige sus dependencias', () => {
    const base = { getHistorialAcademicoUseCase: {}, [generadorKey]: {}, logger: {} };
    expect(() => new Clase({ ...base, getHistorialAcademicoUseCase: null })).toThrow(/getHistorialAcademicoUseCase/);
    expect(() => new Clase({ ...base, [generadorKey]: null })).toThrow(new RegExp(generadorKey));
    expect(() => new Clase({ ...base, logger: null })).toThrow(/logger/);
  });

  it('genera el archivo con la matrícula en el nombre', async () => {
    const { useCase, generador } = crear({ estudiante: { matricula: '2026/0001' }, filas: [{}, {}] });
    const r = await useCase.execute({ estudianteId: 5 });
    expect(generador.generarHistorialAcademico).toHaveBeenCalled();
    expect(r.fileName).toBe(`Historial_Academico_2026_0001.${ext}`);
    expect(r.mimeType).toContain(mime);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
  });

  it('sin matrícula usa el id del estudiante (regresión: el fallback nunca se aplicaba)', async () => {
    const { useCase } = crear({ estudiante: {} });
    const r = await useCase.execute({ estudianteId: 5 });
    expect(r.fileName).toBe(`Historial_Academico_est_5.${ext}`);
  });
});
