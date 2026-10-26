import { describe, it, expect } from '@jest/globals';
import { SubjectRepository } from '../../../src/infrastructure/repositories/SubjectRepository.js';
import { Materia } from '../../../src/infrastructure/database/models/materia.js';

describe('SubjectRepository', () => {
  it('busca solo en columnas que existen en el modelo Materia (GET /materias?search= daba 500)', () => {
    const campos = new SubjectRepository().getSearchFields();
    expect(campos.length).toBeGreaterThan(0);
    const atributos = Object.keys(Materia.getAttributes());
    for (const campo of campos) {
      expect(atributos).toContain(campo);
    }
  });
});
