import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CreateBitacoraEntradaUseCase } = await import(
  '../../../src/application/use-cases/titulacion/CreateBitacoraEntradaUseCase.js'
);

describe('CreateBitacoraEntradaUseCase', () => {
  const crear = ({
    proyecto = { id: 5 },
    avance = { id: 12, proyectoGradoId: 5 },
    maxPorcentaje = 20,
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      bitacoraProyectoRepository: {
        create: jest.fn().mockResolvedValue({ id: 40 }),
        findMaxPorcentajeAvance: jest.fn().mockResolvedValue(maxPorcentaje),
      },
      avanceProyectoRepository: {
        findById: jest.fn().mockResolvedValue(avance),
        update: jest.fn().mockResolvedValue({}),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateBitacoraEntradaUseCase(deps) };
  };

  beforeEach(() => {
    mockTransaction.mockClear();
  });

  it('crea una reunión con valores por defecto dentro de una transacción', async () => {
    const { deps, useCase } = crear();
    const result = await useCase.execute(5, {}, 3);

    expect(result).toEqual({ bitacoraEntrada: { id: 40 } });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      {
        proyectoGradoId: 5,
        avanceProyectoId: null,
        tipo: 'REUNION',
        fecha: new Date().toISOString().slice(0, 10),
        actividad: null,
        observaciones: null,
        porcentajeAvance: null,
        estado: 'PENDIENTE',
      },
      3,
      { transaction: 'TX' }
    );
    expect(deps.avanceProyectoRepository.update).not.toHaveBeenCalled();
    expect(deps.bitacoraProyectoRepository.findMaxPorcentajeAvance).not.toHaveBeenCalled();
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('REVISION_AVANCE actualiza el estado de revisión del avance en la misma transacción', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(
      5,
      {
        tipo: 'REVISION_AVANCE',
        avanceProyectoId: '12',
        estadoRevisionAvance: 'APROBADO',
        fecha: '2026-09-02',
      },
      3
    );

    expect(deps.avanceProyectoRepository.findById).toHaveBeenCalledWith(12);
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ avanceProyectoId: 12, tipo: 'REVISION_AVANCE', fecha: '2026-09-02' }),
      3,
      { transaction: 'TX' }
    );
    expect(deps.avanceProyectoRepository.update).toHaveBeenCalledWith(
      12,
      { estadoRevision: 'APROBADO', fechaRevision: '2026-09-02' },
      3,
      { transaction: 'TX' }
    );
  });

  it('REVISION_AVANCE usa OBSERVADO por defecto', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { tipo: 'REVISION_AVANCE', avanceProyectoId: 12, fecha: '2026-09-02' });
    expect(deps.avanceProyectoRepository.update).toHaveBeenCalledWith(
      12,
      { estadoRevision: 'OBSERVADO', fechaRevision: '2026-09-02' },
      null,
      { transaction: 'TX' }
    );
  });

  it('REVISION_AVANCE exige avanceProyectoId', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { tipo: 'REVISION_AVANCE' })).rejects
      .toBeInstanceOf(ValidationError);
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('REVISION_AVANCE con avance inexistente lanza NotFoundError', async () => {
    const { deps, useCase } = crear({ avance: null });
    await expect(
      useCase.execute(5, { tipo: 'REVISION_AVANCE', avanceProyectoId: 12 })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('REVISION_AVANCE con avance de otro proyecto lanza NotFoundError', async () => {
    const { useCase } = crear({ avance: { id: 12, proyectoGradoId: 77 } });
    await expect(
      useCase.execute(5, { tipo: 'REVISION_AVANCE', avanceProyectoId: 12 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('REVISION_AVANCE con avanceProyectoId no numérico lanza NotFoundError', async () => {
    const { deps, useCase } = crear({ avance: null });
    await expect(
      useCase.execute(5, { tipo: 'REVISION_AVANCE', avanceProyectoId: 'abc' })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('REVISION_AVANCE rechaza un estadoRevisionAvance inválido', async () => {
    const { deps, useCase } = crear();
    await expect(
      useCase.execute(5, {
        tipo: 'REVISION_AVANCE', avanceProyectoId: 12, estadoRevisionAvance: 'XYZ',
      })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('acepta un porcentaje igual o mayor al máximo registrado', async () => {
    const { deps, useCase } = crear({ maxPorcentaje: 20 });
    await useCase.execute(5, { porcentajeAvance: 20 });
    await useCase.execute(5, { porcentajeAvance: '35' });
    expect(deps.bitacoraProyectoRepository.findMaxPorcentajeAvance).toHaveBeenCalledWith(5);
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledTimes(2);
  });

  it('acepta porcentaje 0 cuando no hay avance previo', async () => {
    const { deps, useCase } = crear({ maxPorcentaje: 0 });
    await useCase.execute(5, { porcentajeAvance: 0 });
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ porcentajeAvance: 0 }),
      null,
      { transaction: 'TX' }
    );
  });

  it('rechaza un porcentaje menor al máximo ya registrado (monotónico)', async () => {
    const { deps, useCase } = crear({ maxPorcentaje: 60 });
    await expect(useCase.execute(5, { porcentajeAvance: 59 })).rejects
      .toBeInstanceOf(ValidationError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], [-5], [101], [''], [NaN], [Infinity]])(
    'porcentajeAvance %p inválido: ValidationError sin consultar ni crear',
    async (valor) => {
      const { deps, useCase } = crear({ maxPorcentaje: 0 });
      await expect(useCase.execute(5, { porcentajeAvance: valor })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
    }
  );

  it('porcentaje numérico en texto se guarda como número', async () => {
    const { deps, useCase } = crear({ maxPorcentaje: 0 });
    await useCase.execute(5, { porcentajeAvance: '40' });
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ porcentajeAvance: 40 }),
      null,
      { transaction: 'TX' }
    );
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { deps, useCase } = crear({ proyecto: null });
    await expect(useCase.execute(5, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('usa el body vacío por defecto', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5)).resolves.toHaveProperty('bitacoraEntrada');
  });
});
