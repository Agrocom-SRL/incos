import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_FOLIO,
  ESTADOS_FOLIO_VALUES,
  TRANSICIONES_FOLIO,
} from '../../../../domain/constants/libros.constants.js';
import { toFolioDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Cambia el estado de un folio (PATCH /libros/:id/folios/:folioId/estado).
 * Permiso: academico.libro · APROBAR.
 *
 * Máquina de estados: BORRADOR → ANULADO. ANULADO exige motivo (queda en
 * observaciones del folio) y es terminal: regenerar el paralelo crea folios
 * nuevos con numeración nueva. El "cierre" oficial del documento (con bloque
 * de firmas en el export) se controla por `libros_registro.estado` (CERRADO),
 * no por folio.
 */
export class CambiarEstadoFolioUseCase {
  constructor({ libroRegistroRepository, libroRegistroViewRepository, logger }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id - Libro.
   * @param {number} params.folioId
   * @param {Object} params.body - { estado, motivo? }
   * @returns {Promise<{folio: Object}>}
   */
  async execute({ usuarioId, id, folioId, body = {} }) {
    const { estado, motivo } = body;
    if (!estado || !ESTADOS_FOLIO_VALUES.includes(estado)) {
      throw new ValidationError('Estado de folio inválido');
    }

    const folio = await this.libroRegistroRepository.findFolioById(Number(folioId));
    if (!folio || Number(folio.libroId) !== Number(id)) {
      throw new NotFoundError('Folio');
    }

    const permitidos = TRANSICIONES_FOLIO[folio.estado] ?? [];
    if (!permitidos.includes(estado)) {
      throw new ValidationError(
        `Transición inválida: ${folio.estado} → ${estado}`,
      );
    }

    const motivoLimpio = motivo != null ? String(motivo).trim() : '';
    if (estado === ESTADOS_FOLIO.ANULADO && !motivoLimpio) {
      throw new ValidationError('El motivo de anulación es obligatorio');
    }

    const cambios = { estado, observaciones: motivoLimpio };

    await this.libroRegistroRepository.updateFolio(folio.id, cambios, usuarioId);

    this.logger?.info('[Libros] Estado de folio cambiado', {
      libroId: Number(id),
      folioId: folio.id,
      de: folio.estado,
      a: estado,
    });

    const row = await this.libroRegistroViewRepository.obtenerFolioPorId(folio.id);
    return { folio: toFolioDTO(row) };
  }
}

export default CambiarEstadoFolioUseCase;
