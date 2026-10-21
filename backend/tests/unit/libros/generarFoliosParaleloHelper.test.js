import { describe, it, expect, jest } from '@jest/globals';
import {
  calcularPaginasParalelo,
  generarParaUnParalelo,
} from '../../../src/application/use-cases/academico/libros/helpers/generarFoliosParaleloHelper.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

const nomina = (n) =>
  Array.from({ length: n }, (_, i) => ({ estudiante_id: i + 1, inscripcion_id: 500 + i }));

const repos = (n, filas135 = []) => ({
  libroRegistroViewRepository: {
    listarNominaPorParaleloGestion: jest.fn().mockResolvedValue(nomina(n)),
    listarFoliosPorLibro: jest.fn().mockResolvedValue([{ id: 1, numero_folio: 4 }]),
  },
  calificacionCentralizadorRepository: {
    listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue(filas135),
  },
});

describe('generarFoliosParaleloHelper', () => {
  describe('calcularPaginasParalelo', () => {
    it('corta en páginas de 10 con numeración continua y estado sugerido', async () => {
      const r = repos(21, [{ estudiante_id: 1, nota_final: 80 }, { estudiante_id: 2, nota_final: 10 }]);
      const { paginas, totalEstudiantes } = await calcularPaginasParalelo({
        ...r, paraleloGestionId: 40, notaMinimaAprobacion: 61, fechaRegistro: '2026-01-02',
      });

      expect(totalEstudiantes).toBe(21);
      expect(paginas.map((p) => p.estudiantes.length)).toEqual([10, 10, 1]);
      expect(paginas.map((p) => p.ordenEnParalelo)).toEqual([1, 2, 3]);
      expect(paginas[2].estudiantes[0].numeroOrden).toBe(21);
      expect(paginas[0]).toMatchObject({ paraleloGestionId: 40, estado: 'BORRADOR', fechaRegistro: '2026-01-02' });
      expect(paginas[0].estudiantes[0]).toMatchObject({
        estudianteId: 1, inscripcionId: 500, estadoAcademico: 'APROBADO', observaciones: null,
      });
      expect(paginas[0].estudiantes[1].estadoAcademico).toBe('REPROBADO');
      // sin filas 135 -> ABANDONO
      expect(paginas[0].estudiantes[2].estadoAcademico).toBe('ABANDONO');
    });

    it('exactamente 10 estudiantes -> una sola página', async () => {
      const { paginas } = await calcularPaginasParalelo({
        ...repos(10), paraleloGestionId: 1, notaMinimaAprobacion: 61,
      });
      expect(paginas).toHaveLength(1);
    });

    it('lanza ValidationError sin nómina y no consulta la 135', async () => {
      const r = repos(0);
      await expect(calcularPaginasParalelo({ ...r, paraleloGestionId: 1, notaMinimaAprobacion: 61 }))
        .rejects.toThrow(ValidationError);
      expect(r.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion)
        .not.toHaveBeenCalled();
    });
  });

  describe('generarParaUnParalelo', () => {
    it('persiste las páginas y devuelve DTOs de la vista 176', async () => {
      const r = repos(12);
      const libroRegistroRepository = {
        crearFoliosConEstudiantes: jest.fn().mockResolvedValue([{ numeroFolio: 4 }]),
      };
      const res = await generarParaUnParalelo({
        ...r,
        libroRegistroRepository,
        libro: { id: 2, gestionId: 8, folioInicial: 3 },
        paralelo: { paralelo_gestion_id: '40' },
        notaMinimaAprobacion: 61,
        usuarioId: 5,
      });

      const [datos, usuario] = libroRegistroRepository.crearFoliosConEstudiantes.mock.calls[0];
      expect(usuario).toBe(5);
      expect(datos).toMatchObject({ libroId: 2, gestionId: 8, folioInicial: 3 });
      expect(datos.folios[0].paraleloGestionId).toBe(40);
      expect(r.libroRegistroViewRepository.listarFoliosPorLibro).toHaveBeenCalledWith(2, { paraleloGestionId: 40 });
      expect(res.totalEstudiantes).toBe(12);
      expect(res.creados).toEqual([{ numeroFolio: 4 }]);
      expect(res.folios[0].numeroFolio).toBe(4);
    });
  });
});
