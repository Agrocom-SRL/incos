import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { body, validationResult } from 'express-validator';
import { setAppContainer, getAppContainer } from '../../../../src/presentation/middleware/container-ref.js';
import { authenticate } from '../../../../src/presentation/middleware/auth.middleware.js';
import {
  verificarPermiso,
  verificarPermisoCualquiera,
  listarCatalogoReferencia,
  complementoPaginaLectura,
} from '../../../../src/presentation/middleware/permisos.middleware.js';
import { createErrorHandler } from '../../../../src/presentation/middleware/errorHandler.middleware.js';
import { createNotFoundHandler } from '../../../../src/presentation/middleware/notFound.middleware.js';
import { createValidateRequest } from '../../../../src/presentation/middleware/validation.middleware.js';
import { createHttpLogger } from '../../../../src/presentation/middleware/logger.middleware.js';
import { generarToken } from '../../../../src/infrastructure/utils/jwt.utils.js';
import {
  NotFoundError,
  ValidationError,
  UnprocessableEntityError,
  ForbiddenError,
} from '../../../../src/domain/errors/AppError.js';
import { ErrorFormatter } from '../../../../src/infrastructure/services/ErrorFormatter.js';

const crearRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const contenedorCon = (authRepository) => ({ resolve: jest.fn(() => authRepository) });

describe('container-ref', () => {
  it('lanza si el contenedor no se inicializó y devuelve el registrado después', () => {
    setAppContainer(null);
    expect(() => getAppContainer()).toThrow('Contenedor DI no inicializado');
    const c = { resolve: jest.fn() };
    setAppContainer(c);
    expect(getAppContainer()).toBe(c);
  });
});

describe('authenticate', () => {
  let authRepo;
  let res;
  let next;
  const token = () => generarToken({ userId: 1, rolId: 2, rolCodigo: 'ADMIN' });

  beforeEach(() => {
    authRepo = { findSesionActiva: jest.fn() };
    setAppContainer(contenedorCon(authRepo));
    res = crearRes();
    next = jest.fn();
  });

  it('401 sin cabecera Bearer', async () => {
    await authenticate({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('401 con token no verificable, sin consultar la sesión', async () => {
    await authenticate({ headers: { authorization: 'Bearer basura' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(authRepo.findSesionActiva).not.toHaveBeenCalled();
  });

  it('401 si la sesión no está activa', async () => {
    authRepo.findSesionActiva.mockResolvedValue(null);
    await authenticate({ headers: { authorization: `Bearer ${token()}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sesión expirada o inválida' });
  });

  it('403 con motivo si la cuenta tiene estado (suspendida, etc.)', async () => {
    authRepo.findSesionActiva.mockResolvedValue({ usuario_estado: 'SUSPENDIDO', motivo_cambio_estado: 'mora' });
    await authenticate({ headers: { authorization: `Bearer ${token()}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cuenta suspendido', motivo: 'mora' });
    expect(next).not.toHaveBeenCalled();
  });

  it('con sesión válida puebla req.usuario, sesionData y token', async () => {
    const t = token();
    const sesion = {
      usuario_estado: null,
      usuario_id: 7,
      username: 'ana',
      email: 'a@x.com',
      foto_url: null,
      rol_id: 2,
      rol_codigo: 'DOCENTE',
      rol_is_system: 1,
    };
    authRepo.findSesionActiva.mockResolvedValue(sesion);
    const req = { headers: { authorization: `Bearer ${t}` } };
    await authenticate(req, res, next);
    expect(authRepo.findSesionActiva).toHaveBeenCalledWith(t);
    expect(req.usuario).toEqual({
      id: 7,
      username: 'ana',
      email: 'a@x.com',
      foto_url: null,
      rolId: 2,
      rolCodigo: 'DOCENTE',
      rolIsSystem: true,
    });
    expect(req.sesionData).toBe(sesion);
    expect(req.token).toBe(t);
    expect(next).toHaveBeenCalledWith();
  });

  it('un fallo del repositorio se delega a next(error)', async () => {
    const boom = new Error('bd caída');
    authRepo.findSesionActiva.mockRejectedValue(boom);
    await authenticate({ headers: { authorization: `Bearer ${token()}` } }, res, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe('permisos', () => {
  let authRepo;
  let res;
  let next;
  beforeEach(() => {
    authRepo = { tienePermiso: jest.fn() };
    setAppContainer(contenedorCon(authRepo));
    res = crearRes();
    next = jest.fn();
  });

  it('verificarPermiso deja pasar si el repositorio concede el permiso', async () => {
    authRepo.tienePermiso.mockResolvedValue(true);
    await verificarPermiso('a.b', 'LISTAR')({ usuario: { id: 3 } }, res, next);
    expect(authRepo.tienePermiso).toHaveBeenCalledWith(3, 'a.b', 'LISTAR');
    expect(next).toHaveBeenCalledWith();
  });

  it('verificarPermiso responde 403 con código y acción si no hay permiso', async () => {
    authRepo.tienePermiso.mockResolvedValue(false);
    await verificarPermiso('a.b', 'CREAR')({ usuario: { id: 3 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado', codigo: 'a.b', accion: 'CREAR' });
    expect(next).not.toHaveBeenCalled();
  });

  it('verificarPermiso propaga errores', async () => {
    const boom = new Error('x');
    authRepo.tienePermiso.mockRejectedValue(boom);
    await verificarPermiso('a.b', 'CREAR')({ usuario: { id: 3 } }, res, next);
    expect(next).toHaveBeenCalledWith(boom);
  });

  it('verificarPermisoCualquiera es un OR: basta un par concedido', async () => {
    authRepo.tienePermiso.mockImplementation(async (_u, cod) => cod === 'b');
    await verificarPermisoCualquiera([['a', 'LISTAR'], ['b', 'LISTAR']])({ usuario: { id: 1 } }, res, next);
    expect(authRepo.tienePermiso).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledWith();
  });

  it('verificarPermisoCualquiera responde 403 si ningún par aplica y propaga errores', async () => {
    authRepo.tienePermiso.mockResolvedValue(false);
    await verificarPermisoCualquiera([['a', 'LISTAR']])({ usuario: { id: 1 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    const boom = new Error('x');
    authRepo.tienePermiso.mockRejectedValue(boom);
    await verificarPermisoCualquiera([['a', 'LISTAR']])({ usuario: { id: 1 } }, crearRes(), next);
    expect(next).toHaveBeenCalledWith(boom);
  });

  it('listarCatalogoReferencia encadena authenticate + permiso de catálogo (y su alias)', () => {
    expect(listarCatalogoReferencia).toHaveLength(2);
    expect(listarCatalogoReferencia[0]).toBe(authenticate);
    expect(complementoPaginaLectura).toBe(listarCatalogoReferencia);
  });

  it('el permiso de catálogo usa el código sistema.catalogo.referencia con LISTAR', async () => {
    authRepo.tienePermiso.mockResolvedValue(true);
    await listarCatalogoReferencia[1]({ usuario: { id: 5 } }, res, next);
    expect(authRepo.tienePermiso).toHaveBeenCalledWith(5, 'sistema.catalogo.referencia', 'LISTAR');
  });
});

describe('createErrorHandler', () => {
  const logger = { error: jest.fn() };
  const handler = createErrorHandler(logger, new ErrorFormatter());
  const req = { originalUrl: '/x', method: 'GET', path: '/x', headers: {} };

  beforeEach(() => logger.error.mockClear());

  it('errores operacionales < 500 conservan su status', () => {
    const res = crearRes();
    handler(new NotFoundError('Algo'), req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(logger.error).toHaveBeenCalled();
  });

  it('errores de Multer responden 400', () => {
    for (const code of ['LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE']) {
      const res = crearRes();
      handler(Object.assign(new Error('grande'), { code }), req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('ValidationError y UnprocessableEntityError devuelven un cuerpo de validación', () => {
    const r1 = crearRes();
    handler(new ValidationError('mal', []), req, r1, jest.fn());
    expect(r1.status).toHaveBeenCalledTimes(1);
    expect(r1.json).toHaveBeenCalledTimes(1);
    const r2 = crearRes();
    handler(new UnprocessableEntityError('regla', []), req, r2, jest.fn());
    expect(r2.status).toHaveBeenCalledTimes(1);
  });

  it('un error inesperado es 500 y no filtra el mensaje en producción', () => {
    const res = crearRes();
    const previo = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      handler(new Error('secreto interno'), req, res, jest.fn());
    } finally {
      process.env.NODE_ENV = previo;
    }
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('secreto interno');
  });

  it('un error con statusCode no operacional lo respeta', () => {
    const res = crearRes();
    handler(Object.assign(new Error('x'), { statusCode: 503 }), req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('ForbiddenError (operacional) sale como 403', () => {
    const res = crearRes();
    handler(new ForbiddenError('no'), req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('createNotFoundHandler', () => {
  const h = createNotFoundHandler();
  it('envía NotFoundError con la ruta pedida', () => {
    const next = jest.fn();
    h({ originalUrl: '/api/nada' }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.message).toContain('/api/nada');
  });

  it('no intercepta /uploads ni /public', () => {
    for (const u of ['/uploads/a.png', '/public/x']) {
      const next = jest.fn();
      h({ originalUrl: u }, {}, next);
      expect(next).toHaveBeenCalledWith();
    }
  });
});

describe('createValidateRequest', () => {
  const logger = { warn: jest.fn() };
  const validate = createValidateRequest(logger);

  it('sin errores continúa', () => {
    const next = jest.fn();
    validate({ method: 'POST', originalUrl: '/x', body: {}, headers: {}, query: {}, params: {} }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('con errores arma ValidationError con campo, mensaje y valor, y lo registra', async () => {
    const req = { method: 'POST', originalUrl: '/x', body: { nombre: '' }, headers: {}, query: {}, params: {} };
    await body('nombre').notEmpty().withMessage('Nombre requerido').run(req);
    expect(validationResult(req).isEmpty()).toBe(false);
    const next = jest.fn();
    validate(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ValidationError);
    expect(JSON.stringify(err)).toContain('Nombre requerido');
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });
});

describe('createHttpLogger', () => {
  const montar = (logger) => {
    const app = express();
    app.use((req, _res, next) => {
      req.user = { id: 4 };
      next();
    });
    app.use(createHttpLogger(logger));
    app.get('/x', (_req, res) => res.json({ ok: true }));
    app.get('/health', (_req, res) => res.json({ ok: true }));
    return app;
  };

  it('escribe método, url, estado y usuario en el stream del logger', async () => {
    const write = jest.fn();
    await request(montar({ stream: { write } })).get('/x').expect(200);
    expect(write).toHaveBeenCalled();
    const linea = String(write.mock.calls[0][0]);
    expect(linea).toContain('GET /x 200');
    expect(linea).toContain('- 4');
  });

  it('en producción no registra /health', async () => {
    const write = jest.fn();
    const previo = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await request(montar({ stream: { write } })).get('/health').expect(200);
    } finally {
      process.env.NODE_ENV = previo;
    }
    expect(write).not.toHaveBeenCalled();
  });
});
