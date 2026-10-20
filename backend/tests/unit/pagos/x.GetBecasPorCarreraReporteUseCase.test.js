import { jest } from '@jest/globals';
import { GetBecasPorCarreraReporteUseCase } from '../../../src/application/use-cases/pagos/GetBecasPorCarreraReporteUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetBecasPorCarreraReporteUseCase', () => {
  const fila = (over = {}) => ({
    carrera_id: 1,
    carrera_nombre: 'Sistemas',
    carrera_codigo: 'SIS',
    periodo_id: 11,
    periodo_numero: 1,
    periodo_nombre: 'Primero',
    paralelo_id: 21,
    paralelo_nombre: 'A',
    paralelo_turno: 'MAÑANA',
    estudiante_id: 100,
    apellido_paterno: 'Paz',
    apellido_materno: 'Lima',
    nombres: 'Ana',
    beca_porcentaje: 0,
    ...over,
  });
  const conBeca = (id, pct, over = {}) =>
    fila({ estudiante_id: id, beca_porcentaje: pct, beca_tipo_nombre: 'Excelencia', beca_descuento_nombre: `B${pct}`, descuento_beca: 50, aporte_monto_base: 200, ...over });

  const crear = ({ rows = [], becas = [], gestion = { id: 3, name: 'G2026', year: 2026 } } = {}) => {
    const viewRepo = { findRowsByGestionId: jest.fn().mockResolvedValue(rows) };
    const managementRepository = {
      findById: jest.fn().mockResolvedValue(gestion),
      findBy: jest.fn().mockResolvedValue(gestion),
    };
    const scholarshipRepository = { findAll: jest.fn().mockResolvedValue({ scholarships: becas }) };
    return {
      viewRepo,
      managementRepository,
      scholarshipRepository,
      useCase: new GetBecasPorCarreraReporteUseCase({
        becasPorCarreraViewRepository: viewRepo,
        managementRepository,
        scholarshipRepository,
        logger: { info: jest.fn(), warn: jest.fn() },
      }),
    };
  };

  it('cuenta becados por porcentaje y arma el árbol carrera > periodo > paralelo', async () => {
    const { useCase, viewRepo } = crear({
      rows: [conBeca(1, 50), conBeca(2, 100, { apellido_paterno: 'Alva' }), fila({ estudiante_id: 3 }), fila({ estudiante_id: 4 })],
      becas: [{ percentage: 50 }, { percentage: 50 }, { percentage: 25 }],
    });
    const res = await useCase.execute({ gestionId: '3' });
    expect(viewRepo.findRowsByGestionId).toHaveBeenCalledWith(3);
    expect(res.gestion).toEqual({ id: 3, nombre: 'G2026', anio: 2026 });
    expect(res.porcentajes).toEqual([50, 100]);
    expect(res.totales).toEqual({ totalMatriculados: 4, becasPorPorcentaje: { 50: 1, 100: 1 }, totalConBeca: 2, porcentajeConBeca: 50 });
    expect(res.resumen).toEqual({ totalMatriculados: 4, totalConBeca: 2, porcentajeConBeca: 50, porcentajeSinBeca: 50 });

    const [carrera] = res.filas;
    expect(carrera).toMatchObject({ nivel: 'carrera', id: 'c1', totalMatriculados: 4, totalConBeca: 2 });
    const periodo = carrera.children[0];
    expect(periodo).toMatchObject({ nivel: 'periodo', label: 'Primero' });
    const paralelo = periodo.children[0];
    expect(paralelo).toMatchObject({ nivel: 'paralelo', label: 'Paralelo A (MAÑANA)', totalMatriculados: 4, totalConBeca: 2 });
    // Detalle solo de becados, ordenado por apellido paterno.
    expect(paralelo.estudiantes.map((e) => e.estudianteId)).toEqual([2, 1]);
    expect(paralelo.estudiantes[1]).toMatchObject({ becaPorcentaje: 50, montoDescuento: 50, montoBase: 200 });
  });

  it('distribución y catálogo incluyen tramos sin uso', async () => {
    const { useCase } = crear({
      rows: [conBeca(1, 50), conBeca(2, 50), fila({ estudiante_id: 3 })],
      becas: [{ percentage: 50 }, { percentage: 25 }, { percentage: 0 }, { percentage: 'x' }],
    });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.distribucion).toEqual([{ porcentaje: 50, etiqueta: 'Beca 50%', beneficiados: 2, porcentajeDelTotalConBeca: 100 }]);
    expect(res.catalogo).toEqual([
      { porcentaje: 25, etiqueta: 'Beca 25%', tipos: 1, beneficiados: 0, usado: false, porcentajeDelTotalConBeca: 0 },
      { porcentaje: 50, etiqueta: 'Beca 50%', tipos: 1, beneficiados: 2, usado: true, porcentajeDelTotalConBeca: 100 },
    ]);
    expect(res.catalogoResumen).toEqual({ totalTipos: 2, tramosTotales: 2, tramosUsados: 1 });
  });

  it('no cuenta como beca el porcentaje 0, negativo, NaN ni el tipo "NO APLICA"', async () => {
    const { useCase } = crear({
      rows: [
        fila({ estudiante_id: 1, beca_porcentaje: 0 }),
        fila({ estudiante_id: 2, beca_porcentaje: -10, beca_tipo_nombre: 'X' }),
        fila({ estudiante_id: 3, beca_porcentaje: 'abc', beca_tipo_nombre: 'X' }),
        fila({ estudiante_id: 4, beca_porcentaje: 50, beca_tipo_nombre: ' no aplica ' }),
        fila({ estudiante_id: 5, beca_porcentaje: null }),
      ],
    });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.totales.totalConBeca).toBe(0);
    expect(res.totales.totalMatriculados).toBe(5);
    expect(res.porcentajes).toEqual([]);
    expect(res.filas[0].children[0].children[0].estudiantes).toEqual([]);
  });

  it('un estudiante repetido se cuenta una sola vez', async () => {
    const { useCase } = crear({ rows: [conBeca(1, 50), conBeca(1, 50)] });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.totales).toMatchObject({ totalMatriculados: 1, totalConBeca: 1, becasPorPorcentaje: { 50: 1 } });
  });

  it('agrega varias carreras ordenadas por nombre', async () => {
    const { useCase } = crear({
      rows: [conBeca(1, 25, { carrera_id: 2, carrera_nombre: 'Contaduría' }), conBeca(2, 25, { carrera_id: 1, carrera_nombre: 'Administración' })],
    });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.filas.map((f) => f.carreraNombre)).toEqual(['Administración', 'Contaduría']);
    expect(res.totales.totalConBeca).toBe(2);
  });

  it('sin filas devuelve totales en cero sin dividir por cero', async () => {
    const { useCase } = crear({ rows: [] });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.filas).toEqual([]);
    expect(res.totales).toEqual({ totalMatriculados: 0, becasPorPorcentaje: {}, totalConBeca: 0, porcentajeConBeca: 0 });
    expect(res.resumen.porcentajeSinBeca).toBe(0);
  });

  it('tolera fallo del catálogo de becas', async () => {
    const { useCase, scholarshipRepository } = crear({ rows: [conBeca(1, 50)] });
    scholarshipRepository.findAll.mockRejectedValue(new Error('db'));
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.catalogo).toEqual([]);
    expect(res.totales.totalConBeca).toBe(1);
  });

  it('sin gestionId usa la gestión vigente', async () => {
    const { useCase, managementRepository } = crear();
    await useCase.execute();
    expect(managementRepository.findBy).toHaveBeenCalledWith({ vigente: true, isActive: true });
  });

  it('sin gestión vigente lanza ValidationError', async () => {
    const { useCase, managementRepository, viewRepo } = crear();
    managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
    expect(viewRepo.findRowsByGestionId).not.toHaveBeenCalled();
  });

  it('gestión inexistente lanza NotFoundError', async () => {
    const { useCase, managementRepository, viewRepo } = crear();
    managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionId: 99 })).rejects.toBeInstanceOf(NotFoundError);
    expect(viewRepo.findRowsByGestionId).not.toHaveBeenCalled();
  });

  it.each([[0], [-1], ['abc']])('gestionId inválido %p lanza ValidationError', async (gestionId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ gestionId })).rejects.toBeInstanceOf(ValidationError);
  });
});
