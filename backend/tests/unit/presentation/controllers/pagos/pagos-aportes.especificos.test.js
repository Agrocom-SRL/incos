import { describe, it, expect, jest } from '@jest/globals';
import { MisAportesController } from '../../../../../src/presentation/controllers/pagos/pagos-aportes/mis-aportes.controller.js';
import { RegisterPagoAporteController } from '../../../../../src/presentation/controllers/pagos/pagos-aportes/register.controller.js';
import { GetEstadoAporteRegistroController } from '../../../../../src/presentation/controllers/pagos/pagos-aportes/estado-registro.controller.js';
import { GetBecasPorCarreraReporteController } from '../../../../../src/presentation/controllers/pagos/pagos-aportes/becas-por-carrera-reporte.controller.js';
import { crearLogger, crearRes } from '../harness.js';

describe('MisAportesController', () => {
  const crear = (aportes) => {
    const listPagosAportesUseCase = {
      execute: jest.fn().mockResolvedValue({ pagos: aportes, page: 1, limit: 50, total: 2, totalPages: 1 }),
    };
    const responseFormatter = { _success: jest.fn().mockReturnValue('ok') };
    const controller = new MisAportesController({
      listPagosAportesUseCase,
      studentRepository: { findAll: jest.fn().mockResolvedValue([{ id: 9 }]) },
      userRepository: { findById: jest.fn() },
      logger: crearLogger(),
      responseFormatter,
    });
    return { controller, listPagosAportesUseCase, responseFormatter };
  };

  it('fuerza el estudiante de la sesión e ignora estudiante_id del cliente (IDOR)', async () => {
    const { controller, listPagosAportesUseCase } = crear([]);
    await controller.handle(
      { usuario: { id: 3 }, query: { estudiante_id: '999', page: '2', limit: '10' } },
      crearRes(),
      jest.fn()
    );
    expect(listPagosAportesUseCase.execute).toHaveBeenCalledWith({}, 2, 10, { estudiante_id: 9 });
  });

  it('agrega el resumen de saldos de las cabeceras', async () => {
    const { controller, responseFormatter } = crear([
      { monto_obligatorio: '100', total_pagado: 40, saldo_pendiente: 60 },
      { monto_obligatorio: 50, total_pagado: null },
    ]);
    await controller.handle({ usuario: { id: 3 }, query: {} }, crearRes(), jest.fn());
    const [, data, opts] = responseFormatter._success.mock.calls[0];
    expect(data.resumen).toEqual({
      cantidadAportes: 2,
      montoObligatorio: 150,
      totalPagado: 40,
      saldoPendiente: 60,
    });
    expect(opts.pagination).toEqual({ page: 1, limit: 50, total: 2, totalPages: 1 });
  });

  it('sin aportes devuelve resumen en cero', () => {
    const { controller } = crear([]);
    expect(controller._buildResumen([])).toEqual({
      cantidadAportes: 0,
      montoObligatorio: 0,
      totalPagado: 0,
      saldoPendiente: 0,
    });
  });
});

describe('RegisterPagoAporteController', () => {
  const crear = (result) => {
    const useCase = { execute: jest.fn().mockResolvedValue(result) };
    const responseFormatter = { created: jest.fn().mockReturnValue('ok') };
    const controller = new RegisterPagoAporteController({
      registerPagoAporteUseCase: useCase,
      logger: crearLogger(),
      responseFormatter,
    });
    return { controller, useCase, responseFormatter };
  };

  it('adjunta el archivo subido y el usuario autenticado', () => {
    const { controller } = crear({});
    const file = { filename: 'f.pdf', originalname: 'o.pdf', path: '/tmp/f.pdf', mimetype: 'application/pdf', size: 10 };
    const data = controller.prepareData({ concept: 'Aporte' }, { usuario: { id: 4 }, file });
    expect(data).toEqual({ concept: 'Aporte', userId: 4, documentFile: file });
  });

  it('sin archivo ni usuario, userId queda en null', () => {
    const { controller } = crear({});
    expect(controller.prepareData({}, {})).toEqual({ userId: null });
  });

  it('expone el recibo con ruta accesible /uploads', async () => {
    const payment = { id: 5 };
    const { controller, responseFormatter } = crear({ payment, reciboPDF: 'recibos/2026/r.pdf' });
    await controller.handle({ body: {}, usuario: { id: 1 } }, crearRes(), jest.fn());
    expect(responseFormatter.created.mock.calls[0][1].reciboPDF).toBe('/uploads/recibos/2026/r.pdf');
    expect(responseFormatter.created.mock.calls[0][3]).toBe(5);
  });

  it('respeta una ruta que ya empieza por /uploads/', async () => {
    const { controller, responseFormatter } = crear({ payment: { id: 5 }, reciboPDF: '/uploads/r.pdf' });
    await controller.handle({ body: {} }, crearRes(), jest.fn());
    expect(responseFormatter.created.mock.calls[0][1].reciboPDF).toBe('/uploads/r.pdf');
  });

  it('sin id en la respuesta usa "nuevo" y delega errores en next', async () => {
    const { controller, responseFormatter, useCase } = crear({});
    await controller.handle({ body: {} }, crearRes(), jest.fn());
    expect(responseFormatter.created.mock.calls[0][3]).toBe('nuevo');
    const error = new Error('x');
    useCase.execute.mockRejectedValue(error);
    const next = jest.fn();
    await controller.handle({ body: {} }, crearRes(), next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('GetEstadoAporteRegistroController', () => {
  const crear = () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ saldo: 1 }) };
    const responseFormatter = { retrieved: jest.fn().mockReturnValue('ok') };
    const controller = new GetEstadoAporteRegistroController({
      getEstadoAporteRegistroUseCase: useCase,
      logger: crearLogger(),
      responseFormatter,
    });
    return { controller, useCase, responseFormatter };
  };

  it.each([[{}], [{ estudiante_id: 'abc' }], [{ estudiante_id: '0' }]])(
    'estudiante_id inválido (%j) responde 400 sin invocar el use case',
    async (query) => {
      const { controller, useCase } = crear();
      const res = crearRes();
      await controller.handle({ query }, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].error.code).toBe('INVALID_ESTUDIANTE_ID');
      expect(useCase.execute).not.toHaveBeenCalled();
    }
  );

  it('gestion_id vacío se interpreta como gestión vigente (null)', async () => {
    const { controller, useCase } = crear();
    await controller.handle({ query: { estudiante_id: '4', gestion_id: '' } }, crearRes(), jest.fn());
    expect(useCase.execute).toHaveBeenCalledWith({ studentId: 4, managementId: null });
  });
});

describe('GetBecasPorCarreraReporteController', () => {
  it('valida dependencias requeridas', () => {
    const base = { getBecasPorCarreraReporteUseCase: {}, logger: {}, responseFormatter: {} };
    expect(() => new GetBecasPorCarreraReporteController({ ...base, getBecasPorCarreraReporteUseCase: null })).toThrow(/requerido/);
    expect(() => new GetBecasPorCarreraReporteController({ ...base, logger: null })).toThrow(/requerido/);
    expect(() => new GetBecasPorCarreraReporteController({ ...base, responseFormatter: null })).toThrow(/requerido/);
  });

  it('expone la planilla bajo planillaBecas y usa la gestión devuelta como id', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ gestion: { id: 3 } }) };
    const responseFormatter = { retrieved: jest.fn() };
    const controller = new GetBecasPorCarreraReporteController({
      getBecasPorCarreraReporteUseCase: useCase,
      logger: crearLogger(),
      responseFormatter,
    });
    await controller.handle({ query: { gestion_id: '' } }, crearRes(), jest.fn());
    expect(useCase.execute).toHaveBeenCalledWith({ gestionId: null });
    const [, data, , id] = responseFormatter.retrieved.mock.calls[0];
    expect(Object.keys(data)).toEqual([controller.dataFieldName]);
    expect(id).toBe(3);
  });
});
