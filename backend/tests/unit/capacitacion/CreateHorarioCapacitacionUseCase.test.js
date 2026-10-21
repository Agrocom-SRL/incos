import { describe, it, expect, jest } from '@jest/globals';
import { CreateHorarioCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/CreateHorarioCapacitacionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateHorarioCapacitacionUseCase', () => {
  const crear = ({ existente = null } = {}) => {
    const deps = {
      scheduleRepository: {
        findBy: jest.fn().mockResolvedValue(existente),
        create: jest.fn().mockImplementation(async (d) => ({ id: 31, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateHorarioCapacitacionUseCase(deps) };
  };
  const body = { dia: 'sabado', horaInicio: '08:00', horaFin: '12:00' };

  it('crea el horario CAPACITACION con el código interno día-hora y horas normalizadas', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(body, 4);
    expect(deps.scheduleRepository.findBy).toHaveBeenCalledWith({
      day: 'SABADO', startTime: '08:00:00', endTime: '12:00:00', scheduleType: 'CAPACITACION',
    });
    expect(deps.scheduleRepository.create).toHaveBeenCalledWith(
      {
        name: 'CAP-SABADO-0800-1200',
        day: 'SABADO',
        startTime: '08:00:00',
        endTime: '12:00:00',
        scheduleType: 'CAPACITACION',
      },
      4
    );
    expect(res.creado).toBe(true);
    expect(res.horario).toMatchObject({ horarioId: 31, dia: 'SABADO', tipoHorario: 'CAPACITACION', ocupado: false });
  });

  it('find-or-create: si ya existe lo devuelve sin crear otro', async () => {
    const { deps, useCase } = crear({
      existente: { id: 9, name: 'X', day: 'SABADO', startTime: '08:00:00', endTime: '12:00:00', scheduleType: 'CAPACITACION' },
    });
    const res = await useCase.execute(body);
    expect(deps.scheduleRepository.create).not.toHaveBeenCalled();
    expect(res).toMatchObject({ creado: false, horario: { horarioId: 9 } });
  });

  it('ignora cualquier nombre enviado: el código se arma siempre con día y horas (acepta HH:MM:SS)', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ ...body, nombre: ' Grupo A ', horaInicio: '15:00:00', horaFin: '19:00:00' });
    expect(deps.scheduleRepository.create.mock.calls[0][0]).toMatchObject({
      name: 'CAP-SABADO-1500-1900', startTime: '15:00:00', endTime: '19:00:00',
    });
  });

  it.each([[undefined], [''], ['FERIADO'], [3]])('rechaza día inválido (%p)', async (dia) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, dia })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.scheduleRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['8'], ['25:00'], ['08:60'], ['abc'], [800]])('rechaza hora inválida (%p)', async (hora) => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...body, horaInicio: hora })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, horaFin: hora })).rejects.toBeInstanceOf(ValidationError);
  });

  it('exige horaFin posterior a horaInicio', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, horaInicio: '12:00', horaFin: '12:00' })).rejects.toBeInstanceOf(
      ValidationError
    );
    await expect(useCase.execute({ ...body, horaInicio: '19:00', horaFin: '08:00' })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(deps.scheduleRepository.create).not.toHaveBeenCalled();
  });

});
