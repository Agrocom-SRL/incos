/**
 * Subida de archivos (multer): tipo, MIME, tamaño y nombre. Se usa un directorio temporal
 * (UPLOAD_DIR se fija antes de cargar la configuración) y los middlewares reales de upload.middleware.js,
 * con el mismo errorHandler de la app.
 */
import { describe, it, expect, afterAll } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';

const RAIZ = fs.mkdtempSync(path.join(os.tmpdir(), 'incos-uploads-'));
process.env.UPLOAD_DIR = RAIZ;
process.env.MAX_AVANCE_PROYECTO_SIZE = '2048';
process.env.MAX_COMPROBANTE_CAPACITACION_SIZE = '2048';
process.env.MAX_CARRERA_IMAGE_SIZE = '2048';
process.env.MAX_CUENTA_PAGO_QR_SIZE = '2048';

const { uploadAvanceProyecto, uploadComprobanteCapacitacion, uploadCuentaPagoQr, uploadCarreraImagen } =
  await import('../../../src/presentation/middleware/upload.middleware.js');
const { createErrorHandler } = await import('../../../src/presentation/middleware/errorHandler.middleware.js');
const { default: container } = await import('../../../src/infrastructure/container/index.js');
const { SERVICIOS_TOKENS } = await import('../../../src/infrastructure/container/tokens/index.js');

const logger = container.resolve(SERVICIOS_TOKENS.logger);
const errorFormatter = container.resolve(SERVICIOS_TOKENS.errorFormatter);

function appCon(middleware) {
  const mini = express();
  mini.post('/proyectos/:id/avances', middleware, (req, res) =>
    res.json({ file: req.file ? { name: req.file.filename, path: req.file.path } : null })
  );
  mini.use(createErrorHandler(logger, errorFormatter));
  return mini;
}

const PDF = Buffer.from('%PDF-1.4\n%fake\n');
const subir = (mini, campo, buffer, filename, contentType) =>
  request(mini).post('/proyectos/7/avances').attach(campo, buffer, { filename, contentType });

function archivosGuardados() {
  const lista = [];
  const recorrer = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const ruta = path.join(d, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else lista.push(ruta);
    }
  };
  recorrer(RAIZ);
  return lista;
}

afterAll(() => fs.rmSync(RAIZ, { recursive: true, force: true }));

describe('Avance de proyecto (solo PDF/Word)', () => {
  const mini = appCon(uploadAvanceProyecto);

  it('acepta un PDF legítimo y lo guarda dentro del directorio de uploads', async () => {
    const res = await subir(mini, 'archivo', PDF, 'capitulo1.pdf', 'application/pdf');
    expect(res.status).toBe(200);
    expect(path.resolve(res.body.file.path).startsWith(path.resolve(RAIZ) + path.sep)).toBe(true);
  });

  it.each([
    ['ejecutable .exe', 'virus.exe', 'application/octet-stream'],
    ['script .php con MIME pdf', 'shell.php', 'application/pdf'],
    ['html con MIME pdf', 'x.html', 'application/pdf'],
    ['doble extensión .pdf.exe', 'doc.pdf.exe', 'application/pdf'],
    ['extensión pdf con MIME text/html', 'doc.pdf', 'text/html'],
    ['svg', 'logo.svg', 'image/svg+xml'],
    ['sin extensión', 'archivo', 'application/pdf'],
  ])('rechaza %s con 4xx y no escribe nada', async (_n, nombre, mime) => {
    const antes = archivosGuardados().length;
    const res = await subir(mini, 'archivo', PDF, nombre, mime);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(archivosGuardados().length).toBe(antes);
  });

  it('rechaza un archivo que excede el límite de tamaño (400) y no deja residuos', async () => {
    const antes = archivosGuardados().length;
    const res = await subir(mini, 'archivo', Buffer.alloc(4096, 1), 'grande.pdf', 'application/pdf');
    expect(res.status).toBe(400);
    expect(archivosGuardados().length).toBe(antes);
  });

  it('rechaza un campo de archivo inesperado (LIMIT_UNEXPECTED_FILE)', async () => {
    const res = await subir(mini, 'otro', PDF, 'a.pdf', 'application/pdf');
    expect(res.status).toBe(400);
  });

  it('un nombre con path traversal no escapa del directorio de uploads', async () => {
    const res = await subir(mini, 'archivo', PDF, '../../../../etc/cron.d/x.pdf', 'application/pdf');
    if (res.status === 200) {
      expect(path.resolve(res.body.file.path).startsWith(path.resolve(RAIZ) + path.sep)).toBe(true);
      expect(res.body.file.name).not.toMatch(/[\\/]/);
    } else {
      expect(res.status).toBeLessThan(500);
    }
  });
});

describe('Comprobante de capacitación (imagen o PDF)', () => {
  const mini = appCon(uploadComprobanteCapacitacion);

  it('acepta PNG', async () => {
    const res = await subir(mini, 'comprobante', Buffer.from('\x89PNG\r\n'), 'dep.png', 'image/png');
    expect(res.status).toBe(200);
  });

  it.each([
    ['svg (XSS almacenado)', 'x.svg', 'image/svg+xml'],
    ['html', 'x.html', 'text/html'],
    ['js', 'x.js', 'application/javascript'],
    ['docx (no permitido aquí)', 'x.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ])('rechaza %s', async (_n, nombre, mime) => {
    const res = await subir(mini, 'comprobante', PDF, nombre, mime);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('rechaza archivos sobre el límite', async () => {
    const res = await subir(mini, 'comprobante', Buffer.alloc(4096, 1), 'g.png', 'image/png');
    expect(res.status).toBe(400);
  });
});

describe('Imagen de carrera y QR de cuenta de pago (solo imágenes)', () => {
  it.each([
    ['carrera', uploadCarreraImagen, 'imagen'],
    ['QR', uploadCuentaPagoQr, 'qr'],
  ])('%s: rechaza ejecutables/scripts/HTML y archivos sobredimensionados', async (_n, mw, campo) => {
    const mini = appCon(mw);
    for (const [nombre, mime] of [
      ['a.php', 'image/png'],
      ['a.exe', 'application/octet-stream'],
      ['a.html', 'text/html'],
      ['a.png.php', 'image/png'],
      ['a.png', 'text/html'],
    ]) {
      const res = await subir(mini, campo, PDF, nombre, mime);
      expect({ nombre, mime, ok: res.status >= 400 && res.status < 500 }).toEqual({ nombre, mime, ok: true });
    }
    const grande = await subir(mini, campo, Buffer.alloc(4096, 1), 'g.png', 'image/png');
    expect(grande.status).toBe(400);
  });
});
