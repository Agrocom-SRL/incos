import { describe, it, expect, jest } from '@jest/globals';
import { GetHorarioCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/GetHorarioCapacitacionUseCase.js';
import { UpdateHorarioCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/UpdateHorarioCapacitacionUseCase.js';
import { DeleteHorarioCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/DeleteHorarioCapacitacionUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const horario = (o = {}) => ({
  id: 9, name: 'SAB M', day: 'SABADO', startTime: '08:00:00', endTime: '12:00:00', scheduleType: 'CAPACITACION', ...o,
});
const logger = () => ({ info: jest.fn() });

describe('GetHorarioCapacitacionUseCase', () => {
  const crear = ({ encontrado = horario(), cursos = [] } = {}) => {
    const deps = {
      scheduleRepository: { findById: jest.fn().mockResolvedValue(encontrado) },
      bloqueCapacitacionRepository: { findCursosQueUsanHorario: jest.fn().mockResolvedValue(cursos) },
      logger: logger(),
    };
    return { deps, useCase: new GetHorarioCapacitacionUseCase(deps) };
  };

  it('devuelve el horario con cursosEnUso y los cursos que lo usan', async () => {
    const { deps, useCase } = crear({ cursos: [{ id: 1, titulo: 'Guaraní' }] });
    const res = await useCase.execute('9');
    expect(deps.scheduleRepository.findById).toHaveBeenCalledWith(9);
    expect(res).toMatchObject({ horarioId: 9, dia: 'SABADO', tipoHorario: 'CAPACITACION', cursosEnUso: 1 });
    expect(res.cursos).toEqual([{ id: 1, titulo: 'Guaraní' }]);
  });

  it('NotFound si no existe o no es de tipo CAPACITACION', async () => {
    await expect(crear({ encontrado: null }).useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
    await expect(crear({ encontrado: horario({ scheduleType: 'CLASES' }) }).useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([['x'], [0], [null]])('rechaza id inválido (%p)', async (id) => {
    await expect(crear().useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('UpdateHorarioCapacitacionUseCase', () => {
  const crear = ({ encontrado = horario(), duplicado = null } = {}) => {
    const deps = {
      scheduleRepository: {
        findById: jest.fn().mockResolvedValue(encontrado),
        findBy: jest.fn().mockResolvedValue(duplicado),
        update: jest.fn().mockImplementation(async (id, d) => horario({ id, ...d })),
      },
      logger: logger(),
    };
    return { deps, useCase: new UpdateHorarioCapacitacionUseCase(deps) };
  };
  const body = { dia: 'viernes', horaInicio: '15:00', horaFin: '19:00' };

  it('edita día y horas normalizados y regenera el código interno', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(9, body, 4);
    expect(deps.scheduleRepository.findBy).toHaveBeenCalledWith({
      day: 'VIERNES', startTime: '15:00:00', endTime: '19:00:00', scheduleType: 'CAPACITACION',
    });
    expect(deps.scheduleRepository.update).toHaveBeenCalledWith(
      9, { name: 'CAP-VIERNES-1500-1900', day: 'VIERNES', startTime: '15:00:00', endTime: '19:00:00' }, 4
    );
    expect(res.horario).toMatchObject({ horarioId: 9, dia: 'VIERNES', horaInicio: '15:00:00' });
  });

  it('permite guardar sin cambiar día/horas (el "duplicado" es el mismo horario)', async () => {
    const { deps, useCase } = crear({ duplicado: horario() });
    await expect(useCase.execute(9, body)).resolves.toBeDefined();
    expect(deps.scheduleRepository.update).toHaveBeenCalled();
  });

  it('rechaza (409) un duplicado exacto de otro horario activo', async () => {
    const { deps, useCase } = crear({ duplicado: horario({ id: 77 }) });
    await expect(useCase.execute(9, body)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.scheduleRepository.update).not.toHaveBeenCalled();
  });

  it('solo edita horarios de capacitación existentes', async () => {
    await expect(crear({ encontrado: null }).useCase.execute(9, body)).rejects.toBeInstanceOf(NotFoundError);
    await expect(crear({ encontrado: horario({ scheduleType: 'CLASES' }) }).useCase.execute(9, body)).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([
    [{ ...body, dia: 'FERIADO' }], [{ ...body, horaInicio: '25:00' }], [{ ...body, horaFin: '14:00' }],
    [{ ...body, horaFin: '15:00' }], [{}],
  ])('valida día y horas (%p)', async (invalido) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(9, invalido)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.scheduleRepository.update).not.toHaveBeenCalled();
  });
});

describe('DeleteHorarioCapacitacionUseCase', () => {
  const crear = ({ encontrado = horario(), cursos = [] } = {}) => {
    const deps = {
      scheduleRepository: { findById: jest.fn().mockResolvedValue(encontrado), delete: jest.fn().mockResolvedValue(true) },
      bloqueCapacitacionRepository: { findCursosQueUsanHorario: jest.fn().mockResolvedValue(cursos) },
      logger: logger(),
    };
    return { deps, useCase: new DeleteHorarioCapacitacionUseCase(deps) };
  };

  it('elimina (soft delete) un horario sin uso', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute('9', 4)).resolves.toBe(9);
    expect(deps.scheduleRepository.delete).toHaveBeenCalledWith(9, 4);
  });

  it('409 con detalle de los cursos activos que lo usan, sin eliminar', async () => {
    const { deps, useCase } = crear({ cursos: [{ id: 1, titulo: 'Guaraní' }, { id: 2, titulo: 'Excel' }] });
    const error = await useCase.execute(9).catch((e) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toMatch(/2 curso\(s\).*Guaraní.*Excel/);
    expect(error.details).toEqual([{ cursoId: 1, titulo: 'Guaraní' }, { cursoId: 2, titulo: 'Excel' }]);
    expect(deps.scheduleRepository.delete).not.toHaveBeenCalled();
  });

  it('solo elimina horarios de capacitación existentes', async () => {
    await expect(crear({ encontrado: null }).useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
    const clases = crear({ encontrado: horario({ scheduleType: 'CLASES' }) });
    await expect(clases.useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
    expect(clases.deps.scheduleRepository.delete).not.toHaveBeenCalled();
  });

  it.each([['x'], [0]])('rechaza id inválido (%p)', async (id) => {
    await expect(crear().useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
  });
});
