import { jest } from '@jest/globals';
import { GetCuentasPorCobrarReporteUseCase } from '../../../src/application/use-cases/pagos/GetCuentasPorCobrarReporteUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetCuentasPorCobrarReporteUseCase', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date(2026, 5, 15, 12, 0, 0) }); // 2026-06-15 local
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const fila = (over = {}) => ({
    carrera_id: 1,
    carrera_nombre: 'Sistemas',
    paralelo_id: 10,
    paralelo_nombre: 'A',
    paralelo_turno: 'MAÑANA',
    estudiante_id: 100,
    pago_aporte_id: 500,
    apellido_paterno: 'Paz',
    apellido_materno: 'Lima',
    nombres: 'Ana',
    monto_total_deuda: 1000,
    monto_pagado: 400,
    saldo_pendiente: 600,
    ...over,
  });

  const crear = ({ rows = [fila()], ultimoPago = [], compromisos = [], config = { baseAmount: 1000 }, gestion = { id: 3, name: 'G2026', year: 2026 } } = {}) => {
    const viewRepo = {
      findRowsByGestionId: jest.fn().mockResolvedValue(rows),
      findUltimoPagoByGestionId: jest.fn().mockResolvedValue(ultimoPago),
    };
    const compromisoRepo = { findVigentesByPagoAporteIds: jest.fn().mockResolvedValue(compromisos) };
    const managementRepository = {
      findById: jest.fn().mockResolvedValue(gestion),
      findBy: jest.fn().mockResolvedValue(gestion),
    };
    const configRepo = { findBy: jest.fn().mockResolvedValue(config) };
    return {
      viewRepo,
      compromisoRepo,
      managementRepository,
      configRepo,
      useCase: new GetCuentasPorCobrarReporteUseCase({
        cuentasPorCobrarViewRepository: viewRepo,
        compromisoPagoRepository: compromisoRepo,
        managementRepository,
        contributionConfigurationRepository: configRepo,
        logger: { info: jest.fn(), warn: jest.fn() },
      }),
    };
  };

  it('construye jerarquía carrera > paralelo > estudiante con totales', async () => {
    const { useCase, viewRepo, compromisoRepo, configRepo } = crear({
      rows: [fila(), fila({ estudiante_id: 101, pago_aporte_id: 501, nombres: 'Beto', apellido_paterno: 'Alva', monto_pagado: 1000, saldo_pendiente: 0 })],
      ultimoPago: [{ pago_aporte_id: 500, fecha_ultimo_pago: '2026-05-01' }],
    });
    const res = await useCase.execute({ gestionId: '3' });
    expect(viewRepo.findRowsByGestionId).toHaveBeenCalledWith(3);
    expect(compromisoRepo.findVigentesByPagoAporteIds).toHaveBeenCalledWith([500, 501]);
    expect(configRepo.findBy).toHaveBeenCalledWith({ managementId: 3 });
    expect(res.gestion).toEqual({ id: 3, nombre: 'G2026', anio: 2026 });
    expect(res.montoMaximoPorEstudiante).toBe(1000);
    const [carrera] = res.carreras;
    expect(carrera).toMatchObject({ totalMatriculados: 2, montoMaximoTotal: 2000, totalCancelado: 1400, totalPendiente: 600, porcentajePendiente: 30 });
    const est = carrera.paralelos[0].estudiantes;
    expect(est.map((e) => e.nombreCompleto)).toEqual(['Alva Lima Beto', 'Paz Lima Ana']);
    expect(est[1]).toMatchObject({ montoTotal: 1000, totalPagado: 400, saldoPendiente: 600, porcentajeSaldo: 60, fechaUltimoPago: '2026-05-01' });
    expect(res.resumen).toEqual({ totalMatriculados: 2, montoMaximoTotal: 2000, totalCancelado: 1400, totalPendientePorCobrar: 600, porcentajePendiente: 30 });
  });

  it('deduplica el mismo estudiante en la misma carrera/paralelo (no suma deuda doble)', async () => {
    const { useCase } = crear({ rows: [fila(), fila()] });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.resumen.totalMatriculados).toBe(1);
    expect(res.resumen.totalPendientePorCobrar).toBe(600);
  });

  describe('estado según saldo y compromiso (hoy = 2026-06-15)', () => {
    const estadoCon = async (fechaCompromiso, saldo = 600, obs = 'obs') => {
      const { useCase } = crear({
        rows: [fila({ saldo_pendiente: saldo })],
        compromisos: fechaCompromiso ? [{ pagoAporteId: 500, fechaCompromiso, observacion: obs }] : [],
      });
      const res = await useCase.execute({ gestionId: 3 });
      return res.carreras[0].paralelos[0].estudiantes[0];
    };

    it('saldo 0 => AL_DIA', async () => {
      expect(await estadoCon(null, 0)).toMatchObject({ estado: 'AL_DIA', saldoPendiente: 0 });
    });
    it('saldo > 0 sin compromiso => SIN_COMPROMISO', async () => {
      expect(await estadoCon(null)).toMatchObject({ estado: 'SIN_COMPROMISO', observacion: 'Sin compromiso', diasAtraso: null });
    });
    it('compromiso pasado => VENCIDA con días de atraso', async () => {
      expect(await estadoCon('2026-06-10')).toMatchObject({ estado: 'VENCIDA', diasAtraso: 5, observacion: 'obs' });
    });
    it('compromiso hoy y a 3 días => PROXIMA', async () => {
      expect((await estadoCon('2026-06-15')).estado).toBe('PROXIMA');
      expect((await estadoCon('2026-06-18')).estado).toBe('PROXIMA');
    });
    it('compromiso a 4 días o más => AL_DIA', async () => {
      expect((await estadoCon('2026-06-19')).estado).toBe('AL_DIA');
    });
  });

  it('calcula el saldo cuando la vista no lo trae (nunca negativo)', async () => {
    const { useCase } = crear({
      rows: [
        fila({ saldo_pendiente: null, monto_total_deuda: 1000, monto_pagado: 300 }),
        fila({ estudiante_id: 101, pago_aporte_id: 501, saldo_pendiente: null, monto_total_deuda: 100, monto_pagado: 150 }),
      ],
    });
    const res = await useCase.execute({ gestionId: 3 });
    const saldos = res.carreras[0].paralelos[0].estudiantes.map((e) => e.saldoPendiente).sort((a, b) => a - b);
    expect(saldos).toEqual([0, 700]);
  });

  it('redondea a 2 decimales', async () => {
    const { useCase } = crear({ rows: [fila({ monto_total_deuda: 100.005, monto_pagado: 33.333, saldo_pendiente: 66.672 })] });
    const res = await useCase.execute({ gestionId: 3 });
    const e = res.carreras[0].paralelos[0].estudiantes[0];
    expect(e.totalPagado).toBe(33.33);
    expect(e.saldoPendiente).toBe(66.67);
  });

  it('monto máximo 0 si no hay configuración o el repositorio falla; porcentajes sin dividir por cero', async () => {
    const { useCase, configRepo } = crear();
    configRepo.findBy.mockRejectedValue(new Error('db'));
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.montoMaximoPorEstudiante).toBe(0);
    expect(res.resumen.porcentajePendiente).toBe(0);

    configRepo.findBy.mockResolvedValue(null);
    expect((await useCase.execute({ gestionId: 3 })).montoMaximoPorEstudiante).toBe(0);
  });

  it('sin filas devuelve estructura vacía', async () => {
    const { useCase } = crear({ rows: [] });
    const res = await useCase.execute({ gestionId: 3 });
    expect(res.carreras).toEqual([]);
    expect(res.resumen).toEqual({ totalMatriculados: 0, montoMaximoTotal: 0, totalCancelado: 0, totalPendientePorCobrar: 0, porcentajePendiente: 0 });
  });

  it('sin gestionId usa la gestión vigente', async () => {
    const { useCase, managementRepository } = crear();
    await useCase.execute();
    expect(managementRepository.findBy).toHaveBeenCalledWith({ vigente: true, isActive: true });
    expect(managementRepository.findById).not.toHaveBeenCalled();
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

  it.each([[0], [-3], ['abc']])('gestionId inválido %p lanza ValidationError', async (gestionId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ gestionId })).rejects.toBeInstanceOf(ValidationError);
  });

  it('matriculado sin cabecera (monto_total_deuda null) cae al monto máximo y no queda AL_DIA con deuda 0', async () => {
    const { useCase } = crear({
      rows: [fila({ pago_aporte_id: null, monto_total_deuda: null, monto_pagado: null, saldo_pendiente: null })],
    });
    const res = await useCase.execute({ gestionId: 3 });
    const est = res.carreras[0].paralelos[0].estudiantes[0];
    expect(est.montoTotal).toBe(1000);
    expect(est.saldoPendiente).toBe(1000);
    expect(est.estado).not.toBe('AL_DIA');
  });
});
