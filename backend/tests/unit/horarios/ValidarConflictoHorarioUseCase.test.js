import { describe, it, expect, jest } from '@jest/globals';
import { ValidarConflictoHorarioUseCase } from '../../../src/application/use-cases/horarios/ValidarConflictoHorarioUseCase.js';

describe('ValidarConflictoHorarioUseCase', () => {
  const crear = (respuesta = { valido: true, conflictos: [] }) => {
    const horarioConflictosService = { validarPropuesta: jest.fn().mockResolvedValue(respuesta) };
    return { horarioConflictosService, useCase: new ValidarConflictoHorarioUseCase({ horarioConflictosService }) };
  };

  it('delega al servicio con ids numéricos desde snake_case', async () => {
    const { useCase, horarioConflictosService } = crear();
    const out = await useCase.execute({ asignacion_docente_id: '4', horario_id: '9' });

    expect(horarioConflictosService.validarPropuesta).toHaveBeenCalledWith({
      asignacionDocenteId: 4,
      horarioId: 9,
      excludeAsignacionHorarioId: undefined,
    });
    expect(out).toEqual({ valido: true, conflictos: [] });
  });

  it('acepta camelCase y excluye el bloque indicado', async () => {
    const { useCase, horarioConflictosService } = crear();
    await useCase.execute({ asignacionDocenteId: 4, horarioId: 9, asignacionHorarioId: 33 });

    expect(horarioConflictosService.validarPropuesta).toHaveBeenCalledWith({
      asignacionDocenteId: 4,
      horarioId: 9,
      excludeAsignacionHorarioId: 33,
    });
  });

  it('usa exclude_id como alias de exclusión', async () => {
    const { useCase, horarioConflictosService } = crear();
    await useCase.execute({ asignacion_docente_id: 1, horario_id: 2, exclude_id: 7 });

    expect(horarioConflictosService.validarPropuesta.mock.calls[0][0].excludeAsignacionHorarioId).toBe(7);
  });

  it('devuelve tal cual los conflictos de docente, aula y solape', async () => {
    const respuesta = {
      valido: false,
      conflictos: [{ tipo: 'DOCENTE' }, { tipo: 'AULA' }, { tipo: 'PARALELO' }],
    };
    const { useCase } = crear(respuesta);
    const out = await useCase.execute({ asignacion_docente_id: 1, horario_id: 2 });

    expect(out.valido).toBe(false);
    expect(out.conflictos.map((c) => c.tipo)).toEqual(['DOCENTE', 'AULA', 'PARALELO']);
  });

  it('propaga el error del servicio', async () => {
    const { useCase, horarioConflictosService } = crear();
    horarioConflictosService.validarPropuesta.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute({ asignacion_docente_id: 1, horario_id: 2 })).rejects.toThrow('boom');
  });
});
