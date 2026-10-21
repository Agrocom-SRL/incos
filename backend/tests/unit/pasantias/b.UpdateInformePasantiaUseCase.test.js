import { describe, it, expect, jest } from '@jest/globals';
import { UpdateInformePasantiaUseCase } from '../../../src/application/use-cases/pasantias/UpdateInformePasantiaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const actual = {
  id: 5,
  pasantiaId: 2,
  tipo: 'VERIFICACION_EMPRESA',
  docenteId: 11,
  numeroMemo: 'M-1',
  fechaVerificacion: '2026-01-01',
  fechaEmision: '2026-01-02',
  destinatario: 'Rector',
  areaRelacionada: 'TI',
  evaluacionCualitativa: 'buena',
  resultado: 'VIABLE',
  contenido: 'txt',
  nombreArchivo: 'orig.pdf',
};

const crear = ({ pasantia = { id: 2, tipo: 'PASANTIA' }, informe = actual } = {}) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaInformeRepository = {
    findById: jest.fn().mockResolvedValue(informe),
    update: jest.fn().mockImplementation(async (id, d) => ({ id, ...d })),
  };
  const pasantiaViewRepository = { findListadoById: jest.fn().mockResolvedValue(null) };
  const pasantiaInformePdfGenerator = { generate: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
  const uploadsStorage = {
    saveToUploads: jest.fn().mockReturnValue({ fileName: 'orig.pdf', absolutePath: '/abs/orig.pdf' }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    pasantiaInformeRepository,
pasantiaInformePdfGenerator,
uploadsStorage,
pasantiaRepository,
    useCase: new UpdateInformePasantiaUseCase({
      pasantiaRepository,
      pasantiaInformeRepository,
      pasantiaViewRepository,
      pasantiaInformePdfGenerator,
      uploadsStorage,
      logger,
    }),
  };
};

describe('UpdateInformePasantiaUseCase', () => {
  it('fusiona el payload con el informe actual, regenera el PDF y oculta la ruta', async () => {
    const m = crear();
    const res = await m.useCase.execute(2, 5, { numeroMemo: 'M-2', resultado: 'NO_VIABLE' }, 8);

    const { informe } = m.pasantiaInformePdfGenerator.generate.mock.calls[0][0];
    expect(informe).toMatchObject({ numeroMemo: 'M-2', resultado: 'NO_VIABLE', contenido: 'txt' });
    expect(m.uploadsStorage.saveToUploads).toHaveBeenCalledWith(
      'documentos/pasantias/2', 'orig.pdf', Buffer.from('pdf')
    );
    expect(m.pasantiaInformeRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        numeroMemo: 'M-2', nombreArchivo: 'orig.pdf', rutaArchivo: '/abs/orig.pdf', extension: 'pdf',
      }),
      8
    );
    expect(res.informe.numeroMemo).toBe('M-2');
    expect(res.informe).not.toHaveProperty('rutaArchivo');
  });

  it('sin nombreArchivo previo genera uno nuevo', async () => {
    const m = crear({ informe: { ...actual, nombreArchivo: null } });
    await m.useCase.execute(2, 5, {});
    expect(m.uploadsStorage.saveToUploads).toHaveBeenCalledWith(
      'documentos/pasantias/2',
      expect.stringMatching(/^informe_verificacion_empresa_2_\d+\.pdf$/),
      expect.anything()
    );
  });

  it('NotFoundError si el trámite no existe', async () => {
    const m = crear({ pasantia: null });
    await expect(m.useCase.execute(2, 5, {})).rejects.toBeInstanceOf(NotFoundError);
  });

  it('NotFoundError si el informe no existe', async () => {
    const m = crear({ informe: null });
    await expect(m.useCase.execute(2, 5, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(m.pasantiaInformeRepository.update).not.toHaveBeenCalled();
  });

  it('NotFoundError (anti-IDOR) si el informe pertenece a otro trámite', async () => {
    const m = crear({ informe: { ...actual, pasantiaId: 77 } });
    await expect(m.useCase.execute(2, 5, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(m.pasantiaInformePdfGenerator.generate).not.toHaveBeenCalled();
  });

  it('rechaza un tipo incoherente con el camino', async () => {
    const m = crear();
    await expect(m.useCase.execute(2, 5, { tipo: 'CONVALIDACION_TRABAJO' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(m.pasantiaInformeRepository.update).not.toHaveBeenCalled();
  });
});
