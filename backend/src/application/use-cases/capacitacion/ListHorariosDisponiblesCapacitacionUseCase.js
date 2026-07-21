import { ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: ListHorariosDisponiblesCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Devuelve los bloques del catálogo `horarios` (tipo_horario='CLASES', los
 * mismos 60 bloques que usa el sistema académico) para un aula, marcando
 * `ocupado` cuando ya están en uso por un paralelo académico o por otro
 * curso de capacitación en esa misma aula. Alimenta el picker de horarios
 * al crear/editar un curso de capacitación (aula primero, luego bloques).
 */
export class ListHorariosDisponiblesCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository - Repo CRUD del curso (expone la consulta de disponibilidad)
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionRepository, logger }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string} params.aulaId - Aula a consultar (catálogo `aulas`)
   * @param {number|string|null} [params.excludeCursoId] - Curso a excluir de la comprobación (modo edición)
   * @returns {Promise<{horarios: Array<Object>}>}
   */
  async execute({ aulaId, excludeCursoId = null } = {}) {
    const parsedAulaId = Number(aulaId);
    if (!Number.isInteger(parsedAulaId) || parsedAulaId <= 0) {
      throw new ValidationError('aulaId debe ser un entero positivo');
    }

    let parsedExcludeCursoId = null;
    if (excludeCursoId !== undefined && excludeCursoId !== null && excludeCursoId !== '') {
      parsedExcludeCursoId = Number(excludeCursoId);
      if (!Number.isInteger(parsedExcludeCursoId) || parsedExcludeCursoId <= 0) {
        throw new ValidationError('excludeCursoId debe ser un entero positivo');
      }
    }

    this.logger.info('[Capacitación] Consultando horarios disponibles por aula', {
      aulaId: parsedAulaId,
      excludeCursoId: parsedExcludeCursoId,
    });

    const rows = await this.cursoCapacitacionRepository.listHorariosDisponibles({
      aulaId: parsedAulaId,
      excludeCursoId: parsedExcludeCursoId,
    });

    const horarios = rows.map((row) => ({
      horarioId: row.horarioId,
      nombre: row.nombre ?? null,
      dia: row.dia ?? null,
      horaInicio: row.horaInicio ?? null,
      horaFin: row.horaFin ?? null,
      turno: row.turno ?? null,
      numeroBloque: row.numeroBloque ?? null,
      ocupado: Boolean(Number(row.ocupado)),
    }));

    return { horarios };
  }
}
