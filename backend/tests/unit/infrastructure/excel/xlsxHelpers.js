// Ayudas compartidas por las pruebas de generadores Excel (sin BD, sin red).
import ExcelJS from 'exceljs';
import { expect } from '@jest/globals';

/** Verifica que sea un .xlsx (zip: cabecera "PK") y lo relee con exceljs. */
export async function leerXlsx(buffer) {
  expect(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array).toBe(true);
  expect(Buffer.from(buffer).subarray(0, 2).toString('latin1')).toBe('PK');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
}

/** Texto visible de todas las celdas de una hoja (incluye celdas combinadas una sola vez). */
export function textosDe(ws) {
  const out = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      let t = '';
      try {
        t = cell.text; // celdas combinadas con maestra vacía hacen fallar a exceljs
      } catch {
        t = '';
      }
      if (t !== '' && t != null) out.push(String(t));
    });
  });
  return out;
}

export const nombresHojas = (wb) => wb.worksheets.map((w) => w.name);

export const contiene = (ws, fragmento) => textosDe(ws).some((t) => t.includes(fragmento));
