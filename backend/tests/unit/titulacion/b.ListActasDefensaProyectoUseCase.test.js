import { describe, it, expect, jest } from '@jest/globals';
import { ListActasDefensaProyectoUseCase } from '../../../src/application/use-cases/titulacion/ListActasDefensaProyectoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListActasDefensaProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 10 }, actas = [], integrantes = [] } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      actaDefensaRepository: { findByProyectoId: jest.fn().mockResolvedValue(actas) },
      integranteProyectoRepository: {
        findByProyectoGradoId: jest.fn().mockResolvedValue(integrantes),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListActasDefensaProyectoUseCase(deps) };
  };

  it('proyecto inexistente -> NotFoundError sin consultar actas', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.actaDefensaRepository.findByProyectoId).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) se propaga al repositorio y devuelve NotFoundError', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(Number('x'))).rejects.toThrow(NotFoundError);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(NaN);
  });

  it('sin actas devuelve lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(10)).toEqual({ actasDefensa: [], total: 0 });
  });

  it('consulta actas e integrantes del proyecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(10);
    expect(deps.actaDefensaRepository.findByProyectoId).toHaveBeenCalledWith(10);
    expect(deps.integranteProyectoRepository.findByProyectoGradoId).toHaveBeenCalledWith(10);
  });

  it('ordena TITULAR primero y luego por número de acta; formatea el número', async () => {
    const { useCase } = crear({
      integrantes: [
        { estudianteId: 1, rol: 'INTEGRANTE' },
        { estudianteId: 2, rol: 'TITULAR' },
      ],
      actas: [
        { id: 1, estudianteId: 1, numeroActa: 5 },
        { id: 2, estudianteId: 2, numeroActa: 9 },
        { id: 3, estudianteId: 3, numeroActa: 2 },
      ],
    });
    const r = await useCase.execute(10);
    expect(r.total).toBe(3);
    expect(r.actasDefensa.map((a) => a.id)).toEqual([2, 3, 1]);
    expect(r.actasDefensa[0].numeroActaFormateado).toBe('009');
  });

  it('no muta el arreglo original de actas', async () => {
    const actas = [
      { id: 1, estudianteId: 1, numeroActa: 5 },
      { id: 2, estudianteId: 2, numeroActa: 1 },
    ];
    const { useCase } = crear({ actas, integrantes: [{ estudianteId: 2, rol: 'TITULAR' }] });
    await useCase.execute(10);
    expect(actas.map((a) => a.id)).toEqual([1, 2]);
  });
});
