import { describe, it, expect, jest } from '@jest/globals';
import { CreateTeacherUseCase } from '../../../src/application/use-cases/docentes/CreateTeacherUseCase.js';

describe('CreateTeacherUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: { create: jest.fn().mockResolvedValue({ id: 8 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateTeacherUseCase(deps) };
  };

  it('mapea el body a dominio, crea con el usuario y devuelve el id', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(
      { ci: ' 123 ', nombres: 'Ana', apellidoPaterno: 'Perez', expedicion: 'cb', celular: '7000' },
      42
    );

    expect(res).toEqual({ docente: { id: 8 } });
    const [domain, userId] = deps.teacherRepository.create.mock.calls[0];
    expect(userId).toBe(42);
    expect(domain).toMatchObject({
      ci: '123',
firstName: 'Ana',
lastName: 'Perez',
expedition: 'CB',
mobilePhone: '7000',
      nationality: 'Boliviana',
active: true,
    });
  });

  it('aplica valores por defecto cuando faltan campos opcionales', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ci: '1', nombres: 'A' });
    expect(deps.teacherRepository.create.mock.calls[0][0]).toMatchObject({
      expedition: 'LP',
lastName: '-',
motherLastName: null,
contractType: 'CONTRATO',
      laborState: 'ACTIVO',
academicLevel: 'LICENCIATURA',
yearsOfExperience: 0,
    });
    expect(deps.teacherRepository.create.mock.calls[0][1]).toBeNull();
  });

  it('respeta activo=false', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ci: '1', nombres: 'A', activo: false });
    expect(deps.teacherRepository.create.mock.calls[0][0].active).toBe(false);
  });

  it('propaga los errores del repositorio (p. ej. CI duplicado)', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.create.mockRejectedValue(new Error('duplicado'));
    await expect(useCase.execute({ ci: '1', nombres: 'A' })).rejects.toThrow('duplicado');
  });
});
