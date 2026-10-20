import { describe, it, expect } from '@jest/globals';
import {
  agruparFoliosConCursandoPorParalelo,
  clasificarFilasCursandoParalelo,
  resumirFoliosPendientes,
  toParaleloPendientesDTO,
  construirAsientosCierre,
} from '../../../src/application/use-cases/academico/libros/helpers/cierreLibroPendientesHelper.js';

describe('cierreLibroPendientesHelper', () => {
  describe('agruparFoliosConCursandoPorParalelo', () => {
    it('filtra anulados y sin cursando, agrupa y ordena por carrera canónica', () => {
      const res = agruparFoliosConCursandoPorParalelo([
        { id: 1, paralelo_gestion_id: 1, numero_folio: 9, total_cursando: 1, carrera_codigo: 'SIS-INF' },
        { id: 2, paralelo_gestion_id: 2, numero_folio: 5, total_cursando: 2, carrera_codigo: 'CON-GEN' },
        { id: 3, paralelo_gestion_id: 2, numero_folio: 3, total_cursando: 1, carrera_codigo: 'CON-GEN' },
        { id: 4, paralelo_gestion_id: 3, numero_folio: 1, total_cursando: 0, carrera_codigo: 'ADM-EMP' },
        { id: 5, paralelo_gestion_id: 4, numero_folio: 2, total_cursando: 3, estado: 'ANULADO' },
      ]);
      expect(res.map((g) => g.paraleloGestionId)).toEqual([2, 1]);
      expect(res[0].folios.map((f) => f.numero_folio)).toEqual([3, 5]);
    });
    it('entrada nula -> []', () => {
      expect(agruparFoliosConCursandoPorParalelo(null)).toEqual([]);
    });
    it('desempata por periodo y nombre de paralelo', () => {
      const res = agruparFoliosConCursandoPorParalelo([
        { paralelo_gestion_id: 1, numero_folio: 1, total_cursando: 1, carrera_codigo: 'CON-GEN', periodo_numero: 2, paralelo_nombre: 'A' },
        { paralelo_gestion_id: 2, numero_folio: 2, total_cursando: 1, carrera_codigo: 'CON-GEN', periodo_numero: 1, paralelo_nombre: 'B' },
        { paralelo_gestion_id: 3, numero_folio: 3, total_cursando: 1, carrera_codigo: 'CON-GEN', periodo_numero: 1, paralelo_nombre: 'A' },
      ]);
      expect(res.map((g) => g.paraleloGestionId)).toEqual([3, 2, 1]);
    });
  });

  describe('clasificarFilasCursandoParalelo', () => {
    const folios = [{ id: 1, numero_folio: 7 }];
    const nominasPorFolio = new Map([[1, [
      { id: 10, estudiante_id: 1, estado_academico: 'CURSANDO', numero_orden: 1, nombre_completo: 'AÑEZ JUAN' },
      { id: 11, estudiante_id: 2, estado_academico: 'CURSANDO', numero_orden: 2, apellido_paterno: 'ROCA' },
      { id: 12, estudiante_id: 3, estado_academico: 'APROBADO', numero_orden: 3 },
    ]]]);
    const filas135 = [
      { estudiante_id: 1, nota_final: null },
      { estudiante_id: 2, nota_final: 40 },
    ];

    it('separa pendientes y desactualizadas (re-derivadas) e ignora no CURSANDO', () => {
      const res = clasificarFilasCursandoParalelo({ folios, nominasPorFolio, filas135, notaMinimaAprobacion: 61 });
      expect(res.pendientes).toEqual([
        { folioEstudianteId: 10, estudianteId: 1, numeroFolio: 7, numeroOrden: 1, apellidoPaterno: 'AÑEZ' },
      ]);
      expect(res.desactualizadas).toEqual([
        {
          folioEstudianteId: 11,
estudianteId: 2,
numeroFolio: 7,
numeroOrden: 2,
          apellidoPaterno: 'ROCA',
estadoAcademico: 'REPROBADO',
        },
      ]);
    });

    it('sin filas 135 el estudiante deriva ABANDONO (desactualizada)', () => {
      const res = clasificarFilasCursandoParalelo({ folios, nominasPorFolio, filas135: [], notaMinimaAprobacion: 61 });
      expect(res.pendientes).toEqual([]);
      expect(res.desactualizadas.map((d) => d.estadoAcademico)).toEqual(['ABANDONO', 'ABANDONO']);
    });
  });

  it('resumirFoliosPendientes: rango de apellidos por folio ordenado', () => {
    const res = resumirFoliosPendientes([
      { numeroFolio: 8, numeroOrden: 2, apellidoPaterno: 'B' },
      { numeroFolio: 8, numeroOrden: 1, apellidoPaterno: 'A' },
      { numeroFolio: 3, numeroOrden: 5, apellidoPaterno: 'Z' },
    ]);
    expect(res).toEqual([
      { numeroFolio: 3, totalEstudiantes: 1, apellidoDesde: 'Z', apellidoHasta: 'Z' },
      { numeroFolio: 8, totalEstudiantes: 2, apellidoDesde: 'A', apellidoHasta: 'B' },
    ]);
  });

  describe('toParaleloPendientesDTO', () => {
    it('null sin pendientes', () => {
      expect(toParaleloPendientesDTO({ paraleloGestionId: 1, folios: [{}] }, [])).toBeNull();
      expect(toParaleloPendientesDTO({ paraleloGestionId: 1, folios: [{}] }, null)).toBeNull();
    });
    it('arma cabecera y rango de folios', () => {
      const dto = toParaleloPendientesDTO(
        { paraleloGestionId: 4, folios: [{ carrera_codigo: 'SIS-INF', paralelo_nombre: 'A' }] },
        [
          { numeroFolio: 2, numeroOrden: 1, apellidoPaterno: 'X' },
          { numeroFolio: 5, numeroOrden: 1, apellidoPaterno: 'Y' },
        ],
      );
      expect(dto).toMatchObject({
        paraleloGestionId: 4,
carreraCodigo: 'SIS-INF',
paraleloNombre: 'A',
        folioDesde: 2,
folioHasta: 5,
totalEstudiantes: 2,
turno: null,
      });
      expect(dto.folios).toHaveLength(2);
    });
  });

  describe('construirAsientosCierre', () => {
    it('ABANDONO para pendientes y un grupo por estado para desactualizadas', () => {
      const res = construirAsientosCierre({
        pendientes: [{ folioEstudianteId: 1 }, { folioEstudianteId: 2 }],
        desactualizadas: [
          { folioEstudianteId: 3, estadoAcademico: 'APROBADO' },
          { folioEstudianteId: 4, estadoAcademico: 'REPROBADO' },
          { folioEstudianteId: 5, estadoAcademico: 'APROBADO' },
        ],
        observacionAbandono: 'OBS',
      });
      expect(res).toEqual([
        { ids: [1, 2], estadoAcademico: 'ABANDONO', observacion: 'OBS' },
        { ids: [3, 5], estadoAcademico: 'APROBADO' },
        { ids: [4], estadoAcademico: 'REPROBADO' },
      ]);
    });
    it('vacío sin filas', () => {
      expect(construirAsientosCierre({ pendientes: [], desactualizadas: [], observacionAbandono: 'x' })).toEqual([]);
    });
  });
});
