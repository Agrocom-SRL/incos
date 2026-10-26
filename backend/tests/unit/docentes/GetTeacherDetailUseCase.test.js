import { describe, it, expect, jest } from '@jest/globals';
import { GetTeacherDetailUseCase } from '../../../src/application/use-cases/docentes/GetTeacherDetailUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetTeacherDetailUseCase', () => {
  const bundle = {
    teacher: {
      ci: '123',
expedicion: 'LP',
nombres: 'Ana',
apellido_paterno: 'Perez',
      apellido_materno: 'Gomez',
activo: 1,
color_hex: 'e6194b',
usuario_username: 'aperez',
    },
    assignments: [{ asignacion_docente_id: '4', vigente: 1, conflict_horario: 1, curso_codigo: 'C1' }],
    schedules: [{ curso_codigo: 'C1', dia: 'LUNES', hora_inicio: '08:00', hora_fin: '09:00' }],
  };

  const crear = () => {
    const deps = {
      teacherRepository: { findDetailBundleByTeacherId: jest.fn().mockResolvedValue(bundle) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetTeacherDetailUseCase(deps) };
  };

  it('arma perfil, asignaciones, horarios y acceso', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(8);

    expect(deps.teacherRepository.findDetailBundleByTeacherId).toHaveBeenCalledWith(8);
    expect(res.profile).toMatchObject({
      nombreCompleto: 'Ana Perez Gomez',
ciCompleto: '123 LP',
registroActivo: true,
      colorHex: '#e6194b',
maxHorasSemana: 20,
maxHorasMes: 80,
    });
    expect(res.assignments[0]).toMatchObject({
      id: 4, vigente: true, conflictos: { horario: true, total: 1, hasConflictos: true },
    });
    expect(res.courseSchedules[0]).toMatchObject({ cursoCodigo: 'C1' });
    expect(res.courseSchedules[0].bloques).toHaveLength(1);
    expect(res.access).toMatchObject({ tieneAcceso: true, usuario: 'aperez' });
  });

  it('lanza NotFoundError si el repositorio no devuelve docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findDetailBundleByTeacherId.mockResolvedValue({ teacher: null });
    await expect(useCase.execute(8)).rejects.toBeInstanceOf(NotFoundError);
    deps.teacherRepository.findDetailBundleByTeacherId.mockResolvedValue(null);
    await expect(useCase.execute(8)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('GetTeacherDetailUseCase id inválido', () => {
  it.each([['abc'], ['12abc'], [0], [-1], [1.5]])('id %p lanza ValidationError sin consultar', async (id) => {
    const teacherRepository = { findDetailBundleByTeacherId: jest.fn() };
    const useCase = new GetTeacherDetailUseCase({ teacherRepository, logger: { info: jest.fn() } });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
    expect(teacherRepository.findDetailBundleByTeacherId).not.toHaveBeenCalled();
  });
});
