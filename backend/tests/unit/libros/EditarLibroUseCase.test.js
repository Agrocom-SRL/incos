import { describe, it, expect, jest } from '@jest/globals';
import { EditarLibroUseCase } from '../../../src/application/use-cases/academico/libros/EditarLibroUseCase.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

const folio176 = (o) => ({
  id: 1,
estado: 'BORRADOR',
paralelo_gestion_id: 40,
numero_folio: 1,
total_cursando: 1,
  carrera_codigo: 'CON-GEN',
...o,
});
const fila = (o) => ({
  id: 100, estudiante_id: 1, estado_academico: 'CURSANDO', numero_orden: 1, apellido_paterno: 'AÑEZ', ...o,
});

describe('EditarLibroUseCase', () => {
  const crear = ({ libro, folios = [], nomina = [], filas135 = [] } = {}) => {
    const deps = {
      libroRegistroRepository: {
        findById: jest.fn().mockResolvedValue(
          libro === undefined
            ? { id: 2, gestionId: 8, estado: 'ABIERTO', folioInicial: 10, observaciones: 'base' }
            : libro,
        ),
        update: jest.fn().mockResolvedValue(true),
        cerrarLibro: jest.fn().mockResolvedValue({ filasAsentadas: 1 }),
        listarEstudiantesFolio: jest.fn().mockResolvedValue(nomina),
      },
      libroRegistroViewRepository: {
        obtenerLibroPorId: jest.fn().mockResolvedValue({ id: 2, numero_libro: 15 }),
        listarFoliosPorLibro: jest.fn().mockResolvedValue(folios),
      },
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue(filas135),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn() },
      evaluationConfigurationRepository: { findActiveRowByGestionId: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new EditarLibroUseCase(deps) };
  };
  const ejecutar = (useCase, body, extra = {}) =>
    useCase.execute({ usuarioId: 6, id: '2', body, ...extra });

  describe('edición de cabecera', () => {
    it('actualiza campos con trim y devuelve el DTO', async () => {
      const { useCase, deps } = crear();
      const res = await ejecutar(useCase, {
        codigoRegistro: ' 555 ', folioFinal: '50', fechaApertura: '2026-02-01', observaciones: ' hola ',
      });
      expect(deps.libroRegistroRepository.update).toHaveBeenCalledWith(
        2,
        { codigoRegistro: '555', folioFinal: 50, fechaApertura: '2026-02-01', observaciones: 'hola' },
        6,
      );
      expect(deps.libroRegistroViewRepository.obtenerLibroPorId).toHaveBeenCalledWith(2);
      expect(res).toEqual({ libro: expect.objectContaining({ id: 2, numeroLibro: 15 }) });
      expect(res.cierre).toBeUndefined();
    });

    it('permite limpiar folioFinal, fecha y observaciones con null', async () => {
      const { useCase, deps } = crear();
      await ejecutar(useCase, { folioFinal: null, fechaApertura: null, observaciones: null });
      expect(deps.libroRegistroRepository.update).toHaveBeenCalledWith(
        2, { folioFinal: null, fechaApertura: null, observaciones: null }, 6,
      );
    });

    it('NotFound si el libro no existe', async () => {
      const { useCase } = crear({ libro: null });
      await expect(ejecutar(useCase, { observaciones: 'a' })).rejects.toThrow(NotFoundError);
    });

    it('rechaza código vacío', async () => {
      const { useCase, deps } = crear();
      await expect(ejecutar(useCase, { codigoRegistro: '  ' })).rejects.toThrow('código de registro');
      expect(deps.libroRegistroRepository.update).not.toHaveBeenCalled();
    });

    it('rechaza folio final menor al inicial del libro', async () => {
      const { useCase } = crear();
      await expect(ejecutar(useCase, { folioFinal: 9 })).rejects.toThrow('folio final');
    });

    it('rechaza body sin cambios', async () => {
      const { useCase, deps } = crear();
      await expect(ejecutar(useCase, {})).rejects.toThrow('No hay cambios');
      expect(deps.libroRegistroRepository.update).not.toHaveBeenCalled();
    });

    it('rechaza estado inválido', async () => {
      const { useCase } = crear();
      await expect(ejecutar(useCase, { estado: 'ANULADO' })).rejects.toThrow('Estado de libro inválido');
    });

    it('estado igual al actual no cuenta como cambio', async () => {
      const { useCase } = crear();
      await expect(ejecutar(useCase, { estado: 'ABIERTO' })).rejects.toThrow('No hay cambios');
    });

    it('reabrir limpia fechaCierre', async () => {
      const { useCase, deps } = crear({ libro: { id: 2, gestionId: 8, estado: 'CERRADO' } });
      await ejecutar(useCase, { estado: 'ABIERTO' });
      expect(deps.libroRegistroRepository.update)
        .toHaveBeenCalledWith(2, { estado: 'ABIERTO', fechaCierre: null }, 6);
    });
  });

  describe('cierre', () => {
    it('cierra sin folios con CURSANDO: update simple y resumen en cero', async () => {
      const { useCase, deps } = crear();
      const res = await ejecutar(useCase, { estado: 'CERRADO' });

      const [, cambios] = deps.libroRegistroRepository.update.mock.calls[0];
      expect(cambios.estado).toBe('CERRADO');
      expect(cambios.fechaCierre).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(deps.libroRegistroRepository.cerrarLibro).not.toHaveBeenCalled();
      expect(res.cierre).toEqual({ forzado: false, pendientesAsentados: 0, filasSincronizadas: 0 });
    });

    it('409 con desglose si hay pendientes y no se fuerza', async () => {
      const { useCase, deps } = crear({
        folios: [folio176({})],
        nomina: [fila({})],
        filas135: [{ estudiante_id: 1, oferta_curso_id: 1, nota_final: null, estado: 'CURSANDO' }],
      });
      const error = await ejecutar(useCase, { estado: 'CERRADO' }).catch((e) => e);

      expect(error).toBeInstanceOf(ConflictError);
      expect(JSON.stringify(error.details ?? error)).toContain('AÑEZ');
      expect(deps.libroRegistroRepository.cerrarLibro).not.toHaveBeenCalled();
      expect(deps.libroRegistroRepository.update).not.toHaveBeenCalled();
    });

    it('cierre forzado exige motivo de al menos 10 caracteres', async () => {
      const { useCase, deps } = crear({
        folios: [folio176({})],
        nomina: [fila({})],
        filas135: [{ estudiante_id: 1, oferta_curso_id: 1, nota_final: null, estado: 'CURSANDO' }],
      });
      await expect(ejecutar(useCase, { estado: 'CERRADO', forzarCierre: true, motivo: 'corto' }))
        .rejects.toThrow(ValidationError);
      expect(deps.libroRegistroRepository.cerrarLibro).not.toHaveBeenCalled();
    });

    it('cierre forzado asienta ABANDONO, sella observaciones y usa cerrarLibro', async () => {
      const { useCase, deps } = crear({
        folios: [folio176({})],
        nomina: [fila({})],
        filas135: [{ estudiante_id: 1, oferta_curso_id: 1, nota_final: null, estado: 'CURSANDO' }],
      });
      const res = await ejecutar(
        useCase,
        { estado: 'CERRADO', forzarCierre: 'true', motivo: 'Docentes no entregaron' },
        { usuarioNombre: 'jperez' },
      );

      const [args, usuario] = deps.libroRegistroRepository.cerrarLibro.mock.calls[0];
      expect(usuario).toBe(6);
      expect(args.libroId).toBe(2);
      expect(args.asientos).toEqual([
        { ids: [100], estadoAcademico: 'ABANDONO', observacion: 'SIN NOTAS AL CIERRE DE GESTIÓN' },
      ]);
      expect(args.cambios.estado).toBe('CERRADO');
      expect(args.cambios.observaciones).toMatch(/^base\n\[Cierre \d{4}-\d{2}-\d{2}\]/);
      expect(args.cambios.observaciones).toContain('Motivo: Docentes no entregaron');
      expect(args.cambios.observaciones).toContain('Usuario: jperez.');
      expect(deps.libroRegistroRepository.update).not.toHaveBeenCalled();
      expect(res.cierre).toEqual({ forzado: true, pendientesAsentados: 1, filasSincronizadas: 0 });
    });

    it('sincroniza filas desactualizadas sin forzar (usuario por id)', async () => {
      const { useCase, deps } = crear({
        folios: [folio176({})],
        nomina: [fila({})],
        filas135: [{ estudiante_id: 1, oferta_curso_id: 1, nota_final: 80, estado: 'CURSANDO' }],
      });
      const res = await ejecutar(useCase, { estado: 'CERRADO' });

      const [args] = deps.libroRegistroRepository.cerrarLibro.mock.calls[0];
      expect(args.asientos).toEqual([{ ids: [100], estadoAcademico: 'APROBADO' }]);
      expect(args.cambios.observaciones).toContain('Usuario: #6.');
      expect(args.cambios.observaciones).not.toContain('Motivo');
      expect(res.cierre).toEqual({ forzado: false, pendientesAsentados: 0, filasSincronizadas: 1 });
      expect(deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion)
        .toHaveBeenCalledWith(40);
    });
  });
});
