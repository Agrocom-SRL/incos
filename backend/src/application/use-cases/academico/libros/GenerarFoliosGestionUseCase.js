import { ValidationError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_LIBRO } from '../../../../domain/constants/libros.constants.js';
import { calcularPaginasParalelo } from './helpers/generarFoliosParaleloHelper.js';

/**
 * Reajusta los folios de TODOS los paralelos de una gestión: recalcula la
 * numeración COMPLETA del libro (las 3 carreras comparten libro) a partir de
 * la nómina ACTUAL de cada paralelo, en el orden canónico del documento
 * oficial (Contaduría → Administración → Informática, `ordenCarreraLibro`,
 * ya aplicado por `listarParalelosPorGestion`). Es la operación detrás del
 * botón "Generar todos los folios" de la ficha del libro: la primera vez
 * genera; las siguientes veces REAJUSTA la numeración si cambió la matrícula
 * de algún paralelo (altas/bajas que corren un folio a otra página).
 * Permiso: academico.libro · CREAR.
 *
 * Todo o nada (decisión de negocio explícita, no per-paralelo): se anulan TODOS
 * los folios vigentes (BORRADOR) del libro y se regeneran de una sola vez con
 * numeración correlativa ENTRE SÍ. numero_folio nunca se reutiliza (restricción
 * única `uk_libro_folio`, anular no borra la fila) — los nuevos arrancan en
 * MAX(numero_folio del libro) + 1, no en 1: el rango del libro crece en cada
 * reajuste sucesivo (p. ej. 1–44, luego 45–88), pero dentro del reajuste no
 * quedan huecos entre los folios vigentes.
 *
 * Precondición: debe existir un libro ABIERTO de la gestión — si falta o está
 * CERRADO, rechaza antes de tocar folios. Un libro CERRADO es precisamente lo
 * que protege el reajuste: el folio no tiene un estado "inmutable" propio, el
 * cierre oficial del documento vive en `libros_registro.estado`.
 *
 * Paralelos sin nómina (helper lanza ValidationError) se OMITEN y quedan
 * reportados en el resumen: es una condición de datos recuperable, no debe
 * frenar el reajuste del resto de la gestión.
 *
 * Persistencia: UNA sola transacción para todo el libro
 * (`libroRegistroRepository.reajustarFoliosGestion`) — todo o nada también a
 * nivel de base de datos.
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
   *   { paralelosGenerados, foliosCreados, foliosAnulados, folioDesde,
   *   folioHasta, omitidos }.
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

    // Precondición: un libro ABIERTO de la gestión (compartido por las 3 carreras).
    const libro = await this.libroRegistroRepository.findByGestion(gid);
    if (!libro) {
      throw new ValidationError('Falta abrir el libro de esta gestión antes de generar folios');
    }
    if (libro.estado !== ESTADOS_LIBRO.ABIERTO) {
      throw new ValidationError('El libro de esta gestión está cerrado: no admite nuevos folios');
    }

    // Recalcula las páginas de CADA paralelo con nómina, en orden canónico —
    // el resultado es el libro completo tal como debería quedar HOY.
    const omitidos = [];
    const folios = [];
    let paralelosConNomina = 0;

    for (const paralelo of paralelos) {
      const paraleloGestionId = Number(paralelo.paralelo_gestion_id);
      try {
        // eslint-disable-next-line no-await-in-loop
        const { paginas } = await calcularPaginasParalelo({
          libroRegistroViewRepository: this.libroRegistroViewRepository,
          calificacionCentralizadorRepository: this.calificacionCentralizadorRepository,
          paraleloGestionId,
          fechaRegistro: body.fechaRegistro,
        });
        paralelosConNomina += 1;
        folios.push(...paginas);
      } catch (error) {
        // Condición de datos recuperable (paralelo sin nómina): se omite y se
        // reporta, sin frenar el reajuste del resto de la gestión.
        if (error instanceof ValidationError) {
          omitidos.push({ paraleloGestionId, motivo: error.message });
          // eslint-disable-next-line no-continue
          continue;
        }
        throw error;
      }
    }

    if (folios.length === 0) {
      throw new ValidationError('Ningún paralelo de la gestión tiene estudiantes matriculados');
    }

    const fecha = body.fechaRegistro ?? new Date().toISOString().slice(0, 10);
    const motivoAnulacion = `Reajuste de folios de la gestión (recálculo de numeración por cambio de matrícula) — ${fecha}`;

    const { anulados, creados } = await this.libroRegistroRepository.reajustarFoliosGestion(
      {
        libroId: libro.id,
        gestionId: gid,
        folioInicial: libro.folioInicial ?? 1,
        motivoAnulacion,
        folios,
      },
      usuarioId,
    );

    const numerosFolio = creados.map((f) => Number(f.numeroFolio));
    const resumen = {
      paralelosGenerados: paralelosConNomina,
      foliosCreados: creados.length,
      foliosAnulados: anulados,
      folioDesde: numerosFolio.length > 0 ? Math.min(...numerosFolio) : null,
      folioHasta: numerosFolio.length > 0 ? Math.max(...numerosFolio) : null,
      omitidos,
    };

    this.logger?.info('[Libros] Folios reajustados por gestión', { gestionId: gid, ...resumen });

    return { resumenGeneracion: resumen };
  }
}

export default GenerarFoliosGestionUseCase;
