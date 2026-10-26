import { describe, it, expect, jest } from '@jest/globals';
import { unwrapRepositoryList } from '../../../src/application/utils/repositoryResultUtils.js';
import { resolveTeacherAssignmentOfferContext } from '../../../src/application/utils/teacherAssignmentOfferContext.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/index.js';

describe('unwrapRepositoryList', () => {
  it('devuelve el arreglo tal cual', () => {
    const a = [1];
    expect(unwrapRepositoryList(a)).toBe(a);
  });

  it('busca primero por las claves indicadas, luego cualquier arreglo del objeto', () => {
    expect(unwrapRepositoryList({ students: [1], otros: [2] }, ['students'])).toEqual([1]);
    expect(unwrapRepositoryList({ total: 1, filas: [3] })).toEqual([3]);
    expect(unwrapRepositoryList({ students: 'x', otros: [2] }, ['students'])).toEqual([2]);
  });

  it('cualquier otra cosa da []', () => {
    expect(unwrapRepositoryList(null)).toEqual([]);
    expect(unwrapRepositoryList(undefined)).toEqual([]);
    expect(unwrapRepositoryList('texto')).toEqual([]);
    expect(unwrapRepositoryList({ total: 0 })).toEqual([]);
  });
});

describe('resolveTeacherAssignmentOfferContext', () => {
  const armar = (over = {}) => {
    const deps = {
      managementPlanRepository: { findById: jest.fn().mockResolvedValue({ id: 5, studyPlanId: 50 }) },
      courseOfferRepository: { findById: jest.fn().mockResolvedValue({ id: 7, parallelManagementId: 70, planSubjectId: 700 }) },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 70, managementPlanId: 5 }) },
      planSubjectRepository: { findById: jest.fn().mockResolvedValue({ id: 700, studyPlanId: 50, weeklyHours: 4 }) },
      offerCourseId: '7',
      managementPlanId: '5',
    };
    return { ...deps, ...over };
  };

  it('camino feliz: devuelve el contexto y consulta con ids numéricos', async () => {
    const deps = armar();
    const ctx = await resolveTeacherAssignmentOfferContext(deps);
    expect(deps.managementPlanRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.courseOfferRepository.findById).toHaveBeenCalledWith(7);
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(70);
    expect(deps.planSubjectRepository.findById).toHaveBeenCalledWith(700);
    expect(ctx).toMatchObject({ parallelManagementId: 70, planSubjectId: 700, weeklyHours: 4 });
  });

  it('acepta entidades con toPlainObject y nombres alternativos de campos', async () => {
    const deps = armar({
      courseOfferRepository: { findById: jest.fn().mockResolvedValue({ toPlainObject: () => ({ paraleloGestionId: 70, asignaturaPlanId: 700 }) }) },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ toPlainObject: () => ({ gestionPlanId: 5 }) }) },
      planSubjectRepository: { findById: jest.fn().mockResolvedValue({ toPlainObject: () => ({ planEstudioId: 50, horasSemanales: 6 }) }) },
      managementPlanRepository: { findById: jest.fn().mockResolvedValue({ planEstudioId: 50 }) },
    });
    const ctx = await resolveTeacherAssignmentOfferContext(deps);
    expect(ctx.weeklyHours).toBe(6);
  });

  it('horas semanales ausentes dan null', async () => {
    const deps = armar({ planSubjectRepository: { findById: jest.fn().mockResolvedValue({ studyPlanId: 50 }) } });
    expect((await resolveTeacherAssignmentOfferContext(deps)).weeklyHours).toBeNull();
  });

  it.each([
    ['plan habilitado inexistente', { managementPlanRepository: { findById: async () => null } }, NotFoundError],
    ['oferta inexistente', { courseOfferRepository: { findById: async () => null } }, NotFoundError],
    ['oferta sin paralelo-gestión', { courseOfferRepository: { findById: async () => ({ planSubjectId: 1 }) } }, UnprocessableEntityError],
    ['paralelo-gestión inexistente', { parallelManagementRepository: { findById: async () => null } }, NotFoundError],
    ['oferta de otro plan habilitado', { parallelManagementRepository: { findById: async () => ({ managementPlanId: 99 }) } }, UnprocessableEntityError],
    ['oferta sin asignatura de plan', { courseOfferRepository: { findById: async () => ({ parallelManagementId: 70 }) } }, UnprocessableEntityError],
    ['asignatura de plan inexistente', { planSubjectRepository: { findById: async () => null } }, NotFoundError],
    ['asignatura de otro plan de estudios', { planSubjectRepository: { findById: async () => ({ studyPlanId: 51 }) } }, UnprocessableEntityError],
    ['plan habilitado sin plan de estudios', { managementPlanRepository: { findById: async () => ({ id: 5 }) } }, UnprocessableEntityError],
  ])('%s', async (_n, over, Error_) => {
    await expect(resolveTeacherAssignmentOfferContext(armar(over))).rejects.toBeInstanceOf(Error_);
  });
});
