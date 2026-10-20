import { jest } from '@jest/globals';

export const filaLicencia = (o = {}) => ({
  id: 1,
  inscripcion_id: 5,
  estudiante_nombre: 'Ana Perez',
  codigo_estudiante: 'E1',
  carrera_nombre: 'Contaduría',
  carrera_codigo: 'CON',
  periodo_nombre: '1er año',
  paralelo_nombre: 'A',
  fecha_solicitud: '2026-03-01',
  fecha_inicio: '2026-03-02',
  fecha_fin: '2026-03-04',
  total_dias: 3,
  motivo: 'ENFERMEDAD',
  detalle_motivo: 'Gripe',
  estado: 'PENDIENTE',
  observaciones_decision: null,
  ...o,
});

export const crearLicenseRepository = (overrides = {}) => ({
  findById: jest.fn().mockResolvedValue({ id: 1, state: 'PENDIENTE', createdBy: 10, enrollmentId: 5, totalDays: 3 }),
  findByIdWithStudentName: jest.fn().mockResolvedValue(filaLicencia()),
  findAllWithStudentName: jest.fn().mockResolvedValue([filaLicencia()]),
  getInscripcionInfo: jest.fn().mockResolvedValue({ id: 5 }),
  sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(0),
  create: jest.fn().mockResolvedValue({ id: 1 }),
  update: jest.fn().mockResolvedValue({}),
  findInscripcionVigenteByEstudiante: jest.fn().mockResolvedValue({ id: 5 }),
  ...overrides,
});

export const loggerLic = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });
