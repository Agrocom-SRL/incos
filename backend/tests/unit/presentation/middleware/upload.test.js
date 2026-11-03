import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, jest, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Los archivos se escriben en un directorio temporal absoluto, nunca en el repo.
const dirTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'incos-upload-'));

jest.unstable_mockModule('../../../../src/infrastructure/config/multer.config.js', () => ({
  multerConfig: {
    uploadDir: dirTemporal,
    maxFileSize: 1024,
    allowedFileTypes: ['.pdf', '.png'],
    allowedMimeTypes: ['application/pdf', 'image/png'],
    limits: { fileSize: 1024, files: 2 },
  },
}));

const upload = await import('../../../../src/presentation/middleware/upload.middleware.js');

afterAll(() => fs.rmSync(dirTemporal, { recursive: true, force: true }));

/** App mínima: middleware de subida + eco de req.file y manejo de errores como el real (400 con mensaje). */
const montar = (middleware, ruta = '/subir/:id') => {
  const app = express();
  app.post(ruta, middleware, (req, res) => res.json({ file: req.file ? { name: req.file.originalname, path: req.file.path, field: req.file.fieldname } : null }));
  app.use((err, _req, res, _next) => res.status(400).json({ error: err.message }));
  return app;
};

const PNG = Buffer.from('89504e470d0a1a0a', 'hex');

describe('upload.middleware', () => {
  describe('comprobante de pago (uploadPaymentDocument)', () => {
    const app = montar(upload.uploadPaymentDocument, '/pagos/:studentId');

    it('guarda un PDF permitido bajo el directorio del estudiante', async () => {
      const res = await request(app)
        .post('/pagos/12')
        .attach('documentoRespaldo', Buffer.from('%PDF-1'), { filename: 'recibo.pdf', contentType: 'application/pdf' })
        .expect(200);
      expect(res.body.file.field).toBe('documentoRespaldo');
      expect(res.body.file.path.startsWith(dirTemporal)).toBe(true);
      expect(fs.existsSync(res.body.file.path)).toBe(true);
    });

    it('rechaza extensión no permitida', async () => {
      const res = await request(app)
        .post('/pagos/12')
        .attach('documentoRespaldo', Buffer.from('x'), { filename: 'virus.exe', contentType: 'application/pdf' })
        .expect(400);
      expect(res.body.error).toContain('Tipo de archivo no permitido');
    });

    it('rechaza MIME no permitido aunque la extensión sea válida', async () => {
      const res = await request(app)
        .post('/pagos/12')
        .attach('documentoRespaldo', Buffer.from('x'), { filename: 'a.pdf', contentType: 'text/html' })
        .expect(400);
      expect(res.body.error).toContain('Tipo MIME no permitido');
    });

    it('rechaza archivos por encima del límite de tamaño', async () => {
      const res = await request(app)
        .post('/pagos/12')
        .attach('documentoRespaldo', Buffer.alloc(4096), { filename: 'a.pdf', contentType: 'application/pdf' })
        .expect(400);
      expect(res.body.error).toMatch(/File too large/i);
    });

    it('sin archivo continúa con file nulo', async () => {
      const res = await request(app).post('/pagos/12').field('x', '1').expect(200);
      expect(res.body.file).toBeNull();
    });
  });

  describe('imagen de carrera (uploadCarreraImagen)', () => {
    const app = montar(upload.uploadCarreraImagen);

    it('acepta imágenes y las guarda con el código de carrera', async () => {
      const res = await request(app)
        .post('/subir/1')
        .field('codigo', 'SIS')
        .attach('imagen', PNG, { filename: 'logo.png', contentType: 'image/png' })
        .expect(200);
      expect(path.basename(res.body.file.path)).toContain('SIS');
    });

    it('rechaza extensiones no imagen y MIME no imagen', async () => {
      const r1 = await request(app).post('/subir/1').attach('imagen', Buffer.from('x'), { filename: 'a.pdf', contentType: 'application/pdf' }).expect(400);
      expect(r1.body.error).toContain('Solo imágenes permitidas');
      const r2 = await request(app).post('/subir/1').attach('imagen', Buffer.from('x'), { filename: 'a.png', contentType: 'text/plain' }).expect(400);
      expect(r2.body.error).toContain('MIME de imagen');
    });
  });

  describe('QR de cuenta de pago (uploadCuentaPagoQr)', () => {
    const app = montar(upload.uploadCuentaPagoQr);

    it('acepta imagen y rechaza lo que no lo es', async () => {
      await request(app).post('/subir/1').attach('qr', PNG, { filename: 'qr.png', contentType: 'image/png' }).expect(200);
      const bad = await request(app).post('/subir/1').attach('qr', Buffer.from('x'), { filename: 'qr.txt', contentType: 'text/plain' }).expect(400);
      expect(bad.body.error).toContain('Solo imágenes permitidas');
      const mime = await request(app).post('/subir/1').attach('qr', Buffer.from('x'), { filename: 'qr.png', contentType: 'application/zip' }).expect(400);
      expect(mime.body.error).toContain('MIME');
    });
  });

  describe('avance de proyecto (uploadAvanceProyecto)', () => {
    const app = montar(upload.uploadAvanceProyecto);

    it('acepta PDF y Word; rechaza imágenes y MIME ajeno', async () => {
      await request(app).post('/subir/9').attach('archivo', Buffer.from('%PDF'), { filename: 'a.pdf', contentType: 'application/pdf' }).expect(200);
      await request(app).post('/subir/9').attach('archivo', Buffer.from('x'), { filename: 'a.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }).expect(200);
      const ext = await request(app).post('/subir/9').attach('archivo', PNG, { filename: 'a.png', contentType: 'image/png' }).expect(400);
      expect(ext.body.error).toContain('Tipo de archivo no permitido');
      const mime = await request(app).post('/subir/9').attach('archivo', Buffer.from('x'), { filename: 'a.pdf', contentType: 'image/png' }).expect(400);
      expect(mime.body.error).toContain('solo PDF o Word');
    });
  });

  describe('comprobante de capacitación (uploadComprobanteCapacitacion)', () => {
    const app = montar(upload.uploadComprobanteCapacitacion);

    it('acepta imagen o PDF; rechaza Word', async () => {
      await request(app).post('/subir/3').attach('comprobante', PNG, { filename: 'c.png', contentType: 'image/png' }).expect(200);
      await request(app).post('/subir/3').attach('comprobante', Buffer.from('%PDF'), { filename: 'c.pdf', contentType: 'application/pdf' }).expect(200);
      const ext = await request(app).post('/subir/3').attach('comprobante', Buffer.from('x'), { filename: 'c.docx', contentType: 'application/msword' }).expect(400);
      expect(ext.body.error).toContain('Tipo de archivo no permitido');
      const mime = await request(app).post('/subir/3').attach('comprobante', Buffer.from('x'), { filename: 'c.pdf', contentType: 'application/msword' }).expect(400);
      expect(mime.body.error).toContain('solo imagen o PDF');
    });
  });
});
