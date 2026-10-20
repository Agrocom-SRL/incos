import { describe, it, expect, jest } from '@jest/globals';
import { GetDocenteColoresSugeridosUseCase } from '../../../src/application/use-cases/docentes/GetDocenteColoresSugeridosUseCase.js';
import { DOCENTE_COLOR_PALETTE } from '../../../src/domain/constants/docentes.constants.js';

describe('GetDocenteColoresSugeridosUseCase', () => {
  const crear = (rows) => {
    const deps = {
      teacherRepository: { findActiveColorAssignments: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return new GetDocenteColoresSugeridosUseCase(deps);
  };

  it('toda la paleta queda disponible si nadie usa colores', async () => {
    const res = await crear([]).execute();
    expect(res.colores_sugeridos).toHaveLength(DOCENTE_COLOR_PALETTE.length);
    expect(res.colores_sugeridos.every((c) => c.disponible && c.docente_id === null)).toBe(true);
  });

  it('marca como no disponible el color en uso y quién lo usa', async () => {
    const usado = DOCENTE_COLOR_PALETTE[0].toUpperCase();
    const res = await crear([
      { docenteId: 4, colorHex: usado, docenteNombre: 'Ana' },
      { docenteId: 5, colorHex: usado, docenteNombre: 'Duplicado' },
    ]).execute();

    const fila = res.colores_sugeridos.find((c) => c.color_hex === usado);
    expect(fila).toEqual({
      color_hex: usado, disponible: false, docente_id: 4, docente_nombre: 'Ana',
    });
    expect(res.colores_sugeridos.filter((c) => !c.disponible)).toHaveLength(1);
  });
});
