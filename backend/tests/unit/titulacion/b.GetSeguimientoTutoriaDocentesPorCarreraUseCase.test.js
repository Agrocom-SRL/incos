import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { GetSeguimientoTutoriaDocentesPorCarreraUseCase } from '../../../src/application/use-cases/titulacion/GetSeguimientoTutoriaDocentesPorCarreraUseCase.js';

describe('GetSeguimientoTutoriaDocentesPorCarreraUseCase', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date(2026, 6, 20, 12) });
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const fila = (o = {}) => ({
    estudiante_id: 1,
    estudiante_nombre_completo: 'Ana',
    proyecto_grado_id: 100,
    carrera_id: 1,
    carrera_nombre: 'Enfermería',
    tutor_id: 10,
    tutor_nombre: 'Docente B',
    ...o,
  });

  const crear = (rows = []) => {
    const deps = {
      tutoriaAvanceViewRepository: {
        findSeguimientoTutoriaDocentes: jest.fn().mockResolvedValue(rows),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetSeguimientoTutoriaDocentesPorCarreraUseCase(deps) };
  };

  it('usa mes y año actuales por defecto', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute();
    expect(deps.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes).toHaveBeenCalledWith({
      docenteId: undefined,
      carreraId: undefined,
      anio: 2026,
      mes: 7,
    });
    expect(r).toEqual({
      seguimientoTutoriaDocentesPorCarrera: { anio: 2026, mes: 7, carreras: [] },
    });
  });

  it('convierte filtros de texto a número', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ docenteId: '4', carreraId: '5', anio: '2024', mes: '2' });
    expect(deps.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes).toHaveBeenCalledWith({
      docenteId: 4,
      carreraId: 5,
      anio: 2024,
      mes: 2,
    });
  });

  it('agrupa por carrera, ordena carreras y tutoriados por docente y nombre', async () => {
    const { useCase } = crear([
      fila({ estudiante_id: 1, estudiante_nombre_completo: 'Zoe', tutor_nombre: 'Docente B' }),
      fila({ estudiante_id: 2, estudiante_nombre_completo: 'Beto', tutor_nombre: 'Docente B' }),
      fila({ estudiante_id: 3, estudiante_nombre_completo: 'Cris', tutor_nombre: 'Docente A' }),
      fila({ estudiante_id: 4, carrera_id: 2, carrera_nombre: 'Anestesia' }),
    ]);
    const { seguimientoTutoriaDocentesPorCarrera: s } = await useCase.execute();

    expect(s.carreras.map((c) => c.carreraNombre)).toEqual(['Anestesia', 'Enfermería']);
    const enf = s.carreras[1];
    expect(enf.tutoriados.map((t) => t.nombreCompleto)).toEqual(['Cris', 'Beto', 'Zoe']);
  });

  it('un docente con tutoriados en dos carreras aparece en cada una', async () => {
    const { useCase } = crear([
      fila({ estudiante_id: 1, carrera_id: 1, carrera_nombre: 'A' }),
      fila({ estudiante_id: 2, carrera_id: 2, carrera_nombre: 'B' }),
    ]);
    const { seguimientoTutoriaDocentesPorCarrera: s } = await useCase.execute();
    expect(s.carreras).toHaveLength(2);
    expect(s.carreras.every((c) => c.tutoriados[0].docenteId === 10)).toBe(true);
  });

  it('filas sin carrera se agrupan en "SIN CARRERA"', async () => {
    const { useCase } = crear([fila({ carrera_id: null, carrera_nombre: null })]);
    const { seguimientoTutoriaDocentesPorCarrera: s } = await useCase.execute();
    expect(s.carreras).toEqual([
      expect.objectContaining({ carreraId: null, carreraNombre: 'SIN CARRERA' }),
    ]);
  });

  it.each([[{ mes: 13 }], [{ mes: 0 }], [{ mes: 'abc' }], [{ anio: 'x' }], [{ anio: 1800 }], [{ docenteId: 'abc' }], [{ carreraId: -1 }]])(
    'filtro inválido %j: ValidationError sin consultar',
    async (query) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(query)).rejects.toThrow(ValidationError);
      expect(deps.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes).not.toHaveBeenCalled();
    }
  );
});
