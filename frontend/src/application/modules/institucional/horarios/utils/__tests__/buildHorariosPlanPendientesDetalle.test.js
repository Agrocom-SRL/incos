import { describe, it, expect } from 'vitest';
import {
  buildHorariosPlanPendientesDetalleLines,
  appendCoberturaPlanPendientesLineas,
  appendParaleloDashboardPendientesLineas,
} from '../buildHorariosPlanPendientesDetalle';

const blq = (dia, ini, fin, aula = 'A1') => ({ dia, horaInicio: ini, horaFin: fin, aula });
const c = (cursoId, sigla, docente, bloques, extra = {}) => ({
  cursoId,
  materiaSigla: sigla,
  docente,
  docenteId: docente ? cursoId : null,
  bloques,
  ...extra,
});

describe('buildHorariosPlanPendientesDetalleLines', () => {
  it('devuelve vacío sin cursos', () => {
    expect(buildHorariosPlanPendientesDetalleLines(null)).toEqual([]);
    expect(buildHorariosPlanPendientesDetalleLines([])).toEqual([]);
  });
  it('lista materias sin bloques, sin docente y sin aula', () => {
    const lines = buildHorariosPlanPendientesDetalleLines([
      c(1, 'MAT', 'Ana', []),
      c(2, 'FIS', null, [blq('LUNES', '08:00', '08:45', null)]),
    ]);
    expect(lines).toContain('Materias sin ningún bloque de horario: MAT.');
    expect(lines).toContain('Materias sin docente asignado: FIS.');
    expect(lines).toContain('Bloques sin aula asignada (por materia): FIS.');
  });
  it('detecta solapes entre cursos con docentes distintos', () => {
    const lines = buildHorariosPlanPendientesDetalleLines([
      c(1, 'MAT', 'Ana', [blq('Miércoles', '08:00', '08:45')]),
      c(2, 'FIS', 'Beto', [blq('MIERCOLES', '08:00', '08:45')]),
    ]);
    expect(lines).toEqual(['Solape en Mié 08:00: FIS, MAT.']);
  });
  it('detecta choque de docente y no lo cuenta como solape', () => {
    const lines = buildHorariosPlanPendientesDetalleLines([
      { ...c(1, 'MAT', 'Ana', [blq('LUNES', '08:00', '08:45')]), docenteId: 5 },
      { ...c(2, 'FIS', 'Ana', [blq('LUNES', '08:00', '08:45')]), docenteId: 5 },
    ]);
    expect(lines).toEqual(['Choque de docente (Ana) en Lun 08:00–08:45: FIS, MAT.']);
  });
  it('trunca solapes por encima del máximo', () => {
    const cursos = [];
    for (let i = 0; i < 3; i += 1) {
      cursos.push(c(i * 2 + 1, `A${i}`, 'X', [blq('LUNES', `0${8 + i}:00`, `0${8 + i}:45`)]));
      cursos.push(c(i * 2 + 2, `B${i}`, 'Y', [blq('LUNES', `0${8 + i}:00`, `0${8 + i}:45`)]));
    }
    const lines = buildHorariosPlanPendientesDetalleLines(cursos, { maxSolapeLineas: 1 });
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('…y 2 solape(s) adicional(es) en el paralelo.');
  });
  it('ignora bloques sin día u hora y usa respaldo de sigla', () => {
    const lines = buildHorariosPlanPendientesDetalleLines([
      { cursoId: 9, bloques: [{ dia: null, horaInicio: '08:00' }] },
      { cursoId: 10, cursoCodigo: 'COD', bloques: [] },
    ]);
    expect(lines).toEqual([
      'Materias sin ningún bloque de horario: COD.',
      'Materias sin docente asignado: Curso 9.',
    ]);
  });
});

describe('appendCoberturaPlanPendientesLineas', () => {
  it('quita líneas de cobertura previas y recalcula', () => {
    const cursos = [
      { cursoId: 1, materiaSigla: 'MAT', horasSemanalesPlan: 2, bloques: [{}] },
      { cursoId: 2, materiaSigla: 'FIS', horasSemanalesPlan: 1, bloques: [{}, {}] },
      { cursoId: 3, materiaSigla: 'QUI', horasSemanalesPlan: 1, bloques: [] },
      { cursoId: 4, materiaSigla: 'LEN', bloques: [{}] },
    ];
    const out = appendCoberturaPlanPendientesLineas(cursos, { ofertasCoberturaIncompleta: 5 }, [
      'Otra línea',
      'Materias sin ningún bloque de horario: X.',
    ]);
    expect(out[0]).toBe('Otra línea');
    expect(out.some((l) => l.startsWith('Materias sin ningún bloque'))).toBe(false);
    expect(out.join('\n')).toMatch(/4 materia\(s\) con bloques insuficientes.*: MAT, QUI\./);
    expect(out.join('\n')).toMatch(/1 materia\(s\) con más bloques.*FIS/);
  });
  it('no agrega nada si todo está cubierto', () => {
    expect(appendCoberturaPlanPendientesLineas([{ cursoId: 1, horasSemanalesPlan: 1, bloques: [{}] }], null)).toEqual([]);
    expect(appendCoberturaPlanPendientesLineas(null, undefined, undefined)).toEqual([]);
  });
});

describe('appendParaleloDashboardPendientesLineas', () => {
  it('antepone cursos faltantes y agrega conflicto de aula', () => {
    const out = appendParaleloDashboardPendientesLineas(['x'], { cursosTotales: 5, cursosCreados: 3, conflictosAula: 2 });
    expect(out[0]).toBe('Faltan 2 curso(s) del plan por crear en el paralelo.');
    expect(out[1]).toBe('x');
    expect(out[2]).toMatch(/2 caso\(s\)/);
  });
  it('devuelve copia sin cambios si no hay datos', () => {
    const base = ['a'];
    const out = appendParaleloDashboardPendientesLineas(base, null);
    expect(out).toEqual(['a']);
    expect(out).not.toBe(base);
    expect(appendParaleloDashboardPendientesLineas(undefined, undefined)).toEqual([]);
  });
});
