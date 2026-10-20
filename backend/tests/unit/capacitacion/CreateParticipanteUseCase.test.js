import { describe, it, expect, jest } from '@jest/globals';
import { CreateParticipanteUseCase } from '../../../src/application/use-cases/capacitacion/CreateParticipanteUseCase.js';
import { ConflictError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateParticipanteUseCase', () => {
  const crear = (duplicado = null) => {
    const deps = {
      participanteRepository: {
        findByCiExpedicion: jest.fn().mockResolvedValue(duplicado),
        create: jest.fn().mockImplementation(async (d) => ({ id: 10, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateParticipanteUseCase(deps) };
  };
  const body = { ci: ' 123 ', nombres: ' Ana ', celular: ' 700 ' };

  it('crea el participante normalizado', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ ...body, expedicion: 'LP', activo: true }, 2);
    expect(deps.participanteRepository.findByCiExpedicion).toHaveBeenCalledWith('123', 'LP');
    expect(deps.participanteRepository.create).toHaveBeenCalledWith(
      {
        ci: '123',
expedicion: 'LP',
nombres: 'Ana',
apellidoPaterno: null,
        apellidoMaterno: null,
celular: '700',
email: null,
activo: true,
      },
      2
    );
    expect(res.participante).toMatchObject({ id: 10, ci: '123', nombreCompleto: 'Ana' });
  });

  it('omite activo si no viene y expedicion por defecto null', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(body);
    const data = deps.participanteRepository.create.mock.calls[0][0];
    expect(data).not.toHaveProperty('activo');
    expect(data.expedicion).toBeNull();
  });

  it.each([['ci'], ['nombres'], ['celular']])('rechaza %s faltante o vacío', async (campo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, [campo]: '  ' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, [campo]: undefined })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.participanteRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza sin argumentos', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza ConflictError si CI + expedición ya existe', async () => {
    const { deps, useCase } = crear({ id: 5 });
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.participanteRepository.create).not.toHaveBeenCalled();
  });
});
