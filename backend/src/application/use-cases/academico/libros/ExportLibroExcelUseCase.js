import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_FOLIO } from '../../../../domain/constants/libros.constants.js';
import { sanitizarFilePart } from '../../../utils/centralizadorExcelDatos.js';
import {
  toFolioEstudianteDTO,
} from '../../../mappers/academico/LibroRegistroPresentationMapper.js';
import {
  construirAsignaturasDesdeFilas135,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
} from './helpers/folioCeldasHelper.js';

/**
 * Exporta el libro de registro COMPLETO a Excel (GET /libros/:id/export):
 * una hoja por paralelo con sus folios apilados verticalmente — réplica del
 * libro físico "LIBRO LLENADO SISTEMAS 11 dic 2025".
 * Permiso: academico.libro · EXPORTAR.
 *
 * Los folios ANULADOS no se exportan: su numeración queda como hueco (como en
 * el libro físico, donde el número de una página anulada no se reutiliza).
 * Las notas por materia salen de la vista 135 (una lectura por paralelo);
 * ESTADO y OBSERVACIONES salen del snapshot congelado en folio_estudiantes.
 */
export class ExportLibroExcelUseCase {
  constructor({
    libroRegistroRepository,
    libroRegistroViewRepository,
    calificacionCentralizadorRepository,
    libroRegistroExcelGenerator,
    logger,
  }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.libroRegistroExcelGenerator = libroRegistroExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} params - { id }
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ id }) {
    const libroId = Number(id);
    const libroRow = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    if (!libroRow) {
      throw new NotFoundError('Libro de registro');
    }

    const foliosRows = await this.libroRegistroViewRepository.listarFoliosPorLibro(libroId);
    const exportables = foliosRows.filter((f) => f.estado !== ESTADOS_FOLIO.ANULADO);
    if (exportables.length === 0) {
      throw new ValidationError('El libro aún no tiene folios generados para exportar');
    }

    // Una hoja por paralelo (orden: curso/periodo, luego paralelo).
    const porParalelo = new Map();
    for (const folio of exportables) {
      const lista = porParalelo.get(folio.paralelo_gestion_id) ?? [];
      lista.push(folio);
      porParalelo.set(folio.paralelo_gestion_id, lista);
    }
    const grupos = [...porParalelo.values()].sort((a, b) => {
      const pa = a[0];
      const pb = b[0];
      return (
        (pa.periodo_numero ?? 0) - (pb.periodo_numero ?? 0) ||
        String(pa.paralelo_nombre ?? '').localeCompare(String(pb.paralelo_nombre ?? ''))
      );
    });

    const hojas = [];
    let totalEstudiantes = 0;
    for (const foliosParalelo of grupos) {
      const primero = foliosParalelo[0];
      // Una lectura de la 135 por paralelo (celdas de nota final por materia).
      // Secuencial a propósito (no saturar la BD con fan-out por paralelo).
      // eslint-disable-next-line no-await-in-loop
      const filas135 = await this.calificacionCentralizadorRepository
        .listarFilasCentralizadorPorParaleloGestion(primero.paralelo_gestion_id);
      const asignaturas = construirAsignaturasDesdeFilas135(filas135);
      const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);

      const folios = [];
      for (const folioRow of foliosParalelo) {
        // eslint-disable-next-line no-await-in-loop
        const estudiantesRows = await this.libroRegistroRepository.listarEstudiantesFolio(
          folioRow.id,
        );
        totalEstudiantes += estudiantesRows.length;
        folios.push({
          cabecera: {
            codigoRegistro: libroRow.codigo_registro ?? '',
            numeroLibro: libroRow.numero_libro,
            numeroFolio: folioRow.numero_folio,
            turno: folioRow.turno ?? '',
            gestionAnio: folioRow.gestion_anio ?? libroRow.gestion_anio ?? '',
            carrera: folioRow.carrera_nombre ?? libroRow.carrera_nombre ?? '',
            curso: `${String(folioRow.periodo_nombre ?? '').toUpperCase()} - PARALELO ${
              folioRow.paralelo_nombre ?? ''
            }`.trim(),
            estado: folioRow.estado,
          },
          asignaturas,
          estudiantes: estudiantesRows.map((fila) => ({
            ...toFolioEstudianteDTO(fila),
            celdas: construirCeldasEstudiante(filasPorEstudiante.get(fila.estudiante_id)),
          })),
        });
      }

      hojas.push({
        nombreHoja: `${primero.periodo_nombre ?? ''} ${primero.paralelo_nombre ?? ''}`.trim(),
        folios,
      });
    }

    const buffer = await this.libroRegistroExcelGenerator.generarLibroRegistro({
      libro: {
        numeroLibro: libroRow.numero_libro,
        codigoRegistro: libroRow.codigo_registro ?? '',
        carreraNombre: libroRow.carrera_nombre ?? '',
        gestionAnio: libroRow.gestion_anio ?? '',
      },
      hojas,
    });

    const fileName = `Libro_${libroRow.numero_libro}_${sanitizarFilePart(
      libroRow.carrera_codigo || libroRow.carrera_nombre || '',
    )}_${sanitizarFilePart(String(libroRow.gestion_anio ?? ''))}.xlsx`;

    this.logger?.info('[Libros] Libro exportado a Excel', {
      libroId,
      hojas: hojas.length,
      folios: exportables.length,
      estudiantes: totalEstudiantes,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportLibroExcelUseCase;
