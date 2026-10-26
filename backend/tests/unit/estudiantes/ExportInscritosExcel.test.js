import { describe, it, expect, jest } from '@jest/globals';

const mockExcel = {
  generarListaInscritosPorCarrera: jest.fn(),
  generarListaAportesPorCarrera: jest.fn(),
  generarReporteInscritos: jest.fn(),
};
jest.unstable_mockModule('../../../src/infrastructure/external/excel/ExcelGenerator.js', () => ({
  ExcelGenerator: mockExcel,
}));

const { ExportStudentEnrollmentStudentListExcelUseCase } = await import(
  '../../../src/application/use-cases/estudiantes/ExportStudentEnrollmentStudentListExcelUseCase.js'
);
const { ExportPaymentAporteByCareerExcelUseCase } = await import(
  '../../../src/application/use-cases/pagos/ExportPaymentAporteByCareerExcelUseCase.js'
);
const { ExportStudentEnrollmentStatisticsExcelUseCase } = await import(
  '../../../src/application/use-cases/estudiantes/ExportStudentEnrollmentStatisticsExcelUseCase.js'
);
const { NotFoundError, ValidationError } = await import('../../../src/domain/errors/AppError.js');

const plano = (o) => ({ toPlainObject: () => o });

const casos = [
  ['lista de inscritos por carrera', ExportStudentEnrollmentStudentListExcelUseCase, 'studentEnrollmentStudentListExcelReportRepository', 'findRowsByGestionIdAndCarreraId', 'generarListaInscritosPorCarrera', 'lista_inscritos_', true],
  ['lista de aportes por carrera', ExportPaymentAporteByCareerExcelUseCase, 'paymentAporteCareerExcelReportRepository', 'findRowsByGestionIdAndCarreraId', 'generarListaAportesPorCarrera', 'lista_aportes_', true],
];

describe.each(casos)('Excel %s', (_n, Clase, repoKey, repoMethod, genMethod, prefijo) => {
  const crear = () => {
    const deps = {
      [repoKey]: { [repoMethod]: jest.fn().mockResolvedValue([{ a: 1 }]) },
      managementRepository: {
        findById: jest.fn().mockResolvedValue(plano({ year: 2026, name: 'Gestión 2026' })),
        findBy: jest.fn().mockResolvedValue({ id: 3 }),
      },
      careerRepository: { findById: jest.fn().mockResolvedValue(plano({ name: 'Mecánica', code: 'MEC-1' })) },
      logger: { info: jest.fn() },
    };
    mockExcel[genMethod].mockResolvedValue(new Uint8Array([1]));
    return { deps, useCase: new Clase(deps) };
  };

  it('genera el libro para la gestión indicada', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ gestionId: '3', carreraId: '8' });
    expect(deps[repoKey][repoMethod]).toHaveBeenCalledWith(3, 8);
    expect(mockExcel[genMethod]).toHaveBeenCalledWith([{ a: 1 }], {
      gestion_anio: '2026',
      gestion_nombre: 'Gestión 2026',
      carrera_nombre: 'Mecánica',
      carrera_codigo: 'MEC-1',
    });
    expect(r.fileName).toBe(`${prefijo}MEC-1_2026.xlsx`);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
  });

  it('sin gestionId usa la vigente y acepta entidades sin toPlainObject', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findBy.mockResolvedValue(plano({ id: 4 }));
    deps.managementRepository.findById.mockResolvedValue({ anio: 2025 });
    deps.careerRepository.findById.mockResolvedValue({ codigo: 'C 1' });
    const r = await useCase.execute({ carreraId: 8 });
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ vigente: true, isActive: true });
    expect(r.fileName).toBe(`${prefijo}C_1_2025.xlsx`);
  });

  it('sin datos de gestión/carrera usa los ids en el nombre', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValueOnce({ id: 3 }).mockResolvedValueOnce(null);
    deps.careerRepository.findById.mockResolvedValue({});
    const r = await useCase.execute({ gestionId: 3, carreraId: 8 });
    expect(r.fileName).toBe(`${prefijo}carrera_8_3.xlsx`);
  });

  it('valida carrera, gestión y existencia', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ carreraId: '' })).rejects.toThrow('carrera_id inválido');
    await expect(useCase.execute({ carreraId: 'x', gestionId: 3 })).rejects.toThrow('carrera_id inválido');
    await expect(useCase.execute({ carreraId: 0, gestionId: 3 })).rejects.toThrow('carrera_id inválido');
    await expect(useCase.execute({ carreraId: 8, gestionId: 'x' })).rejects.toThrow('gestion_id inválido');
    deps.managementRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ carreraId: 8, gestionId: 9 })).rejects.toBeInstanceOf(NotFoundError);
    deps.managementRepository.findBy.mockResolvedValueOnce(null);
    await expect(useCase.execute({ carreraId: 8 })).rejects.toThrow('No hay una gestión vigente');
    deps.managementRepository.findBy.mockResolvedValueOnce({});
    await expect(useCase.execute({ carreraId: 8 })).rejects.toThrow('No se pudo determinar la gestión vigente');
    deps.careerRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ carreraId: 8, gestionId: 3 })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ExportStudentEnrollmentStatisticsExcelUseCase', () => {
  const crear = () => {
    const deps = {
      studentEnrollmentExcelReportRepository: { findRowsByGestionId: jest.fn().mockResolvedValue([1, 2]) },
      managementRepository: {
        findById: jest.fn().mockResolvedValue({ year: 2026, name: 'G26' }),
        findBy: jest.fn().mockResolvedValue({ id: 3 }),
      },
      logger: { info: jest.fn() },
    };
    mockExcel.generarReporteInscritos.mockResolvedValue(Buffer.from('x'));
    return { deps, useCase: new ExportStudentEnrollmentStatisticsExcelUseCase(deps) };
  };

  it('genera la estadística solo con columnas de inscripción', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ gestionId: 3 });
    expect(deps.studentEnrollmentExcelReportRepository.findRowsByGestionId).toHaveBeenCalledWith(3);
    expect(mockExcel.generarReporteInscritos).toHaveBeenCalledWith(
      [1, 2],
      { gestion_anio: '2026', gestion_nombre: 'G26' },
      { soloInscripcion: true }
    );
    expect(r.fileName).toBe('estadistica_inscritos_2026.xlsx');
  });

  it('usa la gestión vigente y el id si no hay año', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    const r = await useCase.execute();
    expect(r.fileName).toBe('estadistica_inscritos_3.xlsx');
  });

  it('valida gestión', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ gestionId: 'x' })).rejects.toThrow('gestion_id inválido');
    deps.managementRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ gestionId: 5 })).rejects.toBeInstanceOf(NotFoundError);
    deps.managementRepository.findBy.mockResolvedValueOnce(null);
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
    deps.managementRepository.findBy.mockResolvedValueOnce({});
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
  });
});
