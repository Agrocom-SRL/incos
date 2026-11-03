import { describe, it, expect } from '@jest/globals';
import { leerXlsx, textosDe, nombresHojas, contiene } from './xlsxHelpers.js';
import { CentralizadorExcelBuilder } from '../../../../src/infrastructure/external/excel/centralizador/CentralizadorExcelBuilder.js';
import { LibroRegistroExcelBuilder } from '../../../../src/infrastructure/external/excel/libro-registro/LibroRegistroExcelBuilder.js';
import { SeguimientoTutoriaDocentesExcelBuilder } from '../../../../src/infrastructure/external/excel/titulacion-seguimiento-docentes/SeguimientoTutoriaDocentesExcelBuilder.js';
import { RegistroPedagogicoExcelBuilder } from '../../../../src/infrastructure/external/excel/RegistroPedagogicoExcelBuilder.js';
import { formatNota, esNotaReprobada } from '../../../../src/infrastructure/external/excel/centralizador/sheet/centralizadorSheetFormatters.js';
import { computeColumnMap } from '../../../../src/infrastructure/external/excel/centralizador/sheet/centralizadorSheetLayout.js';
import { formatNotaFolio, esNotaNP, formatCedulaFolio, estimarLineasObservacion } from '../../../../src/infrastructure/external/excel/libro-registro/sheet/libroRegistroSheetFormatters.js';
import { computeLibroColumnMap, computeTresZonasFirmas, computeTresZonasDocentes, computeColumnasEstadisticas } from '../../../../src/infrastructure/external/excel/libro-registro/sheet/libroRegistroSheetLayout.js';
import { buildColumnMap } from '../../../../src/infrastructure/external/excel/registro-pedagogico/registroPedagogicoColumnMap.js';

const LARGO = 'Ñandú pérez '.repeat(60);

const datosCentralizador = (extra = {}) => ({
  titulo: 'CENTRALIZADOR — 1er BIMESTRE',
  notaMinimaAprobacion: 61,
  cabecera: { carrera: 'Informática', periodo: '1er año', paralelo: 'A', turno: 'NOCHE', gestionAnio: 2026, gestionNombre: 'Gestión 2026', bimestreLabel: '1er BIMESTRE' },
  asignaturas: [
    { ofertaCursoId: 1, sigla: 'INF-101', nombre: 'Programación I', docenteNombre: 'Díaz' },
    { ofertaCursoId: 2, sigla: 'INF-102', nombre: LARGO, docenteNombre: null },
  ],
  estudiantes: [
    { nro: 1, nombreCompleto: 'núñez ñ', ci: '111', celdas: { 1: { nota: 85 }, 2: { nota: 40.456 } }, estado: 'REPROBADO', observacion: 'Falta' },
    { nombreCompleto: null, celdas: undefined, estado: 'XX' },
  ],
  ...extra,
});

describe('CentralizadorExcelBuilder', () => {
  it('paralelo: hoja saneada con notas, reprobadas y estados', async () => {
    const wb = await leerXlsx(await new CentralizadorExcelBuilder().generarCentralizadorParaleloBimestre(datosCentralizador()));
    expect(nombresHojas(wb)).toEqual(['A']);
    const ws = wb.worksheets[0];
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['CENTRALIZADOR — 1er BIMESTRE', 'NÓMINA DE ESTUDIANTES', 'INF-101', 'NÚÑEZ Ñ', 'NOTA MÍNIMA DE APROBACIÓN', 'REPROBADO', 'Falta', '85', '40.46', '(Díaz)']));
    expect(contiene(ws, 'Contabilidad')).toBe(false);
  });

  it('paralelo sin estudiantes ni cabecera: aviso y nombre por defecto', async () => {
    const wb = await leerXlsx(await new CentralizadorExcelBuilder().generarCentralizadorParaleloBimestre({ titulo: undefined }));
    expect(nombresHojas(wb)).toEqual(['Centralizador']);
    expect(contiene(wb.worksheets[0], 'CENTRALIZADOR DE CALIFICACIONES')).toBe(true);
    expect(contiene(wb.worksheets[0], 'Sin estudiantes matriculados')).toBe(true);
  });

  it.each([
    ['sin asignaturas ni estudiantes', { asignaturas: [], estudiantes: [] }],
    ['con estudiantes pero sin asignaturas', { asignaturas: [] }],
    ['con una sola asignatura', { asignaturas: [{ ofertaCursoId: 1, sigla: 'INF-101', nombre: 'Programación I' }] }],
  ])('paralelo con cabecera completa y %s genera un libro válido (sin "Cannot merge already merged cells")', async (_caso, extra) => {
    const buffer = await new CentralizadorExcelBuilder().generarCentralizadorParaleloBimestre(datosCentralizador(extra));
    const wb = await leerXlsx(buffer);
    expect(nombresHojas(wb)).toEqual(['A']);
    expect(contiene(wb.worksheets[0], 'NÓMINA DE ESTUDIANTES')).toBe(true);
  });

  it('carrera: una hoja por paralelo con nombres únicos y saneados', async () => {
    const hojas = [
      { nombreHoja: 'A/1?', datos: datosCentralizador() },
      { nombreHoja: 'A/1?', datos: datosCentralizador() },
      { nombreHoja: 'A 1', datos: datosCentralizador() },
      { datos: datosCentralizador({ cabecera: { paralelo: LARGO } }) },
      { datos: { cabecera: {} } },
    ];
    const wb = await leerXlsx(await new CentralizadorExcelBuilder().generarCentralizadorCarreraBimestre({ carrera: { nombre: 'Informática' }, hojas }));
    const nombres = nombresHojas(wb);
    expect(nombres).toHaveLength(5);
    expect(new Set(nombres).size).toBe(5);
    expect(nombres[0]).toBe('A 1');
    expect(nombres[1]).toBe('A 1 (2)');
    nombres.forEach((n) => expect(n.length).toBeLessThanOrEqual(31));
    expect(wb.title).toBe('Centralizador Informática');
  });

  it('BUG: paralelo sin asignaturas (o con 1) no rompe el bloque de bimestre', async () => {
    for (const n of [0, 1, 2]) {
      const asignaturas = datosCentralizador().asignaturas.slice(0, n);
      const wb = await leerXlsx(await new CentralizadorExcelBuilder().generarCentralizadorParaleloBimestre(datosCentralizador({ asignaturas })));
      expect(contiene(wb.worksheets[0], '1er BIMESTRE')).toBe(true);
    }
  });

  it('carrera sin hojas deja una pestaña informativa', async () => {
    const wb = await leerXlsx(await new CentralizadorExcelBuilder().generarCentralizadorCarreraBimestre());
    expect(nombresHojas(wb)).toEqual(['Sin paralelos']);
  });

  it('formateadores y layout', () => {
    expect(formatNota(null)).toBe('—');
    expect(formatNota('abc')).toBe('—');
    expect(formatNota(80)).toBe(80);
    expect(formatNota(80.456)).toBe(80.46);
    expect(esNotaReprobada(50, 61)).toBe(true);
    expect(esNotaReprobada(null, 61)).toBe(false);
    expect(esNotaReprobada(50, NaN)).toBe(false);
    expect(computeColumnMap([]).lastCol).toBe(computeColumnMap(0).lastCol);
    expect(computeColumnMap([{}, {}]).COL_ESTADO).toBe(computeColumnMap([]).COL_ESTADO + 4);
    expect(computeColumnMap(null).COL_ESTADO).toBe(7);
  });
});

const folio = (extra = {}) => ({
  cabecera: { codigoRegistro: 'REG-1', numeroLibro: 3, numeroFolio: 7, gestionAnio: 2026, turno: 'noche', carrera: 'Informática', curso: 'Primer año' },
  asignaturas: [
    { ofertaCursoId: 1, sigla: 'INF-101', nombre: 'Programación', docenteNombre: 'Díaz Ñ' },
    { ofertaCursoId: 2, sigla: 'INF-102', nombre: 'Bases de datos', docenteNombre: null },
    { ofertaCursoId: 3, sigla: 'INF-103', nombre: 'Redes', docenteNombre: 'Pérez' },
    { ofertaCursoId: 4, sigla: 'INF-104', nombre: 'Sistemas', docenteNombre: 'Soto' },
  ],
  estudiantes: [
    { numeroOrden: 1, nombreCompleto: 'núñez ñusta', ci: '123', expedicion: 'SC', celdas: { 1: 80, 2: 'NP', 3: 55.555 }, estadoAcademico: 'APROBADO', observaciones: LARGO },
    { numeroOrden: 2, nombreCompleto: 'sin celdas', ci: '0456', expedicion: '', celdas: {}, estadoAcademico: 'ABANDONO' },
  ],
  ...extra,
});

describe('LibroRegistroExcelBuilder', () => {
  const estadisticas = { estudiantesInscritos: 40, porcentajeInscritos: 100, estudiantesAprobados: 30, porcentajeAprobados: 75, estudiantesReprobados: 6, porcentajeReprobados: 15, abandono: 4, porcentajeAbandono: 10 };

  it('borrador: una hoja por paralelo, con folios y nota de borrador (sin firmas)', async () => {
    const wb = await leerXlsx(await new LibroRegistroExcelBuilder().generarLibroRegistro({
      libro: { numeroLibro: 3 },
      hojas: [{ nombreHoja: 'INF 1A', folios: [folio(), folio()] }, { nombreHoja: 'INF 1A', folios: [folio()] }],
    }));
    expect(wb.title).toBe('Libro de registro N° 3');
    expect(nombresHojas(wb)).toEqual(['INF 1A', 'INF 1A (2)']);
    const ws = wb.worksheets[0];
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['Código de Registro: REG-1', 'LIBRO N°', 'FOLIO N°', 'INF-101', 'NÚÑEZ ÑUSTA', '123 SC', 'NP', 'NOCHE', 'INFORMÁTICA']));
    expect(t.some((x) => x.startsWith('DOCUMENTO BORRADOR'))).toBe(true);
    expect(t).toContain('80');
    expect(contiene(ws, 'ESTADÍSTICAS')).toBe(false);
  });

  it('con firmas: autoridades, docentes por materia y estadísticas', async () => {
    const wb = await leerXlsx(await new LibroRegistroExcelBuilder().generarLibroRegistro({
      libro: {}, incluirFirmas: true,
      hojas: [{ nombreHoja: 'INF 1A', folios: [folio()], estadisticas }],
    }));
    const ws = wb.worksheets[0];
    const t = textosDe(ws);
    expect(t.some((x) => x.startsWith('DOCUMENTO BORRADOR'))).toBe(false);
    expect(t).toEqual(expect.arrayContaining(['DÍAZ Ñ', 'Bases de datos', 'ESTADÍSTICAS', 'ESTUDIANTES INSCRITOS', 'ABANDONO', 'DETALLE', 'CANTIDAD']));
    expect(contiene(ws, 'RECTOR')).toBe(true);
  });

  it('con firmas pero sin estadísticas no las dibuja', async () => {
    const wb = await leerXlsx(await new LibroRegistroExcelBuilder().generarLibroRegistro({
      incluirFirmas: true, hojas: [{ nombreHoja: 'X', folios: [folio({ asignaturas: undefined, estudiantes: undefined })] }],
    }));
    expect(contiene(wb.worksheets[0], 'ESTADÍSTICAS')).toBe(false);
  });

  it('hojas sin folios no escriben nada; sin hojas deja "Sin folios"', async () => {
    const wb = await leerXlsx(await new LibroRegistroExcelBuilder().generarLibroRegistro({ hojas: [{ nombreHoja: 'Vacía' }, { folios: [] }] }));
    expect(nombresHojas(wb)).toEqual(['Vacía', 'Paralelo']);
    expect(textosDe(wb.worksheets[0])).toEqual([]);
    const sin = await leerXlsx(await new LibroRegistroExcelBuilder().generarLibroRegistro());
    expect(nombresHojas(sin)).toEqual(['Sin folios']);
  });

  it('BUG: con pocas asignaturas (0-9) las zonas de firmas no se solapan y el libro se genera', async () => {
    for (let n = 0; n <= 9; n += 1) {
      const asignaturas = Array.from({ length: n }, (_, i) => ({ ofertaCursoId: i + 1, sigla: `S-${i}`, nombre: `Materia ${i}`, docenteNombre: `Doc ${i}` }));
      const layout = computeLibroColumnMap(asignaturas);
      for (const zonas of [computeTresZonasFirmas(layout), computeTresZonasDocentes(layout)]) {
        zonas.forEach(([ini, fin]) => expect(fin).toBeGreaterThanOrEqual(ini));
        expect(zonas[1][0]).toBeGreaterThan(zonas[0][1]);
        expect(zonas[2][0]).toBeGreaterThan(zonas[1][1]);
      }
      const buf = await new LibroRegistroExcelBuilder().generarLibroRegistro({
        incluirFirmas: true,
        hojas: [{ nombreHoja: 'H', folios: [folio({ asignaturas })], estadisticas }],
      });
      expect((await leerXlsx(buf)).worksheets).toHaveLength(1);
    }
  });

  it('formateadores y layout', () => {
    expect(formatNotaFolio(null)).toBe('');
    expect(formatNotaFolio('')).toBe('');
    expect(formatNotaFolio('NP')).toBe('NP');
    expect(formatNotaFolio('70')).toBe(70);
    expect(formatNotaFolio(70.456)).toBe(70.46);
    expect(esNotaNP('NP')).toBe(true);
    expect(esNotaNP(5)).toBe(false);
    expect(formatCedulaFolio('', 'SC')).toBe('');
    expect(formatCedulaFolio('123', 'SC')).toBe('123 SC');
    expect(formatCedulaFolio('0123', '')).toBe(123);
    expect(formatCedulaFolio('A1', null)).toBe('A1');
    expect(estimarLineasObservacion('', 10)).toBe(1);
    expect(estimarLineasObservacion('a'.repeat(25), 10)).toBe(3);
    expect(estimarLineasObservacion('abc', 0)).toBe(1);
    const l = computeLibroColumnMap([{}, {}, {}]);
    expect(l.asigCol(2)).toBe(l.firstAsigCol + 2);
    expect(l.COL_ESTADO_START).toBe(l.firstAsigCol + 3);
    expect(computeLibroColumnMap(null).COL_ESTADO_START).toBe(5);
    expect(computeTresZonasFirmas(l)).toHaveLength(3);
    expect(computeTresZonasDocentes(l)).toHaveLength(3);
    expect(computeColumnasEstadisticas().porcentaje).toBe(10);
  });
});

describe('SeguimientoTutoriaDocentesExcelBuilder', () => {
  it('una hoja por carrera con nombres únicos y filas de tutoriados', async () => {
    const carreras = [
      { carreraNombre: 'Informática', tutoriados: [
        { nombreCompleto: 'ñusta rojas', docenteNombre: 'Dr. Díaz', totalTutoriasMes: 4, tutoriasEjecutadasMes: 3, ultimaActividad: LARGO, porcentajeAvance: 55, ultimaObservacion: 'Bien' },
        { nombreCompleto: null, porcentajeAvance: null },
      ] },
      { carreraNombre: 'Informática', tutoriados: [] },
      { carreraNombre: 'Contabilidad/Auditoría?' },
    ];
    const wb = await leerXlsx(await new SeguimientoTutoriaDocentesExcelBuilder().generarSeguimientoTutoriaDocentes({ anio: 2026, mes: 3, carreras }));
    expect(nombresHojas(wb)).toEqual(['Informática', 'Informática (2)', 'Contabilidad Auditoría']);
    const ws = wb.worksheets[0];
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORÍAS', 'CARRERA:', 'Informática', 'ÑUSTA ROJAS', 'Dr. Díaz', '55%', 'DIRECTORA ACADÉMICA', 'DOCENTE']));
    expect(contiene(ws, 'MES: MARZO')).toBe(true);
    expect(contiene(wb.worksheets[1], 'Sin tutoriados activos.')).toBe(true);
  });

  it('sin carreras deja una hoja "Sin datos"', async () => {
    const wb = await leerXlsx(await new SeguimientoTutoriaDocentesExcelBuilder().generarSeguimientoTutoriaDocentes());
    expect(nombresHojas(wb)).toEqual(['Sin datos']);
    expect(contiene(wb.worksheets[0], 'Sin docentes-tutores')).toBe(true);
  });
});

describe('RegistroPedagogicoExcelBuilder', () => {
  const datos = {
    bimestre: 'primer', carrera: 'Informática', asignatura: 'Programación', codigo_asignatura: 'INF-101', docente: 'Díaz', curso: '1°', paralelo: 'A', gestion: 2026, fecha_emision: '26/10/2026',
    cuota_practico: 70, cuota_teorico: 30, nota_aprobacion: 61,
    evaluaciones_practicas: [{ nombre: 'Práctica 1', puntaje_maximo: 35 }, { nombre: LARGO, puntaje_maximo: 35 }],
    evaluaciones_teoricas: [{ nombre: 'Examen', puntaje_maximo: 30 }],
    estudiantes: [
      { nro: 1, nombre: 'núñez ñusta', sexo: 'F', ci: '123', notas_practicas: [30, null], notas_teoricas: [25] },
      { nombre: null, sexo: 'M', notas_practicas: [], notas_teoricas: [] },
    ],
  };

  it('genera CONSOLIDADO y PLANILLA con fórmulas y estadísticas', async () => {
    const wb = await leerXlsx(await new RegistroPedagogicoExcelBuilder().generarRegistroPedagogicoBimestre(datos));
    expect(nombresHojas(wb)).toEqual(['CONSOLIDADO', 'PLANILLA CALIFICACIONES']);
    const cons = wb.getWorksheet('CONSOLIDADO');
    const t = textosDe(cons);
    expect(t).toEqual(expect.arrayContaining(['REGISTRO PEDAGÓGICO · PRIMER BIMESTRE', 'APELLIDOS Y NOMBRES', 'NÚÑEZ ÑUSTA', 'CALIFICACIÓN FINAL', 'ESTADÍSTICAS', 'Aprobados', 'Práctica 1', '35 pts', 'EVALUACIONES PRÁCTICAS (70)']));
    // las notas ausentes se escriben como 0 y las sumas son fórmulas
    const filaNunez = cons.getRow(8);
    const formulas = [];
    filaNunez.eachCell((cell) => { if (cell.formula) formulas.push(cell.formula); });
    expect(formulas.some((f) => f.startsWith('SUM('))).toBe(true);
    expect(formulas.some((f) => f.includes('COUNTIF('))).toBe(true);
    expect(formulas.some((f) => f.includes('APROBADO/A'))).toBe(true);
    const plan = wb.getWorksheet('PLANILLA CALIFICACIONES');
    expect(textosDe(plan)).toEqual(expect.arrayContaining(['PLANILLA DE REGISTRO PEDAGÓGICO · PRIMER BIMESTRE', 'Inscritos', 'Promedio (aprobados)', 'DOCENTE (Sello y Firma)', 'NOTA']));
    expect(contiene(plan, 'LUGAR Y FECHA: 26/10/2026')).toBe(true);
    const pf = plan.getRow(7).getCell(6).formula;
    expect(pf).toMatch(/^CONSOLIDADO!/);
  });

  it('sin evaluaciones deja celdas vacías y sin fórmulas de notas', async () => {
    const wb = await leerXlsx(await new RegistroPedagogicoExcelBuilder().generarRegistroPedagogicoBimestre({
      ...datos, evaluaciones_practicas: [], evaluaciones_teoricas: [], cuota_practico: undefined,
    }));
    const cons = wb.getWorksheet('CONSOLIDADO');
    let hayFormulas = false;
    cons.getRow(8).eachCell((c) => { if (c.formula) hayFormulas = true; });
    expect(hayFormulas).toBe(false);
    expect(contiene(cons, 'EVALUACIONES PRÁCTICAS (70)')).toBe(true); // cuota por defecto 70
  });

  it('sin estudiantes ni evaluaciones produce la estructura mínima', async () => {
    const wb = await leerXlsx(await new RegistroPedagogicoExcelBuilder().generarRegistroPedagogicoBimestre({}));
    expect(nombresHojas(wb)).toEqual(['CONSOLIDADO', 'PLANILLA CALIFICACIONES']);
  });

  it('solo evaluaciones teóricas (sin prácticas)', async () => {
    const wb = await leerXlsx(await new RegistroPedagogicoExcelBuilder().generarRegistroPedagogicoBimestre({
      ...datos, evaluaciones_practicas: [],
    }));
    expect(contiene(wb.getWorksheet('CONSOLIDADO'), 'EVALUACIONES TEÓRICAS (30)')).toBe(true);
  });

  it('mapa de columnas', () => {
    const m = buildColumnMap(2, 1);
    expect(m.colPractEnd).toBe(m.colPractStart + 1);
    expect(m.colPromPract).toBe(m.colPractEnd + 1);
    expect(m.practRange(8)).toBe('D8:E8');
    expect(m.teoRange(8)).toMatch(/^G8:G8$/);
    const v = buildColumnMap(0, 0);
    expect(v.colPromPract).toBe(v.colPractStart);
  });
});
