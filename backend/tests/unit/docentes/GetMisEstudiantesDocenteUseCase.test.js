import { describe, it, expect, jest } from '@jest/globals';
import { GetMisEstudiantesDocenteUseCase } from '../../../src/application/use-cases/docentes/GetMisEstudiantesDocenteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMisEstudiantesDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      dashboardRepository: {
        findEstudiantesDeDocente: jest.fn().mockResolvedValue([
          {
            estudiante_id: '30',
ci: '111',
apellido_paterno: 'Lopez',
nombres: 'Eva',
            asignacion_docente_id: '4',
oferta_curso_id: 5,
materia_sigla: 'MAT',
            asignatura_periodo_nombre: '1er año',
paralelo_nombre: 'A',
          },
        ]),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue({
          gestion_id: '2', gestion_anio: '2026', gestion_nombre: null,
        }),
      },
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue([{ id: 8 }]),
        findById: jest.fn().mockResolvedValue({ lastName: 'Perez', firstName: 'Ana' }),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetMisEstudiantesDocenteUseCase(deps) };
  };

  it('devuelve docente, gestión vigente y el roster mapeado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 20 });

    expect(deps.dashboardRepository.findEstudiantesDeDocente).toHaveBeenCalledWith(8, 2);
    expect(res.docente).toEqual({ id: 8, nombre: 'Perez Ana' });
    expect(res.gestion).toEqual({ anio: 2026, nombre: 'Gestión 2026' });
    expect(res.estudiantes).toHaveLength(1);
    expect(res.estudiantes[0]).toMatchObject({
      estudianteId: 30,
ci: '111',
apellidoPaterno: 'Lopez',
nombres: 'Eva',
      asignacionDocenteId: 4,
ofertaCursoId: 5,
materiaSigla: 'MAT',
      periodoNombre: '1er año',
paraleloNombre: 'A',
apellidoMaterno: null,
genero: null,
    });
  });

  it('usa el nombre de gestión si viene en el contexto', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue({
      gestion_id: 2, gestion_anio: 2026, gestion_nombre: 'Anual 2026',
    });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.gestion.nombre).toBe('Anual 2026');
  });

  it('sin gestión vigente devuelve el contrato vacío sin consultar el roster', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue(null);
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res).toEqual({ docente: { id: 8, nombre: 'Perez Ana' }, gestion: null, estudiantes: [] });
    expect(deps.dashboardRepository.findEstudiantesDeDocente).not.toHaveBeenCalled();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('roster nulo se devuelve como lista vacía', async () => {
    const { useCase, deps } = crear();
    deps.dashboardRepository.findEstudiantesDeDocente.mockResolvedValue(null);
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.estudiantes).toEqual([]);
  });

  it('lanza ForbiddenError si el usuario no es docente (anti-IDOR)', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    await expect(useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.dashboardRepository.findEstudiantesDeDocente).not.toHaveBeenCalled();
  });

  it('exige las dependencias en el constructor', () => {
    const ok = {
      dashboardRepository: {},
calificacionContextoRepository: {},
      teacherRepository: {},
userRepository: {},
logger: {},
    };
    for (const k of Object.keys(ok)) {
      const resto = { ...ok };
      delete resto[k];
      expect(() => new GetMisEstudiantesDocenteUseCase(resto)).toThrow();
    }
  });
});
