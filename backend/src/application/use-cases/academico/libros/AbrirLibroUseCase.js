import { ValidationError } from '../../../../domain/errors/AppError.js';
import {
  CODIGO_REGISTRO_INSTITUCIONAL,
  ESTADOS_LIBRO,
} from '../../../../domain/constants/libros.constants.js';
import { toLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Abre un libro de registro para una carrera y gestión (POST /libros).
 * Permiso: academico.libro · CREAR.
 *
 * Reglas:
 * - UNIQUE un libro por carrera+gestión (uk_carrera_gestion).
 * - numero_libro es OBLIGATORIO y se ingresa cada gestión: en la práctica es el
 *   MISMO número para los libros de todas las carreras de esa gestión (ej.
 *   todas abren la gestión 2026 con el libro 15). No se auto-sugiere MAX+1 por
 *   carrera (daría números distintos por carrera).
 * - codigo_registro: el front lo prellena con 81981609 como sugerencia; si no
 *   llega, el backend usa ese default institucional.
 * - folio_inicial editable (default 1): arranque histórico (el libro 14 real
 *   arranca en 56) — solo aplica si la gestión aún no tiene folios.
 */
export class AbrirLibroUseCase {
  constructor({ libroRegistroRepository, libroRegistroViewRepository, logger }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {Object} params.body - { carreraId, gestionId, numeroLibro?,
   *   codigoRegistro?, folioInicial?, folioFinal?, fechaApertura?, observaciones? }
   * @returns {Promise<{libro: Object}>}
   */
  async execute({ usuarioId, body = {} }) {
    const carreraId = Number(body.carreraId);
    const gestionId = Number(body.gestionId);
    if (!Number.isFinite(carreraId) || carreraId < 1) {
      throw new ValidationError('La carrera es obligatoria');
    }
    if (!Number.isFinite(gestionId) || gestionId < 1) {
      throw new ValidationError('La gestión es obligatoria');
    }

    const existente = await this.libroRegistroRepository.findByCarreraGestion(
      carreraId,
      gestionId,
    );
    if (existente) {
      throw new ValidationError(
        `La carrera ya tiene el libro N° ${existente.numeroLibro} abierto para esta gestión`,
      );
    }

    // numero_libro se ingresa cada gestión (mismo número para todas las
    // carreras de la gestión); no se auto-sugiere en servidor.
    const numeroLibro = Number(body.numeroLibro);
    if (!Number.isFinite(numeroLibro) || numeroLibro < 1) {
      throw new ValidationError('El número de libro es obligatorio');
    }

    const folioInicial = body.folioInicial != null ? Number(body.folioInicial) : 1;
    if (!Number.isFinite(folioInicial) || folioInicial < 1) {
      throw new ValidationError('El folio inicial debe ser 1 o mayor');
    }

    const folioFinal = body.folioFinal != null ? Number(body.folioFinal) : null;
    if (folioFinal != null && folioFinal < folioInicial) {
      throw new ValidationError('El folio final no puede ser menor al folio inicial');
    }

    const codigoRegistro = body.codigoRegistro
      ? String(body.codigoRegistro).trim()
      : CODIGO_REGISTRO_INSTITUCIONAL;

    const creado = await this.libroRegistroRepository.create(
      {
        numeroLibro,
        carreraId,
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
      carreraId,
      gestionId,
      folioInicial,
    });

    const row = await this.libroRegistroViewRepository.obtenerLibroPorId(creado.id);
    return { libro: toLibroDTO(row) };
  }
}

export default AbrirLibroUseCase;
