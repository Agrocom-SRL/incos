import { jest } from '@jest/globals';
import { GetPaymentAporteByIdUseCase } from '../../../src/application/use-cases/pagos/GetPaymentAporteByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetPaymentAporteByIdUseCase', () => {
  const cabecera = {
    id: 5,
    studentId: 7,
    managementId: 2,
    enrollmentId: 4,
    studentScholarshipId: 9,
    paymentMethodId: 1,
    baseAmount: 200,
    scholarshipDiscount: 50,
    mandatoryAmount: 150,
    state: 'PARCIAL',
  };

  const crear = (over = {}) => {
    const deps = {
      contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(cabecera) },
      studentRepository: { findById: jest.fn().mockResolvedValue({ id: 7, firstName: 'Ana', lastName: 'Paz', ci: '123' }) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2, code: 'G26', name: 'Gestión 2026', year: 2026 }) },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue({ id: 1, name: 'Efectivo', code: 'EFE' }) },
      studentScholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 9, scholarshipId: 3, state: 'APROBADA' }) },
      scholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 3, name: 'Beca', percentage: 25 }) },
      enrollmentRepository: { findById: jest.fn().mockResolvedValue({ id: 4, codigo: 'INS-1' }) },
      studentDocumentRepository: { findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }) },
      compromisoPagoRepository: { findVigenteByPagoAporteId: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...over,
    };
    return { deps, useCase: new GetPaymentAporteByIdUseCase(deps) };
  };

  it('devuelve la cabecera enriquecida con montos y estado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(5);
    expect(deps.contributionPaymentRepository.findById).toHaveBeenCalledWith(5);
    expect(res).toMatchObject({
      id: 5,
      student_id: 7,
      monto_base: 200,
      descuento_beca: 50,
      monto_obligatorio: 150,
      estado: 'PARCIAL',
      estudiante: { id: 7, nombreCompleto: 'Ana Paz' },
      gestion: { id: 2, codigo: 'G26', anio: 2026 },
      metodoPago: { id: 1, nombre: 'Efectivo' },
      beca: { id: 9, estado: 'APROBADA', tipoBeca: { id: 3, porcentaje: 25 } },
      inscripcion: { id: 4, codigo: 'INS-1' },
      reciboDocumento: null,
      compromiso: null,
    });
  });

  it('lanza NotFoundError si el pago no existe y no consulta relaciones', async () => {
    const { useCase, deps } = crear({ contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(null) } });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.studentRepository.findById).not.toHaveBeenCalled();
  });

  it('sin relaciones opcionales devuelve null en ellas y no las consulta', async () => {
    const { useCase, deps } = crear({
      contributionPaymentRepository: { findById: jest.fn().mockResolvedValue({ id: 5, studentId: 7, state: 'PENDIENTE' }) },
    });
    const res = await useCase.execute(5);
    expect(res.beca).toBeNull();
    expect(res.inscripcion).toBeNull();
    expect(res.metodoPago).toBeNull();
    expect(res.gestion).toBeNull();
    expect(deps.studentScholarshipRepository.findById).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.findById).not.toHaveBeenCalled();
  });

  it('tolera el fallo de una relación y registra advertencia', async () => {
    const { useCase, deps } = crear({
      studentRepository: { findById: jest.fn().mockRejectedValue(new Error('boom')) },
    });
    const res = await useCase.execute(5);
    expect(res.estudiante).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('nombre de estudiante de respaldo: CI, código o id', async () => {
    const mk = (student) => crear({ studentRepository: { findById: jest.fn().mockResolvedValue(student) } }).useCase.execute(5);
    expect((await mk({ id: 7, ci: '99' })).estudiante.nombreCompleto).toBe('CI: 99');
    expect((await mk({ id: 7, codigoEstudiante: 'E7' })).estudiante.nombreCompleto).toBe('Código: E7');
    expect((await mk({ id: 7 })).estudiante.nombreCompleto).toBe('Estudiante #7');
  });

  it('beca sin tipo cuando la beca base no existe', async () => {
    const { useCase } = crear({ scholarshipRepository: { findById: jest.fn().mockResolvedValue(null) } });
    const res = await useCase.execute(5);
    expect(res.beca.tipoBeca).toBeNull();
  });

  it('elige el recibo cuyo nombre contiene el id y normaliza la ruta', async () => {
    const docs = [
      { id: 1, fileName: 'RECIBO_PAGO_1_000099_x.pdf', filePath: 'recibos/a.pdf' },
      { id: 2, fileName: 'RECIBO_PAGO_1_000005_x.pdf', filePath: '/recibos/b.pdf' },
    ];
    const { useCase, deps } = crear({ studentDocumentRepository: { findAll: jest.fn().mockResolvedValue({ studentDocuments: docs }) } });
    const res = await useCase.execute(5);
    expect(deps.studentDocumentRepository.findAll).toHaveBeenCalledWith(
      { studentId: 7, tipoDocumento: 'PAGO', sort: 'createdAt:DESC' }, 1, 10
    );
    expect(res.reciboDocumento).toMatchObject({ id: 2, filePath: '/uploads/recibos/b.pdf' });
  });

  it('incluye el compromiso vigente con su contrato', async () => {
    const { useCase, deps } = crear({
      compromisoPagoRepository: { findVigenteByPagoAporteId: jest.fn().mockResolvedValue({ id: 3, fechaCompromiso: '2000-01-01', estado: 'VIGENTE' }) },
    });
    const res = await useCase.execute(5);
    expect(deps.compromisoPagoRepository.findVigenteByPagoAporteId).toHaveBeenCalledWith(5);
    expect(res.compromiso).toMatchObject({ id: 3, alerta: 'VENCIDA' });
  });
});
