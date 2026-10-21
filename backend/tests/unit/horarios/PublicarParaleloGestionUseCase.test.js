import { describe, it, expect, jest } from '@jest/globals';
import { PublicarParaleloGestionUseCase } from '../../../src/application/use-cases/horarios/PublicarParaleloGestionUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/index.js';

const SIN_COBERTURA = { cobertura: { completa: false }, conflictos: [] };

describe('PublicarParaleloGestionUseCase', () => {
  const crear = (over = {}) => {
    const deps = {
      parallelManagementRepository: {
        findEnrichedById: jest.fn().mockResolvedValue({ id: 11, estado: 'OFERTADO', gestionId: 2 }),
        update: jest.fn().mockResolvedValue({ id: 11, state: 'PUBLICADO' }),
      },
      getParaleloGestionGrillaHorarioUseCase: {
        execute: jest.fn().mockResolvedValue({ cobertura: { completa: true }, conflictos: [] }),
      },
      getParaleloGestionCoberturaDocenteUseCase: {
        execute: jest.fn().mockResolvedValue({ cursos_total: 3, cursos_con_docente: 3 }),
      },
      getDocenteCargaGestionUseCase: { execute: jest.fn().mockResolvedValue({ sobrecarga: false }) },
      teacherAssignmentRepository: {
        findEnriched: jest.fn().mockResolvedValue({ rows: [{ docente_id: 8 }, { docente_id: 8 }, { docente_id: 9 }] }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...over,
    };
    return { deps, useCase: new PublicarParaleloGestionUseCase(deps) };
  };

  describe('evaluarPrecondiciones', () => {
    it('NotFound si el paralelo no existe', async () => {
      const { useCase, deps } = crear();
      deps.parallelManagementRepository.findEnrichedById.mockResolvedValue(null);
      await expect(useCase.evaluarPrecondiciones(11)).rejects.toThrow(NotFoundError);
    });

    it('puede publicar cuando todo se cumple y revisa la carga de cada docente una vez', async () => {
      const { useCase, deps } = crear();
      const out = await useCase.evaluarPrecondiciones('11');

      expect(out).toEqual({ puedePublicar: true, fallas: [], gestionId: 2, paraleloGestionId: 11 });
      expect(deps.teacherAssignmentRepository.findEnriched).toHaveBeenCalledWith(
        { parallelManagementId: 11, vigente: true }, 1, 500
      );
      expect(deps.getDocenteCargaGestionUseCase.execute).toHaveBeenCalledTimes(2);
      expect(deps.getDocenteCargaGestionUseCase.execute).toHaveBeenCalledWith({ docenteId: 8, gestionId: 2 });
    });

    it.each(['BORRADOR', 'PUBLICADO', 'CERRADO', undefined])(
      'solo se publica desde OFERTADO (estado %p) y corta antes de evaluar la grilla',
      async (estado) => {
        const { useCase, deps } = crear();
        deps.parallelManagementRepository.findEnrichedById.mockResolvedValue({ id: 11, estado, gestionId: 2 });
        const out = await useCase.evaluarPrecondiciones(11);

        expect(out.puedePublicar).toBe(false);
        expect(out.fallas).toHaveLength(1);
        expect(out.fallas[0].condicion).toBe('estado');
        expect(deps.getParaleloGestionGrillaHorarioUseCase.execute).not.toHaveBeenCalled();
      }
    );

    it('el estado se compara sin distinguir mayúsculas', async () => {
      const { useCase, deps } = crear();
      deps.parallelManagementRepository.findEnrichedById
        .mockResolvedValue({ id: 11, estado: 'ofertado', gestionId: 2 });
      expect((await useCase.evaluarPrecondiciones(11)).puedePublicar).toBe(true);
    });

    it('falla por cobertura incompleta', async () => {
      const { useCase, deps } = crear();
      deps.getParaleloGestionGrillaHorarioUseCase.execute.mockResolvedValue(SIN_COBERTURA);
      const out = await useCase.evaluarPrecondiciones(11);
      expect(out.fallas.map((f) => f.condicion)).toEqual(['cobertura']);
    });

    it('falla por conflictos de horario', async () => {
      const { useCase, deps } = crear();
      deps.getParaleloGestionGrillaHorarioUseCase.execute.mockResolvedValue({
        cobertura: { completa: true }, conflictos: [{ tipo: 'DOCENTE' }, { tipo: 'AULA' }],
      });
      const out = await useCase.evaluarPrecondiciones(11);
      expect(out.fallas).toEqual([{ condicion: 'conflictos', mensaje: 'Hay 2 conflicto(s) de horario' }]);
    });

    it('falla por cursos sin docente', async () => {
      const { useCase, deps } = crear();
      deps.getParaleloGestionCoberturaDocenteUseCase.execute
        .mockResolvedValue({ cursos_total: 5, cursos_con_docente: 3 });
      const out = await useCase.evaluarPrecondiciones(11);
      expect(out.fallas).toEqual([{ condicion: 'docentes', mensaje: '2 curso(s) sin docente asignado' }]);
    });

    it('falla por docente con sobrecarga', async () => {
      const { useCase, deps } = crear();
      deps.getDocenteCargaGestionUseCase.execute
        .mockImplementation(async ({ docenteId }) => ({ sobrecarga: docenteId === 9 }));
      const out = await useCase.evaluarPrecondiciones(11);
      expect(out.fallas).toEqual([
        expect.objectContaining({ condicion: 'sobrecarga_docente', docente_id: 9 }),
      ]);
    });

    it('acumula varias fallas a la vez', async () => {
      const { useCase, deps } = crear();
      deps.getParaleloGestionGrillaHorarioUseCase.execute.mockResolvedValue({ ...SIN_COBERTURA, conflictos: [{}] });
      deps.getParaleloGestionCoberturaDocenteUseCase.execute
        .mockResolvedValue({ cursos_total: 1, cursos_con_docente: 0 });
      const out = await useCase.evaluarPrecondiciones(11);
      expect(out.fallas.map((f) => f.condicion)).toEqual(['cobertura', 'conflictos', 'docentes']);
      expect(out.puedePublicar).toBe(false);
    });
  });

  describe('execute / ejecutarPublicacion', () => {
    it('publica pasando el estado PUBLICADO', async () => {
      const { useCase, deps } = crear();
      const out = await useCase.execute(11, 7);

      expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(11, { state: 'PUBLICADO' }, 7);
      expect(out.publicado).toBe(true);
      expect(out.paralelo_gestion.estado).toBe('PUBLICADO');
    });

    it('422 con las fallas como detalle y no actualiza', async () => {
      const { useCase, deps } = crear();
      deps.getParaleloGestionGrillaHorarioUseCase.execute.mockResolvedValue(SIN_COBERTURA);

      const err = await useCase.execute(11).catch((e) => e);
      expect(err).toBeInstanceOf(UnprocessableEntityError);
      expect(err.details[0].condicion).toBe('cobertura');
      expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
    });

    it('reutiliza una evaluación previa sin reevaluar', async () => {
      const { useCase, deps } = crear();
      const evaluacion = { puedePublicar: true, fallas: [], gestionId: 2, paraleloGestionId: 11 };
      await useCase.ejecutarPublicacion(11, null, evaluacion);
      expect(deps.parallelManagementRepository.findEnrichedById).not.toHaveBeenCalled();
      expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(11, { state: 'PUBLICADO' }, null);
    });
  });
});
