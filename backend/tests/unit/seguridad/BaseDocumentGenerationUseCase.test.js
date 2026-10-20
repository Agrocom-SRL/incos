import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { BaseDocumentGenerationUseCase } from '../../../src/application/use-cases/base/BaseDocumentGenerationUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('BaseDocumentGenerationUseCase', () => {
  const config = (over = {}) => ({
    studentDocumentRepository: {
      findBy: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 10 }),
      update: jest.fn().mockResolvedValue({ id: 11, updated: true }),
    },
    pdfGenerator: {},
    uploadsStorage: { saveToUploads: jest.fn() },
    logger: { info: jest.fn(), error: jest.fn() },
    moduleName: 'Mod',
    documentType: 'CERT',
    configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
    managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
    ...over,
  });

  afterEach(() => jest.useRealTimers());

  it.each(['studentDocumentRepository', 'pdfGenerator', 'uploadsStorage', 'logger', 'moduleName', 'documentType'])(
    'falta %s: lanza',
    (campo) => {
      expect(() => new BaseDocumentGenerationUseCase(config({ [campo]: undefined }))).toThrow(`${campo} es requerido`);
    },
  );

  it('execute debe implementarse en la subclase', async () => {
    await expect(new BaseDocumentGenerationUseCase(config()).execute(1)).rejects.toThrow('execute must be implemented');
  });

  describe('_saveToUploads', () => {
    it('delega en el storage y devuelve la ruta', async () => {
      const cfg = config();
      cfg.uploadsStorage.saveToUploads.mockReturnValue({ filePath: 'a/b.pdf', absolutePath: '/x/a/b.pdf', fileName: 'b.pdf' });
      const buf = Buffer.from('pdf');
      const res = await new BaseDocumentGenerationUseCase(cfg)._saveToUploads(4, buf, 'a', 'b.pdf');
      expect(cfg.uploadsStorage.saveToUploads).toHaveBeenCalledWith('a', 'b.pdf', buf);
      expect(res.filePath).toBe('a/b.pdf');
    });
  });

  describe('_saveDocumentToDatabase', () => {
    const subida = { filePath: 'a/b.pdf', fileName: 'b.pdf' };

    it('crea documento nuevo verificado y aprobado, con mime pdf', async () => {
      const cfg = config();
      const res = await new BaseDocumentGenerationUseCase(cfg)._saveDocumentToDatabase(4, subida, { tipoDocumento: 'CERT' });
      expect(cfg.studentDocumentRepository.findBy).toHaveBeenCalledWith({ studentId: 4, filePath: 'a/b.pdf' });
      expect(cfg.studentDocumentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 4,
tipoDocumento: 'CERT',
documentacionId: null,
extension: 'pdf',
tipoMime: 'application/pdf',
          verified: true,
state: 'APROBADO',
contieneMultipleDocumentos: false,
        }),
      );
      expect(res).toEqual({ id: 10 });
    });

    it('extensión no pdf: sin mime', async () => {
      const cfg = config();
      await new BaseDocumentGenerationUseCase(cfg)._saveDocumentToDatabase(4, { filePath: 'a/b.png', fileName: 'b.png' }, {});
      expect(cfg.studentDocumentRepository.create).toHaveBeenCalledWith(expect.objectContaining({ extension: 'png', tipoMime: null }));
    });

    it('documento existente: actualiza en vez de crear', async () => {
      const cfg = config();
      cfg.studentDocumentRepository.findBy.mockResolvedValue({ id: 11 });
      const res = await new BaseDocumentGenerationUseCase(cfg)._saveDocumentToDatabase(4, subida, {});
      expect(cfg.studentDocumentRepository.create).not.toHaveBeenCalled();
      expect(cfg.studentDocumentRepository.update).toHaveBeenCalledWith(11, expect.objectContaining({ fileName: 'b.pdf', extension: 'pdf' }));
      expect(res).toEqual({ id: 11, updated: true });
    });

    it('update que no devuelve nada: retorna el documento existente', async () => {
      const cfg = config();
      cfg.studentDocumentRepository.findBy.mockResolvedValue({ id: 11 });
      cfg.studentDocumentRepository.update.mockResolvedValue(null);
      expect(await new BaseDocumentGenerationUseCase(cfg)._saveDocumentToDatabase(4, subida, {})).toEqual({ id: 11 });
    });

    it('falla de BD: registra el error y devuelve null sin lanzar', async () => {
      const cfg = config();
      cfg.studentDocumentRepository.create.mockRejectedValue(new Error('boom'));
      expect(await new BaseDocumentGenerationUseCase(cfg)._saveDocumentToDatabase(4, subida, {})).toBeNull();
      expect(cfg.logger.error).toHaveBeenCalled();
    });
  });

  describe('_getCurrentManagement', () => {
    it('resuelve la gestión vigente del año configurado', async () => {
      const cfg = config();
      const res = await new BaseDocumentGenerationUseCase(cfg)._getCurrentManagement();
      expect(cfg.configuracionSistemaRepository.findBy).toHaveBeenCalledWith({ key: 'gestion_actual' });
      expect(cfg.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });
      expect(res).toEqual({ id: 3, year: 2026 });
    });

    it('repositorios no inyectados: ValidationError', async () => {
      await expect(new BaseDocumentGenerationUseCase(config({ configuracionSistemaRepository: null }))._getCurrentManagement()).rejects.toBeInstanceOf(ValidationError);
      await expect(new BaseDocumentGenerationUseCase(config({ managementRepository: null }))._getCurrentManagement()).rejects.toBeInstanceOf(ValidationError);
    });

    it('configuración inexistente: NotFoundError', async () => {
      const cfg = config();
      cfg.configuracionSistemaRepository.findBy.mockResolvedValue(null);
      await expect(new BaseDocumentGenerationUseCase(cfg)._getCurrentManagement()).rejects.toBeInstanceOf(NotFoundError);
    });

    it.each([['abc'], [''], [undefined]])('año configurado %p no numérico (NaN): ValidationError', async (value) => {
      const cfg = config();
      cfg.configuracionSistemaRepository.findBy.mockResolvedValue({ value });
      await expect(new BaseDocumentGenerationUseCase(cfg)._getCurrentManagement()).rejects.toBeInstanceOf(ValidationError);
      expect(cfg.managementRepository.findBy).not.toHaveBeenCalled();
    });

    it('sin gestión vigente: NotFoundError', async () => {
      const cfg = config();
      cfg.managementRepository.findBy.mockResolvedValue(null);
      await expect(new BaseDocumentGenerationUseCase(cfg)._getCurrentManagement()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('_getCurrentManagementYear', () => {
    it('usa year, luego anio, luego el año del reloj', async () => {
      const cfg = config();
      const uc = new BaseDocumentGenerationUseCase(cfg);
      expect(await uc._getCurrentManagementYear()).toBe(2026);
      cfg.managementRepository.findBy.mockResolvedValue({ id: 1, anio: 2024 });
      expect(await uc._getCurrentManagementYear()).toBe(2024);
      jest.useFakeTimers().setSystemTime(new Date(2030, 5, 1));
      cfg.managementRepository.findBy.mockResolvedValue({ id: 1 });
      expect(await uc._getCurrentManagementYear()).toBe(2030);
    });
  });

  describe('_getCurrentDate', () => {
    it('formatea fecha larga en español', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 2, 7, 12));
      expect(new BaseDocumentGenerationUseCase(config())._getCurrentDate()).toBe('7 de marzo de 2026');
    });
  });
});
