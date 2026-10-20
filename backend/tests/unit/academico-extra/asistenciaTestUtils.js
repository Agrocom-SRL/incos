import { jest } from '@jest/globals';

/**
 * Dependencias simuladas para el control de acceso de asistencia
 * (assertAsistenciaCursoAccess): el usuario 10 es el docente 7 dueño del curso.
 */
export const crearDepsAcceso = (overrides = {}) => ({
  calificacionCoordinacionRepository: {
    obtenerCursoPorAsignacion: jest.fn().mockResolvedValue({
      docente_id: 7,
      materia_nombre: 'Matemática',
      materia_sigla: 'MAT',
      carrera_nombre: 'Contaduría',
      paralelo_nombre: 'A',
      paralelo_turno: 'MAÑANA',
      cantidad_estudiantes: 25,
    }),
    ...overrides.calificacionCoordinacionRepository,
  },
  calificacionContextoRepository: {
    obtenerContextoVigente: jest
      .fn()
      .mockResolvedValue({ gestion_id: 3, bimestre_vigente: 1, gestion_anio: 2026 }),
    obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue([]),
    ...overrides.calificacionContextoRepository,
  },
  teacherRepository: {
    findAll: jest.fn().mockResolvedValue([{ id: 7 }]),
    findById: jest.fn().mockResolvedValue({ lastName: 'Perez', motherLastName: 'Rojas', firstName: 'Ana' }),
    ...overrides.teacherRepository,
  },
  userRepository: { findById: jest.fn(), ...overrides.userRepository },
  authRepository: {
    tienePermiso: jest.fn().mockResolvedValue(false),
    ...overrides.authRepository,
  },
});

export const crearLogger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });
