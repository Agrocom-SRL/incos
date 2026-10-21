import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { UpdateParaleloGestionEstadoUseCase } from '../../../src/application/use-cases/oferta/UpdateParaleloGestionEstadoUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ pg = { id: 3, state: 'BORRADOR', classroomId: 8 }, validacion = { valido: true, faltantes: [] } } = {}) => {
  const deps = {
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue(pg),
      update: jest.fn().mockResolvedValue({ id: 3, state: 'X' }),
    },
    validarOfertaParaleloGestionUseCase: { execute: jest.fn().mockResolvedValue(validacion) },
    logger: logger(),
  };
  return { deps, useCase: new UpdateParaleloGestionEstadoUseCase(deps) };
};

describe('UpdateParaleloGestionEstadoUseCase', () => {
  it('pasa a OFERTADO con aula y oferta completa', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(3, { estado: 'OFERTADO' }, 6);
    expect(deps.validarOfertaParaleloGestionUseCase.execute).toHaveBeenCalledWith(3);
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { state: 'OFERTADO' }, 6);
    expect(res.paraleloGestion).toMatchObject({ id: 3, estado: 'X' });
  });

  it('OFERTADO sin aula falla sin validar la oferta', async () => {
    const { deps, useCase } = crear({ pg: { id: 3, state: 'BORRADOR', classroomId: null } });
    await expect(useCase.execute(3, { estado: 'OFERTADO' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.validarOfertaParaleloGestionUseCase.execute).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['inválida', { valido: false, faltantes: [] }],
    ['con faltantes', { valido: true, faltantes: [{ asignaturaPlanId: 1 }] }],
  ])('OFERTADO con oferta %s falla', async (_n, validacion) => {
    const { deps, useCase } = crear({ validacion });
    await expect(useCase.execute(3, { estado: 'OFERTADO' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['BORRADOR', 'PUBLICADO'], ['BORRADOR', 'CERRADO'], ['OFERTADO', 'CERRADO'],
    ['CERRADO', 'BORRADOR'], ['CERRADO', 'OFERTADO'], ['CERRADO', 'PUBLICADO'],
  ])('transición %s → %s no permitida', async (desde, hacia) => {
    const { deps, useCase } = crear({ pg: { id: 3, state: desde, classroomId: 8 } });
    await expect(useCase.execute(3, { estado: hacia })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it.each([['PUBLICADO', 'OFERTADO'], ['PUBLICADO', 'BORRADOR'], ['OFERTADO', 'BORRADOR'], ['PUBLICADO', 'CERRADO']])(
    'transición %s → %s permitida (sin revalidar la oferta al despublicar)',
    async (desde, hacia) => {
      const { deps, useCase } = crear({ pg: { id: 3, state: desde, classroomId: 8 } });
      await useCase.execute(3, { estado: hacia });
      expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { state: hacia }, null);
      if (hacia === 'OFERTADO' && desde === 'PUBLICADO') {
        expect(deps.validarOfertaParaleloGestionUseCase.execute).not.toHaveBeenCalled();
      }
    }
  );

  it('PUBLICADO solo desde OFERTADO', async () => {
    const { deps, useCase } = crear({ pg: { id: 3, state: 'OFERTADO', classroomId: 8 } });
    await useCase.execute(3, { estado: 'PUBLICADO' });
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { state: 'PUBLICADO' }, null);
  });

  it.each(['BORRADOR', 'CERRADO'])('PUBLICADO desde %s falla', async (state) => {
    const { deps, useCase } = crear({ pg: { id: 3, state, classroomId: 8 } });
    await expect(useCase.execute(3, { estado: 'PUBLICADO' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('permite CERRADO sin validaciones adicionales', async () => {
    const { deps, useCase } = crear({ pg: { id: 3, state: 'PUBLICADO' } });
    await useCase.execute(3, { estado: 'CERRADO' });
    expect(deps.validarOfertaParaleloGestionUseCase.execute).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { state: 'CERRADO' }, null);
  });

  it.each([undefined, null, '', 'ACTIVA', 'publicado'])('rechaza estado inválido %p', async (estado) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(3, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it.each([99, NaN])('NotFoundError si el paralelo no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute(id, { estado: 'OFERTADO' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });
});
