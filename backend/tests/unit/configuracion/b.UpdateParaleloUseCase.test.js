import { describe, it, expect, jest } from '@jest/globals';
import { UpdateParaleloUseCase } from '../../../src/application/use-cases/configuracion/UpdateParaleloUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateParaleloUseCase', () => {
  const actual = { id: 3, careerId: 1, periodId: 10, name: 'A', shift: 'MAÑANA', description: 'd', active: true };

  const crear = ({ current = actual, period = { id: 10, studyPlanId: 20 }, plan = { id: 20, careerId: 1 }, duplicate = null } = {}) => {
    const parallelRepository = {
      findById: jest.fn().mockResolvedValue(current),
      findBy: jest.fn().mockResolvedValue(duplicate),
      update: jest.fn().mockImplementation(async (id, data) => ({ id, ...data })),
    };
    const periodRepository = { findById: jest.fn().mockResolvedValue(period) };
    const studyPlanRepository = { findById: jest.fn().mockResolvedValue(plan) };
    const logger = { info: jest.fn() };
    return {
      parallelRepository,
periodRepository,
studyPlanRepository,
logger,
      useCase: new UpdateParaleloUseCase({ parallelRepository, periodRepository, studyPlanRepository, logger }),
    };
  };

  it('actualiza con todos los campos y devuelve { paralelo }', async () => {
    const { useCase, parallelRepository, periodRepository, studyPlanRepository } = crear();
    const res = await useCase.execute(
      3,
      { carrera_id: '1', periodo_id: '10', nombre: ' B ', turno: 'TARDE', descripcion: ' nueva ', activo: false },
      7
    );
    expect(periodRepository.findById).toHaveBeenCalledWith(10);
    expect(studyPlanRepository.findById).toHaveBeenCalledWith(20);
    expect(parallelRepository.findBy).toHaveBeenCalledWith({ careerId: 1, periodId: 10, shift: 'TARDE', name: 'B' });
    expect(parallelRepository.update).toHaveBeenCalledWith(
      3,
      { careerId: 1, periodId: 10, name: 'B', shift: 'TARDE', description: 'nueva', active: false },
      7
    );
    expect(res.paralelo).toMatchObject({ id: 3, nombre: 'B', activo: false });
  });

  it('lanza NotFoundError si el paralelo no existe', async () => {
    const { useCase, parallelRepository } = crear({ current: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza turno inválido sin actualizar', async () => {
    const { useCase, parallelRepository } = crear();
    await expect(useCase.execute(3, { nombre: 'A', turno: 'MADRUGADA' })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza nombre de más de 50 caracteres', async () => {
    const { useCase, parallelRepository } = crear();
    await expect(useCase.execute(3, { nombre: 'x'.repeat(51) })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['x1']])('rechaza carrera_id no numérico (%p -> NaN)', async (valor) => {
    const { useCase, parallelRepository } = crear();
    await expect(useCase.execute(3, { nombre: 'A', carrera_id: valor })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['x1']])('rechaza periodo_id no numérico (%p -> NaN)', async (valor) => {
    const { useCase, parallelRepository } = crear();
    await expect(useCase.execute(3, { nombre: 'A', periodo_id: valor })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza si el periodo no existe o no tiene plan', async () => {
    const { useCase, parallelRepository } = crear({ period: null });
    await expect(useCase.execute(3, { nombre: 'A', periodo_id: 11 })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza si el periodo pertenece a otra carrera', async () => {
    const { useCase, parallelRepository } = crear({ plan: { id: 20, careerId: 2 } });
    await expect(useCase.execute(3, { nombre: 'A' })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza duplicado de otro paralelo (mismo nombre, periodo y turno)', async () => {
    const { useCase, parallelRepository } = crear({ duplicate: { id: 55 } });
    await expect(useCase.execute(3, { nombre: 'A' })).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
  });

  it('permite que el duplicado encontrado sea el mismo paralelo', async () => {
    const { useCase, parallelRepository } = crear({ duplicate: { id: 3 } });
    await useCase.execute(3, { nombre: 'A' });
    expect(parallelRepository.update).toHaveBeenCalled();
  });

  it('lanza NotFoundError si el repositorio no devuelve el paralelo actualizado', async () => {
    const { useCase, parallelRepository, logger } = crear();
    parallelRepository.update.mockResolvedValue(null);
    await expect(useCase.execute(3, { nombre: 'A' })).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  // BUG conocido (paraleloPayload.js:37-39): normalizeParaleloBody deja name='' si no viene nombre y
  // assertParaleloPayload(requireAll:false) lo rechaza. it.failing pasa mientras el bug exista;
  // al corregirlo, cambiar a it.
  it.failing('actualización parcial: solo cambiar el turno conserva el resto de campos', async () => {
    const { useCase, parallelRepository } = crear();
    await useCase.execute(3, { turno: 'NOCHE' });
    expect(parallelRepository.update).toHaveBeenCalledWith(
      3,
      { careerId: 1, periodId: 10, name: 'A', shift: 'NOCHE', description: 'd', active: true },
      null
    );
  });

  it.failing('actualización parcial: body vacío conserva los valores actuales', async () => {
    const { useCase, parallelRepository } = crear();
    await useCase.execute(3, {});
    expect(parallelRepository.update).toHaveBeenCalledWith(3, expect.objectContaining({ name: 'A', shift: 'MAÑANA' }), null);
  });
});
