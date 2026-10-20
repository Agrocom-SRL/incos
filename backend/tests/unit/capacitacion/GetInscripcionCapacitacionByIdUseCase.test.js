import { describe, it, expect, jest } from '@jest/globals';
import { GetInscripcionCapacitacionByIdUseCase } from '../../../src/application/use-cases/capacitacion/GetInscripcionCapacitacionByIdUseCase.js';

describe('GetInscripcionCapacitacionByIdUseCase', () => {
  const crear = ({ row = { id: 2, estado: 'INSCRITO' }, pagos = [] } = {}) => {
    const deps = {
      inscripcionCapacitacionRepository: { findListadoRowById: jest.fn().mockResolvedValue(row) },
      pagoCapacitacionRepository: { findDetalleByInscripcionId: jest.fn().mockResolvedValue(pagos) },
      capacitacionCompromisoRepository: { marcarVencidosComoIncumplidos: jest.fn().mockResolvedValue(0) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetInscripcionCapacitacionByIdUseCase(deps) };
  };

  it('devuelve la ficha con pagos y marca vencidos antes de leer', async () => {
    const { deps, useCase } = crear({ pagos: [{ id: 1, monto: '10' }, { id: 2, monto: '5' }] });
    const res = await useCase.execute(2);
    expect(deps.capacitacionCompromisoRepository.marcarVencidosComoIncumplidos).toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.findListadoRowById).toHaveBeenCalledWith(2);
    expect(deps.pagoCapacitacionRepository.findDetalleByInscripcionId).toHaveBeenCalledWith(2);
    expect(res.pagos).toHaveLength(2);
  });

  it('devuelve null si no existe y no consulta pagos', async () => {
    const { deps, useCase } = crear({ row: null });
    await expect(useCase.execute(9)).resolves.toBeNull();
    expect(deps.pagoCapacitacionRepository.findDetalleByInscripcionId).not.toHaveBeenCalled();
  });
});
