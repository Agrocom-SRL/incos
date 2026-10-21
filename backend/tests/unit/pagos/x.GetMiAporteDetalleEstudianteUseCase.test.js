import { jest } from '@jest/globals';
import { GetMiAporteDetalleEstudianteUseCase } from '../../../src/application/use-cases/pagos/GetMiAporteDetalleEstudianteUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetMiAporteDetalleEstudianteUseCase', () => {
  const crear = ({ cuotas = [], detalle } = {}) => {
    const deps = {
      getPaymentAporteByIdUseCase: {
        execute: jest.fn().mockResolvedValue(detalle ?? { id: 5, student_id: 7, monto_obligatorio: 100, reciboDocumento: { id: 1 } }),
      },
      contributionPaymentInstallmentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: cuotas }),
      },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue({ name: 'Efectivo' }) },
      studentRepository: { findAll: jest.fn().mockResolvedValue({ students: [{ id: 7 }] }), findById: jest.fn() },
      userRepository: { findById: jest.fn() },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetMiAporteDetalleEstudianteUseCase(deps) };
  };

  it('exige dependencias obligatorias', () => {
    const { deps } = crear();
    for (const k of ['getPaymentAporteByIdUseCase', 'contributionPaymentInstallmentRepository', 'studentRepository', 'userRepository', 'logger']) {
      expect(() => new GetMiAporteDetalleEstudianteUseCase({ ...deps, [k]: undefined })).toThrow();
    }
  });

  it('devuelve el detalle propio con cuotas ordenadas, sin recibo', async () => {
    const { useCase, deps } = crear({
      cuotas: [
        { id: 2, amount: '30.5', paymentDate: '2026-02-01', paymentMethodId: 1, receiptNumber: ' R2 ' },
        { id: 1, amount: 10, paymentDate: '2026-01-01', paymentMethodId: 1, comprobanteCode: 'C1' },
        { id: 3, amount: 'abc', paymentDate: '2026-02-01' },
      ],
    });
    const res = await useCase.execute({ usuarioId: 20, cabeceraId: '5' });
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 20 });
    expect(deps.getPaymentAporteByIdUseCase.execute).toHaveBeenCalledWith(5);
    expect(res.reciboDocumento).toBeUndefined();
    expect(res.cuotas.map((c) => [c.id, c.numero, c.monto])).toEqual([[1, 1, 10], [2, 2, 30.5], [3, 3, 0]]);
    expect(res.cuotas[0]).toMatchObject({ metodoPago: 'Efectivo', nroComprobante: 'C1', numeroRecibo: null, estado: 'PAGADO' });
    expect(res.cuotas[1].numeroRecibo).toBe('R2');
    expect(deps.paymentMethodRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('un aporte ajeno responde NotFound (no filtra existencia)', async () => {
    const { useCase, deps } = crear({ detalle: { id: 5, student_id: 8 } });
    await expect(useCase.execute({ usuarioId: 20, cabeceraId: 5 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.contributionPaymentInstallmentRepository.findAll).not.toHaveBeenCalled();
  });

  it('toma el dueño de estudiante.id si no hay student_id', async () => {
    const { useCase } = crear({ detalle: { id: 5, estudiante: { id: 7 } } });
    await expect(useCase.execute({ usuarioId: 20, cabeceraId: 5 })).resolves.toMatchObject({ id: 5, cuotas: [] });
  });

  it('detalle sin dueño identificable responde NotFound', async () => {
    const { useCase } = crear({ detalle: { id: 5 } });
    await expect(useCase.execute({ usuarioId: 20, cabeceraId: 5 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([[0], [-1], ['x'], [undefined], [Infinity]])('cabeceraId inválido %p responde NotFound sin consultar', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 20, cabeceraId: id })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.studentRepository.findAll).not.toHaveBeenCalled();
    expect(deps.getPaymentAporteByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('usuario no vinculado a estudiante recibe Forbidden', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findAll.mockResolvedValue({ students: [] });
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 3 });
    await expect(useCase.execute({ usuarioId: 20, cabeceraId: 5 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.getPaymentAporteByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('si falla la búsqueda del método de pago, la cuota queda sin método', async () => {
    const { useCase, deps } = crear({ cuotas: [{ id: 1, amount: 5, paymentMethodId: 1 }] });
    deps.paymentMethodRepository.findById.mockRejectedValue(new Error('x'));
    const res = await useCase.execute({ usuarioId: 20, cabeceraId: 5 });
    expect(res.cuotas[0].metodoPago).toBeNull();
  });
});
