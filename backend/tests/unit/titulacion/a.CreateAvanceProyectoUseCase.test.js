import { describe, it, expect, jest } from '@jest/globals';
import { CreateAvanceProyectoUseCase } from '../../../src/application/use-cases/titulacion/CreateAvanceProyectoUseCase.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('CreateAvanceProyectoUseCase', () => {
  const file = {
    originalname: 'Informe Final.PDF',
    path: '/uploads/x.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  };

  const crear = ({
    proyecto = { id: 5 },
    estudiantes = [],
    user = null,
    integrante = { id: 1 },
    maxNumero = 2,
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      avanceProyectoRepository: {
        findMaxNumeroAvance: jest.fn().mockResolvedValue(maxNumero),
        create: jest.fn().mockResolvedValue({ id: 31 }),
      },
      integranteProyectoRepository: {
        findActivoByProyectoAndEstudiante: jest.fn().mockResolvedValue(integrante),
      },
      studentRepository: { findAll: jest.fn().mockResolvedValue(estudiantes), findById: jest.fn() },
      userRepository: { findById: jest.fn().mockResolvedValue(user) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateAvanceProyectoUseCase(deps) };
  };

  it('registra el avance de un estudiante integrante con número correlativo', async () => {
    const { deps, useCase } = crear({ estudiantes: [{ id: 9 }] });
    const result = await useCase.execute({
      proyectoGradoId: 5,
      body: { titulo: 'Avance 3', descripcion: 'desc' },
      file,
      usuarioId: 3,
    });

    expect(result).toEqual({ avance: { id: 31 } });
    expect(deps.avanceProyectoRepository.findMaxNumeroAvance).toHaveBeenCalledWith(5);
    expect(deps.avanceProyectoRepository.create).toHaveBeenCalledWith(
      {
        proyectoGradoId: 5,
        subidoPorEstudianteId: 9,
        numeroAvance: 3,
        titulo: 'Avance 3',
        descripcion: 'desc',
        nombreArchivo: 'Informe Final.PDF',
        rutaArchivo: '/uploads/x.pdf',
        extension: 'pdf',
        tipoMime: 'application/pdf',
        tamanoBytes: 1024,
        estadoRevision: 'PENDIENTE_REVISION',
      },
      3
    );
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .toHaveBeenCalledWith(5, 9);
  });

  it('el primer avance es el número 1', async () => {
    const { deps, useCase } = crear({ maxNumero: 0 });
    await useCase.execute({ proyectoGradoId: 5, file, usuarioId: 3 });
    expect(deps.avanceProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ numeroAvance: 1, titulo: null, descripcion: null }),
      3
    );
  });

  it('un usuario sin estudiante (tutor/admin) sube sin guard de pertenencia', async () => {
    const { deps, useCase } = crear({ user: { referenceType: 'DOCENTE', referenceId: 2 } });
    await useCase.execute({ proyectoGradoId: 5, file, usuarioId: 3 });
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .not.toHaveBeenCalled();
    expect(deps.avanceProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ subidoPorEstudianteId: null }),
      3
    );
  });

  it('extensión nula si el archivo no tiene extensión y tipo/tamaño ausentes -> null', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({
      proyectoGradoId: 5,
      file: { originalname: 'README', path: '/u/r' },
      usuarioId: 3,
    });
    expect(deps.avanceProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ extension: null, tipoMime: null, tamanoBytes: null }),
      3
    );
  });

  it('rechaza si no se adjunta archivo', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ proyectoGradoId: 5, usuarioId: 3 })).rejects
      .toBeInstanceOf(ValidationError);
    expect(deps.proyectoGradoRepository.findById).not.toHaveBeenCalled();
  });

  it('rechaza una llamada sin argumentos', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { deps, useCase } = crear({ proyecto: null });
    await expect(useCase.execute({ proyectoGradoId: 5, file, usuarioId: 3 })).rejects
      .toBeInstanceOf(NotFoundError);
    expect(deps.avanceProyectoRepository.create).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError si el estudiante no es integrante activo', async () => {
    const { deps, useCase } = crear({ estudiantes: [{ id: 9 }], integrante: null });
    await expect(useCase.execute({ proyectoGradoId: 5, file, usuarioId: 3 })).rejects
      .toBeInstanceOf(ForbiddenError);
    expect(deps.avanceProyectoRepository.create).not.toHaveBeenCalled();
  });
});
