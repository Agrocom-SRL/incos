import { jest } from '@jest/globals';
import { ListPagosAportesUseCase } from '../../../src/application/use-cases/pagos/ListPagosAportesUseCase.js';

describe('ListPagosAportesUseCase', () => {
  const fila = (id, extra = {}) => ({
    id,
    estudiante_id: 7,
    estudiante_nombres: 'Ana',
    gestion_id: 3,
    gestion_anio: 2026,
    monto_obligatorio: 400,
    estado: 'PARCIAL',
    ...extra,
  });

  const crear = ({ conCompromisos = true } = {}) => {
    const deps = {
      contributionPaymentRepository: {
        obtenerListadoPagosAportes: jest.fn().mockResolvedValue({
          contributionPayments: [fila(1), fila(2)],
          total: 120,
        }),
      },
      compromisoPagoRepository: conCompromisos
        ? { findVigentesByPagoAporteIds: jest.fn().mockResolvedValue([]) }
        : undefined,
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListPagosAportesUseCase(deps) };
  };

  it('exige repositorio y logger', () => {
    expect(() => new ListPagosAportesUseCase({ logger: {} })).toThrow('contributionPaymentRepository');
    expect(() => new ListPagosAportesUseCase({ contributionPaymentRepository: {} })).toThrow('logger');
  });

  it('lista, mapea y pagina (clave "pagos" del contrato)', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ estado: 'PARCIAL' }, '2', '50', { q: 'ana' });

    expect(deps.contributionPaymentRepository.obtenerListadoPagosAportes)
      .toHaveBeenCalledWith({ estado: 'PARCIAL' }, 2, 50, { q: 'ana' });
    expect(result).toMatchObject({ total: 120, page: 2, limit: 50, totalPages: 3 });
    expect(result.pagos).toHaveLength(2);
    expect(result.pagos[0]).toMatchObject({
      id: 1,
student_id: 7,
monto_obligatorio: 400,
estado: 'PARCIAL',
      estudiante: { id: 7, nombre: 'Ana' },
      gestion: { id: 3, anio: 2026 },
    });
  });

  it('aplica page=1 y limit=50 por defecto, incluso con valores inválidos', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({}, 'x', 0);
    expect(deps.contributionPaymentRepository.obtenerListadoPagosAportes)
      .toHaveBeenCalledWith({}, 1, 50, {});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it('adjunta el compromiso vigente de cada pago y null a los demás', async () => {
    const { useCase, deps } = crear();
    deps.compromisoPagoRepository.findVigentesByPagoAporteIds.mockResolvedValue([
      { id: 9, pagoAporteId: 2, fechaCompromiso: '2000-01-01', estado: 'VIGENTE', observacion: 'o' },
    ]);
    const result = await useCase.execute();
    expect(deps.compromisoPagoRepository.findVigentesByPagoAporteIds).toHaveBeenCalledWith([1, 2]);
    expect(result.pagos[0].compromiso).toBeNull();
    expect(result.pagos[1].compromiso).toMatchObject({
      id: 9, fechaCompromiso: '2000-01-01', estado: 'VIGENTE', alerta: 'VENCIDA',
    });
    expect(result.pagos[1].compromiso.diasAtraso).toBeGreaterThan(0);
  });

  it('sin repositorio de compromisos deja compromiso en null', async () => {
    const { useCase } = crear({ conCompromisos: false });
    const result = await useCase.execute();
    expect(result.pagos.map((p) => p.compromiso)).toEqual([null, null]);
  });

  it('si falla la consulta de compromisos el listado sigue y avisa por log', async () => {
    const { useCase, deps } = crear();
    deps.compromisoPagoRepository.findVigentesByPagoAporteIds.mockRejectedValue(new Error('db'));
    const result = await useCase.execute();
    expect(result.pagos).toHaveLength(2);
    expect(result.pagos[0].compromiso).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('resultado vacío no consulta compromisos', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.obtenerListadoPagosAportes.mockResolvedValue({});
    const result = await useCase.execute();
    expect(result).toMatchObject({ pagos: [], total: 0, totalPages: 0 });
    expect(deps.compromisoPagoRepository.findVigentesByPagoAporteIds).not.toHaveBeenCalled();
  });

  it('registra y propaga errores del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.obtenerListadoPagosAportes.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
