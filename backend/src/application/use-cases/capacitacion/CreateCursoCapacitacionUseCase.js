import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_CAPACITACION,
  ESTADOS_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: CreateCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Crea un curso de capacitación y su junction de bloques horarios
 * (`capacitacion_horarios`) en UNA transacción. Valida aula (catálogo `aulas`)
 * y bloques (catálogo `horarios`, reutiliza los mismos bloques
 * tipo_horario='CLASES' que usa el sistema académico; el frontend ofrece
 * solo los bloques libres del aula elegida vía GET /horarios-disponibles).
 */
export class CreateCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository - Repo CRUD del curso + junction
   * @param {Object} params.scheduleRepository - Catálogo `horarios` (validación de bloques)
   * @param {Object} params.classroomRepository - Catálogo `aulas` (validación de aula)
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionRepository, scheduleRepository, classroomRepository, logger }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos del curso (+ horarioIds opcional)
   * @param {number|null} userId - Usuario que crea (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(body = {}, userId = null) {
    const data = this._validateBody(body);
    const horarioIds = this._normalizeHorarioIds(body.horarioIds);

    await this._validateAula(data.aulaId);
    await this._validateHorarios(horarioIds);

    let created = null;
    await sequelize.transaction(async (transaction) => {
      created = await this.cursoCapacitacionRepository.create(data, userId, { transaction });
      if (horarioIds.length > 0) {
        await this.cursoCapacitacionRepository.replaceHorarios(created.id, horarioIds, userId, {
          transaction,
        });
      }
    });

    this.logger.info('[Capacitación] Curso de capacitación creado', {
      id: created.id,
      horarios: horarioIds.length,
    });

    const presentation = CursoCapacitacionMapper.entityToPresentation(created);
    presentation.horarioIds = horarioIds;
    return { cursoCapacitacion: presentation };
  }

  /**
   * Valida y normaliza los campos del curso.
   * @private
   */
  _validateBody(body) {
    if (!body.titulo || String(body.titulo).trim() === '') {
      throw new ValidationError('titulo es requerido');
    }
    if (body.fechaInicio === undefined || body.fechaInicio === null) {
      throw new ValidationError('fechaInicio es requerida');
    }
    if (body.fechaFin === undefined || body.fechaFin === null) {
      throw new ValidationError('fechaFin es requerida');
    }
    if (new Date(body.fechaFin) < new Date(body.fechaInicio)) {
      throw new ValidationError('fechaFin no puede ser anterior a fechaInicio');
    }

    const costo = body.costo !== undefined && body.costo !== null ? Number(body.costo) : 0;
    if (Number.isNaN(costo) || costo < 0) {
      throw new ValidationError('costo debe ser un número mayor o igual a 0');
    }

    const estado = body.estado ?? ESTADOS_CAPACITACION.PROPUESTO;
    if (!ESTADOS_CAPACITACION_VALUES.includes(estado)) {
      throw new ValidationError(
        `estado inválido. Valores permitidos: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`
      );
    }

    return {
      titulo: String(body.titulo).trim(),
      descripcion: body.descripcion ?? null,
      costo,
      cupoMaximo:
        body.cupoMaximo !== undefined && body.cupoMaximo !== null ? Number(body.cupoMaximo) : 30,
      aulaId: body.aulaId ?? null,
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaFin,
      estado,
      ...(body.activo !== undefined ? { activo: body.activo } : {}),
    };
  }

  /**
   * Normaliza el array de IDs de bloques (sin duplicados, enteros positivos).
   * @private
   */
  _normalizeHorarioIds(horarioIds) {
    if (horarioIds === undefined || horarioIds === null) return [];
    if (!Array.isArray(horarioIds)) {
      throw new ValidationError('horarioIds debe ser un array de IDs del catálogo de horarios');
    }
    const ids = horarioIds.map((id) => Number(id));
    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new ValidationError('horarioIds debe contener solo enteros positivos');
    }
    return [...new Set(ids)];
  }

  /**
   * Valida que el aula exista en el catálogo (si se envió).
   * @private
   */
  async _validateAula(aulaId) {
    if (aulaId === undefined || aulaId === null) return;
    const aula = await this.classroomRepository.findById(aulaId);
    if (!aula) throw new NotFoundError(`aula con ID ${aulaId}`);
  }

  /**
   * Valida que cada bloque exista en el catálogo `horarios`. Los bloques de
   * capacitación reutilizan los mismos bloques `tipo_horario='CLASES'` que
   * usa el sistema académico (el picker del frontend solo ofrece esos).
   * @private
   */
  async _validateHorarios(horarioIds) {
    await Promise.all(
      horarioIds.map(async (horarioId) => {
        const horario = await this.scheduleRepository.findById(horarioId);
        if (!horario) throw new NotFoundError(`horario con ID ${horarioId}`);
      })
    );
  }
}
