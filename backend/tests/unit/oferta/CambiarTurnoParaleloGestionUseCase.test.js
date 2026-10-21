import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { CambiarTurnoParaleloGestionUseCase } from '../../../src/application/use-cases/oferta/CambiarTurnoParaleloGestionUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ pg = { id: 5, state: 'BORRADOR', shift: 'MAÑANA' }, bloques = [] } = {}) => {
  const deps = {
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue(pg),
      update: jest.fn().mockResolvedValue({ id: 5, shift: 'TARDE', state: pg?.state }),
    },
    grillaBloqueViewRepository: { findByParaleloGestionId: jest.fn().mockResolvedValue(bloques) },
    logger: logger(),
  };
  return { deps, useCase: new CambiarTurnoParaleloGestionUseCase(deps) };
};

describe('CambiarTurnoParaleloGestionUseCase', () => {
  it.each(['BORRADOR', 'OFERTADO'])('cambia el turno en estado %s', async (state) => {
    const { deps, useCase } = crear({ pg: { id: 5, state, shift: 'MAÑANA' } });
    const res = await useCase.execute(5, { turno: 'TARDE' }, 9);
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(5, { shift: 'TARDE' }, 9);
    expect(res.paraleloGestion).toMatchObject({ id: 5, turno: 'TARDE' });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('con bloques armados rechaza y remite a cambiar-turno-con-bloques', async () => {
    const { deps, useCase } = crear({ bloques: [{ asignacionHorarioId: 1 }] });
    await expect(useCase.execute(5, { turno: 'TARDE' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('turno igual al actual no consulta bloques', async () => {
    const { deps, useCase } = crear({ pg: { id: 5, state: 'BORRADOR', shift: 'MAÑANA' }, bloques: [{ id: 1 }] });
    await useCase.execute(5, { turno: 'MAÑANA' });
    expect(deps.grillaBloqueViewRepository.findByParaleloGestionId).not.toHaveBeenCalled();
  });

  it.each([undefined, null, '', 'MADRUGADA', 'tarde'])('rechaza turno inválido %p', async (turno) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { turno })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el paralelo no existe', async () => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute(99, { turno: 'TARDE' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError con id NaN (el repositorio no lo encuentra)', async () => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute(NaN, { turno: 'TARDE' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(NaN);
  });

  it.each(['PUBLICADO', 'CERRADO'])('rechaza cambiar turno en estado %s', async (state) => {
    const { deps, useCase } = crear({ pg: { id: 5, state, shift: 'MAÑANA' } });
    await expect(useCase.execute(5, { turno: 'TARDE' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });
});
