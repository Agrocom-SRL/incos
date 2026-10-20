import { jest } from '@jest/globals';
import { SavePoliticaInstitucionalUseCase } from '../../../src/application/use-cases/academico/SavePoliticaInstitucionalUseCase.js';

describe('SavePoliticaInstitucionalUseCase', () => {
  const ctx = { gestion_id: 1, gestion_anio: 2026, gestion_nombre: 'Gestión 2026' };
  const bodyOk = {
    cuotaTeorico: 40,
    cuotaPractico: 60,
    pesosBimestres: [10, 20, 30, 40],
    notaMinimaAprobacion: 55,
    politicaAsistenciaDefault: { politica: 'NO_AFECTA' },
  };
  const crear = () => {
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(ctx),
      },
      evaluationConfigurationRepository: {
        upsertPoliticaVigente: jest.fn().mockResolvedValue(undefined),
        findActiveRowByGestionId: jest.fn().mockResolvedValue({
          id: 5,
          valor: JSON.stringify({ ...bodyOk }),
          updated_at: '2026-03-01',
          updated_by_username: 'admin',
        }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new SavePoliticaInstitucionalUseCase(deps) };
  };

  it.each(['calificacionContextoRepository', 'evaluationConfigurationRepository', 'logger'])(
    'exige %s',
    (k) => {
      const { deps } = crear();
      const resto = { ...deps };
    delete resto[k];
      expect(() => new SavePoliticaInstitucionalUseCase(resto)).toThrow(`${k} es requerido`);
    }
  );

  it('sin gestión vigente lanza 404 y no persiste', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue({});
    await expect(useCase.execute(bodyOk, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).not.toHaveBeenCalled();
  });

  it('persiste el documento en la gestión vigente y devuelve la política guardada', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute(bodyOk, 7);

    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        cuotaTeorico: 40,
        cuotaPractico: 60,
        pesosBimestres: [10, 20, 30, 40],
        notaMinimaAprobacion: 55,
      }),
      7
    );
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(1);
    expect(r.politica).toMatchObject({
      gestionId: 1,
      gestionNombre: 'Gestión 2026',
      configurada: true,
      cuotaTeorico: 40,
      ultimaModificacion: { updatedByNombre: 'admin' },
    });
  });

  it('userId por defecto es null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(bodyOk);
    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).toHaveBeenCalledWith(
      1,
      expect.any(Object),
      null
    );
  });

  it('rechaza (400) teórico + práctico distinto de 100', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ ...bodyOk, cuotaTeorico: 50, cuotaPractico: 60 }, 1))
      .rejects.toMatchObject({
        statusCode: 400,
        message: 'La ponderación teórico + práctico debe sumar 100%',
      });
    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).not.toHaveBeenCalled();
  });

  it('rechaza (400) pesos de bimestres que no suman 100', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ ...bodyOk, pesosBimestres: [25, 25, 25, 20] }, 1))
      .rejects.toMatchObject({
        statusCode: 400,
        message: 'La ponderación de los 4 bimestres debe sumar 100%',
      });
    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).not.toHaveBeenCalled();
  });

  it('cuerpo vacío no suma 100 y se rechaza con 400', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({}, 1)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('tolera diferencias de redondeo de hasta 0.01', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(
      { ...bodyOk, cuotaTeorico: 33.33, cuotaPractico: 66.67, pesosBimestres: [33.33, 33.33, 33.34, 0] },
      1
    );
    expect(deps.evaluationConfigurationRepository.upsertPoliticaVigente).toHaveBeenCalled();
  });

  it('política COMPUTA_NOTA conserva pesoAsistencia en el documento', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(
      { ...bodyOk, politicaAsistenciaDefault: { politica: 'COMPUTA_NOTA', pesoAsistencia: 10 } },
      1
    );
    const doc = deps.evaluationConfigurationRepository.upsertPoliticaVigente.mock.calls[0][1];
    expect(doc.politicaAsistenciaDefault).toMatchObject({
      politica: 'COMPUTA_NOTA',
      pesoAsistencia: 10,
    });
  });
});
