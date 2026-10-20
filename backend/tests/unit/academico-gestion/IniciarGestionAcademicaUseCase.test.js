import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { IniciarGestionAcademicaUseCase } = await import(
  '../../../src/application/use-cases/academico/IniciarGestionAcademicaUseCase.js'
);

describe('IniciarGestionAcademicaUseCase', () => {
  const crear = ({ ctx = { gestion_id: '7' }, flag = null, cursando = false } = {}) => {
    const deps = {
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      subjectEnrollmentRepository: {
        existeCursandoEnGestion: jest.fn().mockResolvedValue(cursando),
        marcarCursandoPorGestion: jest.fn().mockResolvedValue(12),
      },
      subjectEnrollmentBimesterRepository: { abrirBimestresFaltantesPorGestion: jest.fn().mockResolvedValue(undefined) },
      configuracionSistemaRepository: {
        obtenerValorPorClave: jest.fn().mockResolvedValue(flag),
        establecerValor: jest.fn().mockResolvedValue(undefined),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new IniciarGestionAcademicaUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('pasa matrículas a CURSANDO, abre bimestres y marca la bandera', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ userId: 4 });

    expect(res).toEqual({ matriculasInscritoACursando: 12 });
    expect(deps.subjectEnrollmentRepository.marcarCursandoPorGestion).toHaveBeenCalledWith(7, 4, { transaction: 'TX' });
    expect(deps.subjectEnrollmentBimesterRepository.abrirBimestresFaltantesPorGestion).toHaveBeenCalledWith(7, 4, { transaction: 'TX' });
    expect(deps.configuracionSistemaRepository.establecerValor).toHaveBeenCalledWith(
      'cursado_iniciado_7', 'true', expect.objectContaining({ tipo: 'BOOLEAN' }), 4,
    );
  });

  it.each([[null], [{}], [{ gestion_id: null }]])('409 si no hay gestión vigente (%p)', async (ctx) => {
    const { useCase } = crear({ ctx });
    await expect(useCase.execute({ userId: 1 })).rejects.toMatchObject({ statusCode: 409 });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('409 GESTION_YA_INICIADA si la bandera es "true"', async () => {
    const { useCase, deps } = crear({ flag: 'true' });
    await expect(useCase.execute({ userId: 1 })).rejects.toMatchObject({ statusCode: 409, code: 'GESTION_YA_INICIADA' });
    expect(deps.subjectEnrollmentRepository.existeCursandoEnGestion).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('con bandera "false" permite iniciar sin consultar el criterio derivado', async () => {
    const { useCase, deps } = crear({ flag: 'false', cursando: true });
    await expect(useCase.execute({ userId: 1 })).resolves.toBeDefined();
    expect(deps.subjectEnrollmentRepository.existeCursandoEnGestion).not.toHaveBeenCalled();
  });

  it('sin bandera cae al criterio derivado (hay matrículas CURSANDO)', async () => {
    const { useCase, deps } = crear({ flag: null, cursando: true });
    await expect(useCase.execute({ userId: 1 })).rejects.toMatchObject({ code: 'GESTION_YA_INICIADA' });
    expect(deps.subjectEnrollmentRepository.existeCursandoEnGestion).toHaveBeenCalledWith(7);
  });

  it('si falla guardar la bandera, solo advierte y devuelve el resultado', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.establecerValor.mockRejectedValue(new Error('x'));
    await expect(useCase.execute({ userId: 1 })).resolves.toEqual({ matriculasInscritoACursando: 12 });
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('funciona sin repositorio de configuración (opcional)', async () => {
    const { useCase, deps } = crear();
    useCase.configuracion = undefined;
    await expect(useCase.execute({ userId: 1 })).resolves.toBeDefined();
    expect(deps.subjectEnrollmentRepository.existeCursandoEnGestion).toHaveBeenCalled();
  });
});
