import { describe, it, expect, jest, afterEach } from '@jest/globals';
import fs from 'fs';
import { DownloadAvanceArchivoUseCase } from '../../../src/application/use-cases/titulacion/DownloadAvanceArchivoUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DownloadAvanceArchivoUseCase', () => {
  afterEach(() => jest.restoreAllMocks());

  const crear = ({
    proyecto = { id: 5 },
    avance = {
      id: 12, proyectoGradoId: 5, rutaArchivo: '/uploads/a.pdf', nombreArchivo: 'a.pdf',
    },
    estudiantes = [],
    integrante = { id: 1 },
    existeArchivo = true,
  } = {}) => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(existeArchivo);
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      avanceProyectoRepository: { findById: jest.fn().mockResolvedValue(avance) },
      integranteProyectoRepository: {
        findActivoByProyectoAndEstudiante: jest.fn().mockResolvedValue(integrante),
      },
      studentRepository: { findAll: jest.fn().mockResolvedValue(estudiantes), findById: jest.fn() },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new DownloadAvanceArchivoUseCase(deps) };
  };

  const input = { proyectoGradoId: 5, avanceId: 12, usuarioId: 3 };

  it('devuelve ruta y nombre del archivo para un integrante activo', async () => {
    const { deps, useCase } = crear({ estudiantes: [{ id: 9 }] });
    await expect(useCase.execute(input)).resolves.toEqual({
      absolutePath: '/uploads/a.pdf',
      fileName: 'a.pdf',
    });
    expect(deps.avanceProyectoRepository.findById).toHaveBeenCalledWith(12);
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .toHaveBeenCalledWith(5, 9);
    expect(fs.existsSync).toHaveBeenCalledWith('/uploads/a.pdf');
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('un usuario no estudiante descarga sin guard de pertenencia', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input)).resolves.toHaveProperty('absolutePath');
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el avance no existe', async () => {
    const { useCase } = crear({ avance: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el avance es de otro proyecto (anti-IDOR)', async () => {
    const { deps, useCase } = crear({
      avance: { id: 12, proyectoGradoId: 77, rutaArchivo: '/x', nombreArchivo: 'x' },
    });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.studentRepository.findAll).not.toHaveBeenCalled();
  });

  it('un avanceId no numérico (NaN) no coincide con ningún avance', async () => {
    const { useCase } = crear({ avance: null });
    await expect(useCase.execute({ ...input, avanceId: 'abc' })).rejects
      .toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError si el estudiante no es integrante activo', async () => {
    const { useCase } = crear({ estudiantes: [{ id: 9 }], integrante: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lanza NotFoundError si el avance no tiene ruta de archivo', async () => {
    const { useCase } = crear({
      avance: { id: 12, proyectoGradoId: 5, rutaArchivo: null, nombreArchivo: 'a.pdf' },
    });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el archivo no existe en disco', async () => {
    const { deps, useCase } = crear({ existeArchivo: false });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
