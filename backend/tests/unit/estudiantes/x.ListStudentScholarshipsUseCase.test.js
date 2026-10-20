import { jest } from '@jest/globals';
import { ListStudentScholarshipsUseCase } from '../../../src/application/use-cases/estudiantes/becas/ListStudentScholarshipsUseCase.js';

describe('ListStudentScholarshipsUseCase', () => {
  const fila = {
    id: 1,
    estudiante_id: 5,
    codigo_estudiante: 'E1',
    apellido_paterno: 'Lopez',
    apellido_materno: null,
    nombres: 'Ana',
    beca_descuento_id: 2,
    beca_nombre: 'Excelencia',
    beca_porcentaje: '50.00',
    gestion_id: 3,
    gestion_anio: 2026,
    estado: 'ACTIVA',
    documentos_completos: 1,
    carrera_nombre: 'Enf',
    paralelo_id: 9,
    paralelo_nombre: 'A',
    descuento_aplicado: '250',
    monto_obligatorio: null,
  };
  const crear = (rows = [fila], total = 31) => {
    const deps = {
      studentScholarshipRepository: { listarBecasAsignadas: jest.fn().mockResolvedValue({ rows, total }) },
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListStudentScholarshipsUseCase(deps) };
  };

  it('lista desde la vista y mapea la fila al shape del listado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, 2, 10, { studentId: '5', state: 'ACTIVA', search: 'ana' });

    expect(deps.studentScholarshipRepository.listarBecasAsignadas).toHaveBeenCalledWith({
      studentId: 5,
      managementId: undefined,
      scholarshipId: undefined,
      state: 'ACTIVA',
      search: 'ana',
      page: 2,
      limit: 10,
    });
    expect(res).toEqual(expect.objectContaining({ total: 31, page: 2, limit: 10, totalPages: 4 }));
    expect(res.becas[0]).toEqual(
      expect.objectContaining({
        id: 1,
        studentId: 5,
        documentsComplete: true,
        student: expect.objectContaining({ nombreCompleto: 'Lopez Ana' }),
        scholarship: expect.objectContaining({ nombre: 'Excelencia', porcentaje: 50 }),
        management: expect.objectContaining({ id: 3, anio: 2026 }),
        carrera: expect.objectContaining({ nombre: 'Enf', codigo: null }),
        paralelo: expect.objectContaining({ id: 9, nombre: 'A' }),
        impacto: { descuentoAplicado: 250, montoObligatorio: null },
      })
    );
  });

  it('queryParams tiene prioridad sobre filters', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ studentId: 1, state: 'PENDIENTE' }, 1, 10, { studentId: 2 });
    const arg = deps.studentScholarshipRepository.listarBecasAsignadas.mock.calls[0][0];
    expect(arg.studentId).toBe(2);
    expect(arg.state).toBe('PENDIENTE');
  });

  it('ids no numéricos (NaN) o vacíos se ignoran', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { studentId: 'abc', managementId: '', scholarshipId: null });
    const arg = deps.studentScholarshipRepository.listarBecasAsignadas.mock.calls[0][0];
    expect(arg.studentId).toBeUndefined();
    expect(arg.managementId).toBeUndefined();
    expect(arg.scholarshipId).toBeUndefined();
  });

  it('fila sin relaciones deja student/scholarship/management/carrera/paralelo/impacto en null', async () => {
    const { useCase } = crear([{ id: 7 }], 1);
    const res = await useCase.execute();
    expect(res.becas[0]).toEqual(
      expect.objectContaining({ student: null, scholarship: null, management: null, carrera: null, paralelo: null, impacto: null, documentsComplete: false })
    );
  });

  it('page/limit NaN caen a 1 y 50; total 0 da totalPages 0', async () => {
    const { useCase, deps } = crear([], 0);
    const res = await useCase.execute({}, 'x', 'y');
    expect(deps.studentScholarshipRepository.listarBecasAsignadas).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 50 })
    );
    expect(res.becas).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.listarBecasAsignadas.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
