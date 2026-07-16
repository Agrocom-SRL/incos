import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: GetCursoCapacitacionByIdUseCase
 * Módulo: Capacitación (CAP)
 *
 * Ficha de un curso de capacitación: datos + agregados de la vista 155 y
 * bloques horarios de la vista 154 (con bloque_etiqueta y orden por día/hora).
 * Expone también `horarioIds` (IDs del catálogo `horarios`) para precargar el
 * formulario de edición.
 */
export class GetCursoCapacitacionByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionFichaViewRepository - Repo de lectura (vistas 154/155)
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionFichaViewRepository, logger }) {
    this.cursoCapacitacionFichaViewRepository = cursoCapacitacionFichaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @returns {Promise<Object|null>} Ficha en formato de presentación o null
   */
  async execute(id) {
    const row = await this.cursoCapacitacionFichaViewRepository.findListadoById(id);
    if (!row) return null;

    const presentation = CursoCapacitacionMapper.viewRowToPresentation(row);

    const horarioRows =
      await this.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId(id);
    presentation.horarios = CursoCapacitacionMapper.horarioRowsToPresentation(horarioRows);
    presentation.horarioIds = presentation.horarios.map((bloque) => bloque.horarioId);

    this.logger.info('[Capacitación] Ficha de curso de capacitación obtenida', {
      id,
      horarios: presentation.horarios.length,
    });

    return presentation;
  }
}
