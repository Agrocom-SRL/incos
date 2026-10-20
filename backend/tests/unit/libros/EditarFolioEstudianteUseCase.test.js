import { describe, it, expect, jest } from '@jest/globals';
import { EditarFolioEstudianteUseCase } from '../../../src/application/use-cases/academico/libros/EditarFolioEstudianteUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('EditarFolioEstudianteUseCase', () => {
  const crear = ({ folio, fila } = {}) => {
    const deps = {
      libroRegistroRepository: {
        findFolioById: jest.fn().mockResolvedValue(
          folio === undefined ? { id: 5, libroId: 2, estado: 'BORRADOR' } : folio,
        ),
        findFolioEstudianteById: jest.fn().mockResolvedValue(
          fila === undefined ? { id: 11, folioId: 5 } : fila,
        ),
        updateFolioEstudiante: jest.fn().mockResolvedValue(true),
        listarEstudiantesFolio: jest.fn().mockResolvedValue([
          { id: 10, observaciones: null },
          { id: 11, numero_orden: 2, observaciones: 'ok', nombre_completo: 'PEREZ JUAN' },
        ]),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new EditarFolioEstudianteUseCase(deps) };
  };
  const ejecutar = (useCase, body) =>
    useCase.execute({ usuarioId: 4, id: '2', folioId: '5', filaId: '11', body });

  it('actualiza la observación (trim) y devuelve la fila actualizada', async () => {
    const { useCase, deps } = crear();
    const res = await ejecutar(useCase, { observaciones: '  ok ' });

    expect(deps.libroRegistroRepository.findFolioEstudianteById).toHaveBeenCalledWith(11);
    expect(deps.libroRegistroRepository.updateFolioEstudiante)
      .toHaveBeenCalledWith(11, { observaciones: 'ok' }, 4);
    expect(deps.libroRegistroRepository.listarEstudiantesFolio).toHaveBeenCalledWith(5);
    expect(res.folioEstudiante).toMatchObject({ id: 11, nombreCompleto: 'PEREZ JUAN' });
  });

  it('observaciones null limpia el campo', async () => {
    const { useCase, deps } = crear();
    await ejecutar(useCase, { observaciones: null });
    expect(deps.libroRegistroRepository.updateFolioEstudiante)
      .toHaveBeenCalledWith(11, { observaciones: null }, 4);
  });

  it('rechaza sin cambios', async () => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, {})).rejects.toThrow('No hay cambios');
    expect(deps.libroRegistroRepository.updateFolioEstudiante).not.toHaveBeenCalled();
  });

  it('el estado académico no es editable (se ignora)', async () => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, { estadoAcademico: 'APROBADO' })).rejects.toThrow(ValidationError);
    expect(deps.libroRegistroRepository.updateFolioEstudiante).not.toHaveBeenCalled();
  });

  it('NotFound si el folio no existe o es de otro libro', async () => {
    await expect(ejecutar(crear({ folio: null }).useCase, { observaciones: 'a' }))
      .rejects.toThrow(NotFoundError);
    await expect(ejecutar(crear({ folio: { id: 5, libroId: 9, estado: 'BORRADOR' } }).useCase, { observaciones: 'a' }))
      .rejects.toThrow(NotFoundError);
  });

  it('rechaza folio ANULADO', async () => {
    const { useCase, deps } = crear({ folio: { id: 5, libroId: 2, estado: 'ANULADO' } });
    await expect(ejecutar(useCase, { observaciones: 'a' })).rejects.toThrow('ANULADO');
    expect(deps.libroRegistroRepository.updateFolioEstudiante).not.toHaveBeenCalled();
  });

  it('NotFound si la fila no existe o es de otro folio', async () => {
    await expect(ejecutar(crear({ fila: null }).useCase, { observaciones: 'a' }))
      .rejects.toThrow('Fila del folio');
    await expect(ejecutar(crear({ fila: { id: 11, folioId: 77 } }).useCase, { observaciones: 'a' }))
      .rejects.toThrow(NotFoundError);
  });
});
