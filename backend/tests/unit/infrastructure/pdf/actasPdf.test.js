import { describe, it, expect } from '@jest/globals';
import { leerPdf, TEXTO_LARGO } from './pdfHelpers.js';
import { ActaDefensaPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/ActaDefensaPdfGenerator.js';
import { InformeSuficienciaPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/InformeSuficienciaPdfGenerator.js';
import { numberToWords, fechaEnLetras } from '../../../../src/infrastructure/external/pdf/numberToWords.js';
import { RESULTADOS_DICTAMEN_TUTORIA } from '../../../../src/domain/constants/titulacion.constants.js';

describe('numberToWords / fechaEnLetras', () => {
  it.each([
    [0, 'cero'], [1, 'uno'], [10, 'diez'], [16, 'dieciséis'], [21, 'veinte y uno'], [30, 'treinta'], [45, 'cuarenta y cinco'],
    [100, 'cien'], [101, 'ciento uno'], [500, 'quinientos'], [700, 'setecientos'], [900, 'novecientos'], [345, 'trescientos cuarenta y cinco'],
    [1000, 'mil'], [2026, 'dos mil veinte y seis'], [1999, 'mil novecientos noventa y nueve'], [12000, 'doce mil'],
    [-5, 'cinco'], ['x', 'cero'], [null, 'cero'], [72.9, 'setenta y dos'],
  ])('%p -> %s', (n, texto) => {
    expect(numberToWords(n)).toBe(texto);
  });

  it('fechaEnLetras convierte ISO y tolera valores inválidos', () => {
    expect(fechaEnLetras('2026-03-05')).toBe('cinco de marzo de dos mil veinte y seis');
    expect(fechaEnLetras('2026-03-05T10:00:00Z')).toBe('cinco de marzo de dos mil veinte y seis');
    expect(fechaEnLetras('')).toBe('');
    expect(fechaEnLetras(null)).toBe('');
    expect(fechaEnLetras('basura')).toBe('');
    expect(fechaEnLetras('2026-13-05')).toContain('de  de');
  });
});

describe('ActaDefensaPdfGenerator', () => {
  const options = (extra = {}) => ({
    nivel: 'TÉCNICO SUPERIOR',
    acta: {
      numeroActaFormateado: '001/2026', fechaDefensa: '2026-03-05', horaInicio: '09:00:00', horaConclusion: '10:30:00', calificacionFinal: 87.6, resultado: 'APRUEBA',
      tribunal: [{ nombreCompleto: 'Dr. Ñúñez', cargo: 'Presidente' }, { nombreCompleto: 'Lic. Pérez' }, { nombreCompleto: 'Ing. Soto' }],
    },
    estudiante: { nombreCompleto: 'Ana Núñez Ñusta', ci: '1234567', expedicion: 'SC' },
    proyecto: { modalidadNombre: 'Proyecto de grado', titulo: `Sistema de gestión ${TEXTO_LARGO}`, carreraNombre: 'Sistemas Informáticos' },
    ...extra,
  });

  it('genera el acta aprobada con tribunal y firmas', async () => {
    const buf = await new ActaDefensaPdfGenerator().generate(options());
    const { paginas } = await leerPdf(buf);
    expect(paginas).toBeGreaterThanOrEqual(1);
  });

  it('reprobado y sin folio ni tribunal', async () => {
    await leerPdf(await new ActaDefensaPdfGenerator().generate(options({
      acta: { resultado: 'REPRUEBA', calificacionFinal: 30 },
    })));
  });

  it('sin opciones', async () => {
    await leerPdf(await new ActaDefensaPdfGenerator().generate());
  });
});

describe('InformeSuficienciaPdfGenerator', () => {
  const base = {
    estudiante: { nombres: 'Ana', apellidoPaterno: 'Núñez', apellidoMaterno: 'Ñusta', ci: '123', expedicion: 'SC', celular: '700', nombreCompleto: 'Ana Núñez Ñusta' },
    proyecto: { carreraNombre: 'Sistemas', modalidadNombre: 'Proyecto de grado', titulo: 'Título ñ' },
    tutorNombre: 'Dr. Ñ', aspectosFormato: TEXTO_LARGO, contenidoProyecto: 'Bien', procesoTutoria: null, fechaEmision: '2026-03-05',
  };

  it('aprobado y no aprobado', async () => {
    await leerPdf(await new InformeSuficienciaPdfGenerator().generate({ ...base, resultadoSuficiencia: RESULTADOS_DICTAMEN_TUTORIA.APROBADO }));
    await leerPdf(await new InformeSuficienciaPdfGenerator().generate({ ...base, resultadoSuficiencia: 'OTRO' }));
  });

  it('sin opciones', async () => {
    await leerPdf(await new InformeSuficienciaPdfGenerator().generate());
  });

  it('_formatLugarFecha con fecha ISO y con hoy', () => {
    const gen = new InformeSuficienciaPdfGenerator();
    expect(gen._formatLugarFecha('2026-03-05')).toBe('Santa Cruz, 5 de marzo de 2026');
    expect(gen._formatLugarFecha()).toMatch(/^Santa Cruz, \d{1,2} de [a-z]+ de \d{4}$/);
  });
});
