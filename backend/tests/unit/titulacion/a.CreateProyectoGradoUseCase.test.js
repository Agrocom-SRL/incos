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

const { CreateProyectoGradoUseCase } = await import(
  '../../../src/application/use-cases/titulacion/CreateProyectoGradoUseCase.js'
);

describe('CreateProyectoGradoUseCase', () => {
  const crear = ({
    modalidad = { id: 2, codigo: 'TESIS' },
    estudiante = { id: 9 },
    membresias = [],
    inscripcion = { carrera_id: 3, gestion_id: 6 },
    contexto = { gestion_id: 6 },
  } = {}) => {
    const deps = {
      proyectoGradoRepository: {
        findById: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 50 }),
      },
      integranteProyectoRepository: {
        findActivosByEstudianteId: jest.fn().mockResolvedValue(membresias),
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      modalidadGradoRepository: { findById: jest.fn().mockResolvedValue(modalidad) },
      studentRepository: { findById: jest.fn().mockResolvedValue(estudiante) },
      enrollmentRepository: {
        obtenerListadoMatriculas: jest.fn().mockResolvedValue({
          enrollments: inscripcion ? [inscripcion] : [],
        }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(contexto),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateProyectoGradoUseCase(deps) };
  };

  const body = (o = {}) => ({ estudianteIds: [9], modalidadId: 2, titulo: '  Mi proyecto ', ...o });

  beforeEach(() => {
    mockTransaction.mockClear();
  });

  it('crea el proyecto individual en PERFIL con el titular como integrante', async () => {
    const { deps, useCase } = crear();
    const result = await useCase.execute(body({ descripcion: 'd' }), 3);

    expect(result).toEqual({ proyectoGrado: { id: 50 } });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(deps.proyectoGradoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        estudianteId: 9,
        modalidadId: 2,
        tutorId: null,
        carreraId: 3,
        gestionId: 6,
        titulo: 'Mi proyecto',
        descripcion: 'd',
        estado: 'PERFIL',
      }),
      3,
      { transaction: 'TX' }
    );
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 50,
        estudianteId: 9,
        rol: 'TITULAR',
        estado: 'ACTIVO',
        fechaIncorporacion: new Date().toISOString().slice(0, 10),
      }),
      3,
      { transaction: 'TX' }
    );
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('prioriza carreraId, gestionId y fechaPresentacionPerfil del body', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(
      body({ carreraId: 8, gestionId: '7', fechaPresentacionPerfil: '2026-04-01' })
    );
    expect(deps.proyectoGradoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        carreraId: 8, gestionId: '7', fechaPresentacionPerfil: '2026-04-01',
      }),
      null,
      { transaction: 'TX' }
    );
    expect(deps.integranteProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ fechaIncorporacion: '2026-04-01' }),
      null,
      { transaction: 'TX' }
    );
    expect(deps.calificacionContextoRepository.obtenerContextoVigente).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.obtenerListadoMatriculas)
      .toHaveBeenCalledWith({}, 1, 1, { estudiante_id: 9, gestion_id: 7 });
  });

  it('modalidad grupal PSP: raíz sin estudianteId y roles titular/integrante', async () => {
    const { deps, useCase } = crear({ modalidad: { id: 2, codigo: 'PSP' } });
    await useCase.execute(body({ estudianteIds: ['9', 10, 11], titularEstudianteId: '10' }));

    expect(deps.proyectoGradoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ estudianteId: null }),
      null,
      { transaction: 'TX' }
    );
    const roles = deps.integranteProyectoRepository.create.mock.calls.map(
      ([d]) => [d.estudianteId, d.rol]
    );
    expect(roles).toEqual([[9, 'INTEGRANTE'], [10, 'TITULAR'], [11, 'INTEGRANTE']]);
    expect(deps.studentRepository.findById).toHaveBeenCalledTimes(3);
  });

  it.each([[undefined], [null], [[]], ['9'], [{}]])(
    'rechaza estudianteIds inválido (%p)',
    async (estudianteIds) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(body({ estudianteIds }))).rejects
        .toBeInstanceOf(ValidationError);
      expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
    }
  );

  it.each([[['abc']], [[0]], [[-1]], [[1.5]], [[null]], [[9, 'x']]])(
    'rechaza estudianteIds con valores no enteros positivos (%p)',
    async (estudianteIds) => {
      const { useCase } = crear({ modalidad: { id: 2, codigo: 'PSP' } });
      await expect(useCase.execute(body({ estudianteIds }))).rejects
        .toBeInstanceOf(ValidationError);
    }
  );

  it('rechaza estudianteIds duplicados', async () => {
    const { useCase } = crear({ modalidad: { id: 2, codigo: 'PSP' } });
    await expect(useCase.execute(body({ estudianteIds: [9, '9'] }))).rejects
      .toBeInstanceOf(ValidationError);
  });

  it('rechaza un titular que no está en estudianteIds', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(body({ titularEstudianteId: 99 }))).rejects
      .toBeInstanceOf(ValidationError);
  });

  it('rechaza un titularEstudianteId no numérico (NaN)', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(body({ titularEstudianteId: 'abc' }))).rejects
      .toBeInstanceOf(ValidationError);
  });

  it.each([[undefined], [null], [''], ['   '], [123]])('título %p inválido: ValidationError, no guarda "undefined"', async (titulo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(body({ titulo }))).rejects.toBeInstanceOf(ValidationError);
    expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
  });

  it('exige modalidadId', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(body({ modalidadId: undefined }))).rejects
      .toBeInstanceOf(ValidationError);
    expect(deps.modalidadGradoRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la modalidad no existe', async () => {
    const { useCase } = crear({ modalidad: null });
    await expect(useCase.execute(body())).rejects.toBeInstanceOf(NotFoundError);
  });

  it('solo la modalidad grupal admite varios integrantes', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(body({ estudianteIds: [9, 10] }))).rejects
      .toBeInstanceOf(ValidationError);
    expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si un estudiante no existe', async () => {
    const { deps, useCase } = crear({ estudiante: null });
    await expect(useCase.execute(body())).rejects.toBeInstanceOf(NotFoundError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
  });

  it('lanza ConflictError si el estudiante ya tiene un proyecto vigente', async () => {
    const { deps, useCase } = crear({ membresias: [{ proyectoGradoId: 44 }] });
    deps.proyectoGradoRepository.findById.mockResolvedValue({ id: 44, estado: 'DEFENSA' });
    await expect(useCase.execute(body())).rejects.toBeInstanceOf(ConflictError);
    expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
  });

  it('permite al estudiante con proyectos previos cancelados', async () => {
    const { deps, useCase } = crear({ membresias: [{ proyectoGradoId: 44 }] });
    deps.proyectoGradoRepository.findById.mockResolvedValue({ id: 44, estado: 'CANCELADO' });
    await expect(useCase.execute(body())).resolves.toHaveProperty('proyectoGrado');
  });

  it('lanza ValidationError si el estudiante no tiene inscripción vigente', async () => {
    const { deps, useCase } = crear({ inscripcion: null });
    await expect(useCase.execute(body())).rejects.toBeInstanceOf(ValidationError);
    expect(deps.proyectoGradoRepository.create).not.toHaveBeenCalled();
  });

  it('sin gestión en body usa la vigente para buscar la inscripción', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(body());
    expect(deps.enrollmentRepository.obtenerListadoMatriculas)
      .toHaveBeenCalledWith({}, 1, 1, { estudiante_id: 9, gestion_id: 6 });
  });

  it('sin gestión vigente busca la inscripción sin filtro de gestión', async () => {
    const { deps, useCase } = crear({ contexto: null, inscripcion: { carrera_id: 3 } });
    await useCase.execute(body());
    expect(deps.enrollmentRepository.obtenerListadoMatriculas)
      .toHaveBeenCalledWith({}, 1, 1, { estudiante_id: 9 });
    expect(deps.proyectoGradoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ gestionId: null, carreraId: 3 }),
      null,
      { transaction: 'TX' }
    );
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });
});
