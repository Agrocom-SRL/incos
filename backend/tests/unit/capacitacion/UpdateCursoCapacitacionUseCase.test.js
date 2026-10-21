import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdateCursoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/UpdateCursoCapacitacionUseCase.js'
);

describe('UpdateCursoCapacitacionUseCase', () => {
  const existing = {
    id: 2, titulo: 'Viejo', estado: 'PROPUESTO', fechaInicio: '2999-01-01', fechaFin: '2999-02-01',
    tieneCosto: true, costo: 440, cobraMatricula: false, costoMatricula: 0,
  };
  const grupoA = { id: 10, nombre: 'Grupo 1', cupoMaximo: null, orden: 1 };
  const grupoB = { id: 11, nombre: 'Grupo 2', cupoMaximo: 20, orden: 2 };

  const crear = ({
    found = existing, aula = { id: 1 }, horario = { id: 1 },
    grupos = [grupoA, grupoB], bloques = [], inscritos = {},
  } = {}) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(found),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...existing, ...d })),
      },
      capacitacionRequisitoRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue([{ id: 1, descripcion: 'Cédula', obligatorio: true, orden: 1 }]),
        create: jest.fn().mockImplementation(async (d) => ({ id: 99, ...d })),
        update: jest.fn(),
        softDeleteByIds: jest.fn(),
      },
      grupoCapacitacionRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue(grupos),
        create: jest.fn().mockImplementation(async (d) => ({ id: 500, ...d })),
        update: jest.fn().mockImplementation(async (id, d) => ({ id, ...d })),
        softDeleteByIds: jest.fn(),
      },
      bloqueCapacitacionRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue(bloques),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn(),
        softDeleteByIds: jest.fn(),
      },
      inscripcionCapacitacionRepository: {
        countVigentesByGrupoIds: jest.fn().mockImplementation(async (ids) =>
          Object.fromEntries(ids.map((id) => [id, inscritos[id] ?? 0]))),
      },
      scheduleRepository: { findById: jest.fn().mockResolvedValue(horario) },
      classroomRepository: { findById: jest.fn().mockResolvedValue(aula) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateCursoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('actualiza campos, ignora estado y devuelve grupos y requisitos actuales', async () => {
    const { deps, useCase } = crear({ bloques: [{ id: 1, grupoId: 10, horarioId: 7, ordenSecuencia: 1 }] });
    const res = await useCase.execute(2, { titulo: ' Nuevo ', estado: 'CERRADO' }, 3);
    expect(deps.cursoCapacitacionRepository.findById).toHaveBeenCalledWith(2, { paranoid: false });
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(2, { titulo: 'Nuevo' }, 3, { transaction: 'TX' });
    expect(deps.grupoCapacitacionRepository.create).not.toHaveBeenCalled();
    expect(res.cursoCapacitacion).toMatchObject({ titulo: 'Nuevo', estado: 'PROPUESTO' });
    expect(res.cursoCapacitacion.grupos[0]).toMatchObject({ id: 10, horarios: [{ capacitacionHorarioId: 1, horarioId: 7 }] });
    expect(res.cursoCapacitacion.requisitos).toEqual([{ id: 1, descripcion: 'Cédula', obligatorio: true, orden: 1 }]);
  });

  it('body vacío no actualiza nada', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, {});
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  describe('costos condicionales en edición parcial', () => {
    it('los interruptores no enviados conservan su valor: costo se actualiza si tieneCosto sigue activo', async () => {
      const { deps, useCase } = crear();
      await useCase.execute(2, { costo: 500 });
      expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ costo: 500 });
    });

    it('sin tocar costo ni interruptor no se modifica el costo existente', async () => {
      const { deps, useCase } = crear();
      await useCase.execute(2, { titulo: 'x' });
      expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ titulo: 'x' });
    });

    it('apagar tieneCosto pone costo en 0 aunque se envíe un monto', async () => {
      const { deps, useCase } = crear();
      await useCase.execute(2, { tieneCosto: false, costo: 999 });
      expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ tieneCosto: false, costo: 0 });
    });

    it('encender cobraMatricula exige costoMatricula mayor a 0', async () => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(2, { cobraMatricula: true })).rejects.toThrow(/costoMatricula es obligatorio/);
      await expect(useCase.execute(2, { cobraMatricula: true, costoMatricula: 0 })).rejects.toBeInstanceOf(ValidationError);
      await useCase.execute(2, { cobraMatricula: true, costoMatricula: 150 });
      expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ cobraMatricula: true, costoMatricula: 150 });
    });

    it.each([['abc'], [-5], [0], [null], ['']])('con tieneCosto activo rechaza costo inválido (%p)', async (costo) => {
      const { useCase } = crear();
      await expect(useCase.execute(2, { costo })).rejects.toBeInstanceOf(ValidationError);
    });
  });

  it('actualiza los campos nuevos del curso', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { entidadCertificadora: 'IPELC', modalidad: 'virtual', nivel: null, dirigidoA: 'Todos', duracion: '2 meses' });
    expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({
      entidadCertificadora: 'IPELC', modalidad: 'VIRTUAL', nivel: null, dirigidoA: 'Todos', duracion: '2 meses',
    });
  });

  it('fechaFin null o vacía la deja sin fecha de fin y un curso sin fin acepta cualquier inicio', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { fechaFin: null });
    expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ fechaFin: null });
    const sinFin = crear({ found: { ...existing, fechaFin: null } });
    await expect(sinFin.useCase.execute(2, { fechaInicio: '2999-12-31' })).resolves.toBeDefined();
  });

  it('valida coherencia de fechas contra los valores existentes', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(2, { fechaFin: '2998-01-01' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(2, { fechaInicio: '2999-12-31' })).rejects.toBeInstanceOf(ValidationError);
  });

  describe('sincronización de grupos', () => {
    it('conserva ids, actualiza, crea nuevos y da de baja los ausentes (sin inscritos)', async () => {
      const { deps, useCase } = crear({
        bloques: [
          { id: 1, grupoId: 10, horarioId: 7, ordenSecuencia: 1 },
          { id: 2, grupoId: 10, horarioId: 8, ordenSecuencia: 2 },
          { id: 3, grupoId: 11, horarioId: 7, ordenSecuencia: 1 },
        ],
      });
      await useCase.execute(
        2,
        {
          grupos: [
            { id: 10, nombre: ' Grupo 1 – Mañana ', cupoMaximo: 15, horarios: [{ horarioId: 8 }, { horarioId: 9 }] },
            { nombre: 'Grupo nuevo', horarios: [{ horarioId: 7 }] },
          ],
        },
        3
      );
      const g = deps.grupoCapacitacionRepository;
      expect(g.update).toHaveBeenCalledWith(10, { nombre: 'Grupo 1 – Mañana', cupoMaximo: 15, aulaId: null, orden: 1 }, 3, { transaction: 'TX' });
      expect(g.create).toHaveBeenCalledWith({ capacitacionId: 2, nombre: 'Grupo nuevo', cupoMaximo: null, aulaId: null, orden: 2 }, 3, { transaction: 'TX' });
      expect(g.softDeleteByIds).toHaveBeenCalledWith([11], 3, { transaction: 'TX' });
      const b = deps.bloqueCapacitacionRepository;
      // grupo 10: se quita el horario 7 (bloque 1), se conserva el 8 (reordenado a 1) y se crea el 9
      expect(b.softDeleteByIds).toHaveBeenCalledWith([1], 3, { transaction: 'TX' });
      expect(b.update).toHaveBeenCalledWith(2, { ordenSecuencia: 1 }, 3, { transaction: 'TX' });
      expect(b.create).toHaveBeenCalledWith({ capacitacionId: 2, grupoId: 10, horarioId: 9, ordenSecuencia: 2 }, 3, { transaction: 'TX' });
      // grupo nuevo (id 500): crea su bloque
      expect(b.create).toHaveBeenCalledWith({ capacitacionId: 2, grupoId: 500, horarioId: 7, ordenSecuencia: 1 }, 3, { transaction: 'TX' });
      // bloques del grupo 11 dado de baja
      expect(b.softDeleteByIds).toHaveBeenCalledWith([3], 3, { transaction: 'TX' });
    });

    it('quitar solo bloques de un grupo con inscritos está permitido', async () => {
      const { deps, useCase } = crear({
        bloques: [{ id: 1, grupoId: 10, horarioId: 7, ordenSecuencia: 1 }],
        inscritos: { 10: 4 },
      });
      await expect(
        useCase.execute(2, { grupos: [{ id: 10, nombre: 'Grupo 1', horarios: [] }, { id: 11, nombre: 'Grupo 2' }] })
      ).resolves.toBeDefined();
      expect(deps.bloqueCapacitacionRepository.softDeleteByIds).toHaveBeenCalledWith([1], null, { transaction: 'TX' });
    });

    it('quitar un grupo con inscripciones vigentes responde 409 con el detalle y no borra nada', async () => {
      const { deps, useCase } = crear({ inscritos: { 11: 3 } });
      const error = await useCase.execute(2, { grupos: [{ id: 10, nombre: 'Grupo 1' }] }).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.details).toEqual([{ grupoId: 11, nombre: 'Grupo 2', inscritos: 3 }]);
      expect(error.message).toMatch(/Grupo 2/);
      expect(deps.grupoCapacitacionRepository.softDeleteByIds).not.toHaveBeenCalled();
      expect(deps.bloqueCapacitacionRepository.softDeleteByIds).not.toHaveBeenCalled();
    });

    it('grupos: [] quita todos (409 si alguno tiene inscritos); sin la clave no toca los grupos', async () => {
      const libre = crear();
      await libre.useCase.execute(2, { grupos: [] }, 3);
      expect(libre.deps.grupoCapacitacionRepository.softDeleteByIds).toHaveBeenCalledWith([10, 11], 3, { transaction: 'TX' });
      const ocupado = crear({ inscritos: { 10: 1 } });
      await expect(ocupado.useCase.execute(2, { grupos: [] })).rejects.toBeInstanceOf(ConflictError);
      const sinClave = crear();
      await sinClave.useCase.execute(2, { titulo: 'x' });
      expect(sinClave.deps.grupoCapacitacionRepository.softDeleteByIds).not.toHaveBeenCalled();
    });

    it('un id de grupo que no es del curso da NotFound', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(2, { grupos: [{ id: 999, nombre: 'X' }] })).rejects.toBeInstanceOf(NotFoundError);
    });

    it('valida existencia y tipo de los horarios', async () => {
      const grupos = [{ nombre: 'G', horarios: [{ horarioId: 1 }] }];
      await expect(crear({ horario: null }).useCase.execute(2, { grupos })).rejects.toBeInstanceOf(NotFoundError);
      await expect(
        crear({ horario: { id: 1, scheduleType: 'EVENTOS' } }).useCase.execute(2, { grupos })
      ).rejects.toBeInstanceOf(ValidationError);
      await expect(
        crear({ horario: { id: 1, scheduleType: 'CAPACITACION' } }).useCase.execute(2, { grupos })
      ).resolves.toBeDefined();
    });

    it.each([['x'], [[{ nombre: '' }]], [[{ nombre: 'G', horarios: [{ horarioId: 1 }, { horarioId: 1 }] }]]])(
      'rechaza grupos inválidos (%p)',
      async (grupos) => {
        const { deps, useCase } = crear();
        await expect(useCase.execute(2, { grupos })).rejects.toBeInstanceOf(ValidationError);
        expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
      }
    );
  });

  it('el aula va por grupo: se valida contra el catálogo si viene y es opcional', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { grupos: [{ id: 10, nombre: 'G1', aulaId: 4 }, { id: 11, nombre: 'G2', aulaId: null }] }, 3);
    expect(deps.classroomRepository.findById).toHaveBeenCalledTimes(1);
    expect(deps.classroomRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.grupoCapacitacionRepository.update).toHaveBeenCalledWith(
      10, { nombre: 'G1', cupoMaximo: null, aulaId: 4, orden: 1 }, 3, { transaction: 'TX' }
    );
    expect(deps.grupoCapacitacionRepository.update).toHaveBeenCalledWith(
      11, { nombre: 'G2', cupoMaximo: null, aulaId: null, orden: 2 }, 3, { transaction: 'TX' }
    );
    await expect(
      crear({ aula: null }).useCase.execute(2, { grupos: [{ id: 10, nombre: 'G1', aulaId: 8 }] })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('el curso ya no recibe aulaId: se ignora y no se consulta el catálogo', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { aulaId: 5, titulo: 'x' });
    expect(deps.classroomRepository.findById).not.toHaveBeenCalled();
    expect(deps.cursoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ titulo: 'x' });
  });

  it('sincroniza requisitos: actualiza los que traen id, crea los nuevos y da de baja los ausentes', async () => {
    const { deps, useCase } = crear();
    deps.capacitacionRequisitoRepository.findByCapacitacionId.mockResolvedValue([
      { id: 1, descripcion: 'A', obligatorio: true, orden: 1 },
      { id: 2, descripcion: 'B', obligatorio: true, orden: 2 },
    ]);
    await useCase.execute(2, { requisitos: [{ id: 1, descripcion: ' A2 ', obligatorio: false }, { descripcion: 'C' }] }, 3);
    const repo = deps.capacitacionRequisitoRepository;
    expect(repo.update).toHaveBeenCalledWith(1, { descripcion: 'A2', obligatorio: false, orden: 1 }, 3, { transaction: 'TX' });
    expect(repo.create).toHaveBeenCalledWith({ capacitacionId: 2, descripcion: 'C', obligatorio: true, orden: 2 }, 3, { transaction: 'TX' });
    expect(repo.softDeleteByIds).toHaveBeenCalledWith([2], 3, { transaction: 'TX' });
  });

  it('requisitos: [] da de baja todos; sin la clave no toca los requisitos; id ajeno da NotFound', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { requisitos: [] }, 3);
    expect(deps.capacitacionRequisitoRepository.softDeleteByIds).toHaveBeenCalledWith([1], 3, { transaction: 'TX' });
    deps.capacitacionRequisitoRepository.softDeleteByIds.mockClear();
    await useCase.execute(2, { titulo: 'x' }, 3);
    expect(deps.capacitacionRequisitoRepository.softDeleteByIds).not.toHaveBeenCalled();
    await expect(useCase.execute(2, { requisitos: [{ id: 77, descripcion: 'x' }] })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { deps, useCase } = crear({ found: null });
    await expect(useCase.execute(9, { titulo: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each([[''], ['   '], [null]])('rechaza titulo vacío (%p)', async (titulo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { titulo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });
});
