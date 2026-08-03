import { BaseRepository } from './BaseRepository.js';
import { DictamenProyecto as DictamenProyectoModel } from '../database/models/dictamen_proyecto.js';

/**
 * Repositorio CRUD de dictámenes de tutoría (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method).
 *
 * @implements {IDictamenProyectoRepository}
 */
export class DictamenProyectoRepository extends BaseRepository {
  getModel() {
    return DictamenProyectoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      proyectoGradoId: v.proyectoGradoId ?? null,
      tipo: v.tipo ?? null,
      numeroInforme: v.numeroInforme ?? null,
      resultado: v.resultado ?? null,
      fechaEmision: v.fechaEmision ?? null,
      destinatario: v.destinatario ?? null,
      contenido: v.contenido ?? null,
      nombreArchivo: v.nombreArchivo ?? null,
      rutaArchivo: v.rutaArchivo ?? null,
      extension: v.extension ?? null,
      tipoMime: v.tipoMime ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.proyectoGradoId !== undefined) where.proyectoGradoId = filters.proyectoGradoId;
    if (filters.tipo !== undefined) where.tipo = filters.tipo;
    if (filters.resultado !== undefined) where.resultado = filters.resultado;
    return where;
  }

  getSearchFields() {
    return ['numeroInforme', 'destinatario'];
  }

  getDefaultSort() {
    return [['id', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('proyectoGradoId' in data) model.proyectoGradoId = data.proyectoGradoId ?? null;
    if ('tipo' in data) model.tipo = data.tipo;
    if ('numeroInforme' in data) model.numeroInforme = data.numeroInforme ?? null;
    if ('resultado' in data) model.resultado = data.resultado ?? null;
    if ('fechaEmision' in data) model.fechaEmision = data.fechaEmision ?? null;
    if ('destinatario' in data) model.destinatario = data.destinatario ?? null;
    if ('contenido' in data) model.contenido = data.contenido ?? null;
    if ('nombreArchivo' in data) model.nombreArchivo = data.nombreArchivo ?? null;
    if ('rutaArchivo' in data) model.rutaArchivo = data.rutaArchivo ?? null;
    if ('extension' in data) model.extension = data.extension ?? null;
    if ('tipoMime' in data) model.tipoMime = data.tipoMime ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'dictamenes';
  }

  /**
   * Dictámenes vigentes de un proyecto, del más reciente al más antiguo.
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(proyectoGradoId) {
    const result = await this.findAll({ proyectoGradoId });
    return result[this.getCollectionName()] ?? [];
  }
}
