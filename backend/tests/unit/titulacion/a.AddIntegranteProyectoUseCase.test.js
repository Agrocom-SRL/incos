import { describe, it, expect, jest } from '@jest/globals';
import { AddIntegranteProyectoUseCase } from '../../../src/application/use-cases/titulacion/AddIntegranteProyectoUseCase.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('AddIntegranteProyectoUseCase', () => {
  const crear = ({
    proyecto = { id: 5, modalidadId: 2, estado: 'PERFIL' },
    estudiante = { id: 9 },
    existente = null,
    integrantes = [],
    modalidad = { id: 2, codigo: 'PSP' },
    membresias = [],
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      integranteProyectoRepository: {
        findActivoByProyectoAndEstudiante: jest.fn().mockResolvedValue(existente),
        findByProyectoGradoId: jest.fn().mockResolvedValue(integrantes),
        findActivosByEstudianteId: jest.fn().mockResolvedValue(membresias),
        create: jest.fn().mockResolvedValue({ id: 70 }),
      },
      modalidadGradoRepository: { findById: jest.fn().mockResolvedValue(modalidad) },
      studentRepository: { findById: jest.fn().mockResolvedValue(estudiante) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AddIntegranteProyectoUseCase(deps) };
  };

  it('agrega el primer integrante sin consultar la modalidad', async () => {
    const { deps, useCase } = crear({ integrantes: [] });
    const result = await useCase.execute(5, { estudianteId: '9', observaciones: 'obs' }, 3);

    expect(result).toEqual({ integrante: { id: 70 } });
    expect(deps.modalidadGradoRepository.findById).not.toHaveBeenCalled();
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 5,
        estudianteId: 9,
        rol: 'INTEGRANTE',
        estado: 'ACTIVO',
        observaciones: 'obs',
        fechaIncorporacion: new Date().toISOString().slice(0, 10),
      }),
      3
    );
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('respeta rol y fecha de incorporación enviados', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, {
      estudianteId: 9,
      rol: 'TITULAR',
      fechaIncorporacion: '2026-03-01',
    });
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rol: 'TITULAR', fechaIncorporacion: '2026-03-01', observaciones: null }),
      null
    );
  });

  it('admite un segundo integrante si la modalidad es grupal (PSP)', async () => {
    const { deps, useCase } = crear({
      integrantes: [{ estado: 'ACTIVO' }, { estado: 'RETIRADO' }],
    });
    await expect(useCase.execute(5, { estudianteId: 9 })).resolves.toHaveProperty('integrante');
    expect(deps.modalidadGradoRepository.findById).toHaveBeenCalledWith(2);
  });

  it('rechaza un segundo integrante activo en modalidad no grupal', async () => {
    const { deps, useCase } = crear({
      modalidad: { id: 2, codigo: 'TESIS' },
      integrantes: [{ estado: 'ACTIVO' }],
    });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si el proyecto no tiene modalidad y ya hay un integrante activo', async () => {
    const { useCase } = crear({
      proyecto: { id: 5, modalidadId: null },
      integrantes: [{ estado: 'ACTIVO' }],
    });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(ConflictError);
  });

  it('no cuenta integrantes retirados para la regla de grupalidad', async () => {
    const { deps, useCase } = crear({ integrantes: [{ estado: 'RETIRADO' }] });
    await useCase.execute(5, { estudianteId: 9 });
    expect(deps.modalidadGradoRepository.findById).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['abc'], [0], [-3], [1.5], ['']])(
    'rechaza estudianteId inválido (%p) sin tocar repositorios',
    async (estudianteId) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(5, { estudianteId })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.proyectoGradoRepository.findById).not.toHaveBeenCalled();
    }
  );

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el estudiante no existe', async () => {
    const { deps, useCase } = crear({ estudiante: null });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un estudiante que ya es integrante activo del proyecto', async () => {
    const { deps, useCase } = crear({ existente: { id: 1 } });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un estudiante con otro proyecto vigente', async () => {
    const { deps, useCase } = crear({ membresias: [{ proyectoGradoId: 44 }] });
    deps.proyectoGradoRepository.findById
      .mockResolvedValueOnce({ id: 5, modalidadId: 2, estado: 'PERFIL' })
      .mockResolvedValueOnce({ id: 44, estado: 'DESARROLLO' });
    await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it.each([['APROBADO'], ['REPROBADO'], ['CANCELADO']])(
    'proyecto en estado final %s: ConflictError sin crear integrante',
    async (estado) => {
      const { deps, useCase } = crear({ proyecto: { id: 5, modalidadId: 2, estado } });
      await expect(useCase.execute(5, { estudianteId: 9 })).rejects.toBeInstanceOf(ConflictError);
      expect(deps.studentRepository.findById).not.toHaveBeenCalled();
      expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
    }
  );

  it.each([['PERFIL'], ['DESARROLLO'], ['DEFENSA']])('proyecto vigente %s admite integrantes', async (estado) => {
    const { deps, useCase } = crear({ proyecto: { id: 5, modalidadId: 2, estado } });
    await useCase.execute(5, { estudianteId: 9 });
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledTimes(1);
  });

  it('rol fuera del catálogo: ValidationError', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { estudianteId: 9, rol: 'JEFE' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it.each([['2026-02-31'], ['abc']])('fechaIncorporacion %p inválida: ValidationError', async (fecha) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { estudianteId: 9, fechaIncorporacion: fecha })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.integranteProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('permite al estudiante con proyectos previos ya cerrados', async () => {
    const { deps, useCase } = crear({ membresias: [{ proyectoGradoId: 44 }] });
    deps.proyectoGradoRepository.findById
      .mockResolvedValueOnce({ id: 5, modalidadId: 2, estado: 'PERFIL' })
      .mockResolvedValueOnce({ id: 44, estado: 'APROBADO' });
    await expect(useCase.execute(5, { estudianteId: 9 })).resolves.toHaveProperty('integrante');
  });
});
