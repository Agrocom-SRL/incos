import { describe, it, expect, jest } from '@jest/globals';
import { GetPasantiaUseCase } from '../../../src/application/use-cases/pasantias/GetPasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetPasantiaUseCase', () => {
  const crear = ({ entity = { id: 4, estado: 'EN_CURSO' }, row = null } = {}) => {
    const deps = {
      pasantiaRepository: { findById: jest.fn().mockResolvedValue(entity) },
      pasantiaViewRepository: { findListadoById: jest.fn().mockResolvedValue(row) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetPasantiaUseCase(deps) };
  };

  it('devuelve la ficha mapeada desde la vista de detalle', async () => {
    const row = {
      pasantia_id: 4,
      tipo: 'PASANTIA',
      estado: 'EN_CURSO',
      horas_requeridas: '120',
      empresa_nombre: 'ACME',
      total_informes: '2',
      empresa_en_funcionamiento: 1,
    };
    const { useCase, deps } = crear({ row });

    const result = await useCase.execute(4);

    expect(deps.pasantiaRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.pasantiaViewRepository.findListadoById).toHaveBeenCalledWith(4);
    expect(result).toMatchObject({
      id: 4,
      estado: 'EN_CURSO',
      horasRequeridas: 120,
      empresaNombre: 'ACME',
      totalInformes: 2,
      empresaEnFuncionamiento: true,
    });
  });

  it('si la vista no devuelve fila degrada a la entidad raíz', async () => {
    const entity = { id: 4, estado: 'CANCELADA' };
    const { useCase } = crear({ entity, row: null });

    const result = await useCase.execute(4);

    expect(result).toEqual(entity);
    expect(result).not.toBe(entity);
  });

  it('lanza NotFoundError si el trámite no existe y no consulta la vista', async () => {
    const { useCase, deps } = crear({ entity: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pasantiaViewRepository.findListadoById).not.toHaveBeenCalled();
  });
});
