import { describe, it, expect } from '@jest/globals';
import { calcularEstadisticasParalelo } from '../../../src/application/use-cases/academico/libros/helpers/estadisticasParaleloHelper.js';

describe('estadisticasParaleloHelper', () => {
  it('suma folios y calcula porcentajes redondeados', () => {
    const res = calcularEstadisticasParalelo([
      { total_estudiantes: '10', total_aprobados: 6, total_reprobados: 1, total_abandonos: 1, total_cursando: 2 },
      { total_estudiantes: 2, total_aprobados: 1, total_reprobados: 0, total_abandonos: 0, total_cursando: 1 },
    ]);
    expect(res).toEqual({
      estudiantesInscritos: 12,
      estudiantesAprobados: 7,
      estudiantesReprobados: 1,
      abandono: 1,
      estudiantesPendientes: 3,
      porcentajeInscritos: 100,
      porcentajeAprobados: 58,
      porcentajeReprobados: 8,
      porcentajeAbandono: 8,
      porcentajePendientes: 25,
    });
  });

  it('sin folios o no-array -> ceros sin dividir por cero', () => {
    for (const entrada of [[], null, undefined]) {
      const res = calcularEstadisticasParalelo(entrada);
      expect(res.estudiantesInscritos).toBe(0);
      expect(res.porcentajeInscritos).toBe(0);
      expect(res.porcentajeAprobados).toBe(0);
    }
  });

  it('campos ausentes cuentan como 0', () => {
    expect(calcularEstadisticasParalelo([{ total_estudiantes: 4 }]).estudiantesAprobados).toBe(0);
  });
});
