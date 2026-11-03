import { describe, it, expect, jest } from '@jest/globals';
import ExcelJS from 'exceljs';
import { ExportListadoInscritosCapacitacionExcelUseCase } from '../../../src/application/use-cases/capacitacion/ExportListadoInscritosCapacitacionExcelUseCase.js';
import { ListadoInscritosCapacitacionExcelBuilder } from '../../../src/infrastructure/external/excel/capacitacion/ListadoInscritosCapacitacionExcelBuilder.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const fila = (id, estado, grupo, pagado) => ({
  id,
  estado,
  activo: 1,
  fecha_inscripcion: '2026-10-01',
  participante_ci: `100${id}`,
  participante_expedicion: 'SC',
  participante_nombres: 'Ana',
  participante_apellido_paterno: 'Pérez',
  participante_apellido_materno: 'Rojas',
  participante_celular: '70000000',
  participante_email: 'ana@x.com',
  grupo_nombre: grupo,
  monto_obligatorio: 300,
  monto_matricula: 50,
  total_pagado: pagado,
  pagado_curso: pagado,
  pagado_matricula: 0,
  estado_pago_curso: 'PARCIAL',
  estado_pago_matricula: 'PENDIENTE',
  requisitos_pendientes: 1,
});

describe('ExportListadoInscritosCapacitacionExcelUseCase', () => {
  const crear = (rows, curso = { titulo: 'Excel Avanzado', costo: 300, costo_matricula: 50 }) => {
    const deps = {
      cursoCapacitacionFichaViewRepository: { findListadoById: jest.fn().mockResolvedValue(curso) },
      inscripcionCapacitacionRepository: {
        findListadoRows: jest.fn().mockResolvedValue({ rows, total: rows.length }),
      },
      listadoInscritosCapacitacionExcelGenerator: new ListadoInscritosCapacitacionExcelBuilder(),
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ExportListadoInscritosCapacitacionExcelUseCase(deps) };
  };

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase } = crear([], null);
    await expect(useCase.execute({ capacitacionId: 9 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('genera una hoja por grupo (sin GENERAL), excluye anulados y calcula saldo/pagado', async () => {
    const { useCase } = crear([
      fila(1, 'PENDIENTE', 'Grupo A', 100),
      fila(2, 'INSCRITO', 'Grupo B', 350),
      fila(3, 'ANULADO', 'Grupo A', 0),
    ]);
    const { buffer, fileName } = await useCase.execute({ capacitacionId: 5 });
    expect(fileName).toBe('inscritos_excel_avanzado_5.xlsx');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Grupo A', 'Grupo B']);

    const a = wb.getWorksheet('Grupo A');
    // fila 9 = cabecera; 10 = único participante vigente del grupo (el anulado no aparece)
    expect(a.getRow(9).getCell(5).value).toBe('CELULAR');
    expect(a.getRow(9).height).toBeGreaterThanOrEqual(50);
    expect(a.getRow(10).getCell(5).value).toBe('70000000');
    expect(a.getRow(10).getCell(6).value).toBe('Grupo A');
    expect(a.getRow(10).getCell(8).value).toBe(100); // pagado
    expect(a.getRow(10).getCell(9).value).toBe(250); // saldo = (300-100) + 50 matrícula
    expect(a.getRow(11).getCell(2).value).toBeNull();

    const b = wb.getWorksheet('Grupo B');
    expect(b.getRow(10).getCell(9).value).toBe(50); // curso pagado, matrícula pendiente
    expect(b.getColumn(4).width).toBeGreaterThanOrEqual(40); // correo legible
  });

  it('los inscritos sin grupo van a la hoja «SIN GRUPO»', async () => {
    const { useCase } = crear([fila(1, 'INSCRITO', null, 0), fila(2, 'INSCRITO', 'Grupo A', 0)]);
    const { buffer } = await useCase.execute({ capacitacionId: 5 });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['SIN GRUPO', 'Grupo A']);
  });

  it('curso externo: no suma el aporte del curso, muestra el respaldo y la matrícula de cada grupo', async () => {
    const externa = (id, grupo, matricula, entregado) => ({
      ...fila(id, 'PENDIENTE', grupo, 0),
      monto_obligatorio: 800,
      monto_matricula: matricula,
      pagado_matricula: 20,
      total_pagado: 20,
      pago_curso_externo: 1,
      requisito_acredita_id: 7,
      requisito_acredita_entregado: entregado,
    });
    const { useCase } = crear(
      [externa(1, 'Grupo A', 100, 1), externa(2, 'Grupo B', 150, 0)],
      { titulo: 'Certificado', costo: 800, costo_matricula: 100, entidad_certificadora: 'UPSA' }
    );
    const { buffer } = await useCase.execute({ capacitacionId: 6 });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const a = wb.getWorksheet('Grupo A');
    expect(a.getRow(4).getCell(3).value).toBe('Externo (UPSA)');
    expect(a.getRow(10).getCell(7).value).toBe(100); // solo matrícula del grupo A
    expect(a.getRow(10).getCell(8).value).toBe(20);
    expect(a.getRow(10).getCell(9).value).toBe(80); // saldo = matrícula - pagado
    expect(a.getRow(10).getCell(11).value).toBe('RESPALDO ENTREGADO');
    const b = wb.getWorksheet('Grupo B');
    expect(b.getRow(10).getCell(7).value).toBe(150); // matrícula propia del grupo B
    expect(b.getRow(10).getCell(11).value).toBe('RESPALDO PENDIENTE');
  });
});

describe('Excel inscritos · cabecera del curso', () => {
  it('filas 1-7 con fuente un punto mayor y altura suficiente', async () => {
    const deps = {
      cursoCapacitacionFichaViewRepository: {
        findListadoById: jest.fn().mockResolvedValue({ titulo: 'Guaraní', costo: 0, costo_matricula: 150 }),
      },
      inscripcionCapacitacionRepository: {
        findListadoRows: jest.fn().mockResolvedValue({ rows: [fila(1, 'INSCRITO', 'Grupo 1', 150)], total: 1 }),
      },
      listadoInscritosCapacitacionExcelGenerator: new ListadoInscritosCapacitacionExcelBuilder(),
      logger: { info: jest.fn() },
    };
    const { buffer } = await new ExportListadoInscritosCapacitacionExcelUseCase(deps).execute({ capacitacionId: 1 });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.worksheets[0];
    expect(ws.getCell('B1').font.size).toBe(21);
    expect(ws.getCell('B2').font.size).toBe(16);
    expect(ws.getCell('B3').font.size).toBe(16);
    expect(ws.getCell('C3').font.size).toBe(16);
    expect(ws.getRow(3).height).toBeGreaterThanOrEqual(26);
  });
});
