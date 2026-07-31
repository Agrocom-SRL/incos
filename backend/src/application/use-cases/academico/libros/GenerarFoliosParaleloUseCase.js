import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_LIBRO } from '../../../../domain/constants/libros.constants.js';
import { generarParaUnParalelo } from './helpers/generarFoliosParaleloHelper.js';

/**
 * Genera los folios (páginas del centralizador) de UN paralelo del libro
 * (POST /libros/:id/folios). Permiso: academico.libro · CREAR.
 *
 * Valida el caso de UN paralelo suelto (pertenece al libro, libro ABIERTO, sin
 * folios vigentes) y delega el CORE de la generación (nómina → páginas de 10 →
 * numeración transaccional cross-carrera) en el helper compartido
 * `generarParaUnParalelo`, reutilizado también por `GenerarFoliosGestionUseCase`
 * (generación masiva de toda la gestión). Ver ese helper para el detalle del
 * algoritmo — comportamiento idéntico al de antes de la extracción.
 *
 * Rechazos: libro CERRADO, paralelo de otra carrera/gestión, paralelo sin
 * estudiantes y paralelo con folios vigentes (se anulan antes de regenerar).
 */
export class GenerarFoliosParaleloUseCase {
  constructor({
    libroRegistroRepository,
    libroRegistroViewRepository,
    calificacionCentralizadorRepository,
    logger,
  }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id - Libro.
   * @param {Object} params.body - { paraleloGestionId, fechaRegistro? }
   * @returns {Promise<{folios: Object[]}>} Folios creados (vista 176).
   */
  async execute({ usuarioId, id, body = {} }) {
    const libroId = Number(id);
    const paraleloGestionId = Number(body.paraleloGestionId);
    if (!Number.isFinite(paraleloGestionId) || paraleloGestionId < 1) {
      throw new ValidationError('El paralelo es obligatorio');
    }

    const libro = await this.libroRegistroRepository.findById(libroId);
    if (!libro) {
      throw new NotFoundError('Libro de registro');
    }
    if (libro.estado !== ESTADOS_LIBRO.ABIERTO) {
      throw new ValidationError('El libro está cerrado: no admite nuevos folios');
    }

    // El paralelo debe pertenecer a la carrera+gestión del libro.
    const paralelos = await this.libroRegistroViewRepository.listarParalelosParaLibro({
      carreraId: libro.carreraId,
      gestionId: libro.gestionId,
      libroId,
    });
    const paralelo = paralelos.find(
      (p) => Number(p.paralelo_gestion_id) === paraleloGestionId,
    );
    if (!paralelo) {
      throw new ValidationError(
        'El paralelo no pertenece a la carrera y gestión de este libro',
      );
    }

    const foliosVigentes = await this.libroRegistroRepository.countFoliosVigentesByParalelo(
      libroId,
      paraleloGestionId,
    );
    if (foliosVigentes > 0) {
      throw new ValidationError(
        'El paralelo ya tiene folios en este libro: anule los folios existentes antes de regenerar',
      );
    }

    // CORE de la generación (nómina → páginas de 10 → numeración transaccional
    // cross-carrera), delegado al helper compartido con GenerarFoliosGestionUseCase.
    const { creados, folios, totalEstudiantes } = await generarParaUnParalelo({
      libroRegistroRepository: this.libroRegistroRepository,
      libroRegistroViewRepository: this.libroRegistroViewRepository,
      calificacionCentralizadorRepository: this.calificacionCentralizadorRepository,
      libro,
      paralelo,
      fechaRegistro: body.fechaRegistro,
      usuarioId,
    });

    const numeros = creados.map((f) => Number(f.numeroFolio));
    this.logger?.info('[Libros] Folios generados', {
      libroId,
      paraleloGestionId,
      folios: creados.length,
      estudiantes: totalEstudiantes,
      rango: numeros.length > 0 ? `${Math.min(...numeros)}-${Math.max(...numeros)}` : '',
    });

    return { folios };
  }
}

export default GenerarFoliosParaleloUseCase;
