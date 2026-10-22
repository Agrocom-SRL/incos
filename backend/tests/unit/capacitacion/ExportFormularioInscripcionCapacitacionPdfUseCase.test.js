import { describe, it, expect, jest } from '@jest/globals';
import { ExportFormularioInscripcionCapacitacionPdfUseCase } from '../../../src/application/use-cases/capacitacion/ExportFormularioInscripcionCapacitacionPdfUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearFicha } from './pdf/fichaInscripcionFixture.js';

describe('ExportFormularioInscripcionCapacitacionPdfUseCase', () => {
  const crear = ({ ficha = crearFicha() } = {}) => {
    const deps = {
      getInscripcionCapacitacionByIdUseCase: { execute: jest.fn().mockResolvedValue(ficha) },
      formularioInscripcionCapacitacionPdfGenerator: {
        generarFormularioInscripcion: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.7')),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ExportFormularioInscripcionCapacitacionPdfUseCase(deps) };
  };

  it('genera el PDF con el payload de la ficha y devuelve buffer, nombre y mimeType', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ inscripcionId: '12' });

    expect(deps.getInscripcionCapacitacionByIdUseCase.execute).toHaveBeenCalledWith(12);
    const datos = deps.formularioInscripcionCapacitacionPdfGenerator.generarFormularioInscripcion.mock.calls[0][0];
    expect(datos).toMatchObject({ codigoInscripcion: 'CAP-00012', curso: { titulo: 'Word avanzado' } });
    expect(Buffer.isBuffer(res.buffer)).toBe(true);
    expect(res.mimeType).toBe('application/pdf');
    expect(res.fileName).toBe('Formulario_Inscripcion_PEREZ_GOMEZ_JUAN_CARLOS_Word_avanzado.pdf');
  });

  it('lanza NotFoundError si la inscripción no existe y no genera nada', async () => {
    const { deps, useCase } = crear({ ficha: null });
    await expect(useCase.execute({ inscripcionId: 99 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.formularioInscripcionCapacitacionPdfGenerator.generarFormularioInscripcion).not.toHaveBeenCalled();
  });

  it('rechaza un id inválido con ValidationError', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ inscripcionId: 'abc' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.getInscripcionCapacitacionByIdUseCase.execute).not.toHaveBeenCalled();
  });
});
