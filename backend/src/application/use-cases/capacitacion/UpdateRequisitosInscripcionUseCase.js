import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { InscripcionCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import {
  parseBooleano,
  parseFechaISO,
  parseIdPositivo,
} from '../../utils/validacionEntrada.js';
import { recalcularEstadoInscripcion } from './helpers/estadoInscripcion.js';

const LONGITUD_MAXIMA_OBSERVACION = 255;

const esVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

/**
 * Use Case: UpdateRequisitosInscripcionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Actualiza el checklist de requisitos entregados de una inscripción
 * (PUT /inscripciones-capacitacion/:id/requisitos, permiso EDITAR) y recalcula
 * el estado de la inscripción: INSCRITO solo con matrícula y curso cancelados
 * Y requisitos obligatorios entregados. Nunca baja de RETIRADO/ANULADO.
 */
export class UpdateRequisitosInscripcionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.capacitacionRequisitoRepository
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    capacitacionRequisitoRepository,
    capacitacionInscritoRequisitoRepository,
    pagoCapacitacionRepository,
    capacitacionCompromisoRepository,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.capacitacionRequisitoRepository = capacitacionRequisitoRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la inscripción
   * @param {Object} body - { requisitos: [{ requisitoId, entregado, fechaEntrega?, observacion? }] }
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{inscripcionCapacitacion: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const inscripcionId = parseIdPositivo(id, 'id de la inscripción');
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(inscripcionId);
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');

    const items = await this._normalizarItems(body.requisitos, inscripcion.capacitacionId);

    let resumen = null;
    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        // eslint-disable-next-line no-await-in-loop
        await this._guardarEntrega(inscripcionId, item, userId, transaction);
      }
      resumen = await recalcularEstadoInscripcion({
        inscripcion,
        pagoCapacitacionRepository: this.pagoCapacitacionRepository,
        capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
        inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
        capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
        userId,
        transaction,
      });
    });

    const checklist = await this.capacitacionInscritoRequisitoRepository.findChecklistByInscripcionId(
      inscripcionId,
      inscripcion.capacitacionId
    );

    this.logger.info('[Capacitación] Requisitos de inscripción actualizados', {
      id: inscripcionId,
      items: items.length,
      estado: resumen.estado,
    });

    return {
      inscripcionCapacitacion: {
        id: inscripcionId,
        estado: resumen.estado,
        estadoPago: resumen.estadoPago,
        estadoPagoCurso: resumen.estadoPagoCurso,
        estadoPagoMatricula: resumen.estadoPagoMatricula,
        requisitosPendientes: resumen.requisitosPendientes,
        requisitos: InscripcionCapacitacionMapper.requisitoRowsToPresentation(checklist),
      },
    };
  }

  /**
   * Valida el array de entradas: ids únicos de requisitos vigentes DEL curso.
   * @private
   */
  async _normalizarItems(requisitos, capacitacionId) {
    if (!Array.isArray(requisitos) || requisitos.length === 0) {
      throw new ValidationError('requisitos debe ser un array con al menos un elemento');
    }
    const requisitosCurso = await this.capacitacionRequisitoRepository.findByCapacitacionId(capacitacionId);
    const permitidos = new Set(requisitosCurso.map((r) => r.id));
    const vistos = new Set();

    return requisitos.map((item, index) => {
      const etiqueta = `requisitos[${index}]`;
      if (item === null || typeof item !== 'object') {
        throw new ValidationError(`${etiqueta} debe ser un objeto`);
      }
      const requisitoId = parseIdPositivo(item.requisitoId, `${etiqueta}.requisitoId`);
      if (!permitidos.has(requisitoId)) {
        throw new ValidationError(`El requisito ${requisitoId} no pertenece al curso de la inscripción`);
      }
      if (vistos.has(requisitoId)) {
        throw new ValidationError(`${etiqueta}.requisitoId está repetido`);
      }
      vistos.add(requisitoId);

      const entregado = parseBooleano(item.entregado, `${etiqueta}.entregado`);
      const observacion = esVacio(item.observacion) ? null : String(item.observacion).trim();
      if (observacion && observacion.length > LONGITUD_MAXIMA_OBSERVACION) {
        throw new ValidationError(
          `${etiqueta}.observacion no debe superar los ${LONGITUD_MAXIMA_OBSERVACION} caracteres`
        );
      }
      let fechaEntrega = null;
      if (entregado) {
        fechaEntrega = esVacio(item.fechaEntrega)
          ? new Date().toISOString().slice(0, 10)
          : parseFechaISO(item.fechaEntrega, `${etiqueta}.fechaEntrega`);
      }
      return { requisitoId, entregado, fechaEntrega, observacion };
    });
  }

  /** Crea o actualiza la fila de entrega de un requisito. @private */
  async _guardarEntrega(inscripcionId, item, userId, transaction) {
    const datos = {
      entregado: item.entregado,
      fechaEntrega: item.fechaEntrega,
      observacion: item.observacion,
    };
    const existente = await this.capacitacionInscritoRequisitoRepository.findByInscripcionAndRequisito(
      inscripcionId,
      item.requisitoId,
      { transaction }
    );
    if (existente) {
      await this.capacitacionInscritoRequisitoRepository.update(existente.id, datos, userId, {
        transaction,
      });
      return;
    }
    await this.capacitacionInscritoRequisitoRepository.create(
      { capacitacionInscritoId: inscripcionId, capacitacionRequisitoId: item.requisitoId, ...datos },
      userId,
      { transaction }
    );
  }
}
