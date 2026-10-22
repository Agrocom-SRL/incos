import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CreateCursoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/CreateCursoCapacitacionUseCase.js'
);

describe('CreateCursoCapacitacionUseCase', () => {
  const body = { titulo: ' Excel ', fechaInicio: '2999-01-01', fechaFin: '2999-02-01' };
  const crear = ({ aula = { id: 1 }, horario = { id: 1 } } = {}) => {
    const gruposGuardados = [];
    const bloquesGuardados = [];
    const deps = {
      cursoCapacitacionRepository: {
        create: jest.fn().mockImplementation(async (d) => ({ id: 20, ...d })),
      },
      capacitacionRequisitoRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation(async (d) => ({ id: 1, ...d })),
        update: jest.fn(),
        softDeleteByIds: jest.fn(),
      },
      grupoCapacitacionRepository: {
        findByCapacitacionId: jest.fn().mockImplementation(async () => [...gruposGuardados]),
        create: jest.fn().mockImplementation(async (d) => {
          const g = { id: 100 + gruposGuardados.length, ...d };
          gruposGuardados.push(g);
          return g;
        }),
        update: jest.fn(),
        softDeleteByIds: jest.fn(),
      },
      bloqueCapacitacionRepository: {
        findByCapacitacionId: jest.fn().mockImplementation(async () => [...bloquesGuardados]),
        create: jest.fn().mockImplementation(async (d) => {
          const b = { id: 200 + bloquesGuardados.length, ...d };
          bloquesGuardados.push(b);
          return b;
        }),
        update: jest.fn(),
        softDeleteByIds: jest.fn(),
      },
      inscripcionCapacitacionRepository: { countVigentesByGrupoIds: jest.fn() },
      scheduleRepository: { findById: jest.fn().mockResolvedValue(horario) },
      classroomRepository: { findById: jest.fn().mockResolvedValue(aula) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateCursoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('crea el curso siempre PROPUESTO, gratuito y sin grupos por defecto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ ...body, estado: 'ABIERTO' }, 4);
    expect(deps.cursoCapacitacionRepository.create).toHaveBeenCalledWith(
      {
        titulo: 'Excel',
        descripcion: null,
        tieneCosto: false,
        costo: 0,
        cobraMatricula: false,
        costoMatricula: 0,
        entidadCertificadora: null,
        modalidad: 'PRESENCIAL',
        nivel: null,
        dirigidoA: null,
        duracion: null,
        cupoMaximo: 30,
        fechaInicio: '2999-01-01',
        fechaFin: '2999-02-01',
        estado: 'PROPUESTO',
      },
      4,
      { transaction: 'TX' }
    );
    expect(deps.grupoCapacitacionRepository.create).not.toHaveBeenCalled();
    expect(res.cursoCapacitacion).toMatchObject({ id: 20, estado: 'PROPUESTO', grupos: [] });
  });

  describe('costos condicionales', () => {
    it('con tieneCosto el costo es obligatorio y mayor a 0', async () => {
      const { deps, useCase } = crear();
      await expect(useCase.execute({ ...body, tieneCosto: true })).rejects.toThrow(/costo es obligatorio/);
      await expect(useCase.execute({ ...body, tieneCosto: true, costo: 0 })).rejects.toBeInstanceOf(ValidationError);
      await expect(useCase.execute({ ...body, tieneCosto: true, costo: 'abc' })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('con cobraMatricula la matrícula es obligatoria y mayor a 0', async () => {
      const { useCase } = crear();
      await expect(useCase.execute({ ...body, cobraMatricula: true })).rejects.toThrow(/costoMatricula es obligatorio/);
      await expect(useCase.execute({ ...body, cobraMatricula: true, costoMatricula: -5 })).rejects.toBeInstanceOf(
        ValidationError
      );
    });

    it('guarda los montos solo si su interruptor está activo; apagado se ignora lo enviado y vale 0', async () => {
      const { deps, useCase } = crear();
      await useCase.execute({ ...body, tieneCosto: true, costo: 440, cobraMatricula: false, costoMatricula: 150 });
      expect(deps.cursoCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
        tieneCosto: true, costo: 440, cobraMatricula: false, costoMatricula: 0,
      });
      await useCase.execute({ ...body, tieneCosto: false, costo: 99, cobraMatricula: true, costoMatricula: '150' });
      expect(deps.cursoCapacitacionRepository.create.mock.calls[1][0]).toMatchObject({
        tieneCosto: false, costo: 0, cobraMatricula: true, costoMatricula: 150,
      });
    });

    it('rechaza interruptores que no son booleanos', async () => {
      const { useCase } = crear();
      await expect(useCase.execute({ ...body, tieneCosto: 'quizás' })).rejects.toBeInstanceOf(ValidationError);
    });
  });

  it('valida aula, y crea grupos con sus horarios en la misma transacción', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      {
        ...body,
        cupoMaximo: '12',
        activo: false,
        grupos: [
          { nombre: ' Grupo 1 – Mañana ', cupoMaximo: 15, aulaId: 3, horarios: [{ horarioId: '5' }, { horarioId: 6 }] },
          { nombre: 'Grupo 2 – Tarde', horarios: [{ horarioId: 5 }] },
        ],
      },
      4
    );
    expect(deps.classroomRepository.findById).toHaveBeenCalledWith(3);
    expect(deps.classroomRepository.findById).toHaveBeenCalledTimes(1);
    expect(deps.scheduleRepository.findById).toHaveBeenCalledTimes(2); // ids únicos 5 y 6
    expect(deps.grupoCapacitacionRepository.create).toHaveBeenNthCalledWith(
      1,
      { capacitacionId: 20, nombre: 'Grupo 1 – Mañana', cupoMaximo: 15, aulaId: 3, orden: 1 },
      4,
      { transaction: 'TX' }
    );
    expect(deps.grupoCapacitacionRepository.create).toHaveBeenNthCalledWith(
      2,
      { capacitacionId: 20, nombre: 'Grupo 2 – Tarde', cupoMaximo: null, aulaId: null, orden: 2 },
      4,
      { transaction: 'TX' }
    );
    expect(deps.bloqueCapacitacionRepository.create).toHaveBeenCalledTimes(3);
    expect(deps.bloqueCapacitacionRepository.create.mock.calls[0][0]).toEqual({
      capacitacionId: 20, grupoId: 100, horarioId: 5, ordenSecuencia: 1,
    });
    expect(res.cursoCapacitacion.grupos).toHaveLength(2);
    expect(res.cursoCapacitacion.grupos[0]).toMatchObject({ id: 100, nombre: 'Grupo 1 – Mañana', cupoMaximo: 15, aulaId: 3 });
    expect(res.cursoCapacitacion.aulaId).toBeUndefined();
    expect(res.cursoCapacitacion.grupos[0].horarios.map((h) => h.horarioId)).toEqual([5, 6]);
    expect(res.cursoCapacitacion.grupos[1].horarios.map((h) => h.horarioId)).toEqual([5]);
    expect(deps.cursoCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({ cupoMaximo: 12, activo: false });
  });

  it.each([
    ['grupos no array', 'x'],
    ['grupo no objeto', ['x']],
    ['sin nombre', [{ horarios: [] }]],
    ['nombre largo', [{ nombre: 'x'.repeat(61) }]],
    ['cupo inválido', [{ nombre: 'G', cupoMaximo: 0 }]],
    ['horarios no array', [{ nombre: 'G', horarios: 'x' }]],
    ['horarioId inválido', [{ nombre: 'G', horarios: [{ horarioId: 0 }] }]],
    ['horario repetido en el grupo', [{ nombre: 'G', horarios: [{ horarioId: 1 }, { horarioId: 1 }] }]],
    ['id de grupo repetido', [{ id: 1, nombre: 'A' }, { id: 1, nombre: 'B' }]],
  ])('rechaza grupos inválidos (%s)', async (_n, grupos) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, grupos })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('un mismo horario puede estar en grupos distintos pero no repetirse en uno', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ ...body, grupos: [{ nombre: 'A', horarios: [{ horarioId: 1 }] }, { nombre: 'B', horarios: [{ horarioId: 1 }] }] })
    ).resolves.toBeDefined();
  });

  it('lanza NotFoundError si un horario o el aula no existen y no crea nada', async () => {
    const sinHorario = crear({ horario: null });
    await expect(
      sinHorario.useCase.execute({ ...body, grupos: [{ nombre: 'G', horarios: [{ horarioId: 1 }] }] })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(sinHorario.deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
    const sinAula = crear({ aula: null });
    await expect(
      sinAula.useCase.execute({ ...body, grupos: [{ nombre: 'G', aulaId: 99 }] })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(sinAula.deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('acepta horarios de tipo CAPACITACION y CLASES, y rechaza otros tipos', async () => {
    const grupos = [{ nombre: 'G', horarios: [{ horarioId: 1 }] }];
    for (const tipo of ['CAPACITACION', 'CLASES']) {
      const { useCase } = crear({ horario: { id: 1, scheduleType: tipo } });
      await expect(useCase.execute({ ...body, grupos })).resolves.toBeDefined();
    }
    const feriado = crear({ horario: { id: 1, scheduleType: 'FERIADOS' } });
    await expect(feriado.useCase.execute({ ...body, grupos })).rejects.toBeInstanceOf(ValidationError);
    expect(feriado.deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['   ']])('rechaza titulo vacío (%p)', async (titulo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, titulo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('exige fechaInicio y rechaza fechas que no existen o fechaFin anterior', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...body, fechaInicio: undefined })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, fechaInicio: '2999-02-31' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, fechaFin: 'mañana' })).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ ...body, fechaInicio: '2999-03-01', fechaFin: '2999-02-01' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[undefined], [null], ['']])('fechaFin es opcional (%p): se guarda null', async (fechaFin) => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ ...body, fechaFin, duracion: ' 2 meses ' });
    expect(deps.cursoCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({ fechaFin: null, duracion: '2 meses' });
    expect(res.cursoCapacitacion.fechaFin).toBeNull();
  });

  it('el aula es opcional por grupo: sin aulaId no consulta el catálogo y el curso ya no la lleva', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ ...body, aulaId: 7, grupos: [{ nombre: 'G', aulaId: '' }] });
    expect(deps.classroomRepository.findById).not.toHaveBeenCalled();
    expect(deps.cursoCapacitacionRepository.create.mock.calls[0][0].aulaId).toBeUndefined();
    expect(deps.grupoCapacitacionRepository.create.mock.calls[0][0].aulaId).toBeNull();
  });

  it('guarda entidad certificadora, modalidad, nivel y dirigidoA', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({
      ...body, entidadCertificadora: ' IPELC ', modalidad: 'semipresencial', nivel: 'Básico', dirigidoA: 'Público en general',
    });
    expect(deps.cursoCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
      entidadCertificadora: 'IPELC', modalidad: 'SEMIPRESENCIAL', nivel: 'Básico', dirigidoA: 'Público en general',
    });
    expect(res.cursoCapacitacion).toMatchObject({ modalidad: 'SEMIPRESENCIAL', tieneCosto: false, cobraMatricula: false });
  });

  it.each([['ONLINE'], [5]])('rechaza modalidad inválida (%p)', async (modalidad) => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...body, modalidad })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza textos demasiado largos y cupo inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...body, nivel: 'x'.repeat(61) })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, cupoMaximo: 0 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('sincroniza requisitos[] en la misma transacción', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(
      { ...body, requisitos: [{ descripcion: ' Fotocopia de cédula ', obligatorio: true }, { descripcion: 'Formulario', obligatorio: false, acreditaPagoCurso: false, orden: 5 }] },
      4
    );
    const repo = deps.capacitacionRequisitoRepository;
    expect(repo.create).toHaveBeenNthCalledWith(
      1, { capacitacionId: 20, descripcion: 'Fotocopia de cédula', obligatorio: true, acreditaPagoCurso: false, orden: 1 }, 4, { transaction: 'TX' }
    );
    expect(repo.create).toHaveBeenNthCalledWith(
      2, { capacitacionId: 20, descripcion: 'Formulario', obligatorio: false, acreditaPagoCurso: false, orden: 5 }, 4, { transaction: 'TX' }
    );
  });

  it.each([
    ['no array', 'x'],
    ['sin descripcion', [{ obligatorio: true }]],
    ['descripcion larga', [{ descripcion: 'x'.repeat(256) }]],
    ['obligatorio inválido', [{ descripcion: 'a', obligatorio: 'quizás' }]],
    ['id repetido', [{ id: 1, descripcion: 'a' }, { id: 1, descripcion: 'b' }]],
  ])('rechaza requisitos inválidos (%s)', async (_n, requisitos) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, requisitos })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });
});
