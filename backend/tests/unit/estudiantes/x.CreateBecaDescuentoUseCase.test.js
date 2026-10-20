import { jest } from '@jest/globals';
import { CreateBecaDescuentoUseCase } from '../../../src/application/use-cases/estudiantes/CreateBecaDescuentoUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateBecaDescuentoUseCase', () => {
  const crear = () => {
    const deps = {
      scholarshipRepository: {
        create: jest.fn().mockResolvedValue({ id: 9, name: 'Excelencia', percentage: 50, active: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateBecaDescuentoUseCase(deps) };
  };

  it('crea la beca con campos en español y devuelve becaDescuento mapeada', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(
      { nombre: 'Excelencia', porcentaje: 50, codigo: 'EXC', requiereDocumentacion: true },
      7
    );

    expect(deps.scholarshipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Excelencia',
        code: 'EXC',
        percentage: 50,
        requiresDocumentation: true,
        active: true,
      }),
      7
    );
    expect(res.becaDescuento).toEqual(expect.objectContaining({ id: 9, nombre: 'Excelencia', porcentaje: 50 }));
  });

  it('acepta alias en inglés y respeta active=false', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ name: 'X', percentage: 0, active: false });
    expect(deps.scholarshipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'X', percentage: 0, active: false }),
      null
    );
  });

  it('rechaza si falta el nombre', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ porcentaje: 10 })).rejects.toThrow(ValidationError);
    expect(deps.scholarshipRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta el porcentaje (undefined o null)', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ nombre: 'X' })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ nombre: 'X', porcentaje: null })).rejects.toThrow(ValidationError);
    expect(deps.scholarshipRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un body vacío', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toThrow(ValidationError);
  });
});
