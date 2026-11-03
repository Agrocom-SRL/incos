import { NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';
import {
  CODIGO_REGISTRO_INSTITUCIONAL,
  ESTADOS_LIBRO,
} from '../../../../domain/constants/libros.constants.js';
import { toLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Abre un libro de registro para una gestión (POST /libros), compartido por
 * las 3 carreras del instituto. Permiso: academico.libro · CREAR.
 *
 * Reglas:
 * - La gestión debe existir (404 si no).
 * - UNIQUE un libro por gestión (uk_gestion).
 * - numero_libro es OBLIGATORIO y se ingresa cada gestión (ej. la gestión 2026
 *   abre con el libro 15). No se auto-sugiere MAX+1 en servidor.
 * - codigo_registro: el front lo prellena con 81981609 como sugerencia; si no
 *   llega, el backend usa ese default institucional.
 * - folio_inicial editable (default 1): arranque histórico (el libro 14 real
 *   arranca en 56) — solo aplica si la gestión aún no tiene folios.
 */
export class AbrirLibroUseCase {
  constructor({ libroRegistroRepository, libroRegistroViewRepository, managementRepository, logger }) {
    if (!managementRepository) throw new Error('managementRepository es requerido');
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {Object} params.body - { gestionId, numeroLibro?,
   *   codigoRegistro?, folioInicial?, folioFinal?, fechaApertura?, observaciones? }
   * @returns {Promise<{libro: Object}>}
   */
  async execute({ usuarioId, body = {} }) {
    const gestionId = Number(body.gestionId);
    if (!Number.isFinite(gestionId) || gestionId < 1) {
      throw new ValidationError('La gestión es obligatoria');
    }

    // La gestión debe existir: sin esta comprobación la FK de libros_registro respondería 500.
    const gestion = await this.managementRepository.findById(gestionId);
    if (!gestion) {
      throw new NotFoundError('Gestión');
    }

    const existente = await this.libroRegistroRepository.findByGestion(gestionId);
    if (existente) {
      throw new ValidationError(
        `La gestión ya tiene el libro N° ${existente.numeroLibro} abierto`,
      );
    }

    // numero_libro se ingresa cada gestión; no se auto-sugiere en servidor.
    const numeroLibro = Number(body.numeroLibro);
    if (!Number.isFinite(numeroLibro) || numeroLibro < 1) {
      throw new ValidationError('El número de libro es obligatorio');
    }

    const folioInicial = body.folioInicial != null ? Number(body.folioInicial) : 1;
    if (!Number.isFinite(folioInicial) || folioInicial < 1) {
      throw new ValidationError('El folio inicial debe ser 1 o mayor');
    }

    const folioFinal = body.folioFinal != null ? Number(body.folioFinal) : null;
    if (folioFinal != null && (!Number.isFinite(folioFinal) || folioFinal < folioInicial)) {
      throw new ValidationError('El folio final debe ser un número no menor al folio inicial');
    }

    const codigoRegistro = body.codigoRegistro
      ? String(body.codigoRegistro).trim()
      : CODIGO_REGISTRO_INSTITUCIONAL;

    const creado = await this.libroRegistroRepository.create(
      {
        numeroLibro,
        gestionId,
        codigoRegistro,
        folioInicial,
        folioActual: 0,
        folioFinal,
        estado: ESTADOS_LIBRO.ABIERTO,
        fechaApertura: body.fechaApertura ?? new Date().toISOString().slice(0, 10),
        observaciones: body.observaciones != null ? String(body.observaciones).trim() : null,
      },
      usuarioId,
    );

    this.logger?.info('[Libros] Libro abierto', {
      id: creado.id,
      numeroLibro,
      gestionId,
      folioInicial,
    });

    const row = await this.libroRegistroViewRepository.obtenerLibroPorId(creado.id);
    return { libro: toLibroDTO(row) };
  }
}

export default AbrirLibroUseCase;
