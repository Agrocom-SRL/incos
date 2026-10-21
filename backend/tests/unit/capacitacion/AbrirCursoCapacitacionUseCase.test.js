import { describe, it, expect, jest } from '@jest/globals';
import { AbrirCursoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/AbrirCursoCapacitacionUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('AbrirCursoCapacitacionUseCase', () => {
  const crear = (curso, { grupos = [{ id: 1 }], bloques = [{ grupoId: 1 }] } = {}) => {
    const deps = {
      grupoCapacitacionRepository: { findByCapacitacionId: jest.fn().mockResolvedValue(grupos) },
      bloqueCapacitacionRepository: { findByCapacitacionId: jest.fn().mockResolvedValue(bloques) },
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(curso),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...curso, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AbrirCursoCapacitacionUseCase(deps) };
  };
  const curso = (estado, ini = '2999-01-01', fin = '2999-12-31') => ({
    id: 1, titulo: 'Excel', estado, modalidad: 'PRESENCIAL', fechaInicio: ini, fechaFin: fin,
  });

  it('abre un curso PROPUESTO', async () => {
    const { deps, useCase } = crear(curso('PROPUESTO'));
    const res = await useCase.execute(1, 6);
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(1, { estado: 'ABIERTO' }, 6);
    expect(res.cursoCapacitacion.estado).toBe('ABIERTO');
  });

  it('lanza NotFoundError si no existe', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['ABIERTO', undefined, undefined],
    ['CANCELADO', undefined, undefined],
    ['CERRADO', undefined, undefined],
    ['EN_CURSO', undefined, undefined],
  ])('rechaza abrir desde %s', async (estado) => {
    const { deps, useCase } = crear(curso(estado));
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  describe('coherencia con la modalidad al abrir', () => {
    it.each([['PRESENCIAL'], ['SEMIPRESENCIAL']])('%s exige al menos un grupo', async (modalidad) => {
      const { deps, useCase } = crear({ ...curso('PROPUESTO'), modalidad }, { grupos: [], bloques: [] });
      await expect(useCase.execute(1)).rejects.toThrow(/al menos un grupo con horarios/);
      expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
    });

    it('exige que al menos un grupo tenga horarios', async () => {
      const { deps, useCase } = crear(curso('PROPUESTO'), { grupos: [{ id: 1 }, { id: 2 }], bloques: [] });
      await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
      expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
    });

    it('los bloques sin grupo no cuentan como horario de un grupo', async () => {
      const { useCase } = crear(curso('PROPUESTO'), { grupos: [{ id: 1 }], bloques: [{ grupoId: null }] });
      await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
    });

    it('un curso con un grupo con horarios abre (basta uno de varios grupos)', async () => {
      const { deps, useCase } = crear(curso('PROPUESTO'), { grupos: [{ id: 1 }, { id: 2 }], bloques: [{ grupoId: 2 }] });
      await expect(useCase.execute(1)).resolves.toBeDefined();
      expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalled();
    });

    it('un curso VIRTUAL abre sin grupos ni horarios', async () => {
      const { deps, useCase } = crear({ ...curso('PROPUESTO'), modalidad: 'VIRTUAL' }, { grupos: [], bloques: [] });
      await expect(useCase.execute(1)).resolves.toBeDefined();
      expect(deps.grupoCapacitacionRepository.findByCapacitacionId).not.toHaveBeenCalled();
    });
  });
});
