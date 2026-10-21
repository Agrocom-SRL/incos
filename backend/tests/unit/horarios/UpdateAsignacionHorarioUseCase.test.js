import { describe, it, expect, jest } from '@jest/globals';
import { UpdateAsignacionHorarioUseCase } from '../../../src/application/use-cases/horarios/UpdateAsignacionHorarioUseCase.js';
import { NotFoundError, ValidationError, UnprocessableEntityError } from '../../../src/domain/errors/index.js';

describe('UpdateAsignacionHorarioUseCase', () => {
  const crear = ({ estado = 'OFERTADO' } = {}) => {
    const deps = {
      asignacionHorarioRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, teacherAssignmentId: 4, scheduleId: 9, sequenceOrder: 2 }),
        update: jest.fn().mockResolvedValue({ id: 5, teacherAssignmentId: 4, scheduleId: 12, sequenceOrder: 2 }),
      },
      teacherAssignmentRepository: {
        findEnrichedById: jest.fn().mockResolvedValue({ vigente: true, paralelo_gestion_id: 11 }),
      },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 11, state: estado }) },
      scheduleRepository: { findById: jest.fn().mockResolvedValue({ id: 12 }) },
      horarioConflictosService: {
        validarPropuesta: jest.fn().mockResolvedValue({ valido: true, conflictos: [] }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateAsignacionHorarioUseCase(deps) };
  };

  it('reubica el bloque a otro horario', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute('5', { horario_id: 12 }, 7);

    expect(deps.scheduleRepository.findById).toHaveBeenCalledWith(12);
    expect(deps.horarioConflictosService.validarPropuesta).toHaveBeenCalledWith({
      asignacionDocenteId: 4,
      horarioId: 12,
      excludeAsignacionHorarioId: 5,
      excludeAsignacionHorarioIds: null,
    });
    expect(deps.asignacionHorarioRepository.update).toHaveBeenCalledWith(
      5,
      { teacherAssignmentId: 4, scheduleId: 12, sequenceOrder: 2 },
      7
    );
    expect(out.asignacion_horario).toEqual({
      id: 5, asignacion_docente_id: 4, horario_id: 12, orden_secuencia: 2,
    });
  });

  it.each([{ horario_id: 'abc' }, { asignacion_docente_id: 'abc' }, { orden_secuencia: 'abc' }])(
    'rechaza valores no numéricos (%j)',
    async (body) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute(5, body)).rejects.toThrow(ValidationError);
      expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
    }
  );

  it('rechaza mover el bloque a una asignación de otro paralelo', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById
      .mockResolvedValueOnce({ vigente: true, paralelo_gestion_id: 22 })
      .mockResolvedValueOnce({ vigente: true, paralelo_gestion_id: 11 });
    await expect(useCase.execute(5, { asignacion_docente_id: 8 })).rejects.toThrow(ValidationError);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });

  it('conserva valores existentes si el body no los trae y no consulta el horario', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5, {});
    expect(deps.scheduleRepository.findById).not.toHaveBeenCalled();
    expect(deps.asignacionHorarioRepository.update).toHaveBeenCalledWith(
      5,
      { teacherAssignmentId: 4, scheduleId: 9, sequenceOrder: 2 },
      null
    );
  });

  it('propaga los ids excluidos del bulk (ambas variantes)', async () => {
    const a = crear();
    await a.useCase.execute(5, { horario_id: 12, _exclude_asignacion_horario_ids: [5, 6] });
    expect(a.deps.horarioConflictosService.validarPropuesta.mock.calls[0][0].excludeAsignacionHorarioIds)
      .toEqual([5, 6]);

    const b = crear();
    await b.useCase.execute(5, { horario_id: 12, _excludeAsignacionHorarioIds: [8] });
    expect(b.deps.horarioConflictosService.validarPropuesta.mock.calls[0][0].excludeAsignacionHorarioIds)
      .toEqual([8]);
  });

  it.each([[0], ['abc'], [-3], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id, {})).rejects.toThrow(ValidationError);
    expect(deps.asignacionHorarioRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si el bloque no existe', async () => {
    const { useCase, deps } = crear();
    deps.asignacionHorarioRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5, { horario_id: 12 })).rejects.toThrow(NotFoundError);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });

  it('NotFound si la asignación docente no existe o no está vigente', async () => {
    const a = crear();
    a.deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    await expect(a.useCase.execute(5, { horario_id: 12 })).rejects.toThrow(NotFoundError);

    const b = crear();
    b.deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue({ vigente: false });
    await expect(b.useCase.execute(5, { horario_id: 12 })).rejects.toThrow(NotFoundError);
  });

  it('usa la asignación docente del body si viene', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5, { asignacionDocenteId: 20, horario_id: 12 });
    expect(deps.teacherAssignmentRepository.findEnrichedById).toHaveBeenCalledWith(20);
  });

  it('NotFound si el paralelo en gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5, { horario_id: 12 })).rejects.toThrow(NotFoundError);
  });

  it('NotFound si el nuevo horario no existe', async () => {
    const { useCase, deps } = crear();
    deps.scheduleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5, { horario_id: 12 })).rejects.toThrow(NotFoundError);
    expect(deps.horarioConflictosService.validarPropuesta).not.toHaveBeenCalled();
  });

  it('permite reubicar en PUBLICADO y bloquea en CERRADO', async () => {
    const pub = crear({ estado: 'PUBLICADO' });
    await expect(pub.useCase.execute(5, { horario_id: 12 })).resolves.toBeDefined();

    const cer = crear({ estado: 'CERRADO' });
    await expect(cer.useCase.execute(5, { horario_id: 12 })).rejects.toThrow(ValidationError);
    expect(cer.deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });

  it('422 con conflicto y no actualiza', async () => {
    const { useCase, deps } = crear();
    const conflictos = [{ tipo: 'DOCENTE' }];
    deps.horarioConflictosService.validarPropuesta.mockResolvedValue({ valido: false, conflictos });

    const err = await useCase.execute(5, { horario_id: 12 }).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.details).toEqual(conflictos);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });
});
