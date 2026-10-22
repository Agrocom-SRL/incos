import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { resolverGrupoInscripcion } from './helpers/grupoInscripcion.js';

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
   * @param {Object} params.updateParticipanteUseCase - Reutilizado (validaciones y unicidad de CI)
   * @param {Object} params.getInscripcionCapacitacionByIdUseCase - Ficha de respuesta
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    grupoCapacitacionRepository,
    updateParticipanteUseCase,
    getInscripcionCapacitacionByIdUseCase,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
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

    const nuevoGrupoId = cambiaGrupo ? await this._resolverNuevoGrupo(inscripcion, body) : null;
    const grupoCambia = cambiaGrupo && nuevoGrupoId !== (inscripcion.capacitacionGrupoId ?? null);

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
        await this.inscripcionCapacitacionRepository.update(
          inscripcionId,
          { capacitacionGrupoId: nuevoGrupoId },
          userId,
          { transaction }
        );
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
   * @returns {Promise<number|null>} id del grupo destino
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
    return grupo?.id ?? null;
  }
}

export default UpdateInscripcionCapacitacionUseCase;
