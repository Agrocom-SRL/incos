import { jest } from '@jest/globals';
import { SearchStudentsForAporteRegistroUseCase } from '../../../src/application/use-cases/pagos/SearchStudentsForAporteRegistroUseCase.js';

describe('SearchStudentsForAporteRegistroUseCase', () => {
  const crear = (rows = []) => {
    const studentRepository = { buscarParaRegistroAporte: jest.fn().mockResolvedValue(rows) };
    return { studentRepository, useCase: new SearchStudentsForAporteRegistroUseCase({ studentRepository, logger: {} }) };
  };

  it('exige dependencias', () => {
    expect(() => new SearchStudentsForAporteRegistroUseCase({ logger: {} })).toThrow();
    expect(() => new SearchStudentsForAporteRegistroUseCase({ studentRepository: {} })).toThrow();
  });

  it('con término < 2 caracteres devuelve [] sin consultar', async () => {
    const { useCase, studentRepository } = crear();
    await expect(useCase.execute({ q: ' a ' })).resolves.toEqual([]);
    await expect(useCase.execute({})).resolves.toEqual([]);
    expect(studentRepository.buscarParaRegistroAporte).not.toHaveBeenCalled();
  });

  it('busca con el término recortado y mapea el DTO', async () => {
    const { useCase, studentRepository } = crear([
      {
        id: 1,
codigo_estudiante: 'E1',
nombres: 'Ana',
apellido_paterno: 'Paz',
apellido_materno: '',
        cabeceras_total: '2',
cabeceras_con_saldo: '1',
saldo_pendiente_total: '150.50',
      },
    ]);
    const res = await useCase.execute({ q: '  ana ', limit: 10 });
    expect(studentRepository.buscarParaRegistroAporte).toHaveBeenCalledWith({ q: 'ana', limit: 10 });
    expect(res[0]).toMatchObject({
      id: 1,
      nombreCompleto: 'Ana Paz',
      aporteRegistro: { tieneCabeceraAporte: true, tieneSaldoPendiente: true, aporteTotalmenteCubierto: false, saldoPendienteTotal: 150.5 },
    });
  });

  it('modo preliminar no exige término', async () => {
    const { useCase, studentRepository } = crear([]);
    await useCase.execute({ preliminar: true });
    expect(studentRepository.buscarParaRegistroAporte).toHaveBeenCalledWith({ preliminar: true, limit: 50 });
  });

  it('aporte totalmente cubierto: cabeceras sin saldo', async () => {
    const { useCase } = crear([{ id: 1, codigo_estudiante: 'E1', cabeceras_total: 1, cabeceras_con_saldo: 0, saldo_pendiente_total: 0 }]);
    const [dto] = await useCase.execute({ q: 'E1' });
    expect(dto.aporteRegistro).toEqual({ tieneCabeceraAporte: true, tieneSaldoPendiente: false, aporteTotalmenteCubierto: true, saldoPendienteTotal: 0 });
    expect(dto.nombreCompleto).toBe('E1');
  });

  it('sin cabeceras no está cubierto ni tiene saldo', async () => {
    const { useCase } = crear([{ id: 1, codigo_estudiante: 'E1' }]);
    const [dto] = await useCase.execute({ q: 'E1' });
    expect(dto.aporteRegistro).toEqual({ tieneCabeceraAporte: false, tieneSaldoPendiente: false, aporteTotalmenteCubierto: false, saldoPendienteTotal: 0 });
  });
});
