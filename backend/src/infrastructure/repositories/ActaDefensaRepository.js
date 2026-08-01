import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { ActaDefensa as ActaDefensaModel } from '../database/models/acta_defensa.js';
import { TribunalActaDefensa as TribunalActaDefensaModel } from '../database/models/tribunal_acta_defensa.js';
import { ESTADOS_ACTA_DEFENSA } from '../../domain/constants/titulacion.constants.js';

/**
 * Repositorio CRUD de actas de defensa de grado (módulo TIT · titulación).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) para el CRUD de la
 * raíz `actas_defensa`. El tribunal (`tribunal_acta_defensa`) NO tiene su
 * propio recurso expuesto: se crea/lee siempre junto al acta desde este mismo
 * repositorio (no hay asociaciones Sequelize declaradas en este repo — mismo
 * patrón manual de `ProyectoGradoRepository`/`IntegranteProyectoRepository`).
 *
 * @implements {IActaDefensaRepository}
 */
export class ActaDefensaRepository extends BaseRepository {
  getModel() {
    return ActaDefensaModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      proyectoGradoId: v.proyectoGradoId ?? null,
      estudianteId: v.estudianteId ?? null,
      gestionId: v.gestionId ?? null,
      numeroActa: v.numeroActa != null ? Number(v.numeroActa) : null,
      fechaDefensa: v.fechaDefensa ?? null,
      horaInicio: v.horaInicio ?? null,
      horaConclusion: v.horaConclusion ?? null,
      calificacionFinal:
        v.calificacionFinal !== undefined && v.calificacionFinal !== null
          ? Number(v.calificacionFinal)
          : null,
      resultado: v.resultado ?? null,
      observaciones: v.observaciones ?? null,
      estado: v.estado ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  /** @private */
  _tribunalToEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      actaDefensaId: v.actaDefensaId ?? null,
      orden: v.orden != null ? Number(v.orden) : null,
      docenteId: v.docenteId ?? null,
      nombreCompleto: v.nombreCompleto ?? null,
      cargo: v.cargo ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.proyectoGradoId !== undefined) where.proyectoGradoId = filters.proyectoGradoId;
    if (filters.estudianteId !== undefined) where.estudianteId = filters.estudianteId;
    if (filters.gestionId !== undefined) where.gestionId = filters.gestionId;
    if (filters.numeroActa !== undefined) where.numeroActa = filters.numeroActa;
    if (filters.estado !== undefined) where.estado = filters.estado;
    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [['id', 'ASC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('proyectoGradoId' in data) model.proyectoGradoId = data.proyectoGradoId ?? null;
    if ('estudianteId' in data) model.estudianteId = data.estudianteId ?? null;
    if ('gestionId' in data) model.gestionId = data.gestionId ?? null;
    if ('numeroActa' in data) model.numeroActa = data.numeroActa;
    if ('fechaDefensa' in data) model.fechaDefensa = data.fechaDefensa;
    if ('horaInicio' in data) model.horaInicio = data.horaInicio;
    if ('horaConclusion' in data) model.horaConclusion = data.horaConclusion ?? null;
    if ('calificacionFinal' in data) model.calificacionFinal = data.calificacionFinal;
    if ('resultado' in data) model.resultado = data.resultado;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'actasDefensa';
  }

  /**
   * Crea el acta y sus filas de tribunal en UNA transacción.
   *
   * Acepta una transacción externa (`options.transaction`) para que el use
   * case pueda registrar VARIAS actas (PSP grupal, una por integrante) de
   * forma atómica en una sola transacción compartida; si no se provee,
   * abre su propia transacción (uso individual).
   *
   * @param {Object} actaData
   * @param {Array<{orden:number, docenteId:number|null, nombreCompleto:string, cargo?:string}>} tribunalRows
   * @param {number|null} userId
   * @param {Object} [options] - { transaction }
   * @returns {Promise<Object>} Acta creada con `tribunal` anidado
   */
  async createConTribunal(actaData, tribunalRows, userId = null, options = {}) {
    const run = async (transaction) => {
      const acta = await this.create(actaData, userId, { transaction });

      const tribunalCreado = [];
      for (const fila of tribunalRows) {
        // eslint-disable-next-line no-await-in-loop
        const miembro = await TribunalActaDefensaModel.create(
          {
            actaDefensaId: acta.id,
            orden: fila.orden,
            docenteId: fila.docenteId ?? null,
            nombreCompleto: fila.nombreCompleto,
            cargo: fila.cargo ?? undefined,
            activo: true,
            createdBy: userId,
          },
          { transaction }
        );
        tribunalCreado.push(this._tribunalToEntity(miembro));
      }

      // Se compone en memoria (sin releer de BD): si `options.transaction` viene
      // de una transacción externa TODAVÍA abierta (PSP: varias actas en una
      // sola transacción), un SELECT fuera de ella no vería las filas recién
      // insertadas hasta el COMMIT.
      return { ...acta, tribunal: tribunalCreado };
    };

    return options.transaction ? run(options.transaction) : sequelize.transaction(run);
  }

  /**
   * Actas de un proyecto (EMITIDA + ANULADA), con tribunal incluido y
   * ordenado por `orden`.
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoId(proyectoGradoId) {
    const actas = await ActaDefensaModel.findAll({
      where: { proyectoGradoId, activo: true },
      order: [['id', 'ASC']],
    });
    return this._attachTribunal(actas.map((a) => this.toEntity(a)));
  }

  /**
   * Acta EMITIDA vigente de un estudiante en un proyecto, o null.
   * @param {number} proyectoGradoId
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findEmitidaByProyectoEstudiante(proyectoGradoId, estudianteId) {
    return this.findBy({
      proyectoGradoId,
      estudianteId,
      estado: ESTADOS_ACTA_DEFENSA.EMITIDA,
    });
  }

  /**
   * Máximo `numeroActa` ya asignado en una gestión (0 si no hay actas).
   * @param {number} gestionId
   * @returns {Promise<number>}
   */
  async maxNumeroActaByGestion(gestionId) {
    const max = await ActaDefensaModel.max('numeroActa', {
      where: { gestionId },
      paranoid: false,
    });
    return max ? Number(max) : 0;
  }

  /**
   * Acta por ID con tribunal incluido (para exportar el PDF).
   * @param {number} actaId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithTribunal(actaId) {
    const acta = await this.findById(actaId);
    if (!acta) return null;
    const [conTribunal] = await this._attachTribunal([acta]);
    return conTribunal;
  }

  /** @private Adjunta `tribunal` (ordenado por `orden`) a cada acta. */
  async _attachTribunal(actas) {
    if (actas.length === 0) return actas;
    const actaIds = actas.map((a) => a.id);
    const tribunalRows = await TribunalActaDefensaModel.findAll({
      where: { actaDefensaId: { [Op.in]: actaIds }, activo: true },
      order: [['orden', 'ASC']],
    });
    const porActa = new Map();
    for (const row of tribunalRows) {
      const entity = this._tribunalToEntity(row);
      const lista = porActa.get(entity.actaDefensaId) ?? [];
      lista.push(entity);
      porActa.set(entity.actaDefensaId, lista);
    }
    return actas.map((acta) => ({ ...acta, tribunal: porActa.get(acta.id) ?? [] }));
  }
}
