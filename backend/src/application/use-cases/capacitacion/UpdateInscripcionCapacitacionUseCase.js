import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { resolverCostoMatricula, resolverGrupoInscripcion } from './helpers/grupoInscripcion.js';
import { recalcularEstadoInscripcion } from './helpers/estadoInscripcion.js';

/** Campos del participante que se pueden corregir desde la inscripción (sin `activo`). */
const CAMPOS_PARTICIPANTE = [
  'ci',
  'expedicion',
  'nombres',
  'apellidoPaterno',
  'apellidoMaterno',
  'celular',
  'email',
];
const ESTADOS_CON_GRUPO_EDITABLE = [
  ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
  ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
];

const esVerdadero = (v) => v === true || v === 'true';

/**
 * Use Case: UpdateInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Corrige una inscripción (PUT /inscripciones-capacitacion/:id, permiso
 * capacitacion.inscripcion EDITAR). Body: `{ participante?: {...}, capacitacionGrupoId?, exonerarMatricula? }`.
 *
 * - `participante`: corrige nombres, apellidos, CI, expedición, celular y correo
 *   delegando en `UpdateParticipanteUseCase` (mismas validaciones y unicidad de
 *   CI + expedición, 409 si ya existe). Los datos son del participante: el cambio
 *   se refleja también en sus otras inscripciones. Se permite en cualquier estado
 *   (corregir un error de digitación no depende del estado).
 * - `capacitacionGrupoId`: cambia el grupo/horario. Mismas reglas que al inscribir
 *   (`helpers/grupoInscripcion.js`): debe ser del curso y, si el grupo tiene cupo
 *   propio y está lleno, 409. Solo con la inscripción PENDIENTE o INSCRITO (una
 *   RETIRADA o ANULADA queda congelada, salvo los datos del participante).
 *
 * - `exonerarMatricula`: `true` exonera la matrícula de ESTA inscripción (personal
 *   administrativo, etc.): el snapshot `montoMatricula` pasa a lo ya pagado (0 si no
 *   pagó nada; con pago parcial queda saldada con lo abonado, sin perder los pagos).
 *   `false` revierte a la matrícula vigente del grupo. Solo PENDIENTE o INSCRITO.
 *
 * Los cambios van en UNA transacción. Devuelve la ficha completa de la inscripción
 * (la misma de GET /:id).
 */
export class UpdateInscripcionCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.grupoCapacitacionRepository
   * @param {Object} params.cursoCapacitacionRepository - Para la matrícula del grupo nuevo
   * @param {Object} params.pagoCapacitacionRepository - Recálculo de estados al cambiar la matrícula
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {Object} params.updateParticipanteUseCase - Reutilizado (validaciones y unicidad de CI)
   * @param {Object} params.getInscripcionCapacitacionByIdUseCase - Ficha de respuesta
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    grupoCapacitacionRepository,
    cursoCapacitacionRepository,
    pagoCapacitacionRepository,
    capacitacionInscritoRequisitoRepository,
    capacitacionCompromisoRepository,
    updateParticipanteUseCase,
    getInscripcionCapacitacionByIdUseCase,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.updateParticipanteUseCase = updateParticipanteUseCase;
    this.getInscripcionCapacitacionByIdUseCase = getInscripcionCapacitacionByIdUseCase;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la inscripción
   * @param {Object} body - { participante?, capacitacionGrupoId? }
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{inscripcionCapacitacion: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const inscripcionId = parseIdPositivo(id, 'id de la inscripción');
    const datosParticipante = this._extraerDatosParticipante(body);
    const cambiaGrupo = 'capacitacionGrupoId' in body;
    const cambiaExoneracion = body.exonerarMatricula !== undefined && body.exonerarMatricula !== null;
    if (datosParticipante === null && !cambiaGrupo && !cambiaExoneracion) {
      throw new ValidationError(
        'Debe enviarse participante, capacitacionGrupoId y/o exonerarMatricula para corregir la inscripción'
      );
    }

    const inscripcion = await this.inscripcionCapacitacionRepository.findById(inscripcionId);
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');

    const nuevoGrupo = cambiaGrupo ? await this._resolverNuevoGrupo(inscripcion, body) : null;
    const nuevoGrupoId = nuevoGrupo?.id ?? null;
    const grupoCambia = cambiaGrupo && nuevoGrupoId !== (inscripcion.capacitacionGrupoId ?? null);
    let montoMatricula = grupoCambia ? await this._matriculaDelGrupo(inscripcion, nuevoGrupo) : null;
    let matriculaCambia = grupoCambia;
    if (cambiaExoneracion) {
      montoMatricula = await this._matriculaExonerada(inscripcion, body.exonerarMatricula, nuevoGrupo, grupoCambia);
      matriculaCambia = montoMatricula !== Number(inscripcion.montoMatricula ?? 0);
    }

    await sequelize.transaction(async (transaction) => {
      if (datosParticipante !== null) {
        await this.updateParticipanteUseCase.execute(
          inscripcion.participanteId,
          datosParticipante,
          userId,
          { transaction }
        );
      }
      if (grupoCambia || matriculaCambia) {
        // La matrícula depende del grupo (o de la exoneración): el snapshot se actualiza y los estados se recalculan
        const grupoFinalId = grupoCambia ? nuevoGrupoId : (inscripcion.capacitacionGrupoId ?? null);
        await this.inscripcionCapacitacionRepository.update(
          inscripcionId,
          { capacitacionGrupoId: grupoFinalId, montoMatricula },
          userId,
          { transaction }
        );
        if (montoMatricula !== Number(inscripcion.montoMatricula ?? 0)) {
          await recalcularEstadoInscripcion({
            inscripcion: { ...inscripcion, capacitacionGrupoId: grupoFinalId, montoMatricula },
            pagoCapacitacionRepository: this.pagoCapacitacionRepository,
            capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
            inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
            capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
            userId,
            transaction,
          });
        }
      }
    });

    this.logger.info('[Capacitación] Inscripción corregida', {
      id: inscripcionId,
      participante: datosParticipante !== null,
      grupoAnterior: inscripcion.capacitacionGrupoId ?? null,
      matriculaExonerada: cambiaExoneracion ? esVerdadero(body.exonerarMatricula) : undefined,
      grupoNuevo: grupoCambia ? nuevoGrupoId : (inscripcion.capacitacionGrupoId ?? null),
    });

    const ficha = await this.getInscripcionCapacitacionByIdUseCase.execute(inscripcionId);
    return { inscripcionCapacitacion: ficha };
  }

  /**
   * Datos del participante a corregir (solo los campos permitidos) o null si no se enviaron.
   * @private
   */
  _extraerDatosParticipante(body) {
    if (!('participante' in body) || body.participante === undefined) return null;
    const participante = body.participante;
    if (participante === null || typeof participante !== 'object' || Array.isArray(participante)) {
      throw new ValidationError('participante debe ser un objeto con los datos a corregir');
    }
    const datos = {};
    CAMPOS_PARTICIPANTE.forEach((campo) => {
      if (campo in participante) datos[campo] = participante[campo];
    });
    if (Object.keys(datos).length === 0) {
      throw new ValidationError(`participante debe incluir al menos un campo: ${CAMPOS_PARTICIPANTE.join(', ')}`);
    }
    return datos;
  }

  /**
   * Resuelve y valida el grupo destino (pertenencia al curso y cupo).
   * @private
   * @returns {Promise<Object|null>} grupo destino (null si el curso no tiene grupos)
   */
  async _resolverNuevoGrupo(inscripcion, body) {
    if (!ESTADOS_CON_GRUPO_EDITABLE.includes(inscripcion.estado)) {
      throw new ConflictError('No se puede cambiar el grupo de una inscripción retirada o anulada');
    }
    const grupo = await resolverGrupoInscripcion({
      grupoCapacitacionRepository: this.grupoCapacitacionRepository,
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      curso: { id: inscripcion.capacitacionId },
      valor: body.capacitacionGrupoId,
      grupoActualId: inscripcion.capacitacionGrupoId ?? null,
    });
    return grupo;
  }

  /**
   * Matrícula resultante de exonerar (o revertir la exoneración). Exonerar = lo ya pagado.
   * Revertir = matrícula del grupo vigente (o del nuevo si también cambia).
   * @private
   * @returns {Promise<number>}
   */
  async _matriculaExonerada(inscripcion, valor, nuevoGrupo, grupoCambia) {
    if (!ESTADOS_CON_GRUPO_EDITABLE.includes(inscripcion.estado)) {
      throw new ConflictError('No se puede exonerar la matrícula de una inscripción retirada o anulada');
    }
    if (esVerdadero(valor)) {
      const totales = await this.pagoCapacitacionRepository.sumMontosPorConcepto(inscripcion.id);
      return Number(totales?.MATRICULA ?? 0);
    }
    let grupo = nuevoGrupo;
    if (!grupoCambia && inscripcion.capacitacionGrupoId) {
      const grupos = await this.grupoCapacitacionRepository.findByCapacitacionId(inscripcion.capacitacionId);
      grupo = grupos.find((g) => g.id === inscripcion.capacitacionGrupoId) ?? null;
    }
    return this._matriculaDelGrupo(inscripcion, grupo);
  }

  /**
   * Matrícula que corresponde al grupo destino (la del grupo o, si no tiene, la del curso).
   * @private
   * @returns {Promise<number>}
   */
  async _matriculaDelGrupo(inscripcion, grupo) {
    const curso = await this.cursoCapacitacionRepository.findById(inscripcion.capacitacionId);
    return resolverCostoMatricula(curso, grupo);
  }
}

export default UpdateInscripcionCapacitacionUseCase;
