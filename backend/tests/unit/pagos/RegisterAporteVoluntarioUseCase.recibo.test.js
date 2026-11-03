import { jest } from '@jest/globals';
import { RegisterAporteVoluntarioUseCase } from '../../../src/application/use-cases/pagos/RegisterAporteVoluntarioUseCase.js';
import { UploadsStorageHelper } from '../../../src/infrastructure/external/storage/UploadsStorageHelper.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

/**
 * Complemento de RegisterAporteVoluntarioUseCase.test.js: recibo PDF, documento de respaldo,
 * entrega de documento y cálculo de descuento por beca. Sin disco ni red (almacenamiento simulado).
 */
describe('RegisterAporteVoluntarioUseCase: recibo, documentos y beca', () => {
  const gestion = { id: 3, year: 2026 };
  const cabecera = { id: 1, baseAmount: 400, scholarshipDiscount: 0, mandatoryAmount: 400, state: 'PENDIENTE' };

  const crear = (extra = {}) => {
    const deps = {
      contributionPaymentRepository: { findBy: jest.fn().mockResolvedValue(cabecera), create: jest.fn(), update: jest.fn() },
      contributionPaymentInstallmentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [] }),
        create: jest.fn(async (d) => ({ id: 42, ...d })),
        update: jest.fn(),
      },
      paymentMethodRepository: { findById: jest.fn(async (id) => ({ id, nombre: 'Efectivo' })) },
      studentRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 7,
          studentCode: 'E-007',
          firstName: 'Ana',
          lastName: 'Paz',
          motherLastName: 'Ríos',
          ci: '123',
          expedition: 'LP',
        }),
      },
      studentScholarshipRepository: { findBy: jest.fn().mockResolvedValue(null) },
      scholarshipRepository: { findById: jest.fn() },
      managementRepository: { findBy: jest.fn().mockResolvedValue(gestion), findById: jest.fn().mockResolvedValue(gestion) },
      contributionConfigurationRepository: { findAll: jest.fn().mockResolvedValue({}) },
      studentDocumentRepository: { create: jest.fn(async (d) => ({ id: 90, ...d })) },
      studentDocumentDeliveryRepository: { create: jest.fn(async (d) => ({ id: 91, ...d })) },
      upsertCompromisoUseCase: { execute: jest.fn() },
      compromisoPagoRepository: { findVigenteByPagoAporteId: jest.fn(), update: jest.fn() },
      pdfGenerator: { generateReciboPago: jest.fn().mockResolvedValue(Buffer.from('%PDF-recibo')) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...extra,
    };
    return { deps, useCase: new RegisterAporteVoluntarioUseCase(deps) };
  };

  const pago = (extra = {}) => ({ student_id: 7, amount: 100, payment_method_id: 1, payment_date: '2026-03-10', ...extra });

  let guardar;
  beforeEach(() => {
    guardar = jest.spyOn(UploadsStorageHelper, 'saveToUploads').mockReturnValue({
      filePath: '/uploads/recibos/2026/pago_E-007_000042.pdf',
      fileName: 'pago_E-007_000042.pdf',
      absolutePath: '/tmp/uploads/recibos/2026/pago_E-007_000042.pdf',
    });
  });
  afterEach(() => guardar.mockRestore());

  it('genera el recibo con los datos de la cuota, lo guarda en uploads y lo registra como documento aprobado', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(pago({ description: 'Primera cuota' }));

    const recibo = deps.pdfGenerator.generateReciboPago.mock.calls[0][0];
    expect(recibo).toMatchObject({
      numeroRecibo: '000042',
      nombreCompleto: 'PAZ RÍOS ANA',
      ci: '123',
      expedicion: 'LP',
      montoTotal: 400,
      descuentoBeca: 0,
      montoObligatorio: 400,
      totalPagadoAntes: 0,
      montoPagado: 100,
      saldoPendiente: 300,
      concepto: 'Aporte académico',
      metodoPago: 'Efectivo',
      becaInfo: null,
    });
    expect(guardar).toHaveBeenCalledWith('recibos/2026', 'pago_E-007_000042.pdf', Buffer.from('%PDF-recibo'));
    expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 7,
        tipoDocumento: 'PAGO',
        filePath: 'recibos/2026/pago_E-007_000042.pdf',
        extension: 'pdf',
        verified: true,
        state: 'APROBADO',
      })
    );
    expect(result.reciboPDF).toBe('/uploads/recibos/2026/pago_E-007_000042.pdf');
    expect(result.reciboDocument).toMatchObject({ id: 90 });
  });

  it('si falla el guardado del recibo como documento, el pago igual se registra con el PDF', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.create.mockRejectedValue(new Error('bd'));
    const result = await useCase.execute(pago());
    expect(result.reciboPDF).toBeTruthy();
    expect(result.reciboDocument).toBeUndefined();
    expect(result.payment.id).toBe(42);
  });

  it('si falla el generador de PDF, el pago igual se registra sin recibo', async () => {
    const { useCase, deps } = crear();
    deps.pdfGenerator.generateReciboPago.mockRejectedValue(new Error('pdf'));
    const result = await useCase.execute(pago());
    expect(result.payment.id).toBe(42);
    expect(result.reciboPDF).toBeUndefined();
    expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
  });

  it('el nombre del archivo usa el id del estudiante si no hay código, y el año actual sin año de gestión', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue({ id: 7, toPlainObject: () => ({ id: 7, firstName: 'Ana' }) });
    deps.managementRepository.findBy.mockResolvedValue({ id: 3 });
    await useCase.execute(pago());
    const [scope, nombre] = guardar.mock.calls[0];
    expect(scope).toBe(`recibos/${new Date().getFullYear()}`);
    expect(nombre).toBe('pago_7_000042.pdf');
  });

  it('registra el documento de respaldo y su entrega cuando se adjunta un archivo', async () => {
    const { useCase, deps } = crear();
    const documentFile = { originalname: 'Voucher.PDF', path: '/srv/app/uploads/comprobantes/v.pdf', filename: 'v.pdf', mimetype: 'application/pdf' };
    const result = await useCase.execute(pago({ documentFile, descripcion: 'Cuota 1' }));
    expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'v.pdf',
        filePath: 'documentos/comprobantes/v.pdf',
        extension: 'pdf',
        tipoMime: 'application/pdf',
        verified: false,
        state: 'PENDIENTE',
      })
    );
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 7,
        entregado: true,
        enTramite: false,
        fechaEntrega: '2026-03-10',
        observaciones: 'Comprobante de pago de aporte académico: Cuota 1.',
      })
    );
    expect(result.document).toBeDefined();
    expect(result.documentDelivery).toMatchObject({ id: 91 });
  });

  it('un fallo al guardar el respaldo o su entrega no rompe el registro', async () => {
    const { useCase, deps } = crear({ pdfGenerator: null });
    deps.studentDocumentRepository.create.mockRejectedValue(new Error('bd'));
    const documentFile = { originalname: 'v.pdf', path: '/x/uploads/v.pdf', filename: 'v.pdf', mimetype: 'application/pdf' };
    const result = await useCase.execute(pago({ documentFile }));
    expect(result.document).toBeUndefined();
    expect(deps.studentDocumentDeliveryRepository.create).not.toHaveBeenCalled();

    deps.studentDocumentRepository.create.mockResolvedValue({ id: 5 });
    deps.studentDocumentDeliveryRepository.create.mockRejectedValue(new Error('bd'));
    const result2 = await useCase.execute(pago({ documentFile }));
    expect(result2.document).toBeDefined();
    expect(result2.documentDelivery).toBeUndefined();
  });

  describe('descuento por beca al crear la cabecera', () => {
    const conCabeceraNueva = () => {
      const ctx = crear({ pdfGenerator: null });
      ctx.deps.contributionPaymentRepository.findBy.mockResolvedValue(null);
      ctx.deps.contributionPaymentRepository.create.mockImplementation(async (d) => ({ id: 1, ...d }));
      return ctx;
    };

    it('beca activa sin tipo de beca: sin descuento pero vinculada', async () => {
      const { useCase, deps } = conCabeceraNueva();
      deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 8 });
      await useCase.execute(pago());
      expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentScholarshipId: 8, scholarshipDiscount: 0, mandatoryAmount: 400 })
      );
    });

    it('tipo de beca inexistente o con porcentaje 0: sin descuento', async () => {
      const { useCase, deps } = conCabeceraNueva();
      deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 8, becaDescuentoId: 2 });
      deps.scholarshipRepository.findById.mockResolvedValue(null);
      await useCase.execute(pago());
      expect(deps.contributionPaymentRepository.create).toHaveBeenLastCalledWith(expect.objectContaining({ scholarshipDiscount: 0 }));

      deps.scholarshipRepository.findById.mockResolvedValue({ porcentaje: 0 });
      await useCase.execute(pago());
      expect(deps.contributionPaymentRepository.create).toHaveBeenLastCalledWith(
        expect.objectContaining({ scholarshipDiscount: 0, studentScholarshipId: 8 })
      );
    });

    it('beca del 100 % deja la obligación en 0 y un pago gratuito la cancela', async () => {
      const { useCase, deps } = conCabeceraNueva();
      deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 8, beca_descuento_id: 2 });
      deps.scholarshipRepository.findById.mockResolvedValue({ porcentaje: 100 });
      await useCase.execute(pago({ amount: 0 }));
      expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ scholarshipDiscount: 400, mandatoryAmount: 0 })
      );
      expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(1, { state: 'CANCELADO' });
    });

    it('un fallo al leer la configuración de aportes cae al monto por defecto', async () => {
      const { useCase, deps } = conCabeceraNueva();
      deps.contributionConfigurationRepository.findAll.mockRejectedValue(new Error('bd'));
      await useCase.execute(pago());
      expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(expect.objectContaining({ baseAmount: 400 }));
    });
  });

  describe('auxiliares', () => {
    it('_addDays suma días a una fecha ISO y rechaza fechas inválidas', () => {
      const { useCase } = crear();
      expect(useCase._addDays('2026-01-31', 30)).toBe('2026-03-02');
      expect(useCase._addDays('2026-03-10T10:00:00Z', 15)).toBe('2026-03-25');
      expect(useCase._addDays('2026-13-45', 1)).toBeNull();
      expect(useCase._addDays('basura', 1)).toBeNull();
      expect(useCase._addDays(null, 1)).toBeNull();
    });

    it('_preparePaymentData calcula el monto a pagar y normaliza opcionales a null', () => {
      const { useCase } = crear();
      const data = useCase._preparePaymentData({ studentId: 1, managementId: 2, totalAmount: 400, scholarshipDiscount: 100, paymentMethodId: 1, paymentDate: '2026-03-10' });
      expect(data).toMatchObject({
        amountPaid: 300,
        scholarshipDiscount: 100,
        transactionNumber: null,
        comprobanteCode: null,
        description: null,
        paymentAccountId: null,
        studentScholarshipId: null,
      });
      expect(useCase._preparePaymentData({ amountToPay: 50, paymentDate: '2026-03-10', transactionNumber: 'T', comprobanteCode: 'C' })).toMatchObject({
        amountPaid: 50,
        transactionNumber: 'T',
        comprobanteCode: 'C',
      });
      expect(() => useCase._preparePaymentData({ totalAmount: 1 })).toThrow(ValidationError);
    });

    it('_validateNoDuplicatePayment lanza con el número de recibo existente', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentRepository.findBy.mockResolvedValue({ id: 5, numeroRecibo: 'R-5' });
      await expect(useCase._validateNoDuplicatePayment(7, 3)).rejects.toThrow('Número de recibo: R-5');
      deps.contributionPaymentRepository.findBy.mockResolvedValue({ id: 6, toPlainObject: () => ({ receiptNumber: 'R-6' }) });
      await expect(useCase._validateNoDuplicatePayment(7, 3)).rejects.toThrow('R-6');
      deps.contributionPaymentRepository.findBy.mockResolvedValue(null);
      await expect(useCase._validateNoDuplicatePayment(7, 3)).resolves.toBeUndefined();
    });

    it('DEPOSITO exige cuenta y comprobante', async () => {
      const { useCase } = crear();
      await expect(useCase._validatePaymentMethod(4, null, null, 'C')).rejects.toThrow('cuenta de pago');
      await expect(useCase._validatePaymentMethod(4, 5, null, null)).rejects.toThrow('código de comprobante');
      await expect(useCase._validatePaymentMethod(4, 5, null, 'C')).resolves.toMatchObject({ id: 4 });
    });
  });
});
