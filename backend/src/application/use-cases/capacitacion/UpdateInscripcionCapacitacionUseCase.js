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

/**
 * Use Case: UpdateInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Corrige una inscripción (PUT /inscripciones-capacitacion/:id, permiso
 * capacitacion.inscripcion EDITAR). Body: `{ participante?: {...}, capacitacionGrupoId? }`.
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
    if (datosParticipante === null && !cambiaGrupo) {
      throw new ValidationError('Debe enviarse participante y/o capacitacionGrupoId para corregir la inscripción');
    }

    const inscripcion = await this.inscripcionCapacitacionRepository.findById(inscripcionId);
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');

    const nuevoGrupo = cambiaGrupo ? await this._resolverNuevoGrupo(inscripcion, body) : null;
    const nuevoGrupoId = nuevoGrupo?.id ?? null;
    const grupoCambia = cambiaGrupo && nuevoGrupoId !== (inscripcion.capacitacionGrupoId ?? null);
    const montoMatricula = grupoCambia ? await this._matriculaDelGrupo(inscripcion, nuevoGrupo) : null;

    await sequelize.transaction(async (transaction) => {
      if (datosParticipante !== null) {
        await this.updateParticipanteUseCase.execute(
          inscripcion.participanteId,
          datosParticipante,
          userId,
          { transaction }
        );
      }
      if (grupoCambia) {
        // La matrícula depende del grupo: el snapshot sigue al grupo nuevo y los estados se recalculan
        await this.inscripcionCapacitacionRepository.update(
          inscripcionId,
          { capacitacionGrupoId: nuevoGrupoId, montoMatricula },
          userId,
          { transaction }
        );
        if (montoMatricula !== Number(inscripcion.montoMatricula ?? 0)) {
          await recalcularEstadoInscripcion({
            inscripcion: { ...inscripcion, capacitacionGrupoId: nuevoGrupoId, montoMatricula },
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
