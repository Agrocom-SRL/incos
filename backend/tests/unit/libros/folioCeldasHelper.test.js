import { describe, it, expect } from '@jest/globals';
import {
  construirAsignaturasDesdeFilas135,
  notaCeldaFolio,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
  esMateriaPendienteDeNota,
  calcularVeredictoMateria,
  derivarEstadoAcademico,
} from '../../../src/application/use-cases/academico/libros/helpers/folioCeldasHelper.js';

describe('folioCeldasHelper', () => {
  it('notaCeldaFolio: NP si no hay nota o ABANDONO/RETIRADO; número si hay', () => {
    expect(notaCeldaFolio({ nota_final: null })).toBe('NP');
    expect(notaCeldaFolio({ nota_final: 80, estado: 'ABANDONO' })).toBe('NP');
    expect(notaCeldaFolio({ nota_final: 80, estado: 'RETIRADO' })).toBe('NP');
    expect(notaCeldaFolio({ nota_final: '72.5', estado: 'CURSANDO' })).toBe(72.5);
    expect(notaCeldaFolio({ nota_final: 0 })).toBe(0);
    expect(notaCeldaFolio(undefined)).toBe('NP');
  });

  it('construirAsignaturasDesdeFilas135: únicas por oferta y ordenadas', () => {
    const res = construirAsignaturasDesdeFilas135([
      { oferta_curso_id: 2, asignatura_orden: 2, asignatura_sigla: 'B' },
      { oferta_curso_id: 1, asignatura_orden: 1, asignatura_sigla: 'A', docente_nombre: 'D' },
      { oferta_curso_id: 1, asignatura_orden: 1, asignatura_sigla: 'A' },
    ]);
    expect(res).toEqual([
      { ofertaCursoId: 1, sigla: 'A', nombre: '', orden: 1, docenteNombre: 'D' },
      { ofertaCursoId: 2, sigla: 'B', nombre: '', orden: 2, docenteNombre: null },
    ]);
    expect(construirAsignaturasDesdeFilas135(null)).toEqual([]);
  });

  it('agruparFilas135PorEstudiante y construirCeldasEstudiante', () => {
    const filas = [
      { estudiante_id: 1, oferta_curso_id: 10, nota_final: 70 },
      { estudiante_id: 1, oferta_curso_id: 11, nota_final: null },
      { estudiante_id: 2, oferta_curso_id: 10, nota_final: 50 },
    ];
    const mapa = agruparFilas135PorEstudiante(filas);
    expect(mapa.get(1)).toHaveLength(2);
    expect(construirCeldasEstudiante(mapa.get(1))).toEqual({ 10: 70, 11: 'NP' });
    expect(construirCeldasEstudiante(undefined)).toEqual({});
    expect(agruparFilas135PorEstudiante(undefined).size).toBe(0);
  });

  it('esMateriaPendienteDeNota', () => {
    expect(esMateriaPendienteDeNota({ nota_final: null, estado: 'CURSANDO' })).toBe(true);
    expect(esMateriaPendienteDeNota({ nota_final: null, estado: 'ABANDONO' })).toBe(false);
    expect(esMateriaPendienteDeNota({ nota_final: 0 })).toBe(false);
  });

  it('calcularVeredictoMateria usa el umbral (>= aprueba)', () => {
    expect(calcularVeredictoMateria({ nota_final: 61 }, 61)).toBe('APROBADO');
    expect(calcularVeredictoMateria({ nota_final: 60 }, 61)).toBe('REPROBADO');
    expect(calcularVeredictoMateria({ nota_final: null }, 61)).toBe('CURSANDO');
    expect(calcularVeredictoMateria({ nota_final: 90, estado: 'RETIRADO' }, 61)).toBe('ABANDONO');
  });

  describe('derivarEstadoAcademico', () => {
    it('sin filas -> ABANDONO', () => {
      expect(derivarEstadoAcademico([], 61)).toBe('ABANDONO');
      expect(derivarEstadoAcademico(undefined, 61)).toBe('ABANDONO');
    });
    it('reprobado tiene prioridad sobre cursando', () => {
      expect(derivarEstadoAcademico([{ nota_final: 10 }, { nota_final: null }], 61)).toBe('REPROBADO');
    });
    it('cursando si falta alguna nota y no hay reprobadas', () => {
      expect(derivarEstadoAcademico([{ nota_final: 80 }, { nota_final: null }], 61)).toBe('CURSANDO');
    });
    it('todas abandonadas -> ABANDONO', () => {
      expect(derivarEstadoAcademico([{ estado: 'ABANDONO' }, { estado: 'RETIRADO' }], 61)).toBe('ABANDONO');
    });
    it('aprobado si todas con nota >= mínimo (abandono parcial no lo impide)', () => {
      expect(derivarEstadoAcademico([{ nota_final: 70 }, { estado: 'ABANDONO' }], 61)).toBe('APROBADO');
    });
  });
});
