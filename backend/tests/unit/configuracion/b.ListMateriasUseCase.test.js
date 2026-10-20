import { describe, it, expect, jest } from '@jest/globals';
import { ListMateriasUseCase } from '../../../src/application/use-cases/configuracion/ListMateriasUseCase.js';

describe('ListMateriasUseCase', () => {
  const crear = ({ subjects = [{ id: 1, name: 'Mate' }], planSubjects = [] } = {}) => {
    const subjectRepository = { findAll: jest.fn().mockResolvedValue({ subjects, total: subjects.length }) };
    const planSubjectRepository = { findAll: jest.fn().mockResolvedValue({ planSubjects }) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return {
      subjectRepository,
      planSubjectRepository,
      useCase: new ListMateriasUseCase({ subjectRepository, planSubjectRepository, logger }),
    };
  };

  it('lista materias bajo "materias" sin consultar asignaturas_plan si no hay periodo_id', async () => {
    const { useCase, subjectRepository, planSubjectRepository } = crear();
    const res = await useCase.execute({ search: 'm' }, 1, 10, { search: 'm' });
    expect(planSubjectRepository.findAll).not.toHaveBeenCalled();
    expect(subjectRepository.findAll).toHaveBeenCalledWith({ search: 'm' }, 1, 10);
    expect(res).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
    expect(res.materias).toHaveLength(1);
  });

  it('con periodo_id filtra por los ids únicos de materias del periodo', async () => {
    const { useCase, subjectRepository, planSubjectRepository } = crear({
      planSubjects: [{ subjectId: 5 }, { subjectId: 5 }, { subjectId: 8 }, { subjectId: null }],
    });
    await useCase.execute({}, 1, 10, { periodo_id: '3' });
    expect(planSubjectRepository.findAll).toHaveBeenCalledWith(
      { periodId: 3, activo: true, attributes: ['materiaId'] }, null, null);
    expect(subjectRepository.findAll).toHaveBeenCalledWith({ id: [5, 8] }, 1, 10);
  });

  it('con periodo_id sin materias fuerza filtro vacío (id: [])', async () => {
    const { useCase, subjectRepository } = crear({ planSubjects: [] });
    await useCase.execute({ search: 's' }, 1, 10, { periodo_id: '3' });
    expect(subjectRepository.findAll).toHaveBeenCalledWith({ search: 's', id: [] }, 1, 10);
  });

  // BUG conocido (ListMateriasUseCase.js:74): periodo_id no numérico da parseInt NaN y se consulta con periodId NaN.
  // it.failing pasa mientras exista; al corregirlo, cambiar a it.
  it.failing('ignora periodo_id no numérico en vez de consultar con NaN', async () => {
    const { useCase, planSubjectRepository } = crear();
    await useCase.execute({}, 1, 10, { periodo_id: 'abc' });
    const filtro = planSubjectRepository.findAll.mock.calls[0]?.[0];
    expect(filtro === undefined || !Number.isNaN(filtro.periodId)).toBe(true);
  });

  it('propaga el error del repositorio de asignaturas_plan', async () => {
    const { useCase, planSubjectRepository, subjectRepository } = crear();
    planSubjectRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({}, 1, 10, { periodo_id: '3' })).rejects.toThrow('db');
    expect(subjectRepository.findAll).not.toHaveBeenCalled();
  });
});
