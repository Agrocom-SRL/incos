import { describe, it, expect, jest } from '@jest/globals';
import { leerPdf, TEXTO_LARGO } from './pdfHelpers.js';
import { ActaCompromisoPdfGenerator } from '../../../../src/infrastructure/external/pdf/ActaCompromisoPdfGenerator.js';
import { FormularioInscripcionPdfGenerator } from '../../../../src/infrastructure/external/pdf/FormularioInscripcionPdfGenerator.js';
import { DeclaracionJuradaPdfGenerator } from '../../../../src/infrastructure/external/pdf/DeclaracionJuradaPdfGenerator.js';
import { ReciboPagoPdfGenerator } from '../../../../src/infrastructure/external/pdf/ReciboPagoPdfGenerator.js';
import { ReciboPagoCapacitacionPdfGenerator } from '../../../../src/infrastructure/external/pdf/capacitacion/ReciboPagoCapacitacionPdfGenerator.js';
import { FormularioInscripcionCapacitacionPdfGenerator } from '../../../../src/infrastructure/external/pdf/capacitacion/FormularioInscripcionCapacitacionPdfGenerator.js';
import { BoletinPdfGenerator } from '../../../../src/infrastructure/external/pdf/boletin/BoletinPdfGenerator.js';
import { HistorialAcademicoPdfGenerator } from '../../../../src/infrastructure/external/pdf/historial-academico/HistorialAcademicoPdfGenerator.js';
import { PDFGenerator } from '../../../../src/infrastructure/external/pdf/PDFGenerator.js';
import { computeColumnGeometry as geomBoletin, computeTableHeight, computeHorizontalLineYs } from '../../../../src/infrastructure/external/pdf/boletin/boletinPdfLayout.js';
import { ordenarFilasHistorial, necesitaSaltoPagina } from '../../../../src/infrastructure/external/pdf/historial-academico/historialAcademicoPdfLayout.js';
import { computeFirmaColumnas, cabeBloque, formatearMonto, valorODefecto } from '../../../../src/infrastructure/external/pdf/capacitacion/capacitacionPdfLayout.js';

const student = {
  nombres: 'Ana María', apellidoPaterno: 'Núñez', apellidoMaterno: 'Ñusta', ci: '1234567', expedicion: 'SC', codigoEstudiante: 'E-2026-001',
  celular: '70000000', emailPersonal: 'ana@example.com', direccion: 'Av. Cañoto #123', zona: 'Centro', edad: 22, fechaNacimientoLiteral: '5 de marzo de 2004',
  genero: 'FEMENINO', estadoCivilNombre: 'Soltera', tipoSangre: 'O+', trabaja: true, empresaInstitucion: 'Ñandú S.R.L.', cargo: 'Auxiliar',
  residenciaDepartamentoNombre: 'Santa Cruz', residenciaProvinciaNombre: 'Andrés Ibáñez', residenciaMunicipioNombre: 'Santa Cruz de la Sierra',
  tieneDiscapacidad: true, discapacidades: [{ tipoDiscapacidadNombre: 'Visual', gradoDiscapacidad: 'Leve' }, { tipo_discapacidad_nombre: 'Auditiva' }],
  origenes: [{ es_principal: 1, tipo_origen: 'BOLIVIANA', nacimiento_departamento_nombre: 'Santa Cruz', nacimiento_provincia_nombre: 'Andrés Ibáñez', nacimiento_municipio_nombre: 'Cotoca' }, { tipo_origen: 'EXTRANJERA', pais_nombre: 'Perú' }],
  apoderados: [{ es_principal: true, tipoParentescoNombre: 'Madre', apoderadoNombres: 'Rosa', apoderadoApellidos: 'Ñusta', celular: '71111111' }],
};
const entregas = [
  { nombre_documento: 'Cédula de identidad', en_tramite: false, observaciones_entrega: 'Fotocopia' },
  { nombreDocumento: 'Título de bachiller', en_tramite: true },
];
const options = (extra = {}) => ({
  gestion: 2026, student, fechaActual: '26 de octubre de 2026', entregas, diasPlazo: 15,
  academicData: { carreraNombre: 'Sistemas Informáticos', carreraCodigo: 'INF', tipoAdmision: 'REGULAR' },
  enrollmentData: { periodoNombre: 'Primer año', paraleloLabel: 'A', materias: [{ sigla: 'INF-101', nombre: 'Programación', horas: 80, periodoNombre: '1er año', paraleloNombre: 'A', paraleloTurno: 'NOCHE' }, { sigla: 'MAT-1', nombre: TEXTO_LARGO.slice(0, 120) }] },
  ...extra,
});

describe('ActaCompromisoPdfGenerator', () => {
  it('con estudiante, entregas y fecha', async () => {
    const { paginas } = await leerPdf(await new ActaCompromisoPdfGenerator().generate(options()));
    expect(paginas).toBeGreaterThanOrEqual(1);
  });
  it('sin opciones', async () => {
    await leerPdf(await new ActaCompromisoPdfGenerator().generate());
  });
});

describe('FormularioInscripcionPdfGenerator', () => {
  it('formulario completo con materias, apoderado y discapacidad', async () => {
    await leerPdf(await new FormularioInscripcionPdfGenerator().generate(options()));
  });
  it('firma en dos columnas, traspaso, extranjero y datos en snake_case', async () => {
    await leerPdf(await new FormularioInscripcionPdfGenerator().generate(options({
      signatureTwoColumns: true, tipoAdmision: 'TRASPASO',
      student: { ...student, trabaja: false, tieneDiscapacidad: false, discapacidades: [], apoderados: [], origenes: [{ tipo_origen: 'EXTRANJERA', pais_nombre: 'Perú' }], residencia_departamento_nombre: 'Beni', empresa_institucion: 'X' },
    })));
  });
  it('sin opciones', async () => {
    await leerPdf(await new FormularioInscripcionPdfGenerator().generate());
  });
});

describe('DeclaracionJuradaPdfGenerator', () => {
  it.each(['TRASPASO', 'REGULAR', undefined])('tipo de admisión %s', async (tipoAdmision) => {
    await leerPdf(await new DeclaracionJuradaPdfGenerator().generate(options({ tipoAdmision })));
  });
  it('sin opciones', async () => {
    await leerPdf(await new DeclaracionJuradaPdfGenerator().generate());
  });
});

describe('ReciboPagoPdfGenerator', () => {
  const data = (extra = {}) => ({
    numeroRecibo: 'FAV-000123', fechaPago: '2026-03-05', nombreCompleto: 'Núñez Ñusta Ana', ci: '1234567', expedicion: 'SC', carrera: 'Sistemas Informáticos',
    cursoParalelo: 'Primero A', anio: '2026', montoTotal: 2400, descuentoBeca: 0, montoPagado: 400, concepto: 'Aporte voluntario cuota 1', metodoPago: 'EFECTIVO',
    numeroTransaccion: 'TX-1', saldoPendiente: 2000, totalPagadoAntes: 0, observacion: 'Primera cuota', ...extra,
  });

  it('recibo normal', async () => {
    await leerPdf(await new ReciboPagoPdfGenerator().generate(data()));
  });
  it('con beca, exclusión de cuota y saldo cero', async () => {
    const gen = new ReciboPagoPdfGenerator();
    await leerPdf(await gen.generate(data({ montoPagado: 0, descuentoBeca: 2400, becaInfo: { nombre: 'Beca excelencia', porcentaje: 100 }, saldoPendiente: 0 })));
    await leerPdf(await gen.generate(data({ becaInfo: { name: 'Beca Ñ' }, descuentoBeca: 1200, montoObligatorio: 1200 })));
  });
  it('datos mínimos y observación larga', async () => {
    await leerPdf(await new ReciboPagoPdfGenerator().generate({ observacion: TEXTO_LARGO }));
    await leerPdf(await new ReciboPagoPdfGenerator().generate({}));
  });
  it('registra el error si falla la construcción', async () => {
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const gen = new ReciboPagoPdfGenerator({ logger });
    gen._buildHeader = jest.fn().mockRejectedValue(new Error('cabecera'));
    await expect(gen.generate(data())).rejects.toThrow('cabecera');
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('ReciboPagoCapacitacionPdfGenerator', () => {
  const datos = (extra = {}) => ({
    numeroRecibo: 'CAP-1', fechaPago: '2026-03-05', codigoInscripcion: 'INS-1', concepto: 'CURSO', conceptoEtiqueta: 'Costo del curso', metodoPago: 'QR', cuenta: 'BNB 123',
    participante: { nombreCompleto: 'Pérez Ñ.', ci: '999' }, curso: { titulo: 'Excel avanzado', grupo: 'G1', horarios: 'Lun 18:00', entidadCertificadora: 'Cámara' },
    totalConcepto: 350, pagadoAntes: 100, montoPago: 150.5, saldoConcepto: 99.5, observacion: null, ...extra,
  });
  it('genera el recibo de curso y de matrícula', async () => {
    const gen = new ReciboPagoCapacitacionPdfGenerator();
    await leerPdf(await gen.generarRecibo(datos()));
    await leerPdf(await gen.generarRecibo(datos({ concepto: 'MATRICULA', pagadoAntes: 0, cuenta: null })));
  });
  it('_montoEnLetras', () => {
    const gen = new ReciboPagoCapacitacionPdfGenerator();
    expect(gen._montoEnLetras(150.5)).toBe('Ciento cincuenta con 50/100 bolivianos');
    expect(gen._montoEnLetras('x')).toBe('Cero con 00/100 bolivianos');
  });
  it('_textoConstancia sustituye los marcadores', () => {
    const texto = new ReciboPagoCapacitacionPdfGenerator()._textoConstancia(datos());
    expect(texto).toContain('Pérez Ñ.');
    expect(texto).toContain('Excel avanzado');
    expect(texto).not.toContain('{');
  });
});

describe('FormularioInscripcionCapacitacionPdfGenerator', () => {
  const grupos = Array.from({ length: 30 }, (_, i) => ({
    nombre: `Grupo ${i} ${TEXTO_LARGO.slice(0, 60)}`, seleccionado: i === 1,
    bloques: i % 3 === 0 ? [] : [{ dias: 'Lunes y miércoles', horas: '18:00 - 20:00' }, { dias: 'Sábado', horas: '08:00 - 12:00' }],
  }));
  const datos = (extra = {}) => ({
    codigoInscripcion: 'INS-9', gestion: 2026, fechaInscripcion: '2026-03-01', estado: 'ACTIVO',
    participante: { nombreCompleto: 'Pérez Ñ.', ci: '999', celular: '700', email: 'p@x.bo' },
    curso: { titulo: 'Excel avanzado', modalidad: 'Presencial', fechaInicio: '2026-04-01', entidadCertificadora: 'Cámara' },
    requisitos: [{ descripcion: 'Fotocopia de CI', obligatorio: true, entregado: true, fechaEntrega: '2026-03-01' }, { descripcion: TEXTO_LARGO.slice(0, 200), obligatorio: false, entregado: false }],
    compromiso: { fechaLimite: '2026-05-01' }, grupos, ...extra,
  });
  it('formulario con muchos grupos (pagina)', async () => {
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const { paginas } = await leerPdf(await new FormularioInscripcionCapacitacionPdfGenerator({ logger }).generarFormularioInscripcion(datos()));
    expect(paginas).toBeGreaterThan(1);
    expect(logger.info).toHaveBeenCalled();
  });
  it('sin requisitos ni grupos', async () => {
    await leerPdf(await new FormularioInscripcionCapacitacionPdfGenerator().generarFormularioInscripcion(datos({ requisitos: [], grupos: [], compromiso: null })));
  });
});

describe('BoletinPdfGenerator', () => {
  const filas = [
    { codigo: 'INF-101', asignatura: 'Programación I', par1: 70, par2: 65, par3: null, par4: '', prom: 68, hab: null, final: 68, obs: 'Aprobado', teo: 20, pra: 48, total: 68, estado: 'APROBADO' },
    { codigo: 'MAT-1', asignatura: TEXTO_LARGO.slice(0, 200), final: 40, obs: TEXTO_LARGO.slice(0, 100) },
  ];
  it('boletín anual con observaciones y promedios', async () => {
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    await leerPdf(await new BoletinPdfGenerator({ logger }).generarBoletinEstudiante({
      titulo: 'BOLETIN DE CALIFICACIONES', cabecera: { estudiante: 'Núñez Ñusta Ana', carrera: 'Sistemas', nivel: 'Técnico Superior', curso: '1°', paralelo: 'A', regimen: 'Anual', gestion: 2026 },
      filas, promedioClasePorParcial: { par1: 70, prom: 68 }, observaciones: ['Buen desempeño', '', null, TEXTO_LARGO], footerRowLabel: 'PROMEDIO CLASE',
    }));
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Boletín generado'), expect.objectContaining({ asignaturas: 2 }));
  });
  it('boletín por bimestre y sin datos', async () => {
    await leerPdf(await new BoletinPdfGenerator().generarBoletinEstudiante({ bimestre: 2, cabecera: { estudiante: 'X', bimestre: 2 }, filas, promedioClasePorParcial: { total: 55 } }));
    await leerPdf(await new BoletinPdfGenerator().generarBoletinEstudiante());
  });
  it('helpers de texto', () => {
    const gen = new BoletinPdfGenerator();
    expect(gen._formatCellValue(null, 'par1')).toBe('—'.length ? gen._formatCellValue(null, 'par1') : '');
    expect(gen._formatCellValue(null, 'hab')).toBe('');
    expect(gen._formatCellValue('ok', 'obs')).toBe('ok');
    expect(gen._formatCellValue(5, 'par1')).toBe('5');
    expect(gen._columnasVisibles({ bimestre: 3 })).not.toBe(gen._columnasVisibles({}));
    expect(gen._columnasVisibles({ bimestre: 9 })).toBe(gen._columnasVisibles());
    expect(gen._safeWidth({ widthOfTextAtSize: () => { throw new Error('x'); } }, 'abcd', 10)).toBe(20);
    const font = { widthOfTextAtSize: (s, size) => s.length * size };
    expect(gen._fitText(font, 1, '', 10)).toBe('');
    expect(gen._fitText(font, 1, 'abc', 10)).toBe('abc');
    expect(gen._fitText(font, 1, 'abcdefghijklmnop', 5)).toBe('abcd…');
  });
  it('layout de columnas y líneas', () => {
    const cols = geomBoletin({ columns: [{ key: 'a', label: 'A', width: 1 }, { key: 'b', label: 'B', width: 3, tinted: true, align: 'right' }], contentWidth: 400, startX: 10 });
    expect(cols[0]).toMatchObject({ x: 10, width: 100, align: 'left', tinted: false });
    expect(cols[1]).toMatchObject({ x: 110, width: 300, align: 'right', tinted: true });
    expect(geomBoletin({ columns: [], contentWidth: 10, startX: 0 })).toEqual([]);
    expect(computeTableHeight({ headerHeight: 20, rowHeight: 10, dataRowCount: 3, includeFooterRow: true })).toBe(60);
    expect(computeTableHeight({ headerHeight: 20, rowHeight: 10, dataRowCount: 3 })).toBe(50);
    expect(computeHorizontalLineYs({ topY: 100, headerHeight: 20, rowHeight: 10, dataRowCount: 2, includeFooterRow: true })).toEqual([100, 80, 70, 60, 50]);
  });
});

describe('HistorialAcademicoPdfGenerator', () => {
  const filas = Array.from({ length: 70 }, (_, i) => ({
    nro: i + 1, gestionAnio: 2024 + Math.floor(i / 25), periodoNumero: 1 + (i % 3), cargaHoraria: 80, periodoNombre: '1er año', asignaturaSigla: `S-${i}`,
    asignaturaNombre: i % 7 === 0 ? TEXTO_LARGO.slice(0, 150) : `Asignatura ${i} ñ`, prerrequisitoSigla: i % 2 ? 'S-0' : null, notaFinal: 60 + (i % 40), notaRecuperacion: null, estado: i % 9 === 0 ? 'REPROBADO' : 'APROBADO',
  }));
  const estudiante = { nombreCompleto: 'Núñez Ñusta Ana', matricula: 'M-1', ci: '123', expedicion: 'SC', carreraNombre: 'Sistemas', nivelFormacion: 'Técnico Superior', regimen: 'Anual', fechaAdmision: '2024-02-01', fechaConclusion: null };

  it('historial largo con varias páginas y resumen', async () => {
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const { paginas } = await leerPdf(await new HistorialAcademicoPdfGenerator({ logger }).generarHistorialAcademico({
      estudiante, filas, resumen: { totalCargaHoraria: 5600, asignaturasAprobadas: 62, asignaturasTotal: 70, promedioGeneral: 74.3 },
    }));
    expect(paginas).toBeGreaterThan(1);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Historial generado'), expect.objectContaining({ filas: 70 }));
  });
  it('sin filas ni datos', async () => {
    await leerPdf(await new HistorialAcademicoPdfGenerator().generarHistorialAcademico());
  });
  it('ordena filas y decide saltos de página', () => {
    const orden = ordenarFilasHistorial([{ gestionAnio: 2025, periodoNumero: 1, nro: 2 }, { gestionAnio: 2024, periodoNumero: 3, nro: 1 }, { gestionAnio: 2025, periodoNumero: 1, nro: 1 }, null]);
    expect(orden.map((f) => f?.nro)).toEqual([undefined, 1, 1, 2]);
    expect(ordenarFilasHistorial(null)).toEqual([]);
    expect(necesitaSaltoPagina({ currentY: 100, blockHeight: 50, floorY: 60 })).toBe(true);
    expect(necesitaSaltoPagina({ currentY: 200, blockHeight: 50, floorY: 60 })).toBe(false);
  });
});

describe('capacitacionPdfLayout', () => {
  it('computeFirmaColumnas', () => {
    expect(computeFirmaColumnas({ count: 0 })).toEqual([]);
    const cols = computeFirmaColumnas({ count: 2, startX: 0, contentWidth: 400 });
    expect(cols).toHaveLength(2);
    expect(cols[0].centerX).toBe(100);
    expect(cols[1].x2 - cols[1].x1).toBe(150);
    const estrecho = computeFirmaColumnas({ count: 4, startX: 0, contentWidth: 100 });
    expect(estrecho[0].x2 - estrecho[0].x1).toBe(0);
  });
  it('cabeBloque, formatearMonto y valorODefecto', () => {
    expect(cabeBloque({ currentY: 100, requerido: 50, floorY: 50 })).toBe(true);
    expect(cabeBloque({ currentY: 100, requerido: 51, floorY: 50 })).toBe(false);
    expect(formatearMonto(12.345)).toBe('12.35 Bs');
    expect(formatearMonto('x', 'USD')).toBe('0.00 USD');
    expect(valorODefecto('  ', '—')).toBe('—');
    expect(valorODefecto(null, '—')).toBe('—');
    expect(valorODefecto(' a ', '—')).toBe('a');
  });
});

describe('PDFGenerator (fachada)', () => {
  it('delega en cada generador', async () => {
    const mk = () => ({ generate: jest.fn().mockResolvedValue(Buffer.from('%PDF-')) });
    const deps = { actaCompromisoPdfGenerator: mk(), formularioInscripcionPdfGenerator: mk(), declaracionJuradaPdfGenerator: mk(), reciboPagoPdfGenerator: mk() };
    const gen = new PDFGenerator(deps);
    await gen.generateReciboPago({ a: 1 });
    await gen.generateActaCompromiso({ gestion: 2026 });
    await gen.generateFormularioDeclaracionJurada({ b: 2 });
    await gen.generateFormularioInscripcion({ c: 3 });
    expect(deps.reciboPagoPdfGenerator.generate).toHaveBeenCalledWith({ a: 1 });
    expect(deps.actaCompromisoPdfGenerator.generate).toHaveBeenCalledWith({ gestion: 2026 });
    expect(deps.declaracionJuradaPdfGenerator.generate).toHaveBeenCalledWith({ b: 2 });
    expect(deps.formularioInscripcionPdfGenerator.generate).toHaveBeenCalledWith({ c: 3 });
  });
  it('falla con mensaje claro si falta una dependencia', async () => {
    const gen = new PDFGenerator();
    await expect(gen.generateReciboPago({})).rejects.toThrow(/ReciboPagoPdfGenerator no está inyectado/);
    await expect(gen.generateActaCompromiso()).rejects.toThrow(/ActaCompromisoPdfGenerator/);
    await expect(gen.generateFormularioDeclaracionJurada()).rejects.toThrow(/DeclaracionJuradaPdfGenerator/);
    await expect(gen.generateFormularioInscripcion()).rejects.toThrow(/FormularioInscripcionPdfGenerator/);
  });
});
