import { describe, it, expect, jest } from '@jest/globals';
import { CreateAsignacionHorarioUseCase } from '../../../src/application/use-cases/horarios/CreateAsignacionHorarioUseCase.js';
import { NotFoundError, ValidationError, UnprocessableEntityError } from '../../../src/domain/errors/index.js';

describe('CreateAsignacionHorarioUseCase', () => {
  const crear = ({ estado = 'BORRADOR' } = {}) => {
    const deps = {
      asignacionHorarioRepository: {
        create: jest.fn().mockResolvedValue({ id: 50, teacherAssignmentId: 4, scheduleId: 9, sequenceOrder: 1 }),
      },
      teacherAssignmentRepository: {
        findEnrichedById: jest.fn().mockResolvedValue({ vigente: true, paralelo_gestion_id: 11 }),
      },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 11, state: estado }) },
      scheduleRepository: { findById: jest.fn().mockResolvedValue({ id: 9 }) },
      horarioConflictosService: {
        validarPropuesta: jest.fn().mockResolvedValue({ valido: true, conflictos: [] }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateAsignacionHorarioUseCase(deps) };
  };

  it('crea el bloque y devuelve su presentación', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute({ asignacion_docente_id: 4, horario_id: 9 }, 7);

    expect(deps.horarioConflictosService.validarPropuesta).toHaveBeenCalledWith({
      asignacionDocenteId: 4,
      horarioId: 9,
    });
    expect(deps.asignacionHorarioRepository.create).toHaveBeenCalledWith(
      { teacherAssignmentId: 4, scheduleId: 9, sequenceOrder: 1 },
      7
    );
    expect(out).toEqual({
      asignacion_horario: { id: 50, asignacion_docente_id: 4, horario_id: 9, orden_secuencia: 1 },
    });
  });

  it('acepta camelCase y orden_secuencia explícito', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ asignacionDocenteId: 4, horarioId: 9, ordenSecuencia: 3 });
    expect(deps.asignacionHorarioRepository.create.mock.calls[0][0].sequenceOrder).toBe(3);
  });

  it('usa orden 1 si el orden es inválido', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ asignacion_docente_id: 4, horario_id: 9, orden_secuencia: -2 });
    expect(deps.asignacionHorarioRepository.create.mock.calls[0][0].sequenceOrder).toBe(1);
  });

  it.each([
    [{ horario_id: 9 }],
    [{ asignacion_docente_id: 0, horario_id: 9 }],
    [{ asignacion_docente_id: 'x', horario_id: 9 }],
    [{ asignacion_docente_id: 4 }],
    [{ asignacion_docente_id: 4, horario_id: -1 }],
    [undefined],
  ])('rechaza entrada inválida %j sin tocar repositorios', async (body) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(body)).rejects.toThrow(ValidationError);
    expect(deps.teacherAssignmentRepository.findEnrichedById).not.toHaveBeenCalled();
    expect(deps.asignacionHorarioRepository.create).not.toHaveBeenCalled();
  });

  it('NotFound si la asignación docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).rejects.toThrow(NotFoundError);
  });

  it('NotFound si la asignación docente no está vigente', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue({ vigente: false, paralelo_gestion_id: 11 });
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).rejects.toThrow(NotFoundError);
    expect(deps.asignacionHorarioRepository.create).not.toHaveBeenCalled();
  });

  it('NotFound si el paralelo en gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).rejects.toThrow(NotFoundError);
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(11);
  });

  it('NotFound si el horario no existe', async () => {
    const { useCase, deps } = crear();
    deps.scheduleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).rejects.toThrow(NotFoundError);
    expect(deps.horarioConflictosService.validarPropuesta).not.toHaveBeenCalled();
  });

  it.each(['PUBLICADO', 'CERRADO'])('bloquea crear bloques con paralelo %s', async (estado) => {
    const { useCase, deps } = crear({ estado });
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).rejects.toThrow(ValidationError);
    expect(deps.asignacionHorarioRepository.create).not.toHaveBeenCalled();
  });

  it.each(['BORRADOR', 'OFERTADO'])('permite crear con paralelo %s', async (estado) => {
    const { useCase } = crear({ estado });
    await expect(useCase.execute({ asignacion_docente_id: 4, horario_id: 9 })).resolves.toBeDefined();
  });

  it('cobertura_reajuste permite PUBLICADO pero no CERRADO', async () => {
    const pub = crear({ estado: 'PUBLICADO' });
    await expect(
      pub.useCase.execute({ asignacion_docente_id: 4, horario_id: 9, cobertura_reajuste: true })
    ).resolves.toBeDefined();

    const cer = crear({ estado: 'CERRADO' });
    await expect(
      cer.useCase.execute({ asignacionDocenteId: 4, horarioId: 9, coberturaReajuste: true })
    ).rejects.toThrow(ValidationError);
  });

  it('422 con detalle cuando hay conflicto (docente/aula/solape) y no crea', async () => {
    const { useCase, deps } = crear();
    const conflictos = [{ tipo: 'DOCENTE' }, { tipo: 'AULA' }];
    deps.horarioConflictosService.validarPropuesta.mockResolvedValue({ valido: false, conflictos });

    const err = await useCase.execute({ asignacion_docente_id: 4, horario_id: 9 }).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.details).toEqual(conflictos);
    expect(deps.asignacionHorarioRepository.create).not.toHaveBeenCalled();
  });
});
