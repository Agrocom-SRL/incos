import { jest } from '@jest/globals';
import { SaveObservacionCentralizadorBimestreUseCase } from '../../../src/application/use-cases/academico/SaveObservacionCentralizadorBimestreUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('SaveObservacionCentralizadorBimestreUseCase', () => {
  const crear = (filas = 3) => {
    const repo = {
      actualizarObservacionBimestreParaleloEstudiante: jest.fn().mockResolvedValue(filas),
    };
    const logger = { info: jest.fn() };
    return {
      repo,
      logger,
      useCase: new SaveObservacionCentralizadorBimestreUseCase({
        subjectEnrollmentBimesterRepository: repo,
        logger,
      }),
    };
  };
  const base = { usuarioId: 9, paraleloGestionId: 5, estudianteId: 100, bimestre: 2 };

  it('exige el repositorio', () => {
    expect(() => new SaveObservacionCentralizadorBimestreUseCase({})).toThrow(
      'subjectEnrollmentBimesterRepository es requerido'
    );
  });

  it('guarda un verdicto válido y delega en el repositorio', async () => {
    const { useCase, repo } = crear(3);
    const r = await useCase.execute({ ...base, observacion: 'APROBADO/A' });

    expect(repo.actualizarObservacionBimestreParaleloEstudiante).toHaveBeenCalledWith({
      paraleloGestionId: 5,
      estudianteId: 100,
      bimestre: 2,
      observacion: 'APROBADO/A',
      usuarioId: 9,
    });
    expect(r).toEqual({
      paraleloGestionId: 5,
      estudianteId: 100,
      bimestre: 2,
      observacion: 'APROBADO/A',
      filasActualizadas: 3,
    });
  });

  it('acepta ids como string y recorta espacios de la observación', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({
      usuarioId: 9,
      paraleloGestionId: '5',
      estudianteId: '100',
      bimestre: '4',
      observacion: '  NO SE PRESENTO ',
    });
    expect(repo.actualizarObservacionBimestreParaleloEstudiante).toHaveBeenCalledWith(
      expect.objectContaining({ paraleloGestionId: 5, bimestre: 4, observacion: 'NO SE PRESENTO' })
    );
  });

  it.each([[undefined], [null], [''], ['   ']])(
    'observación vacía (%p) limpia la observación (null)',
    async (obs) => {
      const { useCase, repo } = crear();
      const r = await useCase.execute({ ...base, observacion: obs });
      expect(r.observacion).toBeNull();
      expect(repo.actualizarObservacionBimestreParaleloEstudiante).toHaveBeenCalledWith(
        expect.objectContaining({ observacion: null })
      );
    }
  );

  it('usuarioId ausente se envía como null', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ ...base, usuarioId: undefined, observacion: 'ABANDONO' });
    expect(repo.actualizarObservacionBimestreParaleloEstudiante).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: null })
    );
  });

  it('rechaza texto libre fuera del catálogo', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ ...base, observacion: 'lo que sea' })).rejects.toThrow(
      ValidationError
    );
    expect(repo.actualizarObservacionBimestreParaleloEstudiante).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['x'], [undefined], [-1]])('rechaza bimestre %p', async (bimestre) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ ...base, bimestre, observacion: null })).rejects.toThrow(
      'bimestre debe ser un entero entre 1 y 4'
    );
    expect(repo.actualizarObservacionBimestreParaleloEstudiante).not.toHaveBeenCalled();
  });

  it.each([[0], ['abc'], [undefined], [-3]])('rechaza paraleloGestionId %p', async (v) => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...base, paraleloGestionId: v })).rejects.toThrow(
      'paraleloGestionId inválido'
    );
  });

  it.each([[0], ['abc'], [null]])('rechaza estudianteId %p', async (v) => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...base, estudianteId: v })).rejects.toThrow(
      'estudianteId inválido'
    );
  });
});
