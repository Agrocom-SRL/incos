import { describe, it, expect, jest } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { GetAvanceTutoriaCarreraUseCase } from '../../../src/application/use-cases/titulacion/GetAvanceTutoriaCarreraUseCase.js';

describe('GetAvanceTutoriaCarreraUseCase', () => {
  const crear = ({ contexto = { gestion_id: '4' } } = {}) => {
    const deps = {
      tutoriaAvanceViewRepository: {
        findAvancePorCarrera: jest.fn().mockResolvedValue([
          { carrera_id: 1, carrera_nombre: 'Sistemas' },
        ]),
      },
      proyectoGradoListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({
          rows: [{ proyecto_grado_id: 10, titulo: 'P1', cantidad_integrantes: '2' }],
        }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(contexto),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetAvanceTutoriaCarreraUseCase(deps) };
  };

  it('arma el reporte con gestión y carrera enviadas por query', async () => {
    const { deps, useCase } = crear();
    const { avanceTutoriaCarrera } = await useCase.execute({ gestionId: '2', carreraId: '1' });

    expect(avanceTutoriaCarrera.gestionId).toBe(2);
    expect(avanceTutoriaCarrera.carreraId).toBe(1);
    expect(avanceTutoriaCarrera.resumenPorCarrera).toHaveLength(1);
    expect(avanceTutoriaCarrera.resumenPorCarrera[0].carreraId).toBe(1);
    expect(avanceTutoriaCarrera.detalle[0]).toEqual(
      expect.objectContaining({ id: 10, titulo: 'P1', cantidadIntegrantes: 2 })
    );
    expect(deps.tutoriaAvanceViewRepository.findAvancePorCarrera)
      .toHaveBeenCalledWith({ gestionId: 2, carreraId: 1 });
    expect(deps.proyectoGradoListadoViewRepository.findListado)
      .toHaveBeenCalledWith({ gestionId: 2, carreraId: 1 }, 1, 1000);
    expect(deps.calificacionContextoRepository.obtenerContextoVigente).not.toHaveBeenCalled();
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('usa la gestión vigente si no llega gestionId', async () => {
    const { deps, useCase } = crear();
    const { avanceTutoriaCarrera } = await useCase.execute();

    expect(avanceTutoriaCarrera.gestionId).toBe(4);
    expect(avanceTutoriaCarrera.carreraId).toBeNull();
    expect(deps.tutoriaAvanceViewRepository.findAvancePorCarrera)
      .toHaveBeenCalledWith({ gestionId: 4, carreraId: undefined });
  });

  it('sin gestión vigente consulta sin filtro de gestión', async () => {
    const { deps, useCase } = crear({ contexto: null });
    const { avanceTutoriaCarrera } = await useCase.execute({});

    expect(avanceTutoriaCarrera.gestionId).toBeNull();
    expect(deps.tutoriaAvanceViewRepository.findAvancePorCarrera)
      .toHaveBeenCalledWith({ gestionId: undefined, carreraId: undefined });
  });

  it('tolera repositorios sin filas', async () => {
    const { deps, useCase } = crear();
    deps.tutoriaAvanceViewRepository.findAvancePorCarrera.mockResolvedValue([]);
    deps.proyectoGradoListadoViewRepository.findListado.mockResolvedValue({ rows: [] });
    const { avanceTutoriaCarrera } = await useCase.execute({ gestionId: 1 });
    expect(avanceTutoriaCarrera.resumenPorCarrera).toEqual([]);
    expect(avanceTutoriaCarrera.detalle).toEqual([]);
  });

  it.each([[{ gestionId: 'abc' }], [{ carreraId: '1x' }], [{ gestionId: 0 }]])('filtro inválido %j: ValidationError sin consultar', async (query) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(query)).rejects.toThrow(ValidationError);
    expect(deps.tutoriaAvanceViewRepository.findAvancePorCarrera).not.toHaveBeenCalled();
  });
});
