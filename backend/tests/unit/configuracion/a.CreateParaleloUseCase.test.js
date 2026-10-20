import { describe, it, expect, jest } from '@jest/globals';
import { CreateParaleloUseCase } from '../../../src/application/use-cases/configuracion/CreateParaleloUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateParaleloUseCase', () => {
  const crear = ({ period = { studyPlanId: 20 }, plan = { careerId: 1 }, existing = null } = {}) => {
    const parallelRepository = {
      findBy: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue({ id: 50, careerId: 1, periodId: 10, name: 'A', shift: 'MAÑANA' }),
    };
    const periodRepository = { findById: jest.fn().mockResolvedValue(period) };
    const studyPlanRepository = { findById: jest.fn().mockResolvedValue(plan) };
    const logger = { info: jest.fn() };
    return {
      parallelRepository,
      periodRepository,
      studyPlanRepository,
      logger,
      useCase: new CreateParaleloUseCase({ parallelRepository, periodRepository, studyPlanRepository, logger }),
    };
  };
  const valido = { carrera_id: 1, periodo_id: 10, nombre: 'A', turno: 'MAÑANA' };

  it('crea el paralelo y devuelve la presentación', async () => {
    const { useCase, parallelRepository, periodRepository, studyPlanRepository, logger } = crear();
    const res = await useCase.execute({ ...valido, descripcion: ' desc ' }, 9);
    expect(periodRepository.findById).toHaveBeenCalledWith(10);
    expect(studyPlanRepository.findById).toHaveBeenCalledWith(20);
    expect(parallelRepository.findBy).toHaveBeenCalledWith({
      careerId: 1,
      periodId: 10,
      shift: 'MAÑANA',
      name: 'A',
    });
    expect(parallelRepository.create).toHaveBeenCalledWith(
      { careerId: 1, periodId: 10, name: 'A', shift: 'MAÑANA', description: 'desc', active: true },
      9
    );
    expect(res.paralelo).toMatchObject({ id: 50, carreraId: 1, periodoId: 10, nombre: 'A', turno: 'MAÑANA' });
    expect(logger.info).toHaveBeenCalledWith('[CFG] Paralelo maestro creado', { id: 50 });
  });

  it('convierte ids en string a número y respeta activo=false', async () => {
    const { useCase, parallelRepository } = crear();
    await useCase.execute({ ...valido, carrera_id: '1', periodo_id: '10', activo: false });
    expect(parallelRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ careerId: 1, periodId: 10, description: null, active: false }),
      null
    );
  });

  it.each([
    ['carrera_id ausente', { carrera_id: undefined }],
    ['carrera_id no numérico (NaN)', { carrera_id: 'abc' }],
    ['periodo_id ausente', { periodo_id: undefined }],
    ['periodo_id no numérico (NaN)', { periodo_id: 'abc' }],
    ['nombre vacío', { nombre: '   ' }],
    ['nombre mayor a 50', { nombre: 'x'.repeat(51) }],
    ['turno inválido', { turno: 'MADRUGADA' }],
    ['turno ausente', { turno: undefined }],
  ])('rechaza %s sin consultar repositorios', async (_n, parche) => {
    const { useCase, parallelRepository, periodRepository } = crear();
    await expect(useCase.execute({ ...valido, ...parche })).rejects.toBeInstanceOf(ValidationError);
    expect(periodRepository.findById).not.toHaveBeenCalled();
    expect(parallelRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un periodo inexistente', async () => {
    const { useCase, parallelRepository } = crear({ period: null });
    await expect(useCase.execute(valido)).rejects.toThrow('periodo_id no válido');
    expect(parallelRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si el periodo no pertenece a la carrera', async () => {
    const { useCase, parallelRepository } = crear({ plan: { careerId: 2 } });
    await expect(useCase.execute(valido)).rejects.toThrow('no pertenece a la carrera');
    expect(parallelRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si el plan del periodo no existe', async () => {
    const { useCase } = crear({ plan: null });
    await expect(useCase.execute(valido)).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza un paralelo duplicado (mismo nombre, periodo y turno)', async () => {
    const { useCase, parallelRepository } = crear({ existing: { id: 3 } });
    await expect(useCase.execute(valido)).rejects.toThrow('Ya existe un paralelo');
    expect(parallelRepository.create).not.toHaveBeenCalled();
  });
});
