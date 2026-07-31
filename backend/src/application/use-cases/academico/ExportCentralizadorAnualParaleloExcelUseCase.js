import { ValidationError, NotFoundError } from '../../../domain/errors/AppError.js';
import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';
import { construirHojaParalelo } from '../../utils/libroFolioExcelDatos.js';
import { calcularEstadisticasParalelo } from './libros/helpers/estadisticasParaleloHelper.js';

/**
 * Exporta el Centralizador ANUAL de UN paralelo a Excel — grano NUEVO (hoy solo
 * existe el export por bimestre). Reutiliza los folios YA generados del Libro
 * de registro de ese paralelo (Bloque A: `listarFoliosPorParaleloGestion`) y
 * el MISMO armado/generador del Libro completo (`construirHojaParalelo` +
 * `ILibroRegistroExcelGenerator.generarLibroRegistro`), con UNA sola hoja en
 * vez de una por paralelo.
 *
 * La exportación NUNCA genera folios como efecto colateral: la numeración
 * oficial solo se asigna desde POST /libros/:id/folios o
 * POST /libros/gestiones/:gestionId/folios. Si el paralelo aún no tiene folios
 * vigentes en el libro de la gestión, responde 4xx.
 */
export class ExportCentralizadorAnualParaleloExcelUseCase {
  constructor({
    libroRegistroViewRepository,
    libroRegistroRepository,
    calificacionCentralizadorRepository,
    libroRegistroExcelGenerator,
    logger,
  }) {
    if (!libroRegistroViewRepository) {
      throw new Error('libroRegistroViewRepository es requerido');
    }
    if (!libroRegistroRepository) throw new Error('libroRegistroRepository es requerido');
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!libroRegistroExcelGenerator) {
      throw new Error('libroRegistroExcelGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.libroRegistroRepository = libroRegistroRepository;
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.libroRegistroExcelGenerator = libroRegistroExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloGestionId: number|string }} params
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ paraleloGestionId }) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo');
    }

    const foliosParalelo =
      await this.libroRegistroViewRepository.listarFoliosPorParaleloGestion(pgId);
    if (!Array.isArray(foliosParalelo) || foliosParalelo.length === 0) {
      throw new ValidationError(
        'El paralelo aún no tiene folios generados en el libro de la gestión',
      );
    }

    const filas135 =
      await this.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(
        pgId,
      );

    const estudiantesPorFolio = new Map();
    for (const folioRow of foliosParalelo) {
      // Secuencial a propósito (mismo criterio que ExportLibroExcelUseCase:
      // no saturar la BD con fan-out por folio).
      // eslint-disable-next-line no-await-in-loop
      const estudiantesRows = await this.libroRegistroRepository.listarEstudiantesFolio(
        folioRow.id,
      );
      estudiantesPorFolio.set(folioRow.id, estudiantesRows);
    }

    const estadisticas = calcularEstadisticasParalelo(foliosParalelo);
    const primero = foliosParalelo[0];

    const hoja = construirHojaParalelo({
      libroRow: {
        numero_libro: primero.numero_libro,
        codigo_registro: primero.codigo_registro,
        carrera_nombre: primero.carrera_nombre,
        gestion_anio: primero.gestion_anio,
      },
      foliosParalelo,
      filas135,
      estudiantesPorFolio,
      estadisticas,
    });

    const buffer = await this.libroRegistroExcelGenerator.generarLibroRegistro({
      libro: {
        numeroLibro: primero.numero_libro,
        codigoRegistro: primero.codigo_registro ?? '',
        carreraNombre: primero.carrera_nombre ?? '',
        gestionAnio: primero.gestion_anio ?? '',
      },
      hojas: [hoja],
    });

    const fileName = `Centralizador_Anual_${sanitizarFilePart(
      primero.carrera_codigo || primero.carrera_nombre || '',
    )}_${sanitizarFilePart(primero.paralelo_nombre || '')}_${sanitizarFilePart(
      String(primero.gestion_anio ?? ''),
    )}.xlsx`;

    this.logger?.info('[Calificaciones] Centralizador anual exportado a Excel', {
      paraleloGestionId: pgId,
      folios: foliosParalelo.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportCentralizadorAnualParaleloExcelUseCase;
