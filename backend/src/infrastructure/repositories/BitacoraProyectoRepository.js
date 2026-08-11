import { BaseRepository } from './BaseRepository.js';
import { BitacoraProyecto as BitacoraProyectoModel } from '../database/models/bitacora_proyecto.js';

/**
 * Repositorio CRUD de la bitácora de tutoría (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). El reporte mensual
 * agregado vive en views/ProyectoGradoListadoViewRepository (vista 163).
 *
 * @implements {IBitacoraProyectoRepository}
 */
export class BitacoraProyectoRepository extends BaseRepository {
  getModel() {
    return BitacoraProyectoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      proyectoGradoId: v.proyectoGradoId ?? null,
      avanceProyectoId: v.avanceProyectoId ?? null,
      tipo: v.tipo ?? null,
      fecha: v.fecha ?? null,
      actividad: v.actividad ?? null,
      observaciones: v.observaciones ?? null,
      porcentajeAvance:
        v.porcentajeAvance !== undefined && v.porcentajeAvance !== null
          ? Number(v.porcentajeAvance)
          : null,
      estado: v.estado ?? null,
      confirmadoEstudiante: v.confirmadoEstudiante ?? null,
      fechaConfirmacion: v.fechaConfirmacion ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.proyectoGradoId !== undefined) where.proyectoGradoId = filters.proyectoGradoId;
    if (filters.avanceProyectoId !== undefined) where.avanceProyectoId = filters.avanceProyectoId;
    if (filters.tipo !== undefined) where.tipo = filters.tipo;
    if (filters.estado !== undefined) where.estado = filters.estado;
    return where;
  }

  getSearchFields() {
    return ['actividad', 'observaciones'];
  }

  getDefaultSort() {
    return [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('proyectoGradoId' in data) model.proyectoGradoId = data.proyectoGradoId ?? null;
    if ('avanceProyectoId' in data) model.avanceProyectoId = data.avanceProyectoId ?? null;
    if ('tipo' in data) model.tipo = data.tipo;
    if ('fecha' in data) model.fecha = data.fecha ?? null;
    if ('actividad' in data) model.actividad = data.actividad ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    if ('porcentajeAvance' in data) model.porcentajeAvance = data.porcentajeAvance ?? null;
    if ('estado' in data) model.estado = data.estado;
    if ('confirmadoEstudiante' in data) model.confirmadoEstudiante = data.confirmadoEstudiante;
    if ('fechaConfirmacion' in data) model.fechaConfirmacion = data.fechaConfirmacion ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'bitacoraEntradas';
  }

  /**
   * Entradas vigentes de la bitácora de un proyecto (fecha DESC, id DESC).
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(proyectoGradoId) {
    const result = await this.findAll({ proyectoGradoId });
    return result[this.getCollectionName()] ?? [];
  }

  /**
   * Máximo `porcentaje_avance` histórico del proyecto (mismo criterio que la
   * vista 160): piso para que una nueva entrada no pueda retroceder el
   * avance ya alcanzado.
   * @param {number} proyectoGradoId
   * @returns {Promise<number>}
   */
  async findMaxPorcentajeAvance(proyectoGradoId) {
    const max = await this.getModel().max('porcentajeAvance', {
      where: { proyectoGradoId, activo: true },
    });
    return max != null ? Number(max) : 0;
  }
}
