// Ayudas compartidas por las pruebas de generadores PDF (sin BD, sin red).
import { expect } from '@jest/globals';
import { PDFDocument } from 'pdf-lib';

/** Texto largo con acentos, eñes y caracteres no latinos para probar saltos y fuentes. */
export const TEXTO_LARGO = 'Ñandú pérez-núñez según planificación académica ¿qué? '.repeat(40);

/** Verifica cabecera `%PDF-` y que pdf-lib lo relea; devuelve { doc, paginas }. */
export async function leerPdf(buffer) {
  expect(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array).toBe(true);
  const buf = Buffer.from(buffer);
  expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(buf.length).toBeGreaterThan(1000);
  const doc = await PDFDocument.load(buf);
  return { doc, paginas: doc.getPageCount() };
}

/** Logger falso (info/warn/error/debug) para verificar los registros. */
export const loggerFalso = () => ({
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
});
