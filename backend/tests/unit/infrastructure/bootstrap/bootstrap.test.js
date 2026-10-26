import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { Application } from '../../../../src/infrastructure/bootstrap/Application.js';
import { setupMiddleware, setupErrorHandling } from '../../../../src/infrastructure/bootstrap/middleware.config.js';
import { setupRoutes } from '../../../../src/infrastructure/bootstrap/routes.config.js';
import { sequelize } from '../../../../src/infrastructure/database/sequelize.js';
import { serverConfig } from '../../../../src/infrastructure/config/server.config.js';
import { ErrorFormatter } from '../../../../src/infrastructure/services/ErrorFormatter.js';
import { UploadsStorageAdapter } from '../../../../src/infrastructure/services/UploadsStorageAdapter.js';
import { UploadsStorageHelper } from '../../../../src/infrastructure/external/storage/UploadsStorageHelper.js';
import { invalidarCacheConsolidado } from '../../../../src/infrastructure/services/CalificacionCacheInvalidator.js';

const loggerFalso = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() });

describe('Application', () => {
  let app;
  let authenticate;
  beforeEach(() => {
    app = new Application();
    app.logger = loggerFalso();
    authenticate = jest.spyOn(sequelize, 'authenticate');
  });
  afterEach(() => jest.restoreAllMocks());

  it('connectDatabase autentica contra Sequelize y registra el éxito', async () => {
    authenticate.mockResolvedValue();
    await app.connectDatabase();
    expect(app.logger.info).toHaveBeenCalledWith('Base de datos conectada');
  });

  it('connectDatabase registra el detalle de conexión y relanza el error', async () => {
    const error = Object.assign(new Error('ECONNREFUSED'), { original: { code: 'ECONNREFUSED', sqlState: 'X' } });
    authenticate.mockRejectedValue(error);
    await expect(app.connectDatabase()).rejects.toBe(error);
    expect(app.logger.error).toHaveBeenCalledWith('Error de conexión a la base de datos:', expect.objectContaining({ code: 'ECONNREFUSED' }));
    expect(app.logger.error).toHaveBeenCalledTimes(2);
  });

  it('initialize conecta la BD y deja registrado el apagado ordenado', async () => {
    authenticate.mockResolvedValue();
    const on = jest.spyOn(process, 'on').mockImplementation(() => process);
    await app.initialize();
    expect(on.mock.calls.map(([evento]) => evento).sort()).toEqual(['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection']);
    expect(app.logger.info).toHaveBeenCalledWith('Aplicación inicializada correctamente');
  });

  it('initialize propaga el fallo de conexión', async () => {
    authenticate.mockRejectedValue(new Error('sin bd'));
    await expect(app.initialize()).rejects.toThrow('sin bd');
    expect(app.logger.error).toHaveBeenCalledWith('Error al inicializar aplicación:', expect.any(Error));
  });

  it('start escucha en el puerto configurado y registra los errores del servidor', () => {
    const handlers = {};
    const server = { on: jest.fn((evento, cb) => { handlers[evento] = cb; }) };
    let alIniciar;
    const express_ = { listen: jest.fn((port, cb) => { alIniciar = cb; return server; }) };
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined);

    expect(app.start(express_)).toBe(server);
    expect(express_.listen).toHaveBeenCalledWith(serverConfig.port, expect.any(Function));
    alIniciar();
    expect(app.logger.info).toHaveBeenCalledWith(expect.stringContaining(`Servidor: http://localhost:${serverConfig.port}`));

    handlers.error({ code: 'EADDRINUSE' });
    expect(app.logger.error).toHaveBeenCalledWith(`Puerto ${serverConfig.port} ya está en uso`);
    handlers.error(new Error('otro'));
    expect(app.logger.error).toHaveBeenCalledWith('Error del servidor:', expect.any(Error));
    expect(exit).toHaveBeenCalledTimes(2);
    expect(exit).toHaveBeenCalledWith(1);
  });

  describe('apagado ordenado', () => {
    let manejadores;
    let exit;
    beforeEach(() => {
      manejadores = {};
      jest.spyOn(process, 'on').mockImplementation((evento, cb) => {
        manejadores[evento] = cb;
        return process;
      });
      exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined);
      app.setupGracefulShutdown();
    });

    it('sin servidor sale con 0', async () => {
      await manejadores.SIGTERM();
      expect(exit).toHaveBeenCalledWith(0);
    });

    it('con servidor lo cierra, cierra la BD y sale con 0', async () => {
      jest.useFakeTimers();
      const close = jest.spyOn(sequelize, 'close').mockResolvedValue();
      let alCerrar;
      app.server = { close: jest.fn((cb) => { alCerrar = cb; }) };
      await manejadores.SIGINT();
      await alCerrar();
      expect(close).toHaveBeenCalled();
      expect(exit).toHaveBeenCalledWith(0);
      jest.useRealTimers();
    });

    it('si cerrar la BD falla sale con 1', async () => {
      jest.useFakeTimers();
      jest.spyOn(sequelize, 'close').mockRejectedValue(new Error('x'));
      let alCerrar;
      app.server = { close: jest.fn((cb) => { alCerrar = cb; }) };
      await manejadores.SIGTERM();
      await alCerrar();
      expect(exit).toHaveBeenCalledWith(1);
      jest.useRealTimers();
    });

    it('fuerza el cierre tras 10 s si el servidor no cierra', async () => {
      jest.useFakeTimers();
      app.server = { close: jest.fn() };
      await manejadores.SIGTERM();
      jest.advanceTimersByTime(10000);
      expect(exit).toHaveBeenCalledWith(1);
      expect(app.logger.error).toHaveBeenCalledWith('Forzando cierre (timeout)');
      jest.useRealTimers();
    });

    it('un rechazo no manejado o una excepción disparan el apagado', async () => {
      await manejadores.unhandledRejection(new Error('r'), Promise.resolve());
      await manejadores.uncaughtException(new Error('e'));
      expect(app.logger.error).toHaveBeenCalledWith('Unhandled Rejection:', expect.any(Object));
      expect(app.logger.error).toHaveBeenCalledWith('Uncaught Exception:', expect.any(Error));
      expect(exit).toHaveBeenCalledTimes(2);
    });
  });
});

describe('setupMiddleware / setupErrorHandling / setupRoutes', () => {
  const armar = () => {
    const logger = loggerFalso();
    const app = express();
    setupMiddleware(app, logger);
    app.get('/ok', (req, res) => res.json({ cuerpo: req.body }));
    app.post('/eco', (req, res) => res.json(req.body));
    app.get('/falla', () => {
      throw new Error('boom');
    });
    setupErrorHandling(app, logger, new ErrorFormatter());
    return { app, logger };
  };

  it('aplica seguridad (helmet), parseo JSON y registra la configuración', async () => {
    const { app, logger } = armar();
    const res = await request(app).post('/eco').send({ a: 1 }).expect(200);
    expect(res.body).toEqual({ a: 1 });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(logger.info).toHaveBeenCalledWith('Middleware configurado');
    expect(logger.info).toHaveBeenCalledWith('Manejo de errores configurado');
  });

  it('rutas inexistentes responden 404 y los errores inesperados 500 con el formato de la API', async () => {
    const { app } = armar();
    const r404 = await request(app).get('/no-existe').expect(404);
    expect(r404.body).toBeDefined();
    const r500 = await request(app).get('/falla').expect(500);
    expect(r500.body).toBeDefined();
  });

  it('setupRoutes expone /health, /api/v1/health y la especificación OpenAPI', async () => {
    const logger = loggerFalso();
    const app = express();
    setupRoutes(app, logger, new ErrorFormatter());
    const h1 = await request(app).get('/health').expect(200);
    expect(h1.body).toMatchObject({ status: 'OK', version: '1.0.0' });
    await request(app).get('/api/v1/health').expect(200);
    const spec = await request(app).get('/api-docs.json').expect(200);
    expect(spec.body.openapi ?? spec.body.swagger).toBeDefined();
    await request(app).get('/api/v1/usuarios').expect(401);
    await request(app).get('/api/v1/ruta-inexistente').expect(404);
    expect(logger.info).toHaveBeenCalledWith('Rutas configuradas');
  });
});

describe('servicios de infraestructura menores', () => {
  it('UploadsStorageAdapter delega en UploadsStorageHelper', () => {
    const guardar = jest.spyOn(UploadsStorageHelper, 'saveToUploads').mockReturnValue({ filePath: '/uploads/a.pdf' });
    const buf = Buffer.from('x');
    expect(new UploadsStorageAdapter().saveToUploads('scope', 'a.pdf', buf)).toEqual({ filePath: '/uploads/a.pdf' });
    expect(guardar).toHaveBeenCalledWith('scope', 'a.pdf', buf);
    guardar.mockRestore();
  });

  it('invalidarCacheConsolidado es un no-op seguro con y sin REDIS_URL', async () => {
    const previo = process.env.REDIS_URL;
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    delete process.env.REDIS_URL;
    await expect(invalidarCacheConsolidado(1)).resolves.toBeUndefined();
    expect(debug).not.toHaveBeenCalled();
    process.env.REDIS_URL = 'redis://x';
    await expect(invalidarCacheConsolidado(1, 3)).resolves.toBeUndefined();
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('invalidarCacheConsolidado'), { key: 'consolidado:asignacion:1:gestion:3' });
    if (previo === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = previo;
    debug.mockRestore();
  });
});
