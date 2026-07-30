import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';

/** Slug seguro para nombre de archivo de descarga. */
function slug(text) {
  return (
    String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'docente'
  );
}

/** ficha-seguimiento-{apellidos}-{fecha}.pdf. */
function buildFileName(contexto, ficha) {
  // Del nombre institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES se
  // toman las dos primeras palabras (los apellidos).
  const apellidos = slug(
    String(contexto.docenteNombre ?? 'docente')
      .split(/\s+/)
      .slice(0, 2)
      .join('-')
  );
  const fecha = String(ficha.fechaSeguimiento ?? 'sin-fecha');
  return `ficha-seguimiento-${apellidos}-${fecha}.pdf`;
}

/**
 * Use Case: ExportFichaSeguimientoPdfUseCase (S6)
 * Módulo: Docentes (DOC · supervisión docente)
 *
 * Genera el PDF de la «FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL» (réplica
 * del formulario físico de la Dirección Académica) para descarga binaria.
 */
export class ExportFichaSeguimientoPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoClaseRepository - Raíz fichas_seguimiento_clase
   * @param {Object} params.fichaSeguimientoListadoViewRepository - Vista 174 (contexto)
   * @param {Object} params.fichaSeguimientoClasePdfGenerator - IFichaSeguimientoClasePdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    fichaSeguimientoClaseRepository,
    fichaSeguimientoListadoViewRepository,
    fichaSeguimientoClasePdfGenerator,
    logger,
  }) {
    this.fichaSeguimientoClaseRepository = fichaSeguimientoClaseRepository;
    this.fichaSeguimientoListadoViewRepository = fichaSeguimientoListadoViewRepository;
    this.fichaSeguimientoClasePdfGenerator = fichaSeguimientoClasePdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ id: number }} input
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute({ id } = {}) {
    const entity = await this.fichaSeguimientoClaseRepository.findById(id);
    if (!entity) {
      throw new NotFoundError(`ficha de seguimiento con ID ${id}`);
    }

    const row = await this.fichaSeguimientoListadoViewRepository.findListadoById(id);
    const ficha = FichaSeguimientoMapper.toDetail(entity, row);
    const contexto = row ? FichaSeguimientoMapper.toListItem(row) : {};

    const buffer = await this.fichaSeguimientoClasePdfGenerator.generate({ ficha, contexto });

    const fileName = buildFileName(contexto, ficha);

    this.logger.info('[Supervisión docente] Ficha exportada a PDF', { id, fileName });

    return {
      buffer,
      fileName,
      mimeType: 'application/pdf',
    };
  }
}
