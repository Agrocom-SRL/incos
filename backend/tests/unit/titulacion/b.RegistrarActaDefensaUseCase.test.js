import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { RegistrarActaDefensaUseCase } = await import(
  '../../../src/application/use-cases/titulacion/RegistrarActaDefensaUseCase.js'
);

describe('RegistrarActaDefensaUseCase', () => {
  const docente = (id) => ({ id, lastName: `Ap${id}`, motherLastName: `Am${id}`, firstName: `N${id}` });
  const tribunalOk = [{ docenteId: 1, cargo: 'PRESIDENTE' }, { docenteId: 2 }, { docenteId: 3 }];
  const integrantesBase = [
    { estudianteId: 20, rol: 'INTEGRANTE', estado: 'ACTIVO' },
    { estudianteId: 10, rol: 'TITULAR', estado: 'ACTIVO' },
    { estudianteId: 30, rol: 'INTEGRANTE', estado: 'RETIRADO' },
  ];

  const crear = ({
    proyecto = { id: 7, estado: 'DEFENSA', gestionId: 4 },
    integrantes = integrantesBase,
    politicaRow = null,
    maxActa = 11,
    existente = null,
    actaEmitida = null,
    teachers = { 1: docente(1), 2: docente(2), 3: docente(3) },
  } = {}) => {
    const deps = {
      actaDefensaRepository: {
        createConTribunal: jest.fn(async (data) => ({ id: data.estudianteId * 100, ...data })),
        findEmitidaByProyectoEstudiante: jest.fn().mockResolvedValue(actaEmitida),
        maxNumeroActaByGestion: jest.fn().mockResolvedValue(maxActa),
        findBy: jest.fn().mockResolvedValue(existente),
      },
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      integranteProyectoRepository: {
        findByProyectoGradoId: jest.fn().mockResolvedValue(integrantes),
      },
      teacherRepository: {
        findById: jest.fn(async (id) => teachers[id] ?? null),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn() },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(politicaRow),
      },
      aprobarEtapaProyectoUseCase: { execute: jest.fn().mockResolvedValue({}) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new RegistrarActaDefensaUseCase(deps) };
  };

  const bodyOk = (o = {}) => ({
    fechaDefensa: '2026-12-01',
    horaInicio: '09:00',
    horaConclusion: '10:00',
    calificaciones: [
      { estudianteId: 10, calificacionFinal: 85 },
      { estudianteId: 20, calificacionFinal: 50 },
    ],
    tribunal: tribunalOk,
    ...o,
  });

  beforeEach(() => {
    mockTransaction.mockClear();
  });

  describe('camino feliz', () => {
    it('crea un acta por integrante activo con numeración correlativa y tribunal', async () => {
      const { useCase, deps } = crear();
      const r = await useCase.execute(7, bodyOk({ observaciones: 'ok' }), 99);

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(deps.actaDefensaRepository.maxNumeroActaByGestion).toHaveBeenCalledWith(4);
      const llamadas = deps.actaDefensaRepository.createConTribunal.mock.calls;
      expect(llamadas).toHaveLength(2);

      // titular primero (10), luego 20
      const [titular, otro] = llamadas;
      expect(titular[0]).toEqual({
        proyectoGradoId: 7,
        estudianteId: 10,
        gestionId: 4,
        numeroActa: 12,
        fechaDefensa: '2026-12-01',
        horaInicio: '09:00',
        horaConclusion: '10:00',
        calificacionFinal: 85,
        resultado: 'APRUEBA',
        observaciones: 'ok',
        estado: 'EMITIDA',
      });
      expect(otro[0]).toEqual(expect.objectContaining({
        estudianteId: 20, numeroActa: 13, resultado: 'REPRUEBA', calificacionFinal: 50,
      }));
      expect(titular[1]).toEqual([
        { orden: 1, docenteId: 1, nombreCompleto: 'Ap1 Am1 N1', cargo: 'PRESIDENTE' },
        { orden: 2, docenteId: 2, nombreCompleto: 'Ap2 Am2 N2', cargo: undefined },
        { orden: 3, docenteId: 3, nombreCompleto: 'Ap3 Am3 N3', cargo: undefined },
      ]);
      expect(titular[2]).toBe(99);
      expect(titular[3]).toEqual({ transaction: 'TX' });
      expect(r.actasDefensa).toHaveLength(2);
      expect(r.actasDefensa[0].numeroActaFormateado).toBe('012');
    });

    it('no incluye integrantes RETIRADOS', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(7, bodyOk());
      const ids = deps.actaDefensaRepository.createConTribunal.mock.calls.map((c) => c[0].estudianteId);
      expect(ids).not.toContain(30);
    });

    it('delega la transición a APROBADO según la acta del titular', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(7, bodyOk(), 99);
      expect(deps.aprobarEtapaProyectoUseCase.execute).toHaveBeenCalledWith(
        7,
        { estado: 'APROBADO', fecha: '2026-12-01', nota: 85 },
        99
      );
    });

    it('delega la transición a REPROBADO si el titular no alcanza la nota mínima', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(7, bodyOk({
        calificaciones: [
          { estudianteId: 10, calificacionFinal: 60 },
          { estudianteId: 20, calificacionFinal: 90 },
        ],
      }));
      expect(deps.aprobarEtapaProyectoUseCase.execute).toHaveBeenCalledWith(
        7, { estado: 'REPROBADO', fecha: '2026-12-01', nota: 60 }, null
      );
    });

    it('la nota mínima 61 es aprobatoria (borde)', async () => {
      const { useCase, deps } = crear({
        integrantes: [{ estudianteId: 10, rol: 'TITULAR', estado: 'ACTIVO' }],
      });
      await useCase.execute(7, bodyOk({ calificaciones: [{ estudianteId: 10, calificacionFinal: 61 }] }));
      expect(deps.actaDefensaRepository.createConTribunal.mock.calls[0][0].resultado).toBe('APRUEBA');
    });

    it('usa la nota mínima de la política de la gestión', async () => {
      const { useCase, deps } = crear({
        integrantes: [{ estudianteId: 10, rol: 'TITULAR', estado: 'ACTIVO' }],
        politicaRow: { valor: JSON.stringify({ notaMinimaAprobacion: 70 }) },
      });
      await useCase.execute(7, bodyOk({ calificaciones: [{ estudianteId: 10, calificacionFinal: 65 }] }));
      expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(4);
      expect(deps.actaDefensaRepository.createConTribunal.mock.calls[0][0].resultado).toBe('REPRUEBA');
    });

    it('acepta número de acta manual y verifica cada número consecutivo', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(7, bodyOk({ numeroActa: '40' }));
      expect(deps.actaDefensaRepository.maxNumeroActaByGestion).not.toHaveBeenCalled();
      expect(deps.actaDefensaRepository.findBy).toHaveBeenCalledWith({ gestionId: 4, numeroActa: 40 });
      expect(deps.actaDefensaRepository.findBy).toHaveBeenCalledWith({ gestionId: 4, numeroActa: 41 });
      const nums = deps.actaDefensaRepository.createConTribunal.mock.calls.map((c) => c[0].numeroActa);
      expect(nums).toEqual([40, 41]);
    });

    it('sin horaConclusion la guarda como null', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(7, bodyOk({ horaConclusion: undefined }));
      expect(deps.actaDefensaRepository.createConTribunal.mock.calls[0][0].horaConclusion).toBeNull();
    });
  });

  describe('proyecto y estado', () => {
    it('proyecto inexistente -> NotFoundError', async () => {
      const { useCase, deps } = crear({ proyecto: null });
      await expect(useCase.execute(99, bodyOk())).rejects.toThrow(NotFoundError);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });

    it.each(['PERFIL', 'PREDEFENSA', 'APROBADO', 'REPROBADO', 'CANCELADO'])(
      'estado %s distinto de DEFENSA -> ConflictError',
      async (estado) => {
        const { useCase, deps } = crear({ proyecto: { id: 7, estado, gestionId: 4 } });
        await expect(useCase.execute(7, bodyOk())).rejects.toThrow(ConflictError);
        expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
        expect(deps.aprobarEtapaProyectoUseCase.execute).not.toHaveBeenCalled();
      }
    );
  });

  describe('validación de horario', () => {
    it('sin fechaDefensa -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({ fechaDefensa: undefined }))).rejects.toThrow(ValidationError);
    });

    it('sin horaInicio -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({ horaInicio: '' }))).rejects.toThrow(ValidationError);
    });

    it('horaConclusion no posterior a horaInicio -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({ horaConclusion: '09:00' }))).rejects.toThrow(ValidationError);
      await expect(useCase.execute(7, bodyOk({ horaConclusion: '08:30' }))).rejects.toThrow(ValidationError);
    });

    it('sin body -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7)).rejects.toThrow(ValidationError);
    });
  });

  describe('integrantes y calificaciones', () => {
    it('sin integrantes activos -> ValidationError', async () => {
      const { useCase } = crear({
        integrantes: [{ estudianteId: 10, rol: 'TITULAR', estado: 'RETIRADO' }],
      });
      await expect(useCase.execute(7, bodyOk())).rejects.toThrow(ValidationError);
    });

    it.each([undefined, null, [], 'x'])('calificaciones %p inválidas -> ValidationError', async (v) => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({ calificaciones: v }))).rejects.toThrow(ValidationError);
    });

    it.each([0, -1, 1.5, 'abc', null])('estudianteId %p inválido -> ValidationError', async (id) => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [{ estudianteId: id, calificacionFinal: 80 }, { estudianteId: 20, calificacionFinal: 80 }],
      }))).rejects.toThrow(ValidationError);
    });

    it.each([-1, 101, 'abc', NaN, undefined, Infinity, null, '', '  '])(
      'calificacionFinal %p fuera de rango o no numérica -> ValidationError',
      async (nota) => {
        const { useCase } = crear();
        await expect(useCase.execute(7, bodyOk({
          calificaciones: [
            { estudianteId: 10, calificacionFinal: nota },
            { estudianteId: 20, calificacionFinal: 80 },
          ],
        }))).rejects.toThrow(ValidationError);
      }
    );

    it('una nota ausente (null o vacía) no se emite como 0 que REPRUEBA: no crea actas', async () => {
      const { useCase, deps } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [
          { estudianteId: 10, calificacionFinal: null },
          { estudianteId: 20, calificacionFinal: 80 },
        ],
      }))).rejects.toThrow(ValidationError);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });

    it('estudiante repetido en calificaciones -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [
          { estudianteId: 10, calificacionFinal: 70 },
          { estudianteId: 10, calificacionFinal: 90 },
          { estudianteId: 20, calificacionFinal: 80 },
        ],
      }))).rejects.toThrow(ValidationError);
    });

    it('calificaciones sin un integrante activo (faltante) -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [{ estudianteId: 10, calificacionFinal: 80 }],
      }))).rejects.toThrow(ValidationError);
    });

    it('calificación de un estudiante ajeno (sobrante) -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [
          { estudianteId: 10, calificacionFinal: 80 },
          { estudianteId: 20, calificacionFinal: 80 },
          { estudianteId: 99, calificacionFinal: 80 },
        ],
      }))).rejects.toThrow(ValidationError);
    });

    it('calificación de un integrante RETIRADO en lugar de un activo -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        calificaciones: [
          { estudianteId: 10, calificacionFinal: 80 },
          { estudianteId: 30, calificacionFinal: 80 },
        ],
      }))).rejects.toThrow(ValidationError);
    });

    it('integrante con acta EMITIDA previa -> ConflictError sin crear actas', async () => {
      const { useCase, deps } = crear({ actaEmitida: { numeroActa: 3 } });
      await expect(useCase.execute(7, bodyOk())).rejects.toThrow(ConflictError);
      expect(deps.actaDefensaRepository.findEmitidaByProyectoEstudiante).toHaveBeenCalledWith(7, 10);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });
  });

  describe('tribunal', () => {
    it('docente repetido en el tribunal -> ValidationError sin crear actas', async () => {
      const { useCase, deps } = crear();
      await expect(useCase.execute(7, bodyOk({
        tribunal: [{ docenteId: 1 }, { docenteId: 2 }, { docenteId: '2' }],
      }))).rejects.toThrow(/distintos/);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });

    it.each([undefined, null, 'x', [], [{ docenteId: 1 }, { docenteId: 2 }]])(
      'tribunal %p que no tiene exactamente 3 miembros -> ValidationError',
      async (tribunal) => {
        const { useCase } = crear();
        await expect(useCase.execute(7, bodyOk({ tribunal }))).rejects.toThrow(ValidationError);
      }
    );

    it('tribunal con 4 miembros -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        tribunal: [...tribunalOk, { docenteId: 4 }],
      }))).rejects.toThrow(ValidationError);
    });

    it.each([0, -2, 1.5, 'abc', null, undefined])('docenteId %p inválido -> ValidationError', async (docenteId) => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        tribunal: [{ docenteId }, { docenteId: 2 }, { docenteId: 3 }],
      }))).rejects.toThrow(ValidationError);
    });

    it('miembro externo sin docenteId -> ValidationError', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({
        tribunal: [{ nombreCompleto: 'Externo' }, { docenteId: 2 }, { docenteId: 3 }],
      }))).rejects.toThrow(ValidationError);
    });

    it('docente inexistente -> NotFoundError', async () => {
      const { useCase, deps } = crear({ teachers: { 1: docente(1), 2: docente(2) } });
      await expect(useCase.execute(7, bodyOk())).rejects.toThrow(NotFoundError);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });
  });

  describe('número de acta', () => {
    it.each([0, -3, 1.5, 'abc'])('numeroActa manual %p inválido -> ValidationError', async (n) => {
      const { useCase } = crear();
      await expect(useCase.execute(7, bodyOk({ numeroActa: n }))).rejects.toThrow(ValidationError);
    });

    it('número de acta ya asignado en la gestión -> ConflictError', async () => {
      const { useCase, deps } = crear({ existente: { id: 1, numeroActa: 12 } });
      await expect(useCase.execute(7, bodyOk())).rejects.toThrow(ConflictError);
      expect(deps.actaDefensaRepository.createConTribunal).not.toHaveBeenCalled();
    });

    it('sin actas previas en la gestión empieza en 1', async () => {
      const { useCase, deps } = crear({ maxActa: 0 });
      await useCase.execute(7, bodyOk());
      expect(deps.actaDefensaRepository.createConTribunal.mock.calls[0][0].numeroActa).toBe(1);
    });
  });

  describe('errores de persistencia', () => {
    it('colisión UNIQUE bajo carrera -> ConflictError y no transiciona el proyecto', async () => {
      const { useCase, deps } = crear();
      const err = new Error('dup');
      err.name = 'SequelizeUniqueConstraintError';
      deps.actaDefensaRepository.createConTribunal.mockRejectedValue(err);
      await expect(useCase.execute(7, bodyOk())).rejects.toThrow(ConflictError);
      expect(deps.aprobarEtapaProyectoUseCase.execute).not.toHaveBeenCalled();
    });

    it('otro error de persistencia se propaga tal cual', async () => {
      const { useCase, deps } = crear();
      const err = new Error('conexión perdida');
      deps.actaDefensaRepository.createConTribunal.mockRejectedValue(err);
      await expect(useCase.execute(7, bodyOk())).rejects.toBe(err);
      expect(deps.aprobarEtapaProyectoUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
