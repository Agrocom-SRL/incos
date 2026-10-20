import { describe, it, expect, jest } from '@jest/globals';
import { ListProyectosGradoUseCase } from '../../../src/application/use-cases/titulacion/ListProyectosGradoUseCase.js';

describe('ListProyectosGradoUseCase', () => {
  const crear = ({ rows = [], total = 0 } = {}) => {
    const deps = {
      proyectoGradoListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({ rows, total }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListProyectosGradoUseCase(deps) };
  };

  it('sin filtros consulta con filtros indefinidos y paginación por defecto', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute();
    expect(deps.proyectoGradoListadoViewRepository.findListado).toHaveBeenCalledWith(
      {
        search: undefined,
        gestionId: undefined,
        carreraId: undefined,
        modalidadId: undefined,
        estado: undefined,
        tutorId: undefined,
      },
      1,
      50
    );
    expect(r).toEqual({ proyectosGrado: [], total: 0, page: 1, limit: 50, totalPages: 0 });
  });

  it('convierte filtros numéricos y pasa search y estado', async () => {
    const { useCase, deps } = crear({
      rows: [{ proyecto_grado_id: 1, titulo: 'P', proyecto_estado: 'PERFIL' }],
      total: 1,
    });
    const r = await useCase.execute(
      { search: 'sis' },
      '2',
      '10',
      { gestionId: '1', carreraId: '2', modalidadId: '3', tutorId: '4', estado: 'PERFIL' }
    );
    expect(deps.proyectoGradoListadoViewRepository.findListado).toHaveBeenCalledWith(
      { search: 'sis', gestionId: 1, carreraId: 2, modalidadId: 3, estado: 'PERFIL', tutorId: 4 },
      2,
      10
    );
    expect(r.proyectosGrado).toEqual([expect.objectContaining({ id: 1, estado: 'PERFIL' })]);
    expect(r).toEqual(expect.objectContaining({ total: 1, page: 2, limit: 10, totalPages: 1 }));
  });

  it('estado vacío se trata como sin filtro', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 50, { estado: '' });
    expect(deps.proyectoGradoListadoViewRepository.findListado.mock.calls[0][0].estado)
      .toBeUndefined();
  });

  it('page y limit no numéricos caen a los valores por defecto', async () => {
    const { useCase, deps } = crear({ total: 101 });
    const r = await useCase.execute({}, 'abc', 'xyz');
    expect(deps.proyectoGradoListadoViewRepository.findListado)
      .toHaveBeenCalledWith(expect.any(Object), 1, 50);
    expect(r).toEqual(expect.objectContaining({ page: 1, limit: 50, totalPages: 3 }));
  });
});
