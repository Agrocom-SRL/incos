import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_FOLIO, ordenCarreraLibro } from '../../../../domain/constants/libros.constants.js';
import { sanitizarFilePart } from '../../../utils/centralizadorExcelDatos.js';
import { construirHojaParalelo } from '../../../utils/libroFolioExcelDatos.js';
import { calcularEstadisticasParalelo } from './helpers/estadisticasParaleloHelper.js';

/**
 * Exporta el libro de registro a Excel (GET /libros/:id/export): una hoja
 * por paralelo con sus folios apilados verticalmente — réplica del libro
 * físico "LIBRO LLENADO SISTEMAS 11 dic 2025". El libro es de la gestión
 * completa (3 carreras); sin `carreraId` exporta las 3, con `carreraId`
 * exporta solo las hojas de esa carrera (ficha del libro, tab por carrera).
 * Las hojas se ordenan primero por carrera en el orden canónico institucional
 * (`ordenCarreraLibro`), luego periodo, luego paralelo.
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
   * @param {Object} params - { id, carreraId? }
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ id, carreraId = null }) {
    const libroId = Number(id);
    const libroRow = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    if (!libroRow) {
      throw new NotFoundError('Libro de registro');
    }

    const foliosRows = await this.libroRegistroViewRepository.listarFoliosPorLibro(libroId);
    let exportables = foliosRows.filter((f) => f.estado !== ESTADOS_FOLIO.ANULADO);
    if (carreraId != null) {
      exportables = exportables.filter((f) => Number(f.carrera_id) === Number(carreraId));
    }
    if (exportables.length === 0) {
      throw new ValidationError(
        carreraId != null
          ? 'Esta carrera aún no tiene folios generados para exportar'
          : 'El libro aún no tiene folios generados para exportar',
      );
    }

    // Una hoja por paralelo (orden: carrera canónica, luego curso/periodo,
    // luego paralelo — el libro trae hojas de las 3 carreras).
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
        ordenCarreraLibro(pa.carrera_codigo) - ordenCarreraLibro(pb.carrera_codigo) ||
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

      const estudiantesPorFolio = new Map();
      for (const folioRow of foliosParalelo) {
        // eslint-disable-next-line no-await-in-loop
        const estudiantesRows = await this.libroRegistroRepository.listarEstudiantesFolio(
          folioRow.id,
        );
        totalEstudiantes += estudiantesRows.length;
        estudiantesPorFolio.set(folioRow.id, estudiantesRows);
      }

      hojas.push(
        construirHojaParalelo({
          libroRow,
          foliosParalelo,
          filas135,
          estudiantesPorFolio,
          estadisticas: calcularEstadisticasParalelo(foliosParalelo),
        }),
      );
    }

    const buffer = await this.libroRegistroExcelGenerator.generarLibroRegistro({
      libro: {
        numeroLibro: libroRow.numero_libro,
        codigoRegistro: libroRow.codigo_registro ?? '',
        gestionAnio: libroRow.gestion_anio ?? '',
      },
      hojas,
    });

    const sufijoCarrera = carreraId != null ? `_${sanitizarFilePart(String(exportables[0].carrera_codigo ?? ''))}` : '';
    const fileName = `Libro_${libroRow.numero_libro}_${sanitizarFilePart(
      String(libroRow.gestion_anio ?? ''),
    )}${sufijoCarrera}.xlsx`;

    this.logger?.info('[Libros] Libro exportado a Excel', {
      libroId,
      carreraId,
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
