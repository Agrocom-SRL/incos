import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn();
const mockTransaction = jest.fn(async (fn) => fn('TX'));
const mockHorario = { findAll: jest.fn(), destroy: jest.fn(), bulkCreate: jest.fn(), update: jest.fn() };
const mockAsignacion = { findOne: jest.fn(), create: jest.fn() };

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { query: mockQuery, transaction: mockTransaction },
}));
jest.unstable_mockModule('../../../src/infrastructure/database/models/asignacion_horario.js', () => ({
  AsignacionHorario: mockHorario,
}));
jest.unstable_mockModule('../../../src/infrastructure/database/models/asignacion_docente.js', () => ({
  AsignacionDocente: mockAsignacion,
}));

const { PutParaleloScheduleUseCase } = await import(
  '../../../src/application/use-cases/academico/PutParaleloScheduleUseCase.js'
);

describe('PutParaleloScheduleUseCase', () => {
  const crear = ({ paralelo = { id: 1 }, ofertas = [{ id: 100 }, { id: 101 }], horario = { id: 900 } } = {}) => {
    const deps = {
      parallelRepository: { findById: jest.fn().mockResolvedValue(paralelo) },
      courseOfferRepository: { findEnrichedByParallelManagementId: jest.fn().mockResolvedValue(ofertas) },
      scheduleRepository: { findBy: jest.fn().mockResolvedValue(horario) },
      teacherAssignmentRepository: {},
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    };
    return { deps, useCase: new PutParaleloScheduleUseCase(deps) };
  };

  const bloque = (o = {}) => ({ dia: 'lunes', horaInicio: '8:00', horaFin: '09:00', ...o });
  const input = (schedules, paraleloId = 1) => ({ paraleloId, schedules });

  beforeEach(() => {
    mockQuery.mockReset().mockResolvedValue([{ paraleloGestionId: 11, gestionPlanId: 22 }]);
    mockTransaction.mockClear();
    Object.values(mockHorario).forEach((f) => f.mockReset());
    mockHorario.findAll.mockResolvedValue([]);
    mockAsignacion.findOne.mockReset().mockResolvedValue({ id: 500 });
    mockAsignacion.create.mockReset().mockResolvedValue({ id: 600 });
  });

  it.each([['abc'], [0], [undefined], [-1]])('400 si paraleloId es inválido (%p)', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ paraleloId: id, schedules: [] })).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.parallelRepository.findById).not.toHaveBeenCalled();
  });

  it('404 si el paralelo no existe', async () => {
    const { useCase } = crear({ paralelo: null });
    await expect(useCase.execute(input([]))).rejects.toMatchObject({ statusCode: 404 });
  });

  it('404 si no hay instancia en la gestión vigente', async () => {
    mockQuery.mockResolvedValue([]);
    const { useCase } = crear();
    await expect(useCase.execute(input([]))).rejects.toMatchObject({ statusCode: 404 });
  });

  it.each([[undefined], [null], ['x'], [{}]])('400 si schedules no es array (%p)', async (s) => {
    const { useCase } = crear();
    await expect(useCase.execute({ paraleloId: 1, schedules: s })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('422 si el cursoId no pertenece al paralelo o no es numérico', async () => {
    const { useCase } = crear();
    const err = await useCase.execute(input([{ cursoId: 999, bloques: [] }, { cursoId: 'x', bloques: [] }])).catch((e) => e);
    expect(err.statusCode).toBe(422);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it.each([
    ['día inválido', bloque({ dia: 'DOMINGO' })],
    ['hora con formato inválido', bloque({ horaInicio: 'abc' })],
    ['hora fin vacía', bloque({ horaFin: '' })],
    ['fin <= inicio', bloque({ horaInicio: '10:00', horaFin: '09:00' })],
    ['fin == inicio', bloque({ horaInicio: '09:00', horaFin: '09:00' })],
  ])('422 por bloque inválido: %s', async (_n, b) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(input([{ cursoId: 100, bloques: [b] }]))).rejects.toMatchObject({ statusCode: 422 });
    expect(deps.scheduleRepository.findBy).not.toHaveBeenCalledWith(expect.objectContaining({ startTime: 'abc' }));
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('422 si el horario no existe en el catálogo', async () => {
    const { useCase } = crear({ horario: null });
    const err = await useCase.execute(input([{ cursoId: 100, bloques: [bloque()] }])).catch((e) => e);
    expect(err.statusCode).toBe(422);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('crea bloques nuevos normalizando día y hora, con aula nula y orden por día/hora', async () => {
    const { useCase, deps } = crear();
    deps.scheduleRepository.findBy
      .mockResolvedValueOnce({ id: 902 })
      .mockResolvedValueOnce({ id: 901 });
    const res = await useCase.execute(input([
      { cursoId: '100', bloques: [bloque({ dia: 'Martes' }), bloque({ dia: 'lunes', horaInicio: '7:30', horaFin: '8:30' })] },
    ]));

    expect(deps.scheduleRepository.findBy).toHaveBeenCalledWith({
      day: 'MARTES', startTime: '08:00:00', endTime: '09:00:00', scheduleType: 'CLASES',
    });
    expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).toHaveBeenCalledWith(11);
    expect(mockAsignacion.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { ofertaCursoId: 100, gestionPlanId: 22, vigente: true, deletedAt: null },
    }));
    expect(mockHorario.bulkCreate).toHaveBeenCalledWith(
      [
        { asignacionDocenteId: 500, horarioId: 901, aulaId: null, ordenSecuencia: 1, activo: true },
        { asignacionDocenteId: 500, horarioId: 902, aulaId: null, ordenSecuencia: 2, activo: true },
      ],
      { transaction: 'TX' },
    );
    expect(mockHorario.destroy).not.toHaveBeenCalled();
    expect(res).toEqual({ persistencia: { paraleloId: 1, created: 2, updated: 0, deleted: 0 } });
  });

  it('crea la asignación docente vacía si la oferta no tiene una vigente', async () => {
    mockAsignacion.findOne.mockResolvedValue(null);
    const { useCase } = crear();
    await useCase.execute(input([{ cursoId: 100, bloques: [bloque()] }]));
    expect(mockAsignacion.create).toHaveBeenCalledWith({
      gestionPlanId: 22, ofertaCursoId: 100, docenteId: null, vigente: true, activo: true,
    });
    expect(mockHorario.bulkCreate.mock.calls[0][0][0].asignacionDocenteId).toBe(600);
  });

  it('sincroniza: elimina los bloques que ya no están y actualiza orden/aula de los que quedan', async () => {
    mockHorario.findAll.mockResolvedValue([
      { id: 1, asignacionDocenteId: 500, horarioId: 900, ordenSecuencia: 5, aulaId: 3 },
      { id: 2, asignacionDocenteId: 500, horarioId: 777, ordenSecuencia: 2, aulaId: null },
    ]);
    const { useCase } = crear();
    const res = await useCase.execute(input([{ cursoId: 100, bloques: [bloque()] }]));

    expect(mockHorario.destroy).toHaveBeenCalledWith({ where: { id: [2] }, transaction: 'TX' });
    expect(mockHorario.update).toHaveBeenCalledWith(
      { ordenSecuencia: 1, aulaId: null }, { where: { id: 1 }, transaction: 'TX' },
    );
    expect(mockHorario.bulkCreate).not.toHaveBeenCalled();
    expect(res.persistencia).toEqual({ paraleloId: 1, created: 0, updated: 1, deleted: 1 });
  });

  it('bloque idéntico al existente no genera cambios', async () => {
    mockHorario.findAll.mockResolvedValue([{ id: 1, asignacionDocenteId: 500, horarioId: 900, ordenSecuencia: 1, aulaId: null }]);
    const { useCase } = crear();
    const res = await useCase.execute(input([{ cursoId: 100, bloques: [bloque()] }]));
    expect(res.persistencia).toEqual({ paraleloId: 1, created: 0, updated: 0, deleted: 0 });
  });

  it('cursoId con bloques vacíos elimina todos sus bloques', async () => {
    mockHorario.findAll.mockResolvedValue([{ id: 1, asignacionDocenteId: 500, horarioId: 900, ordenSecuencia: 1, aulaId: null }]);
    const { useCase } = crear();
    const res = await useCase.execute(input([{ cursoId: 100 }]));
    expect(mockHorario.destroy).toHaveBeenCalledWith({ where: { id: [1] }, transaction: 'TX' });
    expect(res.persistencia.deleted).toBe(1);
  });
});
