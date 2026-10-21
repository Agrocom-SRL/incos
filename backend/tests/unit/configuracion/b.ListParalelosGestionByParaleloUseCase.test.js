import { describe, it, expect, jest } from '@jest/globals';
import { ListParalelosGestionByParaleloUseCase } from '../../../src/application/use-cases/configuracion/ListParalelosGestionByParaleloUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListParalelosGestionByParaleloUseCase', () => {
  const crear = ({ entity = { id: 4 }, rows = [] } = {}) => {
    const parallelRepository = { findById: jest.fn().mockResolvedValue(entity) };
    const parallelManagementRepository = { findEnrichedByParallelId: jest.fn().mockResolvedValue(rows) };
    const logger = { info: jest.fn() };
    return {
      parallelRepository,
      parallelManagementRepository,
      logger,
      useCase: new ListParalelosGestionByParaleloUseCase({ parallelRepository, parallelManagementRepository, logger }),
    };
  };

  it('devuelve paralelosGestion enriquecidos con datos de gestión', async () => {
    const { useCase, parallelRepository, parallelManagementRepository, logger } = crear({
      rows: [
        { id: 1, paraleloId: 4, gestionId: 9, gestionCodigo: 'G-2026', gestionNombre: 'Gestión 2026', gestionAnio: 2026, gestionVigente: 1 },
        { id: 2, paraleloId: 4 },
      ],
    });
    const res = await useCase.execute('4');
    expect(parallelRepository.findById).toHaveBeenCalledWith(4);
    expect(parallelManagementRepository.findEnrichedByParallelId).toHaveBeenCalledWith(4);
    expect(res.paralelosGestion).toHaveLength(2);
    expect(res.paralelosGestion[0]).toMatchObject({
      id: 1, gestionId: 9, gestionCodigo: 'G-2026', gestionNombre: 'Gestión 2026', gestionAnio: 2026, gestionVigente: true,
    });
    expect(res.paralelosGestion[1]).toMatchObject({
      gestionId: null, gestionCodigo: null, gestionNombre: null, gestionAnio: null, gestionVigente: false,
    });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { paraleloId: 4, total: 2 });
  });

  it('gestionVigente 0 se convierte a false', async () => {
    const { useCase } = crear({ rows: [{ id: 1, gestionVigente: 0 }] });
    const res = await useCase.execute(4);
    expect(res.paralelosGestion[0].gestionVigente).toBe(false);
  });

  it('devuelve lista vacía si el repositorio devuelve null', async () => {
    const { useCase } = crear({ rows: null });
    await expect(useCase.execute(4)).resolves.toEqual({ paralelosGestion: [] });
  });

  it.each([['abc'], [undefined], [null], [''], [0], [-3], [NaN], [Infinity]])(
    'lanza NotFoundError sin consultar con id inválido %p',
    async (valor) => {
      const { useCase, parallelRepository } = crear();
      await expect(useCase.execute(valor)).rejects.toBeInstanceOf(NotFoundError);
      expect(parallelRepository.findById).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si el paralelo no existe y no consulta la oferta', async () => {
    const { useCase, parallelManagementRepository } = crear({ entity: null });
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
    expect(parallelManagementRepository.findEnrichedByParallelId).not.toHaveBeenCalled();
  });
});
