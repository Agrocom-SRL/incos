import { parsePriorHistoryItem } from '../../../src/application/use-cases/inscripciones/priorHistoryItemValidation.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('parsePriorHistoryItem', () => {
  it('normaliza una fila APROBADO con alias en inglés y snake_case', () => {
    expect(parsePriorHistoryItem({ materia_id: '2', period_id: '1', nota_final: '70' })).toEqual({
      materiaId: 2,
      periodId: 1,
      finalGrade: 70,
      status: 'APROBADO',
    });
    expect(parsePriorHistoryItem({ materiaId: 3, periodId: 2, estado: 'aprobado', finalGrade: 0 }).finalGrade).toBe(0);
  });

  it('CONVALIDADO admite nota vacía (null) o numérica', () => {
    expect(parsePriorHistoryItem({ materiaId: 3, periodId: 2, status: 'CONVALIDADO' }).finalGrade).toBeNull();
    expect(parsePriorHistoryItem({ materiaId: 3, periodId: 2, status: 'CONVALIDADO', finalGrade: '' }).finalGrade).toBeNull();
    expect(parsePriorHistoryItem({ materiaId: 3, periodId: 2, status: 'CONVALIDADO', finalGrade: 55 }).finalGrade).toBe(55);
  });

  it.each([
    [{ periodId: 1 }],
    [{ materiaId: 1 }],
    [{ materiaId: 'abc', periodId: 1 }],
    [{ materiaId: 1, periodId: 1, status: 'OTRO' }],
    [{ materiaId: 1, periodId: 1, status: 'APROBADO' }],
    [{ materiaId: 1, periodId: 1, status: 'APROBADO', finalGrade: 'abc' }],
    [{ materiaId: 1, periodId: 1, status: 'APROBADO', finalGrade: 101 }],
    [{ materiaId: 1, periodId: 1, status: 'APROBADO', finalGrade: -1 }],
    [{ materiaId: 1, periodId: 1, status: 'CONVALIDADO', finalGrade: 'abc' }],
    [{ materiaId: 1, periodId: 1, status: 'CONVALIDADO', finalGrade: 150 }],
  ])('rechaza %j con ValidationError', (item) => {
    expect(() => parsePriorHistoryItem(item)).toThrow(ValidationError);
  });
});
