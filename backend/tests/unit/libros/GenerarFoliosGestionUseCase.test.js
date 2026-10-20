import { describe, it, expect, jest } from '@jest/globals';
import { GenerarFoliosGestionUseCase } from '../../../src/application/use-cases/academico/libros/GenerarFoliosGestionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GenerarFoliosGestionUseCase', () => {
  const crear = ({ libro, paralelos, nominas } = {}) => {
    const porParalelo = nominas ?? { 1: 11, 2: 3 };
    const deps = {
      libroRegistroRepository: {
        findByGestion: jest.fn().mockResolvedValue(
          libro === undefined ? { id: 2, estado: 'ABIERTO', folioInicial: 5 } : libro,
        ),
        reajustarFoliosGestion: jest.fn().mockResolvedValue({
          anulados: 4,
          creados: [{ numeroFolio: 20 }, { numeroFolio: 22 }, { numeroFolio: 21 }],
        }),
      },
      libroRegistroViewRepository: {
        listarParalelosPorGestion: jest.fn().mockResolvedValue(
          paralelos ?? [{ paralelo_gestion_id: 1 }, { paralelo_gestion_id: 2 }],
        ),
        listarNominaPorParaleloGestion: jest.fn(async (id) =>
          Array.from({ length: porParalelo[id] ?? 0 }, (_, i) => ({ estudiante_id: i + 1, inscripcion_id: i })),
        ),
      },
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue([]),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn() },
      evaluationConfigurationRepository: { findActiveRowByGestionId: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GenerarFoliosGestionUseCase(deps) };
  };
  const ejecutar = (useCase, body = {}, gestionId = '8') =>
    useCase.execute({ usuarioId: 9, gestionId, body });

  it('reajusta toda la gestión en una transacción y resume', async () => {
    const { useCase, deps } = crear();
    const { resumenGeneracion } = await ejecutar(useCase, { fechaRegistro: '2026-05-05' });

    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledTimes(1);
    expect(deps.libroRegistroRepository.reajustarFoliosGestion).toHaveBeenCalledTimes(1);
    const [datos, usuario] = deps.libroRegistroRepository.reajustarFoliosGestion.mock.calls[0];
    expect(usuario).toBe(9);
    expect(datos).toMatchObject({ libroId: 2, gestionId: 8, folioInicial: 5 });
    expect(datos.folios).toHaveLength(3);
    expect(datos.folios.map((f) => f.paraleloGestionId)).toEqual([1, 1, 2]);
    expect(datos.motivoAnulacion).toContain('2026-05-05');
    expect(resumenGeneracion).toEqual({
      paralelosGenerados: 2,
      foliosCreados: 3,
      foliosAnulados: 4,
      folioDesde: 20,
      folioHasta: 22,
      omitidos: [],
    });
  });

  it('omite paralelos sin nómina y los reporta', async () => {
    const { useCase, deps } = crear({ nominas: { 1: 5 } });
    const { resumenGeneracion } = await ejecutar(useCase);

    expect(deps.libroRegistroRepository.reajustarFoliosGestion.mock.calls[0][0].folios).toHaveLength(1);
    expect(resumenGeneracion.paralelosGenerados).toBe(1);
    expect(resumenGeneracion.omitidos).toEqual([
      { paraleloGestionId: 2, motivo: 'El paralelo no tiene estudiantes matriculados' },
    ]);
  });

  it('propaga errores que no son de validación', async () => {
    const { useCase, deps } = crear();
    deps.libroRegistroViewRepository.listarNominaPorParaleloGestion.mockRejectedValue(new Error('db'));
    await expect(ejecutar(useCase)).rejects.toThrow('db');
  });

  it('rechaza si ningún paralelo tiene estudiantes', async () => {
    const { useCase, deps } = crear({ nominas: {} });
    await expect(ejecutar(useCase)).rejects.toThrow('Ningún paralelo');
    expect(deps.libroRegistroRepository.reajustarFoliosGestion).not.toHaveBeenCalled();
  });

  it.each([null, 0, 'abc'])('gestión inválida (%p)', async (g) => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, {}, g)).rejects.toThrow(ValidationError);
    expect(deps.libroRegistroViewRepository.listarParalelosPorGestion).not.toHaveBeenCalled();
  });

  it('rechaza gestión sin paralelos', async () => {
    const { useCase } = crear({ paralelos: [] });
    await expect(ejecutar(useCase)).rejects.toThrow('no tiene paralelos');
  });

  it('rechaza si falta el libro o está cerrado', async () => {
    await expect(ejecutar(crear({ libro: null }).useCase)).rejects.toThrow('Falta abrir');
    const { useCase, deps } = crear({ libro: { id: 2, estado: 'CERRADO' } });
    await expect(ejecutar(useCase)).rejects.toThrow('cerrado');
    expect(deps.libroRegistroRepository.reajustarFoliosGestion).not.toHaveBeenCalled();
  });
});
