import { describe, it, expect, jest } from '@jest/globals';
import { GetDocenteColoresEnUsoUseCase } from '../../../src/application/use-cases/docentes/GetDocenteColoresEnUsoUseCase.js';

describe('GetDocenteColoresEnUsoUseCase', () => {
  it('devuelve colores_en_uso en snake_case', async () => {
    const deps = {
      teacherRepository: {
        findActiveColorAssignments: jest.fn().mockResolvedValue([
          { docenteId: 1, colorHex: '#E6194B', docenteNombre: 'Ana' },
        ]),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    const res = await new GetDocenteColoresEnUsoUseCase(deps).execute();
    expect(res).toEqual({
      colores_en_uso: [{ docente_id: 1, color_hex: '#E6194B', docente_nombre: 'Ana' }],
    });
    expect(deps.teacherRepository.findActiveColorAssignments).toHaveBeenCalledTimes(1);
  });

  it('sin docentes con color devuelve lista vacía', async () => {
    const deps = {
      teacherRepository: { findActiveColorAssignments: jest.fn().mockResolvedValue([]) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    const res = await new GetDocenteColoresEnUsoUseCase(deps).execute();
    expect(res).toEqual({ colores_en_uso: [] });
  });
});
