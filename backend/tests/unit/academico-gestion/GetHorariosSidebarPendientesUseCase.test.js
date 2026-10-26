import { describe, it, expect, jest } from '@jest/globals';
import { GetHorariosSidebarPendientesUseCase } from '../../../src/application/use-cases/academico/GetHorariosSidebarPendientesUseCase.js';

describe('GetHorariosSidebarPendientesUseCase', () => {
  const crear = ({ bloques = [], cursos = [], docentes = [] } = {}) => {
    const deps = {
      parallelRepository: {
        obtenerBloquesSinAulaDashboard: jest.fn().mockResolvedValue(bloques),
        obtenerCursosSinDocenteDashboard: jest.fn().mockResolvedValue(cursos),
        obtenerDocentesConflictosDetalleDashboard: jest.fn().mockResolvedValue(docentes),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetHorariosSidebarPendientesUseCase(deps) };
  };

  it('sin datos devuelve las tres secciones vacías y consulta los tres orígenes', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute()).resolves.toEqual({
      bloquesSinAulaPorParalelo: [],
      cursosSinDocentePorParalelo: [],
      docentesConConflictosOperativos: [],
    });
    Object.values(deps.parallelRepository).forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));
  });

  it('agrupa bloques sin aula por paralelo y ordena por nombre', async () => {
    const { useCase } = crear({
      bloques: [
        { paralelo_id: '2', paralelo_nombre: 'B', curso_horario_id: '10', curso_id: 1, dia: 'LUNES', orden_secuencia: '1' },
        { paralelo_id: 1, paralelo_nombre: 'A', carrera_id: '4', curso_horario_id: 11, materia_sigla: 'MAT' },
        { paralelo_id: 2, paralelo_nombre: 'B', curso_horario_id: 12 },
        { paralelo_id: 'x', paralelo_nombre: 'Z' },
      ],
    });
    const { bloquesSinAulaPorParalelo: g } = await useCase.execute();
    expect(g.map((p) => p.paraleloId)).toEqual([1, 2]);
    expect(g[0]).toMatchObject({ carreraId: 4, items: [expect.objectContaining({ cursoHorarioId: 11, materiaSigla: 'MAT', cursoId: null })] });
    expect(g[1].items).toHaveLength(2);
    expect(g[1].items[0]).toMatchObject({ cursoHorarioId: 10, cursoId: 1, ordenSecuencia: 1, dia: 'LUNES' });
  });

  it('agrupa cursos sin docente por paralelo', async () => {
    const { useCase } = crear({
      cursos: [
        { paralelo_id: 3, paralelo_nombre: 'C', curso_id: '7', curso_codigo: 'C7' },
        { paralelo_id: 3, paralelo_nombre: 'C', curso_id: 8 },
      ],
    });
    const { cursosSinDocentePorParalelo: g } = await useCase.execute();
    expect(g).toHaveLength(1);
    expect(g[0].items.map((i) => i.cursoId)).toEqual([7, 8]);
  });

  it('consolida conflictos por docente: líneas únicas, tipos en minúscula, primeros ids válidos', async () => {
    const { useCase } = crear({
      docentes: [
        { docente_id: 2, docente_nombre: '  Zeta   Ruiz ', detalle_linea: 'L1', tipo_conflicto: 'SOLAPE', paralelo_gestion_id: 0, oferta_curso_id: null },
        { docente_id: 2, docente_nombre: 'Zeta Ruiz', detalle_linea: 'L1', tipo_conflicto: 'solape', paralelo_gestion_id: 5, oferta_curso_id: 9 },
        { docente_id: 2, detalle_linea: 'L2', tipo_conflicto: 'aula', paralelo_gestion_id: 6, oferta_curso_id: 10 },
        { docente_id: 1, docente_nombre: 'Álvaro', detalle_linea: 'A1' },
        { docente_id: 3, docente_nombre: 'Sin línea', detalle_linea: '   ' },
        { docente_id: 'x', detalle_linea: 'inválido' },
      ],
    });
    const { docentesConConflictosOperativos: d } = await useCase.execute();
    expect(d.map((x) => x.docenteId)).toEqual([1, 2]);
    expect(d[1]).toEqual({
      docenteId: 2,
      docenteNombre: 'Zeta Ruiz',
      lineasDetalle: ['L1', 'L2'],
      paraleloGestionId: 5,
      ofertaCursoId: 9,
      tiposConflicto: ['solape', 'aula'],
    });
    expect(d[0]).toMatchObject({ paraleloGestionId: null, ofertaCursoId: null, tiposConflicto: [] });
  });

  it('propaga el error si falla un origen', async () => {
    const { useCase, deps } = crear();
    deps.parallelRepository.obtenerCursosSinDocenteDashboard.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
  });

  it('paralelo_id/docente_id nulos no se agrupan como 0', async () => {
    const { useCase } = crear({
      bloques: [{ paralelo_id: null, paralelo_nombre: 'X', curso_horario_id: 1 }],
      cursos: [{ paralelo_id: null, curso_id: 1 }, { paralelo_id: 3, paralelo_nombre: 'C', curso_id: 2 }],
      docentes: [{ docente_id: null, detalle_linea: 'l' }],
    });
    const res = await useCase.execute();
    expect(res.bloquesSinAulaPorParalelo).toEqual([]);
    expect(res.cursosSinDocentePorParalelo).toHaveLength(1);
    expect(res.cursosSinDocentePorParalelo[0].paraleloId).toBe(3);
    expect(res.docentesConConflictosOperativos).toEqual([]);
  });
});
