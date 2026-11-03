import { describe, it, expect } from '@jest/globals';
import { leerXlsx, textosDe, nombresHojas, contiene } from './xlsxHelpers.js';
import { ExcelGenerator } from '../../../../src/infrastructure/external/excel/ExcelGenerator.js';
import { ExcelDataProcessor } from '../../../../src/infrastructure/external/excel/ExcelDataProcessor.js';
import { ExcelFormulaBuilder } from '../../../../src/infrastructure/external/excel/ExcelFormulaBuilder.js';
import { ExcelStyleManager } from '../../../../src/infrastructure/external/excel/ExcelStyleManager.js';
import { ExcelSheetComposer, colLetter, colFractionAtWidth } from '../../../../src/infrastructure/external/excel/shared/ExcelSheetComposer.js';
import * as excelIndex from '../../../../src/infrastructure/external/excel/index.js';
import ExcelJS from 'exceljs';

const LARGO = 'Ñandú Pérez '.repeat(50);

const filaInscritos = (extra = {}) => ({
  carrera_nombre: 'Contaduría General', periodo_numero: 1, paralelo_nombre: 'PRIMERO A', paralelo_turno: 'MAÑANA',
  total_mujeres: 10, total_hombres: 5, total_mujeres_efectivos: 9, total_hombres_efectivos: 5,
  total_mujeres_abandono: 1, total_hombres_abandono: 0, total_mujeres_reprobado: 2, total_hombres_reprobado: 1,
  ...extra,
});

describe('ExcelGenerator.generarReporteInscritos', () => {
  it('con datos: hoja de estadísticas con carreras del instituto y fórmulas', async () => {
    const buf = await ExcelGenerator.generarReporteInscritos(
      [filaInscritos(), filaInscritos({ carrera_nombre: 'Sistemas Informáticos', periodo_numero: 2, paralelo_nombre: 'SEGUNDO B' }), filaInscritos({ carrera_nombre: 'Carrera Nueva Ñ', periodo_numero: 3 })],
      { gestion_anio: 2026 },
    );
    const wb = await leerXlsx(buf);
    expect(nombresHojas(wb)).toEqual(['Estadísticas Inscritos']);
    const ws = wb.worksheets[0];
    const t = textosDe(ws).join('|');
    expect(t).toContain('Contaduría General');
    expect(t).toContain('Carrera Nueva Ñ');
    expect(t).toContain('2026');
    let formulas = 0;
    ws.eachRow((row) => row.eachCell((c) => { if (c.formula) formulas += 1; }));
    expect(formulas).toBeGreaterThan(10);
  });

  it('sin datos genera la estructura vacía; soloInscripcion oculta M:AS', async () => {
    const wb = await leerXlsx(await ExcelGenerator.generarReporteInscritos([], {}, { soloInscripcion: true }));
    const ws = wb.worksheets[0];
    expect(ws.getColumn(13).hidden).toBe(true);
    expect(ws.getColumn(45).hidden).toBe(true);
    expect(ws.getColumn(12).hidden).toBeFalsy();
    const completo = await leerXlsx(await ExcelGenerator.generarReporteInscritos(undefined));
    expect(completo.worksheets[0].getColumn(13).hidden).toBeFalsy();
  });
});

describe('ExcelGenerator.generarListaInscritosPorCarrera', () => {
  const datos = [
    { periodo_numero: 1, paralelo_nombre: 'PRIMERO A', paralelo_turno: 'MAÑANA', periodo_nombre: 'Primer año', nombre_completo: 'núñez ñusta', ci: '123 SC', sexo: 'F', celular: '70000000', observaciones: 'Beca' },
    { periodoNumero: 1, paraleloNombre: 'PRIMERO A', nombreCompleto: LARGO, ci: null },
    { periodo_numero: 2, paralelo_nombre: 'SEGUNDO B', paralelo_turno: 'NOCHE' },
    { periodo_numero: 9, paralelo_nombre: null },
  ];

  it('una hoja por periodo-paralelo, con logo y datos', async () => {
    const wb = await leerXlsx(await ExcelGenerator.generarListaInscritosPorCarrera(datos, { gestion_anio: 2026, carrera_nombre: 'Contaduría' }));
    expect(nombresHojas(wb)).toEqual(['1ER-A', '2DO-B', '9º']);
    const ws = wb.getWorksheet('1ER-A');
    expect(contiene(ws, 'LISTA DE ESTUDIANTES INSCRITOS 2026')).toBe(true);
    expect(contiene(ws, 'núñez ñusta')).toBe(true);
    expect(contiene(ws, 'APELLIDO PATERNO, MATERNO Y NOMBRES')).toBe(true);
    expect(contiene(ws, 'Contaduría')).toBe(true);
    expect(contiene(ws, 'MAÑANA')).toBe(true);
    expect(ws.getImages().length).toBe(2);
  });

  it('sin datos crea la hoja SIN_DATOS', async () => {
    const wb = await leerXlsx(await ExcelGenerator.generarListaInscritosPorCarrera());
    expect(nombresHojas(wb)).toEqual(['SIN_DATOS']);
  });
});

describe('ExcelGenerator.generarListaAportesPorCarrera', () => {
  const datos = [
    { periodo_numero: 1, paralelo_nombre: 'PRIMERO A', paralelo_turno: 'MAÑANA', nombre_completo: 'peña ñ', ci: '1', aporte_monto_base: 2400, descuento_beca: 1200, beca_porcentaje: 50, beca_tipo_nombre: 'Excelencia', pago_aporte_id: 5, cantidad_cuotas: 3, monto_total_deuda: 1200, monto_pagado: 400, saldo_pendiente: 800, estado_aporte: 'PARCIAL', observaciones_cuotas: 'Cuota 1 pagada' },
    { periodoNumero: 1, paraleloNombre: 'PRIMERO A', nombreCompleto: LARGO, aporteMontoBase: 'raro', beca_porcentaje: 33.333, estadoAporte: '  ' },
    { periodo_numero: 3, paralelo_nombre: 'TERCERO C', beca_porcentaje: 'x' },
  ];

  it('genera hojas protegidas con montos numéricos y estados', async () => {
    const wb = await leerXlsx(await ExcelGenerator.generarListaAportesPorCarrera(datos, { gestion_anio: 2026, carrera_nombre: 'Contaduría' }));
    expect(nombresHojas(wb)).toEqual(['1ER-A', '3ER-C']);
    const ws = wb.getWorksheet('1ER-A');
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['PARCIAL', 'Excelencia', '50%', '33.33%', 'raro', 'NO APLICA', '—', 'Cuota 1 pagada']));
    expect(ws.sheetProtection).toBeTruthy();
    // monto numérico con formato
    const montoCell = ws.getRow(10).getCell(5);
    expect(montoCell.value).toBe(2400);
    expect(montoCell.numFmt).toBe('#,##0.00');
  });

  it('sin datos genera una hoja', async () => {
    const wb = await leerXlsx(await ExcelGenerator.generarListaAportesPorCarrera());
    expect(wb.worksheets).toHaveLength(1);
  });
});

describe('ExcelGenerator helpers estáticos', () => {
  it('_fmtMontoExcel / _fmtPorcentajeBeca / _estimateWrappedLines', () => {
    expect(ExcelGenerator._fmtMontoExcel(null)).toBe('—');
    expect(ExcelGenerator._fmtMontoExcel('')).toBe('—');
    expect(ExcelGenerator._fmtMontoExcel('abc')).toBe('abc');
    expect(ExcelGenerator._fmtMontoExcel('12.3456')).toBe(12.35);
    expect(ExcelGenerator._fmtPorcentajeBeca(null)).toBe('0%');
    expect(ExcelGenerator._fmtPorcentajeBeca('x')).toBe('0%');
    expect(ExcelGenerator._fmtPorcentajeBeca(50)).toBe('50%');
    expect(ExcelGenerator._fmtPorcentajeBeca(12.5)).toBe('12.5%');
    expect(ExcelGenerator._estimateWrappedLines('', 40)).toBe(1);
    expect(ExcelGenerator._estimateWrappedLines('a'.repeat(100), 20)).toBe(5);
    expect(ExcelGenerator._estimateWrappedLines('abc', 'x')).toBe(1);
  });

  it('_setMontoCell solo da formato a números', () => {
    const num = {};
    ExcelGenerator._setMontoCell(num, 10);
    expect(num).toEqual({ value: 10, numFmt: '#,##0.00' });
    const txt = {};
    ExcelGenerator._setMontoCell(txt, null);
    expect(txt).toEqual({ value: '—' });
  });

  it('nombres de hoja, etiquetas de periodo y letra de paralelo', () => {
    expect(ExcelGenerator._toSafeWorksheetName('A/B:C*?[x]')).toBe('A B C x');
    expect(ExcelGenerator._toSafeWorksheetName('')).toBe('Hoja1');
    expect(ExcelGenerator._toSafeWorksheetName(null)).toBe('Hoja1');
    expect(ExcelGenerator._toSafeWorksheetName('x'.repeat(50))).toHaveLength(31);
    expect(ExcelGenerator._toPeriodoEtiqueta(1)).toBe('1ER');
    expect(ExcelGenerator._toPeriodoEtiqueta(7)).toBe('7º');
    expect(ExcelGenerator._toPeriodoEtiqueta(0)).toBe('');
    expect(ExcelGenerator._toPeriodoEtiqueta('x')).toBe('');
    expect(ExcelGenerator._extractParaleloLetra('Primero b')).toBe('B');
    expect(ExcelGenerator._extractParaleloLetra('SIN_PARALELO')).toBe('');
    expect(ExcelGenerator._extractParaleloLetra(null)).toBe('');
  });

  it('_protectWorksheetSoloLectura aplica contraseña por defecto', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('x');
    await ExcelGenerator._protectWorksheetSoloLectura(ws, '  ');
    expect(ws.sheetProtection.sheet).toBe(true);
    expect(ws.sheetProtection.spinCount).toBe(10000);
  });
});

describe('ExcelDataProcessor', () => {
  it('formatearRegimen', () => {
    expect(ExcelDataProcessor.formatearRegimen(1)).toBe('1ER AÑO');
    expect(ExcelDataProcessor.formatearRegimen('3')).toBe('3ER AÑO');
    expect(ExcelDataProcessor.formatearRegimen(6)).toBe('6º AÑO');
    expect(ExcelDataProcessor.formatearRegimen(undefined)).toBe('1ER AÑO');
  });

  it('determinarParalelo por letra, patrón, turno y por defecto', () => {
    expect(ExcelDataProcessor.determinarParalelo('Paralelo C', null)).toBe('C');
    expect(ExcelDataProcessor.determinarParalelo('segundo b')).toBe('B');
    expect(ExcelDataProcessor.determinarParalelo('Curso', 'Tarde')).toBe('B');
    expect(ExcelDataProcessor.determinarParalelo('Curso', 'NOCHE')).toBe('C');
    expect(ExcelDataProcessor.determinarParalelo('Curso', 'Sábado')).toBe('D');
    expect(ExcelDataProcessor.determinarParalelo(null, null)).toBe('A');
  });

  it('calcularAprobados: valor explícito o derivado', () => {
    expect(ExcelDataProcessor.calcularAprobados({ total_mujeres_aprobado: 4 }, 'mujeres')).toBe(4);
    expect(ExcelDataProcessor.calcularAprobados({ totalHombresAprobado: 0 }, 'hombres')).toBe(0);
    expect(ExcelDataProcessor.calcularAprobados({ total_hombres_efectivos: 10, total_hombres_abandono: 2, total_hombres_reprobado: 3 }, 'hombres')).toBe(5);
    expect(ExcelDataProcessor.calcularAprobados({ total_hombres: 1, total_hombres_reprobado: 5 }, 'hombres')).toBe(0);
  });

  it('obtenerValor y toCamelCase', () => {
    expect(ExcelDataProcessor.toCamelCase('total_mujeres_efectivos')).toBe('totalMujeresEfectivos');
    expect(ExcelDataProcessor.obtenerValor({ totalMujeres: 3 }, 'total_mujeres_efectivos', 'total_mujeres')).toBe(3);
    expect(ExcelDataProcessor.obtenerValor({}, 'a', 'b')).toBe(0);
  });

  it('construirMatrizReporte acumula por carrera/año/paralelo y rellena el resto', () => {
    const m = ExcelDataProcessor.construirMatrizReporte([
      filaInscritos(), filaInscritos(), filaInscritos({ carreraNombre: 'Otra', carrera_nombre: undefined, periodo_numero: 2 }),
    ]);
    expect(Object.keys(m).slice(0, 3)).toEqual(['Contaduría General', 'Administración de Empresas', 'Sistemas Informáticos']);
    expect(Object.keys(m)).toContain('Otra');
    const p = m['Contaduría General']['1ER AÑO'].paralelos.A;
    expect(p.m_inscripcion).toBe(20);
    expect(p.v_inscripcion).toBe(10);
    expect(p.m_abandono).toBe(2);
    expect(p.m_aprobado).toBe(2 * (9 - 1 - 2));
    expect(m['Administración de Empresas']['2DO AÑO'].paralelos).toEqual({});
    expect(Object.keys(ExcelDataProcessor.construirMatrizReporte([]))).toHaveLength(3);
    expect(Object.keys(ExcelDataProcessor.construirMatrizReporte(null))).toHaveLength(3);
  });
});

describe('ExcelFormulaBuilder / ExcelStyleManager', () => {
  it('llenarFila y totales escriben fórmulas SUM', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('t');
    ExcelFormulaBuilder.llenarFila(ws, 5, { A: { m_inscripcion: 3, v_inscripcion: 2, m_efectivos: 3, v_efectivos: 2, m_abandono: 0, v_abandono: 0, m_reprobado: 1, v_reprobado: 0, m_aprobado: 2, v_aprobado: 2 } });
    ExcelFormulaBuilder.llenarFila(ws, 6, {});
    ExcelFormulaBuilder.agregarTotalCarrera(ws, 7, 5, 6);
    ExcelFormulaBuilder.agregarTotalGeneral(ws, 8, 5, 7, [7]);
    const formulas = [];
    ws.eachRow((r) => r.eachCell((c) => { if (c.formula) formulas.push(c.formula); }));
    expect(formulas.length).toBeGreaterThan(20);
    expect(formulas.some((f) => f.includes('SUM('))).toBe(true);
  });

  it('el estilo por carrera devuelve colores y aplica bordes sin lanzar', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('t');
    for (const nombre of ['Contaduría General', 'Administración de Empresas', 'Sistemas Informáticos', 'Otra']) {
      expect(ExcelStyleManager.obtenerColorTotalCarrera(nombre)).toBeDefined();
      ExcelStyleManager.aplicarColorCarrera(ws, 5, nombre);
      ExcelStyleManager.aplicarEstiloTotalCarrera(ws, 6, nombre);
    }
    ExcelStyleManager.aplicarColorColumnaBCarrera(ws, 5, 6, 'Contaduría General');
    ExcelStyleManager.aplicarEstiloTotalGeneral(ws, 7);
    ExcelStyleManager.aplicarEtiquetaTotalEnCarrera(ws, 6, 'TOTAL');
    ExcelStyleManager.aplicarAlineacionEtiquetaTotalCarrera(ws, 6);
    ExcelStyleManager.aplicarBordesFila(ws, 5);
    expect(ExcelStyleManager.getBordeDelgado().top.style).toBe('thin');
    expect(ExcelStyleManager.getAlineacionCuerpoTabla()).toHaveProperty('horizontal');
    expect(ExcelStyleManager.getAlineacionCabeceraTabla()).toHaveProperty('horizontal');
    const celda = ws.getCell('A1');
    ExcelStyleManager.aplicarEstiloCeldaNombreCarrera(celda);
    ExcelStyleManager.aplicarNegrita(celda);
    expect(celda.font.bold).toBe(true);
  });
});

describe('ExcelSheetComposer', () => {
  it('colLetter y colFractionAtWidth', () => {
    expect(colLetter(1)).toBe('A');
    expect(colLetter(26)).toBe('Z');
    expect(colLetter(27)).toBe('AA');
    expect(colLetter(52)).toBe('AZ');
    expect(colLetter(703)).toBe('AAA');
    expect(colFractionAtWidth(0, [10, 10], 5)).toBe(0.5);
    expect(colFractionAtWidth(2, [10, 10], 15)).toBe(3.5);
    expect(colFractionAtWidth(0, [10], 99)).toBe(1);
  });

  it('cell/merge/formula/outline/freeze/labelValue', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('t');
    const c = new ExcelSheetComposer(ws);
    c.cell('A1', 'hola', { bold: true, fill: 'FFFF0000', align: 'left', borderColor: 'FF000000', borderMedium: true });
    c.cell(2, 1, 5, { border: false });
    c.cell(3, 1, undefined, { rotation: 90 });
    c.merge('A5:C5', 'unido');
    c.merge('A6:A6', 'solo');
    c.mergeBox(7, 1, 8, 2, 'caja', {});
    c.mergeBox(9, 1, 9, 1, 'celda', {});
    c.formula(10, 1, 'SUM(A2:A2)', {});
    c.labelValue('A12', 'Etiqueta', 'B12', null);
    c.infoField('A13:B13', 'L', 'C13:D13', undefined);
    c.bandTitle('A14:D14', 'Titulo');
    c.colWidths({ 1: 20, 2: 10 });
    c.rowHeight(1, 30);
    c.borderRow(15, 1, 3, { medium: true });
    c.outline(16, 1, 18, 3, { sides: { top: false } });
    c.freeze(1, 1);
    const wb2 = await leerXlsx(await wb.xlsx.writeBuffer());
    const t = textosDe(wb2.worksheets[0]);
    expect(t).toEqual(expect.arrayContaining(['hola', 'unido', 'solo', 'caja', 'celda', 'Etiqueta', 'Titulo']));
    expect(wb2.worksheets[0].getColumn(1).width).toBe(20);
  });
});

describe('índice del módulo excel', () => {
  it('reexporta las clases públicas', () => {
    for (const nombre of ['ExcelGenerator', 'ExcelStyleManager', 'ExcelStructureBuilder', 'ExcelDataProcessor', 'ExcelFormulaBuilder', 'ExcelContentBuilder', 'RegistroPedagogicoExcelBuilder', 'ConsolidadoSheetBuilder', 'PlanillaCalificacionesSheetBuilder', 'ExcelSheetComposer']) {
      expect(excelIndex[nombre]).toBeDefined();
    }
  });
});
