import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import { GetSeguimientoTutoriaDocentesUseCase } from '../../../src/application/use-cases/titulacion/GetSeguimientoTutoriaDocentesUseCase.js';

describe('GetSeguimientoTutoriaDocentesUseCase', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 15, 12) });
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
    tutor_nombre: 'Zeta Docente',
    tutorias_ejecutadas_mes: 3,
    ...o,
  });

  const crear = (rows = []) => {
    const deps = {
      tutoriaAvanceViewRepository: {
        findSeguimientoTutoriaDocentes: jest.fn().mockResolvedValue(rows),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetSeguimientoTutoriaDocentesUseCase(deps) };
  };

  it('usa mes y año actuales por defecto y no filtra docente ni carrera', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute();
    expect(deps.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes).toHaveBeenCalledWith({
      docenteId: undefined,
      carreraId: undefined,
      anio: 2026,
      mes: 3,
    });
    expect(r).toEqual({ seguimientoTutoriaDocentes: { anio: 2026, mes: 3, docentes: [] } });
  });

  it('convierte los filtros de texto a número', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ docenteId: '10', carreraId: '2', anio: '2025', mes: '11' });
    expect(deps.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes).toHaveBeenCalledWith({
      docenteId: 10,
      carreraId: 2,
      anio: 2025,
      mes: 11,
    });
  });

  it('agrupa por docente, suma tutorías por proyecto distinto y ordena', async () => {
    const { useCase } = crear([
      fila({ estudiante_id: 1, proyecto_grado_id: 100, tutorias_ejecutadas_mes: 3 }),
      // proyecto grupal: mismo proyecto, no suma de nuevo
      fila({ estudiante_id: 2, proyecto_grado_id: 100, tutorias_ejecutadas_mes: 3 }),
      fila({ estudiante_id: 3, proyecto_grado_id: 101, tutorias_ejecutadas_mes: 2, carrera_id: 2, carrera_nombre: 'Anestesia' }),
      fila({ estudiante_id: 4, proyecto_grado_id: 200, tutor_id: 11, tutor_nombre: 'Alfa Docente', tutorias_ejecutadas_mes: 1 }),
    ]);
    const { seguimientoTutoriaDocentes: s } = await useCase.execute();

    expect(s.docentes.map((d) => d.docenteNombre)).toEqual(['Alfa Docente', 'Zeta Docente']);
    const zeta = s.docentes[1];
    expect(zeta.tutoriasEjecutadasMes).toBe(5);
    expect(zeta.tutoriados).toHaveLength(3);
    expect(zeta.carreras.map((c) => c.carreraNombre)).toEqual(['Anestesia', 'Enfermería']);
    expect(s.docentes[0].tutoriasEjecutadasMes).toBe(1);
  });

  it('proyecto nulo no suma tutorías pero el tutoriado sí aparece', async () => {
    const { useCase } = crear([fila({ proyecto_grado_id: null, tutorias_ejecutadas_mes: 4 })]);
    const { seguimientoTutoriaDocentes: s } = await useCase.execute();
    expect(s.docentes[0].tutoriasEjecutadasMes).toBe(0);
    expect(s.docentes[0].tutoriados).toHaveLength(1);
  });

  it('fila sin carrera no agrega carreras al docente', async () => {
    const { useCase } = crear([fila({ carrera_id: null, carrera_nombre: null })]);
    const { seguimientoTutoriaDocentes: s } = await useCase.execute();
    expect(s.docentes[0].carreras).toEqual([]);
  });
});
