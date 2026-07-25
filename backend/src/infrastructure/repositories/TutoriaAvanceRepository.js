import { BaseRepository } from './BaseRepository.js';
import { TutoriaAvance as TutoriaAvanceModel } from '../database/models/tutoria_avance.js';

/**
 * Repositorio CRUD de avances de proyectos de grado (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method).
 *
 * @implements {ITutoriaAvanceRepository}
 */
export class TutoriaAvanceRepository extends BaseRepository {
  getModel() {
    return TutoriaAvanceModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      proyectoGradoId: v.proyectoGradoId ?? null,
      subidoPorEstudianteId: v.subidoPorEstudianteId ?? null,
      numeroAvance: v.numeroAvance ?? null,
      titulo: v.titulo ?? null,
      descripcion: v.descripcion ?? null,
      nombreArchivo: v.nombreArchivo ?? null,
      rutaArchivo: v.rutaArchivo ?? null,
      extension: v.extension ?? null,
      tipoMime: v.tipoMime ?? null,
      tamanoBytes:
        v.tamanoBytes !== undefined && v.tamanoBytes !== null ? Number(v.tamanoBytes) : null,
      estadoRevision: v.estadoRevision ?? null,
      fechaRevision: v.fechaRevision ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.proyectoGradoId !== undefined) where.proyectoGradoId = filters.proyectoGradoId;
    if (filters.estadoRevision !== undefined) where.estadoRevision = filters.estadoRevision;
    if (filters.subidoPorEstudianteId !== undefined) {
      where.subidoPorEstudianteId = filters.subidoPorEstudianteId;
    }
    return where;
  }

  getSearchFields() {
    return ['titulo', 'nombreArchivo'];
  }

  getDefaultSort() {
    return [
      ['numeroAvance', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('proyectoGradoId' in data) model.proyectoGradoId = data.proyectoGradoId ?? null;
    if ('subidoPorEstudianteId' in data) model.subidoPorEstudianteId = data.subidoPorEstudianteId ?? null;
    if ('numeroAvance' in data) model.numeroAvance = data.numeroAvance ?? null;
    if ('titulo' in data) model.titulo = data.titulo ?? null;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('nombreArchivo' in data) model.nombreArchivo = data.nombreArchivo;
    if ('rutaArchivo' in data) model.rutaArchivo = data.rutaArchivo;
    if ('extension' in data) model.extension = data.extension ?? null;
    if ('tipoMime' in data) model.tipoMime = data.tipoMime ?? null;
    if ('tamanoBytes' in data) model.tamanoBytes = data.tamanoBytes ?? null;
    if ('estadoRevision' in data) model.estadoRevision = data.estadoRevision;
    if ('fechaRevision' in data) model.fechaRevision = data.fechaRevision ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'avances';
  }

  /**
   * Avances vigentes de un proyecto, del más reciente al más antiguo.
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(proyectoGradoId) {
    const result = await this.findAll({ proyectoGradoId });
    return result[this.getCollectionName()] ?? [];
  }

  /**
   * Máximo numero_avance del proyecto (0 si no hay avances).
   * @param {number} proyectoGradoId
   * @returns {Promise<number>}
   */
  async findMaxNumeroAvance(proyectoGradoId) {
    const max = await TutoriaAvanceModel.max('numeroAvance', {
      where: { proyectoGradoId },
    });
    return Number.isFinite(Number(max)) ? Number(max) : 0;
  }
}
