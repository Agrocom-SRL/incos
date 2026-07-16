import { BaseRepository } from './BaseRepository.js';
import { CursoCapacitacion as CursoCapacitacionModel } from '../database/models/curso_capacitacion.js';
import { BloqueCapacitacion as BloqueCapacitacionModel } from '../database/models/bloque_capacitacion.js';

/**
 * Repositorio CRUD de cursos de capacitación (tabla raíz `capacitaciones`)
 * y su junction de bloques horarios (`capacitacion_horarios`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. La junction NO tiene repositorio propio: leer/reemplazar los
 * bloques de UN curso es parte del agregado del curso (mismo criterio que la
 * ficha de paralelo_gestion con sus bloques).
 *
 * Las lecturas ricas del listado/ficha (inscritos_count, cupo_disponible,
 * horarios_detalle) viven en views/CursoCapacitacionFichaViewRepository
 * (vistas 154/155); aquí solo el CRUD.
 *
 * @implements {ICursoCapacitacionRepository}
 */
export class CursoCapacitacionRepository extends BaseRepository {
  getModel() {
    return CursoCapacitacionModel;
  }

  /**
   * Convierte el modelo Sequelize a objeto de dominio (claves del contrato).
   * @param {Object|null} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      titulo: v.titulo ?? null,
      descripcion: v.descripcion ?? null,
      costo: v.costo !== undefined && v.costo !== null ? Number(v.costo) : null,
      cupoMaximo: v.cupoMaximo ?? null,
      aulaId: v.aulaId ?? null,
      fechaInicio: v.fechaInicio ?? null,
      fechaFin: v.fechaFin ?? null,
      estado: v.estado ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.estado !== undefined) {
      where.estado = filters.estado;
    }
    if (filters.aulaId !== undefined) {
      where.aulaId = filters.aulaId;
    }
    return where;
  }

  getSearchFields() {
    return ['titulo', 'descripcion'];
  }

  getDefaultSort() {
    return [
      ['fechaInicio', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('titulo' in data) model.titulo = data.titulo;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('costo' in data) model.costo = data.costo;
    if ('cupoMaximo' in data) model.cupoMaximo = data.cupoMaximo;
    if ('aulaId' in data) model.aulaId = data.aulaId ?? null;
    if ('fechaInicio' in data) model.fechaInicio = data.fechaInicio;
    if ('fechaFin' in data) model.fechaFin = data.fechaFin;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // Toggle de activo (patrón PATCH /:id/estado)
    if ('activo' in data) model.activo = data.activo;
    if ('active' in data) model.activo = data.active;
    return model;
  }

  getCollectionName() {
    return 'cursosCapacitacion';
  }

  // ============================================
  // JUNCTION: capacitacion_horarios
  // ============================================

  /**
   * IDs de bloques (`horarios.id`) vigentes del curso, en orden de secuencia.
   *
   * @param {number} capacitacionId
   * @returns {Promise<number[]>}
   */
  async findHorarioIdsByCapacitacionId(capacitacionId) {
    const rows = await BloqueCapacitacionModel.findAll({
      where: { capacitacionId, activo: true },
      order: [
        ['ordenSecuencia', 'ASC'],
        ['id', 'ASC'],
      ],
      attributes: ['horarioId'],
    });
    return rows.map((row) => row.horarioId).filter((id) => id !== null);
  }

  /**
   * Reemplaza la junction de bloques del curso: soft-delete de las filas
   * vigentes y alta de las nuevas con orden_secuencia 1..n.
   * Idempotente respecto del set final de horarioIds.
   *
   * @param {number} capacitacionId
   * @param {number[]} horarioIds
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async replaceHorarios(capacitacionId, horarioIds = [], userId = null, options = {}) {
    const { transaction } = options;

    // 1. Soft-delete de los bloques vigentes (activo=false + deleted_at)
    await BloqueCapacitacionModel.update(
      { activo: false, deletedBy: userId ?? null },
      { where: { capacitacionId }, transaction }
    );
    await BloqueCapacitacionModel.destroy({ where: { capacitacionId }, transaction });

    // 2. Alta de los nuevos bloques con orden secuencial 1..n
    if (Array.isArray(horarioIds) && horarioIds.length > 0) {
      const rows = horarioIds.map((horarioId, index) => ({
        capacitacionId,
        horarioId,
        ordenSecuencia: index + 1,
        activo: true,
        createdBy: userId ?? null,
      }));
      await BloqueCapacitacionModel.bulkCreate(rows, { transaction });
    }
  }
}
