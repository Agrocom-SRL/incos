import { describe, it, expect, jest } from '@jest/globals';
import { CreateInformePasantiaUseCase } from '../../../src/application/use-cases/pasantias/CreateInformePasantiaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const crear = ({ pasantia = { id: 2, tipo: 'PASANTIA', docenteSupervisorId: 11 }, fila = null } = {}) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaInformeRepository = {
    create: jest.fn().mockImplementation(async (d) => ({ id: 50, ...d })),
  };
  const pasantiaViewRepository = { findListadoById: jest.fn().mockResolvedValue(fila) };
  const pasantiaInformePdfGenerator = { generate: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
  const uploadsStorage = {
    saveToUploads: jest.fn().mockReturnValue({ fileName: 'f.pdf', absolutePath: '/abs/f.pdf' }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const useCase = new CreateInformePasantiaUseCase({
    pasantiaRepository,
    pasantiaInformeRepository,
    pasantiaViewRepository,
    pasantiaInformePdfGenerator,
    uploadsStorage,
    logger,
  });
  return {
    useCase,
pasantiaRepository,
pasantiaInformeRepository,
pasantiaViewRepository,
    pasantiaInformePdfGenerator,
uploadsStorage,
logger,
  };
};

describe('CreateInformePasantiaUseCase', () => {
  it('genera el PDF, lo guarda, crea la fila y oculta rutaArchivo', async () => {
    const m = crear({ fila: { id: 2, estudiante_nombres: 'Ana' } });
    const res = await m.useCase.execute(
      2, { tipo: 'VERIFICACION_EMPRESA', numeroMemo: 'M-1', resultado: 'VIABLE' }, 7
    );

    expect(m.pasantiaViewRepository.findListadoById).toHaveBeenCalledWith(2);
    const genArg = m.pasantiaInformePdfGenerator.generate.mock.calls[0][0];
    expect(genArg.tipo).toBe('VERIFICACION_EMPRESA');
    expect(genArg.informe).toMatchObject({ numeroMemo: 'M-1', resultado: 'VIABLE', docenteId: 11 });
    expect(m.uploadsStorage.saveToUploads).toHaveBeenCalledWith(
      'documentos/pasantias/2',
      expect.stringMatching(/^informe_verificacion_empresa_2_\d+\.pdf$/),
      Buffer.from('pdf')
    );
    expect(m.pasantiaInformeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        pasantiaId: 2,
        tipo: 'VERIFICACION_EMPRESA',
        nombreArchivo: 'f.pdf',
        rutaArchivo: '/abs/f.pdf',
        extension: 'pdf',
        tipoMime: 'application/pdf',
      }),
      7,
      {}
    );
    expect(res.informe.id).toBe(50);
    expect(res.informe).not.toHaveProperty('rutaArchivo');
  });

  it('aplica valores por defecto (docente del trámite, fecha de hoy, nulos)', async () => {
    const m = crear();
    await m.useCase.execute(2, { tipo: 'VERIFICACION_EMPRESA' });
    const { informe } = m.pasantiaInformePdfGenerator.generate.mock.calls[0][0];
    expect(informe.fechaEmision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(informe.numeroMemo).toBeNull();
    expect(informe.contenido).toBeNull();
    expect(informe.docenteId).toBe(11);
  });

  it('prioriza docenteId del payload', async () => {
    const m = crear();
    await m.useCase.execute(2, { tipo: 'VERIFICACION_EMPRESA', docenteId: 99 });
    expect(m.pasantiaInformePdfGenerator.generate.mock.calls[0][0].informe.docenteId).toBe(99);
  });

  it('sin fila en la vista usa la entidad raíz como contexto', async () => {
    const m = crear({ fila: null });
    await m.useCase.execute(2, { tipo: 'VERIFICACION_EMPRESA' });
    expect(m.pasantiaInformePdfGenerator.generate.mock.calls[0][0].pasantia).toMatchObject({
      id: 2, tipo: 'PASANTIA',
    });
  });

  it('lanza NotFoundError si el trámite no existe', async () => {
    const m = crear({ pasantia: null });
    await expect(m.useCase.execute(2, { tipo: 'VERIFICACION_EMPRESA' }))
      .rejects.toBeInstanceOf(NotFoundError);
    expect(m.pasantiaInformePdfGenerator.generate).not.toHaveBeenCalled();
  });

  it('rechaza un informe incoherente con el camino', async () => {
    const m = crear();
    await expect(m.useCase.execute(2, { tipo: 'CONVALIDACION_TRABAJO' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(m.pasantiaInformeRepository.create).not.toHaveBeenCalled();
    expect(m.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
  });

  it('CONVALIDACION acepta CONVALIDACION_TRABAJO y rechaza VERIFICACION_EMPRESA', async () => {
    const m = crear({ pasantia: { id: 2, tipo: 'CONVALIDACION' } });
    await m.useCase.execute(2, { tipo: 'CONVALIDACION_TRABAJO' });
    expect(m.pasantiaInformeRepository.create).toHaveBeenCalled();
    await expect(m.useCase.execute(2, { tipo: 'VERIFICACION_EMPRESA' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('sin tipo lanza ValidationError', async () => {
    const m = crear();
    await expect(m.useCase.execute(2, {})).rejects.toBeInstanceOf(ValidationError);
  });
});
