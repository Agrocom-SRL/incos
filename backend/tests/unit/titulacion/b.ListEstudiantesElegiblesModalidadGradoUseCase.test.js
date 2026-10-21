import { describe, it, expect, jest } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { ListEstudiantesElegiblesModalidadGradoUseCase } from '../../../src/application/use-cases/titulacion/ListEstudiantesElegiblesModalidadGradoUseCase.js';

describe('ListEstudiantesElegiblesModalidadGradoUseCase', () => {
  const crear = ({ rows = [], total = 0, contexto = { gestion_id: '7' } } = {}) => {
    const deps = {
      tutoriaAvanceViewRepository: {
        findEstudiantesElegibles: jest.fn().mockResolvedValue({ rows, total }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(contexto),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListEstudiantesElegiblesModalidadGradoUseCase(deps) };
  };

  it('sin gestionId usa la gestión vigente y valores de paginación por defecto', async () => {
    const { useCase, deps } = crear({
      rows: [{ estudiante_id: 1, estudiante_nombre_completo: 'Ana', periodo_numero: '3' }],
      total: 1,
    });
    const r = await useCase.execute();

    expect(deps.calificacionContextoRepository.obtenerContextoVigente).toHaveBeenCalledTimes(1);
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles).toHaveBeenCalledWith(
      { carreraId: undefined, gestionId: 7, search: undefined },
      1,
      50
    );
    expect(r).toEqual({
      estudiantesElegibles: [
        expect.objectContaining({ estudianteId: 1, nombreCompleto: 'Ana', periodoNumero: 3 }),
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  });

  it('con gestionId explícito no consulta el contexto vigente', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 50, { gestionId: '3', carreraId: '2' });
    expect(deps.calificacionContextoRepository.obtenerContextoVigente).not.toHaveBeenCalled();
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles).toHaveBeenCalledWith(
      { carreraId: 2, gestionId: 3, search: undefined },
      1,
      50
    );
  });

  it('sin gestión vigente filtra sin gestión (undefined)', async () => {
    const { useCase, deps } = crear({ contexto: null });
    await useCase.execute();
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles.mock.calls[0][0].gestionId)
      .toBeUndefined();
  });

  it('el search de queryParams prevalece sobre baseFilters', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ search: 'base' }, 1, 50, { gestionId: 1, search: 'query' });
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles.mock.calls[0][0].search)
      .toBe('query');
    await useCase.execute({ search: 'base' }, 1, 50, { gestionId: 1 });
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles.mock.calls[1][0].search)
      .toBe('base');
  });

  it('page y limit no numéricos o cero caen a los valores por defecto', async () => {
    const { useCase, deps } = crear({ total: 120 });
    const r = await useCase.execute({}, 'abc', 'xyz', { gestionId: 1 });
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles).toHaveBeenCalledWith(
      expect.any(Object), 1, 50
    );
    expect(r).toEqual(expect.objectContaining({ page: 1, limit: 50, totalPages: 3 }));
  });

  it('calcula totalPages con el límite indicado', async () => {
    const { useCase } = crear({ total: 25 });
    const r = await useCase.execute({}, '2', '10', { gestionId: 1 });
    expect(r).toEqual(expect.objectContaining({ page: 2, limit: 10, totalPages: 3 }));
  });

  it.each([['gestionId', 'abc'], ['carreraId', '5x'], ['carreraId', -2]])('filtro %s=%p inválido: ValidationError sin consultar', async (campo, valor) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({}, 1, 50, { [campo]: valor })).rejects.toThrow(ValidationError);
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles).not.toHaveBeenCalled();
  });

  it('page/limit negativos caen al valor por defecto', async () => {
    const { deps, useCase } = crear();
    const r = await useCase.execute({}, -4, -9);
    expect(deps.tutoriaAvanceViewRepository.findEstudiantesElegibles).toHaveBeenCalledWith(expect.any(Object), 1, 50);
    expect(r.totalPages).toBeGreaterThanOrEqual(0);
  });
});
