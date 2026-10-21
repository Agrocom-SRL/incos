import { describe, it, expect, jest } from '@jest/globals';
import { AdjuntarComprobantePagoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/AdjuntarComprobantePagoCapacitacionUseCase.js';
import { DescargarComprobantePagoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/DescargarComprobantePagoCapacitacionUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const pagoBase = { id: 5, capacitacionInscritoId: 7, numeroRecibo: '000005', comprobanteRuta: null, comprobanteNombre: null };
const logger = () => ({ info: jest.fn(), warn: jest.fn() });

describe('AdjuntarComprobantePagoCapacitacionUseCase', () => {
  const crear = (pago = pagoBase) => {
    const deps = {
      pagoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(pago),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...pagoBase, id, ...d })),
      },
      logger: logger(),
      fileSystem: { unlinkSync: jest.fn() },
    };
    return { deps, useCase: new AdjuntarComprobantePagoCapacitacionUseCase(deps) };
  };
  const file = { path: '/up/nuevo.pdf', originalname: 'nuevo.pdf' };

  it('adjunta el comprobante a un pago sin comprobante', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ inscripcionId: '7', pagoId: '5', file, userId: 2 });
    expect(deps.pagoCapacitacionRepository.update).toHaveBeenCalledWith(
      5, { comprobanteRuta: '/up/nuevo.pdf', comprobanteNombre: 'nuevo.pdf' }, 2
    );
    expect(deps.fileSystem.unlinkSync).not.toHaveBeenCalled();
    expect(res.pagoCapacitacion).toMatchObject({ tieneComprobante: true, comprobanteNombre: 'nuevo.pdf' });
  });

  it('al reemplazar borra el archivo anterior', async () => {
    const { deps, useCase } = crear({ ...pagoBase, comprobanteRuta: '/up/viejo.pdf' });
    await useCase.execute({ inscripcionId: 7, pagoId: 5, file });
    expect(deps.fileSystem.unlinkSync).toHaveBeenCalledWith('/up/viejo.pdf');
  });

  it('sin archivo lanza ValidationError', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ inscripcionId: 7, pagoId: 5 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('un pago inexistente o de otra inscripción da NotFound y descarta el archivo subido', async () => {
    const otra = crear({ ...pagoBase, capacitacionInscritoId: 99 });
    await expect(otra.useCase.execute({ inscripcionId: 7, pagoId: 5, file })).rejects.toBeInstanceOf(NotFoundError);
    expect(otra.deps.fileSystem.unlinkSync).toHaveBeenCalledWith('/up/nuevo.pdf');
    const nada = crear(null);
    await expect(nada.useCase.execute({ inscripcionId: 7, pagoId: 5, file })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([['x'], [0]])('rechaza ids inválidos (%p)', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute({ inscripcionId: id, pagoId: 5, file })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ inscripcionId: 7, pagoId: id, file })).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('DescargarComprobantePagoCapacitacionUseCase', () => {
  const crear = (pago, existe = true) => {
    const deps = {
      pagoCapacitacionRepository: { findById: jest.fn().mockResolvedValue(pago) },
      logger: logger(),
      fileSystem: { existsSync: jest.fn().mockReturnValue(existe) },
    };
    return { deps, useCase: new DescargarComprobantePagoCapacitacionUseCase(deps) };
  };

  it('devuelve ruta y nombre original del comprobante', async () => {
    const { useCase } = crear({ ...pagoBase, comprobanteRuta: '/up/a.pdf', comprobanteNombre: 'dep.pdf' });
    await expect(useCase.execute({ inscripcionId: 7, pagoId: 5 })).resolves.toEqual({
      absolutePath: '/up/a.pdf', fileName: 'dep.pdf',
    });
  });

  it('usa el número de recibo como nombre si no hay nombre original', async () => {
    const { useCase } = crear({ ...pagoBase, comprobanteRuta: '/up/a.pdf' });
    expect((await useCase.execute({ inscripcionId: 7, pagoId: 5 })).fileName).toBe('comprobante_000005');
  });

  it('NotFound si el pago no tiene comprobante, el archivo no existe o es de otra inscripción', async () => {
    await expect(crear(pagoBase).useCase.execute({ inscripcionId: 7, pagoId: 5 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      crear({ ...pagoBase, comprobanteRuta: '/up/a.pdf' }, false).useCase.execute({ inscripcionId: 7, pagoId: 5 })
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      crear({ ...pagoBase, comprobanteRuta: '/up/a.pdf' }).useCase.execute({ inscripcionId: 8, pagoId: 5 })
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(crear(null).useCase.execute({ inscripcionId: 7, pagoId: 5 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
