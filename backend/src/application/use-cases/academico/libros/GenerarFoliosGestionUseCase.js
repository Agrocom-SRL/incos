import { ValidationError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_LIBRO } from '../../../../domain/constants/libros.constants.js';
import { generarParaUnParalelo } from './helpers/generarFoliosParaleloHelper.js';

/**
 * Genera los folios de TODOS los paralelos de una gestión, en el orden
 * canónico del documento oficial: Contaduría → Administración → Informática
 * (`ordenCarreraLibro`), luego periodo, luego paralelo alfabético
 * (`listarParalelosPorGestion`). Orquesta el mismo CORE que
 * `GenerarFoliosParaleloUseCase` (`generarParaUnParalelo`) paralelo por
 * paralelo. Permiso: academico.libro · CREAR.
 *
 * Precondición: debe existir un libro ABIERTO por cada carrera con paralelos
 * en la gestión — si falta alguno, rechaza nombrando la carrera faltante
 * (evita numerar de corrido omitiendo una carrera completa por error).
 *
 * Idempotente: un paralelo con folios vigentes se OMITE (no es error) y queda
 * en el resumen — a diferencia de `GenerarFoliosParaleloUseCase`, que rechaza
 * con ValidationError cuando se pide un único paralelo ya generado. Un
 * paralelo sin nómina (helper lanza ValidationError) también se omite: es una
 * condición de datos recuperable, no debe frenar el resto de la gestión.
 *
 * Cada paralelo se persiste en SU PROPIA transacción (delegada por
 * `generarParaUnParalelo` → `crearFoliosConEstudiantes`) — NO hay una
 * transacción única para toda la gestión: si algo falla a mitad de camino, los
 * paralelos ya generados quedan válidos y basta volver a llamar el endpoint
 * (los ya generados se omiten por la regla de idempotencia).
 */
export class GenerarFoliosGestionUseCase {
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
   * @param {number} params.gestionId
   * @param {Object} [params.body] - { fechaRegistro? }
   * @returns {Promise<{ resumenGeneracion: Object }>} `resumenGeneracion`:
   *   { paralelosGenerados, foliosCreados, folioDesde, folioHasta, omitidos }.
   */
  async execute({ usuarioId, gestionId, body = {} }) {
    const gid = Number(gestionId);
    if (!Number.isFinite(gid) || gid < 1) {
      throw new ValidationError('La gestión es obligatoria');
    }

    const paralelos = await this.libroRegistroViewRepository.listarParalelosPorGestion(gid);
    if (paralelos.length === 0) {
      throw new ValidationError('La gestión no tiene paralelos en oferta');
    }

    // Precondición: un libro ABIERTO por cada carrera con paralelos en la gestión.
    const carrerasEnGestion = [
      ...new Map(paralelos.map((p) => [Number(p.carrera_id), p.carrera_nombre])).entries(),
    ];
    const librosPorCarrera = new Map();
    for (const [carreraId, carreraNombre] of carrerasEnGestion) {
      // Secuencial a propósito: son 3 carreras como máximo (no fan-out real).
      // eslint-disable-next-line no-await-in-loop
      const libro = await this.libroRegistroRepository.findByCarreraGestion(carreraId, gid);
      if (!libro) {
        throw new ValidationError(
          `Falta abrir el libro de "${carreraNombre}" para esta gestión antes de generar folios`,
        );
      }
      if (libro.estado !== ESTADOS_LIBRO.ABIERTO) {
        throw new ValidationError(
          `El libro de "${carreraNombre}" está cerrado: no admite nuevos folios`,
        );
      }
      librosPorCarrera.set(carreraId, libro);
    }

    const omitidos = [];
    let paralelosGenerados = 0;
    let foliosCreados = 0;
    const numerosFolio = [];

    for (const paralelo of paralelos) {
      const libro = librosPorCarrera.get(Number(paralelo.carrera_id));
      const paraleloGestionId = Number(paralelo.paralelo_gestion_id);

      // Idempotente: un paralelo con folios vigentes se OMITE (no es error).
      // eslint-disable-next-line no-await-in-loop
      const foliosVigentes = await this.libroRegistroRepository.countFoliosVigentesByParalelo(
        libro.id,
        paraleloGestionId,
      );
      if (foliosVigentes > 0) {
        omitidos.push({ paraleloGestionId, motivo: 'Ya tiene folios vigentes en el libro' });
        // eslint-disable-next-line no-continue
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        const { creados } = await generarParaUnParalelo({
          libroRegistroRepository: this.libroRegistroRepository,
          libroRegistroViewRepository: this.libroRegistroViewRepository,
          calificacionCentralizadorRepository: this.calificacionCentralizadorRepository,
          libro,
          paralelo,
          fechaRegistro: body.fechaRegistro,
          usuarioId,
        });
        paralelosGenerados += 1;
        foliosCreados += creados.length;
        creados.forEach((f) => numerosFolio.push(Number(f.numeroFolio)));
      } catch (error) {
        // Condición de datos recuperable (p. ej. paralelo sin nómina): se
        // omite y se reporta, sin frenar el resto de la gestión. Cualquier
        // otro error (infraestructura, etc.) sí aborta — el proceso queda
        // reanudable (los paralelos ya generados no se reprocesan).
        if (error instanceof ValidationError) {
          omitidos.push({ paraleloGestionId, motivo: error.message });
          // eslint-disable-next-line no-continue
          continue;
        }
        throw error;
      }
    }

    const resumen = {
      paralelosGenerados,
      foliosCreados,
      folioDesde: numerosFolio.length > 0 ? Math.min(...numerosFolio) : null,
      folioHasta: numerosFolio.length > 0 ? Math.max(...numerosFolio) : null,
      omitidos,
    };

    this.logger?.info('[Libros] Folios generados por gestión', { gestionId: gid, ...resumen });

    return { resumenGeneracion: resumen };
  }
}

export default GenerarFoliosGestionUseCase;
