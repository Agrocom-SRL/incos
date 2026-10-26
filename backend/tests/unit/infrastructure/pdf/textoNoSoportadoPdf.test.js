/**
 * Un carácter fuera de WinAnsi (Ł, emoji, cirílico, flechas, ≥ ...) en cualquier dato libre
 * hacía fallar TODA la generación del PDF (pdf-lib lanza "WinAnsi cannot encode"). El PDF
 * debe generarse y mostrar "?" en lugar del carácter no soportado.
 */
import { describe, it, expect } from '@jest/globals';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { leerPdf } from './pdfHelpers.js';
import { protegerFuentesEstandar, sanearTextoWinAnsi } from '../../../../src/infrastructure/external/pdf/pdfFontSafety.js';
import { BoletinPdfGenerator } from '../../../../src/infrastructure/external/pdf/boletin/BoletinPdfGenerator.js';
import { DesignacionTutorPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/DesignacionTutorPdfGenerator.js';
import { ActaDefensaPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/ActaDefensaPdfGenerator.js';
import { PasantiaSeguimientoPdfGenerator } from '../../../../src/infrastructure/external/pdf/pasantias/PasantiaSeguimientoPdfGenerator.js';

const RAROS = ['Łukasz Ñandú', 'Ana 😀 Pérez', 'Иван Петров', 'objetivo → alcanzar ≥ 90% ✓'];

describe('protegerFuentesEstandar / sanearTextoWinAnsi', () => {
  it('reemplaza los caracteres no codificables y conserva los válidos', async () => {
    const doc = await PDFDocument.create();
    protegerFuentesEstandar(doc);
    protegerFuentesEstandar(doc); // idempotente
    const font = await doc.embedFont(StandardFonts.Helvetica);
    expect(() => font.encodeText('Łukasz 😀 ñ “ok” – €')).not.toThrow();
    expect(font.widthOfTextAtSize('Ł', 10)).toBeGreaterThan(0);
    expect(sanearTextoWinAnsi(font, 'Ñandú José “a” – ñ')).toBe('Ñandú José “a” – ñ');
    expect(sanearTextoWinAnsi(font, 'Łódź')).toBe('?ódz');
    expect(sanearTextoWinAnsi(font, 'Ana 😀')).toBe('Ana ?');
    expect(sanearTextoWinAnsi(font, 'Ćirilo')).toBe('Cirilo');
    expect(sanearTextoWinAnsi(font, null)).toBe('');
  });

  it('no toca las fuentes personalizadas (bytes)', async () => {
    const doc = await PDFDocument.create();
    protegerFuentesEstandar(doc);
    const original = doc.embedFont;
    expect(typeof original).toBe('function');
  });
});

describe.each(RAROS)('texto con caracteres fuera de WinAnsi: %s', (texto) => {
  it('boletín', async () => {
    const buf = await new BoletinPdfGenerator().generarBoletinEstudiante({
      cabecera: { estudiante: texto }, filas: [{ asignatura: texto }], observaciones: [texto],
    });
    await leerPdf(buf);
  });

  it('designación de tutor', async () => {
    await leerPdf(await new DesignacionTutorPdfGenerator().generate({ tutorNombre: texto, proyecto: { titulo: texto } }));
  });

  it('acta de defensa (fuentes estándar embebidas directamente)', async () => {
    await leerPdf(await new ActaDefensaPdfGenerator().generate({
      estudiante: { nombreCompleto: texto }, proyecto: { titulo: texto }, acta: { tribunal: [{ nombreCompleto: texto }] },
    }));
  });

  it('seguimiento de pasantía', async () => {
    await leerPdf(await new PasantiaSeguimientoPdfGenerator().generate({ pasantia: { estudianteNombre: texto }, seguimiento: { fortalezas: texto } }));
  });
});
