import { describe, it, expect, jest } from '@jest/globals';
import {
  CreateAsignacionDocenteController,
  UpdateAsignacionDocenteController,
} from '../../../../src/presentation/controllers/asignaciones-docentes/asignaciones-docentes.controllers.js';

const deps = () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  responseFormatter: { _success: jest.fn(() => 'ok'), created: jest.fn(() => 'creado'), updated: jest.fn(() => 'actualizado') },
});

describe('UpdateAsignacionDocenteController (PUT /asignaciones-docentes/:id)', () => {
  // Bug corregido: el handler usaba `this.useCase`, que este controller no define
  // (la clase base guarda el caso de uso como `updateTeacherAssignmentUseCase`), por lo
  // que toda actualización terminaba en "Cannot read properties of undefined (reading 'execute')".
  it('ejecuta el caso de uso de actualización con id, cuerpo y usuario, y responde la asignación', async () => {
    const { logger, responseFormatter } = deps();
    const execute = jest.fn().mockResolvedValue({ asignacion: { id: 4 } });
    const controller = new UpdateAsignacionDocenteController({
      updateTeacherAssignmentUseCase: { execute },
      logger,
      responseFormatter,
    });
    const next = jest.fn();
    await controller.handle({ params: { id: '4' }, body: { color: '#fff' }, user: { id: 9 } }, {}, next);
    expect(execute).toHaveBeenCalledWith(4, { color: '#fff' }, 9);
    expect(responseFormatter._success).toHaveBeenCalledWith({}, { asignacion: { id: 4 } }, {}, expect.anything());
    expect(next).not.toHaveBeenCalled();
  });

  it('un error del caso de uso se delega a next', async () => {
    const { logger, responseFormatter } = deps();
    const boom = new Error('conflicto');
    const controller = new UpdateAsignacionDocenteController({
      updateTeacherAssignmentUseCase: { execute: jest.fn().mockRejectedValue(boom) },
      logger,
      responseFormatter,
    });
    const next = jest.fn();
    await controller.handle({ params: { id: '4' }, body: {} }, {}, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe('CreateAsignacionDocenteController (POST /asignaciones-docentes)', () => {
  it('crea y responde 201 con la asignación', async () => {
    const { logger, responseFormatter } = deps();
    const execute = jest.fn().mockResolvedValue({ asignacion: { id: 1 } });
    const controller = new CreateAsignacionDocenteController({
      createTeacherAssignmentUseCase: { execute },
      logger,
      responseFormatter,
    });
    await controller.handle({ body: { docenteId: 2 }, user: { id: 3 } }, {}, jest.fn());
    expect(execute).toHaveBeenCalledWith({ docenteId: 2 }, 3);
    expect(responseFormatter._success).toHaveBeenCalledWith({}, { asignacion: { id: 1 } }, { statusCode: 201 }, expect.anything());
  });
});
