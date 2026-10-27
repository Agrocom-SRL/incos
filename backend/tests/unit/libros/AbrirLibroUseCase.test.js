import { describe, it, expect, jest } from '@jest/globals';
import { AbrirLibroUseCase } from '../../../src/application/use-cases/academico/libros/AbrirLibroUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('AbrirLibroUseCase', () => {
  const crear = (existente = null) => {
    const deps = {
      libroRegistroRepository: {
        findByGestion: jest.fn().mockResolvedValue(existente),
        create: jest.fn().mockResolvedValue({ id: 9 }),
      },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      libroRegistroViewRepository: {
        obtenerLibroPorId: jest.fn().mockResolvedValue({ id: 9, numero_libro: 15, estado: 'ABIERTO' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AbrirLibroUseCase(deps) };
  };

  it('abre el libro con defaults institucionales y devuelve el DTO', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 3, body: { gestionId: '2', numeroLibro: '15' } });

    const [datos, usuario] = deps.libroRegistroRepository.create.mock.calls[0];
    expect(usuario).toBe(3);
    expect(datos).toMatchObject({
      numeroLibro: 15,
      gestionId: 2,
      codigoRegistro: '81981609',
      folioInicial: 1,
      folioActual: 0,
      folioFinal: null,
      estado: 'ABIERTO',
      observaciones: null,
    });
    expect(datos.fechaApertura).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(deps.libroRegistroViewRepository.obtenerLibroPorId).toHaveBeenCalledWith(9);
    expect(res.libro).toMatchObject({ id: 9, numeroLibro: 15, estado: 'ABIERTO' });
  });

  it('respeta código, folios, fecha y observaciones enviados (con trim)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({
      usuarioId: 1,
      body: {
        gestionId: 2,
        numeroLibro: 14,
        codigoRegistro: ' 123 ',
        folioInicial: 56,
        folioFinal: 100,
        fechaApertura: '2026-01-05',
        observaciones: '  nota ',
      },
    });
    expect(deps.libroRegistroRepository.create.mock.calls[0][0]).toMatchObject({
      codigoRegistro: '123',
      folioInicial: 56,
      folioFinal: 100,
      fechaApertura: '2026-01-05',
      observaciones: 'nota',
    });
  });

  it.each(['abc', NaN, 5])('rechaza folioFinal inválido o menor al inicial (%p)', async (folioFinal) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({
      usuarioId: 1, body: { gestionId: 2, numeroLibro: 1, folioInicial: 10, folioFinal },
    })).rejects.toThrow(ValidationError);
    expect(deps.libroRegistroRepository.create).not.toHaveBeenCalled();
  });

  it.each([undefined, 0, -1, 'abc'])('rechaza gestión inválida (%p)', async (gestionId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 1, body: { gestionId, numeroLibro: 1 } }))
      .rejects.toThrow(ValidationError);
    expect(deps.libroRegistroRepository.create).not.toHaveBeenCalled();
  });

  it('una gestión inexistente es NotFound y no escribe (antes daba 500 por la FK)', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 1, body: { gestionId: 999999, numeroLibro: 1 } }))
      .rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(999999);
    expect(deps.libroRegistroRepository.create).not.toHaveBeenCalled();
  });

  it('exige managementRepository', () => {
    const { deps } = crear();
    expect(() => new AbrirLibroUseCase({ ...deps, managementRepository: null })).toThrow(/requerido/);
  });

  it('rechaza si la gestión ya tiene libro abierto', async () => {
    const { useCase, deps } = crear({ id: 1, numeroLibro: 14 });
    await expect(useCase.execute({ usuarioId: 1, body: { gestionId: 2, numeroLibro: 15 } }))
      .rejects.toThrow('N° 14');
    expect(deps.libroRegistroRepository.findByGestion).toHaveBeenCalledWith(2);
    expect(deps.libroRegistroRepository.create).not.toHaveBeenCalled();
  });

  it.each([undefined, 0, 'x'])('exige numeroLibro válido (%p)', async (numeroLibro) => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 1, body: { gestionId: 2, numeroLibro } }))
      .rejects.toThrow('número de libro');
  });

  it('rechaza folio inicial menor a 1', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, body: { gestionId: 2, numeroLibro: 1, folioInicial: 0 } }),
    ).rejects.toThrow('folio inicial');
  });

  it('rechaza folio final menor al inicial', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({
        usuarioId: 1,
        body: { gestionId: 2, numeroLibro: 1, folioInicial: 10, folioFinal: 5 },
      }),
    ).rejects.toThrow('folio final');
  });
});
