import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_CAPACITACION_VALUES } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: UpdateCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Actualiza un curso de capacitación. Si el payload trae `horarioIds`,
 * REEMPLAZA la junction `capacitacion_horarios` (soft-delete de los bloques
 * vigentes + alta de los nuevos), todo en UNA transacción.
 */
export class UpdateCursoCapacitacionUseCase {
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
   * @param {number} id - ID del curso
   * @param {Object} body - Campos a actualizar (+ horarioIds opcional)
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const existing = await this.cursoCapacitacionRepository.findById(id, { paranoid: false });
    if (!existing) throw new NotFoundError('curso de capacitación');

    const updateData = this._buildUpdateData(body, existing);
    const replaceJunction = body.horarioIds !== undefined;
    const horarioIds = replaceJunction ? this._normalizeHorarioIds(body.horarioIds) : null;

    if ('aulaId' in updateData && updateData.aulaId !== null) {
      const aula = await this.classroomRepository.findById(updateData.aulaId);
      if (!aula) throw new NotFoundError(`aula con ID ${updateData.aulaId}`);
    }
    if (replaceJunction) {
      await this._validateHorarios(horarioIds);
    }

    let updated = existing;
    await sequelize.transaction(async (transaction) => {
      if (Object.keys(updateData).length > 0) {
        updated = await this.cursoCapacitacionRepository.update(id, updateData, userId, {
          transaction,
        });
      }
      if (replaceJunction) {
        await this.cursoCapacitacionRepository.replaceHorarios(id, horarioIds, userId, {
          transaction,
        });
      }
    });

    this.logger.info('[Capacitación] Curso de capacitación actualizado', {
      id,
      junctionReemplazada: replaceJunction,
    });

    const presentation = CursoCapacitacionMapper.entityToPresentation(updated);
    presentation.horarioIds = replaceJunction
      ? horarioIds
      : await this.cursoCapacitacionRepository.findHorarioIdsByCapacitacionId(id);

    return { cursoCapacitacion: presentation };
  }

  /**
   * Construye el objeto de actualización solo con campos presentes.
   * @private
   */
  _buildUpdateData(body, existing) {
    const data = {};

    if ('titulo' in body) {
      if (!body.titulo || String(body.titulo).trim() === '') {
        throw new ValidationError('titulo no puede estar vacío');
      }
      data.titulo = String(body.titulo).trim();
    }
    if ('descripcion' in body) data.descripcion = body.descripcion ?? null;
    if ('costo' in body) {
      const costo = Number(body.costo);
      if (Number.isNaN(costo) || costo < 0) {
        throw new ValidationError('costo debe ser un número mayor o igual a 0');
      }
      data.costo = costo;
    }
    if ('cupoMaximo' in body) data.cupoMaximo = Number(body.cupoMaximo);
    if ('aulaId' in body) data.aulaId = body.aulaId ?? null;
    if ('fechaInicio' in body) data.fechaInicio = body.fechaInicio;
    if ('fechaFin' in body) data.fechaFin = body.fechaFin;
    if ('estado' in body) {
      if (!ESTADOS_CAPACITACION_VALUES.includes(body.estado)) {
        throw new ValidationError(
          `estado inválido. Valores permitidos: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`
        );
      }
      data.estado = body.estado;
    }
    if ('activo' in body) data.activo = body.activo;

    // Coherencia de fechas usando los valores finales (payload o existentes)
    const fechaInicio = data.fechaInicio ?? existing.fechaInicio;
    const fechaFin = data.fechaFin ?? existing.fechaFin;
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      throw new ValidationError('fechaFin no puede ser anterior a fechaInicio');
    }

    return data;
  }

  /**
   * Normaliza el array de IDs de bloques (sin duplicados, enteros positivos).
   * @private
   */
  _normalizeHorarioIds(horarioIds) {
    if (horarioIds === null) return [];
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
   * Valida que cada bloque exista y sea del tipo CAPACITACION.
   * @private
   */
  async _validateHorarios(horarioIds) {
    await Promise.all(
      horarioIds.map(async (horarioId) => {
        const horario = await this.scheduleRepository.findById(horarioId);
        if (!horario) throw new NotFoundError(`horario con ID ${horarioId}`);

        const plain = horario.toPlainObject ? horario.toPlainObject() : horario;
        const tipo = plain.scheduleType ?? plain.tipoHorario ?? null;
        if (tipo && tipo !== 'CAPACITACION') {
          throw new ValidationError(
            `El horario ${horarioId} no es de tipo CAPACITACION (tipo actual: ${tipo})`
          );
        }
      })
    );
  }
}
