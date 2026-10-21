import { jest } from '@jest/globals';
import { GetPoliticaInstitucionalUseCase } from '../../../src/application/use-cases/academico/GetPoliticaInstitucionalUseCase.js';

describe('GetPoliticaInstitucionalUseCase', () => {
  const ctx = { gestion_id: 1, gestion_anio: 2026, gestion_nombre: 'Gestión 2026' };
  const crear = () => {
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(ctx),
        obtenerGestionAnteriorPorAnio: jest.fn().mockResolvedValue(null),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
        findPoliticaRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetPoliticaInstitucionalUseCase(deps) };
  };

  it.each(['calificacionContextoRepository', 'evaluationConfigurationRepository', 'logger'])(
    'exige %s',
    (k) => {
      const { deps } = crear();
      const resto = { ...deps };
    delete resto[k];
      expect(() => new GetPoliticaInstitucionalUseCase(resto)).toThrow(`${k} es requerido`);
    }
  );

  it('sin gestión vigente lanza error 404', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue(null);
    await expect(useCase.execute()).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).not.toHaveBeenCalled();
  });

  it('gestión sin política configurada devuelve valores por defecto y configurada=false', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute();

    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(1);
    expect(deps.calificacionContextoRepository.obtenerGestionAnteriorPorAnio)
      .toHaveBeenCalledWith(2026);
    expect(r.gestionVigente).toBe('Gestión 2026');
    expect(r.politica).toMatchObject({
      gestionId: 1,
      configurada: false,
      cuotaTeorico: 30,
      cuotaPractico: 70,
      pesosBimestres: [25, 25, 25, 25],
      notaMinimaAprobacion: 61,
      ultimaModificacion: null,
    });
    expect(r.politicaGestionAnterior).toBeNull();
  });

  it('política configurada se lee del documento JSON y expone quién la modificó', async () => {
    const { useCase, deps } = crear();
    deps.evaluationConfigurationRepository.findActiveRowByGestionId.mockResolvedValue({
      id: 5,
      valor: JSON.stringify({
        cuotaTeorico: 40,
        cuotaPractico: 60,
        pesosBimestres: [10, 20, 30, 40],
        notaMinimaAprobacion: 51,
      }),
      updated_at: '2026-03-01',
      updated_by_username: 'admin',
    });
    const r = await useCase.execute();
    expect(r.politica).toMatchObject({
      configurada: true,
      cuotaTeorico: 40,
      cuotaPractico: 60,
      pesosBimestres: [10, 20, 30, 40],
      notaMinimaAprobacion: 51,
      ultimaModificacion: { updatedAt: '2026-03-01', updatedByNombre: 'admin' },
    });
  });

  it('incluye la política de la gestión anterior si existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerGestionAnteriorPorAnio.mockResolvedValue({
      id: 0,
      anio: 2025,
      nombre: 'Gestión 2025',
    });
    // id 0 es falsy: no debe consultarse
    let r = await useCase.execute();
    expect(r.politicaGestionAnterior).toBeNull();

    deps.calificacionContextoRepository.obtenerGestionAnteriorPorAnio.mockResolvedValue({
      id: 9,
      anio: 2025,
      nombre: 'Gestión 2025',
    });
    deps.evaluationConfigurationRepository.findPoliticaRowByGestionId.mockResolvedValue({
      id: 4,
      valor: JSON.stringify({ notaMinimaAprobacion: 55 }),
    });
    r = await useCase.execute();
    expect(deps.evaluationConfigurationRepository.findPoliticaRowByGestionId)
      .toHaveBeenCalledWith(9);
    expect(r.politicaGestionAnterior).toMatchObject({
      gestionId: 9,
      gestionNombre: 'Gestión 2025',
      configurada: true,
      notaMinimaAprobacion: 55,
    });
  });

  it('gestión anterior sin fila de política deja politicaGestionAnterior en null', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerGestionAnteriorPorAnio.mockResolvedValue({
      id: 9,
      anio: 2025,
    });
    const r = await useCase.execute();
    expect(r.politicaGestionAnterior).toBeNull();
  });

  it('nombre de gestión por defecto es el año cuando falta nombre', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue({
      gestion_id: 1,
      gestion_anio: 2026,
    });
    const r = await useCase.execute();
    expect(r.gestionVigente).toBe('2026');
  });
});
