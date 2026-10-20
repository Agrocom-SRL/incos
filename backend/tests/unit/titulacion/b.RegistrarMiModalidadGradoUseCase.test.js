import { describe, it, expect, jest } from '@jest/globals';
import { RegistrarMiModalidadGradoUseCase } from '../../../src/application/use-cases/titulacion/RegistrarMiModalidadGradoUseCase.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('RegistrarMiModalidadGradoUseCase', () => {
  const crear = ({
    students = [{ id: 5 }],
    modalidad = { id: 2, codigo: 'TG' },
    enrollments = [{ periodo_numero: 3 }],
    historial = [],
  } = {}) => {
    const deps = {
      createProyectoGradoUseCase: {
        execute: jest.fn().mockResolvedValue({ proyectoGrado: { id: 30 } }),
      },
      modalidadGradoRepository: { findById: jest.fn().mockResolvedValue(modalidad) },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue(students),
        findById: jest.fn(),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      enrollmentRepository: {
        obtenerListadoMatriculas: jest.fn().mockResolvedValue({ enrollments }),
      },
      historialAcademicoRepository: {
        listarFilasHistorialPorEstudiante: jest.fn().mockResolvedValue(historial),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new RegistrarMiModalidadGradoUseCase(deps) };
  };

  const body = { modalidadId: 2, titulo: 'Mi tesis', objetivos: 'Obj' };

  it('crea el proyecto individual con el estudiante de la sesión como titular', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ usuarioId: 3, body });

    expect(deps.modalidadGradoRepository.findById).toHaveBeenCalledWith(2);
    expect(deps.enrollmentRepository.obtenerListadoMatriculas)
      .toHaveBeenCalledWith({}, 1, 1, { estudiante_id: 5 });
    expect(deps.historialAcademicoRepository.listarFilasHistorialPorEstudiante)
      .toHaveBeenCalledWith(5);
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalledWith(
      {
        titulo: 'Mi tesis',
        objetivos: 'Obj',
        modalidadId: 2,
        estudianteIds: [5],
        titularEstudianteId: 5,
      },
      3
    );
    expect(r).toEqual({ proyectoGrado: { id: 30 } });
  });

  it('objetivos ausentes se envían como null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ usuarioId: 3, body: { modalidadId: 2, titulo: 'T' } });
    expect(deps.createProyectoGradoUseCase.execute.mock.calls[0][0].objetivos).toBeNull();
  });

  it('usuario no vinculado a estudiante -> ForbiddenError', async () => {
    const { useCase, deps } = crear({ students: [] });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ForbiddenError);
    expect(deps.createProyectoGradoUseCase.execute).not.toHaveBeenCalled();
  });

  it('sin modalidadId -> ValidationError', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 3, body: { titulo: 'T' } }))
      .rejects.toThrow(ValidationError);
    expect(deps.modalidadGradoRepository.findById).not.toHaveBeenCalled();
  });

  it('modalidadId 0 o vacío -> ValidationError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 3, body: { modalidadId: 0 } }))
      .rejects.toThrow(ValidationError);
    await expect(useCase.execute({ usuarioId: 3, body: { modalidadId: '' } }))
      .rejects.toThrow(ValidationError);
  });

  it('modalidad inexistente -> NotFoundError', async () => {
    const { useCase, deps } = crear({ modalidad: null });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(NotFoundError);
    expect(deps.createProyectoGradoUseCase.execute).not.toHaveBeenCalled();
  });

  it('modalidad grupal (PSP) no permite autorregistro -> ValidationError', async () => {
    const { useCase, deps } = crear({ modalidad: { id: 2, codigo: 'PSP' } });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ValidationError);
    expect(deps.createProyectoGradoUseCase.execute).not.toHaveBeenCalled();
  });

  it('sin inscripción vigente -> ValidationError', async () => {
    const { useCase } = crear({ enrollments: [] });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ValidationError);
  });

  it('estudiante que no cursa 3er año -> ConflictError', async () => {
    const { useCase, deps } = crear({ enrollments: [{ periodo_numero: 2 }] });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ConflictError);
    expect(deps.historialAcademicoRepository.listarFilasHistorialPorEstudiante)
      .not.toHaveBeenCalled();
  });

  it('periodo_numero no numérico (NaN) -> ConflictError', async () => {
    const { useCase } = crear({ enrollments: [{ periodo_numero: 'abc' }] });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ConflictError);
  });

  it('periodo_numero como texto "3" se acepta', async () => {
    const { useCase, deps } = crear({ enrollments: [{ periodo_numero: '3' }] });
    await useCase.execute({ usuarioId: 3, body });
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalled();
  });

  it('materia reprobada de 1er/2do año sin recuperar -> ConflictError', async () => {
    const { useCase, deps } = crear({
      historial: [
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'REPROBADO', gestion_anio: 2024 },
      ],
    });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ConflictError);
    expect(deps.createProyectoGradoUseCase.execute).not.toHaveBeenCalled();
  });

  it('abandono pendiente en 2do año -> ConflictError', async () => {
    const { useCase } = crear({
      historial: [
        { periodo_numero: 2, asignatura_sigla: 'FIS', estado: 'ABANDONO', gestion_anio: 2025 },
      ],
    });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ConflictError);
  });

  it('materia reprobada y aprobada luego (año posterior) no bloquea', async () => {
    const { useCase, deps } = crear({
      historial: [
        { periodo_numero: 1, asignatura_sigla: 'ana', estado: 'REPROBADO', gestion_anio: 2024 },
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'APROBADO', gestion_anio: 2025 },
      ],
    });
    await useCase.execute({ usuarioId: 3, body });
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalled();
  });

  it('si el mismo año hay reprobado y aprobado prevalece el aprobado', async () => {
    const { useCase, deps } = crear({
      historial: [
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'APROBADO', gestion_anio: 2025 },
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'REPROBADO', gestion_anio: 2025 },
      ],
    });
    await useCase.execute({ usuarioId: 3, body });
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalled();
  });

  it('reprobada una materia más reciente que la aprobada bloquea', async () => {
    const { useCase } = crear({
      historial: [
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'APROBADO', gestion_anio: 2024 },
        { periodo_numero: 1, asignatura_sigla: 'ANA', estado: 'REPROBADO', gestion_anio: 2025 },
      ],
    });
    await expect(useCase.execute({ usuarioId: 3, body })).rejects.toThrow(ConflictError);
  });

  it('ignora reprobadas de 3er año, estados no concluyentes y filas sin sigla', async () => {
    const { useCase, deps } = crear({
      historial: [
        { periodo_numero: 3, asignatura_sigla: 'X', estado: 'REPROBADO', gestion_anio: 2025 },
        { periodo_numero: 1, asignatura_sigla: 'Y', estado: 'CURSANDO', gestion_anio: 2025 },
        { periodo_numero: 1, asignatura_sigla: '  ', estado: 'REPROBADO', gestion_anio: 2025 },
        { periodo_numero: 2, asignatura_sigla: 'Z', estado: 'CONVALIDADO', gestion_anio: 2025 },
      ],
    });
    await useCase.execute({ usuarioId: 3, body });
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalled();
  });

  it('historial nulo se trata como sin pendientes', async () => {
    const { useCase, deps } = crear({ historial: null });
    await useCase.execute({ usuarioId: 3, body });
    expect(deps.createProyectoGradoUseCase.execute).toHaveBeenCalled();
  });
});
