import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, descargarComo } from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

describe('Exportaciones (archivo real, no vacío)', () => {
  it('Excel: cuentas por cobrar (finanzas.cuenta-cobrar.reporte · EXPORTAR)', async () => {
    const res = await descargarComo('DIR_ADMIN', '/pagos-aportes/reportes/cuentas-por-cobrar/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(XLSX);
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(1000);
    // .xlsx es un zip: firma "PK"
    expect(res.body.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  it('Excel: estadística de inscritos (matricula.admision.ver · EXPORTAR)', async () => {
    const res = await descargarComo('SEC_ACADEMICA', '/estudiantes/export/estadistica-inscritos');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(XLSX);
    expect(res.body.length).toBeGreaterThan(1000);
    expect(res.body.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  it('PDF: avance de tutorías por carrera (titulacion.proyecto · EXPORTAR)', async () => {
    const res = await descargarComo('DIR_ACADEMICO', '/proyectos-grado/reportes/avance-carrera/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body.length).toBeGreaterThan(1000);
    expect(res.body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('una exportación sin el permiso EXPORTAR responde 403 y no entrega archivo', async () => {
    // SEC_ADMIN no tiene finanzas.cuenta-cobrar.reporte
    const res = await descargarComo('SEC_ADMIN', '/pagos-aportes/reportes/cuentas-por-cobrar/export');
    expect(res.status).toBe(403);
    expect(res.headers['content-type']).not.toContain(XLSX);
  });
});
