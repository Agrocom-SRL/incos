import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdateInscripcionCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/UpdateInscripcionCapacitacionUseCase.js'
);

describe('UpdateInscripcionCapacitacionUseCase', () => {
  const inscripcionBase = {
    id: 5,
    participanteId: 9,
    capacitacionId: 1,
    estado: 'PENDIENTE',
    capacitacionGrupoId: 10,
  };
  const grupos = [
    { id: 10, nombre: 'Grupo 1', cupoMaximo: 20 },
    { id: 11, nombre: 'Grupo 2', cupoMaximo: 2 },
    { id: 12, nombre: 'Grupo 3', cupoMaximo: null },
  ];

  const crear = ({ inscripcion = inscripcionBase, lleno = false } = {}) => {
    const deps = {
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn().mockResolvedValue({}),
        countVigentesByGrupoIds: jest.fn().mockImplementation(async (ids) => ({ [ids[0]]: lleno ? 99 : 0 })),
      },
      grupoCapacitacionRepository: { findByCapacitacionId: jest.fn().mockResolvedValue(grupos) },
      updateParticipanteUseCase: { execute: jest.fn().mockResolvedValue({ participante: {} }) },
      getInscripcionCapacitacionByIdUseCase: { execute: jest.fn().mockResolvedValue({ id: 5, grupoNombre: 'x' }) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateInscripcionCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('corrige datos del participante delegando en UpdateParticipante (solo campos permitidos) y devuelve la ficha', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      5,
      { participante: { nombres: 'Ana', ci: '123', activo: false, id: 77, celular: '700' } },
      4
    );
    expect(deps.updateParticipanteUseCase.execute).toHaveBeenCalledWith(
      9,
      { nombres: 'Ana', ci: '123', celular: '700' },
      4,
      { transaction: 'TX' }
    );
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
    expect(deps.getInscripcionCapacitacionByIdUseCase.execute).toHaveBeenCalledWith(5);
    expect(res.inscripcionCapacitacion).toEqual({ id: 5, grupoNombre: 'x' });
  });

  it('propaga el 409 de CI duplicada de UpdateParticipante y no cambia el grupo', async () => {
    const { deps, useCase } = crear();
    deps.updateParticipanteUseCase.execute.mockRejectedValue(new ConflictError('Ya existe otro participante'));
    await expect(
      useCase.execute(5, { participante: { ci: '999' }, capacitacionGrupoId: 12 })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('cambia el grupo a otro del curso con lugar', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { capacitacionGrupoId: 12 }, 4);
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      5, { capacitacionGrupoId: 12 }, 4, { transaction: 'TX' }
    );
    expect(deps.updateParticipanteUseCase.execute).not.toHaveBeenCalled();
  });

  it('409 si el grupo destino tiene cupo propio y está lleno', async () => {
    const { deps, useCase } = crear({ lleno: true });
    await expect(useCase.execute(5, { capacitacionGrupoId: 11 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('enviar el mismo grupo no escribe ni revalida el cupo', async () => {
    const { deps, useCase } = crear({ lleno: true });
    await useCase.execute(5, { capacitacionGrupoId: 10 });
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.countVigentesByGrupoIds).not.toHaveBeenCalled();
  });

  it('400 si el grupo no es del curso o se quita habiendo varios grupos', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5, { capacitacionGrupoId: 999 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(5, { capacitacionGrupoId: null })).rejects.toBeInstanceOf(ValidationError);
  });

  it('el grupo no se puede cambiar en una inscripción RETIRADA o ANULADA, pero sí los datos del participante', async () => {
    const { deps, useCase } = crear({ inscripcion: { ...inscripcionBase, estado: 'ANULADO' } });
    await expect(useCase.execute(5, { capacitacionGrupoId: 12 })).rejects.toBeInstanceOf(ConflictError);
    await expect(useCase.execute(5, { participante: { nombres: 'Ana' } })).resolves.toBeDefined();
    expect(deps.updateParticipanteUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('exige participante y/o capacitacionGrupoId y rechaza formas inválidas', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5, {})).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(5, { participante: 'x' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(5, { participante: { activo: true } })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(0, { capacitacionGrupoId: 12 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('404 si la inscripción no existe', async () => {
    const { deps, useCase } = crear();
    deps.inscripcionCapacitacionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5, { capacitacionGrupoId: 12 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
