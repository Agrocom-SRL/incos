import { TIPOS_HORARIO } from '../../../domain/constants/cursos.constants.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import {
  criterioHorarioExacto,
  horarioEntityToFila,
  parseDatosHorario,
} from './helpers/horarioCapacitacionInput.js';

/**
 * Use Case: CreateHorarioCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Find-or-create de un horario de capacitación (`tipo_horario='CAPACITACION'`)
 * por día + hora de inicio + hora de fin: si ya existe lo devuelve, si no lo
 * crea. Los horarios se definen desde el módulo (no dependen de datos sembrados).
 */
export class CreateHorarioCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scheduleRepository - Catálogo `horarios`
   * @param {ILogger} params.logger
   */
  constructor({ scheduleRepository, logger }) {
    this.scheduleRepository = scheduleRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - { dia, horaInicio, horaFin }
   * @param {number|null} userId - Usuario que crea (auditoría)
   * @returns {Promise<{horario: Object, creado: boolean}>}
   */
  async execute(body = {}, userId = null) {
    const datos = parseDatosHorario(body);

    const existente = await this.scheduleRepository.findBy(criterioHorarioExacto(datos));
    if (existente) {
      return { horario: this._toPresentation(existente), creado: false };
    }

    const creado = await this.scheduleRepository.create(
      {
        name: datos.nombre,
        day: datos.dia,
        startTime: datos.horaInicio,
        endTime: datos.horaFin,
        scheduleType: TIPOS_HORARIO.CAPACITACION,
      },
      userId
    );

    this.logger.info('[Capacitación] Horario de capacitación creado', { id: creado.id, dia: datos.dia });
    return { horario: this._toPresentation(creado), creado: true };
  }

  /** @private */
  _toPresentation(horario) {
    return CursoCapacitacionMapper.horarioCatalogoToPresentation(horarioEntityToFila(horario));
  }
}
