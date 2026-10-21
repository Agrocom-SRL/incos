import { describe, it, expect, jest } from '@jest/globals';
import { AsignarTutorProyectoUseCase } from '../../../src/application/use-cases/titulacion/AsignarTutorProyectoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('AsignarTutorProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 5 }, docente = { lastName: 'Pérez', motherLastName: 'Gómez', firstName: 'Ana' } } = {}) => {
    const updated = { id: 5, titulo: 'Sistema X', gestionId: 2 };
    const deps = {
      proyectoGradoRepository: {
        findById: jest.fn().mockResolvedValue(proyecto),
        update: jest.fn().mockResolvedValue(updated),
      },
      proyectoGradoListadoViewRepository: {
        findListadoById: jest.fn().mockResolvedValue({
          modalidad_nombre: 'Tesis', carrera_nombre: 'Sistemas', tutor_nombre: 'Pérez Gómez Ana',
        }),
        findIntegrantesByProyectoId: jest.fn().mockResolvedValue([
          { integrante_proyecto_id: 1, estudiante_id: 9, estudiante_nombre: 'Luis' },
        ]),
      },
      dictamenProyectoRepository: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      bitacoraProyectoRepository: { create: jest.fn().mockResolvedValue({ id: 2 }) },
      teacherRepository: { findById: jest.fn().mockResolvedValue(docente) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ year: 2026 }) },
      designacionTutorPdfGenerator: { generate: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
      uploadsStorage: {
        saveToUploads: jest.fn().mockReturnValue({ fileName: 'd.pdf', absolutePath: '/u/d.pdf' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, updated, useCase: new AsignarTutorProyectoUseCase(deps) };
  };

  it('asigna el tutor, emite la designación y registra la bitácora', async () => {
    const { deps, updated, useCase } = crear();
    const result = await useCase.execute(
      5,
      { tutorId: '7', fechaEmision: '2026-09-01', numeroInforme: 'N-1', observaciones: 'ok' },
      4
    );

    expect(result).toEqual({ proyectoGrado: updated });
    expect(deps.teacherRepository.findById).toHaveBeenCalledWith(7);
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(5, { tutorId: 7 }, 4);
    expect(deps.designacionTutorPdfGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        tutorNombre: 'Pérez Gómez Ana',
        numeroInforme: 'N-1',
        fechaEmision: '2026-09-01',
        destinatario: 'Dirección Departamental de Educación (DDE)',
        proyecto: expect.objectContaining({ titulo: 'Sistema X', gestionAnio: 2026 }),
      })
    );
    expect(deps.dictamenProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 5,
        tipo: 'DESIGNACION_OFICIAL',
        resultado: null,
        rutaArchivo: '/u/d.pdf',
        extension: 'pdf',
      }),
      4,
      {}
    );
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 5,
        actividad: 'Asignación de tutor: Pérez Gómez Ana',
        observaciones: 'ok',
        estado: 'SUBSANADO',
        confirmadoEstudiante: true,
        fechaConfirmacion: '2026-09-01',
      }),
      4
    );
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('usa fecha de hoy y destinatario personalizado', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { tutorId: 7, destinatario: 'Rectorado' });
    expect(deps.designacionTutorPdfGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        destinatario: 'Rectorado',
        fechaEmision: new Date().toISOString().slice(0, 10),
      })
    );
  });

  it('acepta el docente con campos en español', async () => {
    const { deps, useCase } = crear({
      docente: { apellidoPaterno: 'Rojas', nombres: 'Mario' },
    });
    await useCase.execute(5, { tutorId: 7 });
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ actividad: 'Asignación de tutor: Rojas Mario' }),
      null
    );
  });

  it.each([[undefined], [null], [0], ['']])(
    'rechaza tutorId faltante (%p) sin tocar repositorios',
    async (tutorId) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(5, { tutorId })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.proyectoGradoRepository.findById).not.toHaveBeenCalled();
    }
  );

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { deps, useCase } = crear({ proyecto: null });
    await expect(useCase.execute(5, { tutorId: 7 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el docente no existe y no modifica nada', async () => {
    const { deps, useCase } = crear({ docente: null });
    await expect(useCase.execute(5, { tutorId: 7 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.proyectoGradoRepository.update).not.toHaveBeenCalled();
    expect(deps.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });
});
