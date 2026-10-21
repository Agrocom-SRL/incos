import { describe, it, expect, jest } from '@jest/globals';
import { GenerarFoliosParaleloUseCase } from '../../../src/application/use-cases/academico/libros/GenerarFoliosParaleloUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const nomina = (n) =>
  Array.from({ length: n }, (_, i) => ({ estudiante_id: i + 1, inscripcion_id: 100 + i }));

describe('GenerarFoliosParaleloUseCase', () => {
  const crear = ({ libro, vigentes = 0, total = 12 } = {}) => {
    const deps = {
      libroRegistroRepository: {
        findById: jest.fn().mockResolvedValue(
          libro === undefined ? { id: 2, gestionId: 8, estado: 'ABIERTO', folioInicial: 1 } : libro,
        ),
        countFoliosVigentesByParalelo: jest.fn().mockResolvedValue(vigentes),
        crearFoliosConEstudiantes: jest.fn().mockResolvedValue([{ numeroFolio: 3 }, { numeroFolio: 4 }]),
      },
      libroRegistroViewRepository: {
        listarParalelosPorGestion: jest.fn().mockResolvedValue([{ paralelo_gestion_id: 40 }]),
        listarNominaPorParaleloGestion: jest.fn().mockResolvedValue(nomina(total)),
        listarFoliosPorLibro: jest.fn().mockResolvedValue([{ id: 1, numero_folio: 3 }, { id: 2, numero_folio: 4 }]),
      },
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue([]),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn() },
      evaluationConfigurationRepository: { findActiveRowByGestionId: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GenerarFoliosParaleloUseCase(deps) };
  };
  const ejecutar = (useCase, body = { paraleloGestionId: 40 }) =>
    useCase.execute({ usuarioId: 5, id: '2', body });

  it('genera páginas de 10 y persiste en una sola llamada', async () => {
    const { useCase, deps } = crear({ total: 12 });
    const { folios } = await ejecutar(useCase, { paraleloGestionId: '40', fechaRegistro: '2026-03-01' });

    expect(deps.libroRegistroViewRepository.listarParalelosPorGestion).toHaveBeenCalledWith(8, { libroId: 2 });
    expect(deps.libroRegistroRepository.countFoliosVigentesByParalelo).toHaveBeenCalledWith(2, 40);
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(8);

    const [datos, usuario] = deps.libroRegistroRepository.crearFoliosConEstudiantes.mock.calls[0];
    expect(usuario).toBe(5);
    expect(datos).toMatchObject({ libroId: 2, gestionId: 8, folioInicial: 1 });
    expect(datos.folios).toHaveLength(2);
    expect(datos.folios[0].estudiantes).toHaveLength(10);
    expect(datos.folios[1].estudiantes).toHaveLength(2);
    expect(datos.folios[1]).toMatchObject({ ordenEnParalelo: 2, estado: 'BORRADOR', fechaRegistro: '2026-03-01' });
    expect(datos.folios[1].estudiantes[0].numeroOrden).toBe(11);
    expect(deps.libroRegistroViewRepository.listarFoliosPorLibro).toHaveBeenCalledWith(2, { paraleloGestionId: 40 });
    expect(folios.map((f) => f.numeroFolio)).toEqual([3, 4]);
  });

  it.each([undefined, 0, 'x'])('exige paralelo válido (%p)', async (paraleloGestionId) => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, { paraleloGestionId })).rejects.toThrow('El paralelo es obligatorio');
    expect(deps.libroRegistroRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si el libro no existe', async () => {
    const { useCase } = crear({ libro: null });
    await expect(ejecutar(useCase)).rejects.toThrow(NotFoundError);
  });

  it('rechaza libro CERRADO', async () => {
    const { useCase, deps } = crear({ libro: { id: 2, gestionId: 8, estado: 'CERRADO' } });
    await expect(ejecutar(useCase)).rejects.toThrow('cerrado');
    expect(deps.libroRegistroRepository.crearFoliosConEstudiantes).not.toHaveBeenCalled();
  });

  it('rechaza paralelo de otra gestión', async () => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, { paraleloGestionId: 99 })).rejects.toThrow('no pertenece');
    expect(deps.libroRegistroRepository.crearFoliosConEstudiantes).not.toHaveBeenCalled();
  });

  it('rechaza si ya hay folios vigentes', async () => {
    const { useCase, deps } = crear({ vigentes: 2 });
    await expect(ejecutar(useCase)).rejects.toThrow('ya tiene folios');
    expect(deps.libroRegistroRepository.crearFoliosConEstudiantes).not.toHaveBeenCalled();
  });

  it('rechaza paralelo sin estudiantes', async () => {
    const { useCase, deps } = crear({ total: 0 });
    await expect(ejecutar(useCase)).rejects.toThrow(ValidationError);
    expect(deps.libroRegistroRepository.crearFoliosConEstudiantes).not.toHaveBeenCalled();
  });
});
