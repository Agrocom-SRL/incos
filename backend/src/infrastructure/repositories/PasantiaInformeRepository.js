import { BaseRepository } from './BaseRepository.js';
import { PasantiaInforme as PasantiaInformeModel } from '../database/models/pasantia_informe.js';

/**
 * Repositorio CRUD de informes formales de pasantía (tabla
 * `pasantias_informes`, módulo TUT · pasantías). Patrón
 * DictamenProyectoRepository.
 *
 * Arquetipo A: hereda de BaseRepository (Template Method).
 *
 * @implements {IPasantiaInformeRepository}
 */
export class PasantiaInformeRepository extends BaseRepository {
  getModel() {
    return PasantiaInformeModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      pasantiaId: v.pasantiaId ?? null,
      tipo: v.tipo ?? null,
      docenteId: v.docenteId ?? null,
      numeroMemo: v.numeroMemo ?? null,
      fechaVerificacion: v.fechaVerificacion ?? null,
      fechaEmision: v.fechaEmision ?? null,
      destinatario: v.destinatario ?? null,
      areaRelacionada: v.areaRelacionada ?? null,
      evaluacionCualitativa: v.evaluacionCualitativa ?? null,
      resultado: v.resultado ?? null,
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
    if (filters.pasantiaId !== undefined) where.pasantiaId = filters.pasantiaId;
    if (filters.tipo !== undefined) where.tipo = filters.tipo;
    if (filters.docenteId !== undefined) where.docenteId = filters.docenteId;
    if (filters.resultado !== undefined) where.resultado = filters.resultado;
    return where;
  }

  getSearchFields() {
    return ['numeroMemo', 'destinatario'];
  }

  getDefaultSort() {
    return [['id', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('pasantiaId' in data) model.pasantiaId = data.pasantiaId ?? null;
    if ('tipo' in data) model.tipo = data.tipo;
    if ('docenteId' in data) model.docenteId = data.docenteId ?? null;
    if ('numeroMemo' in data) model.numeroMemo = data.numeroMemo ?? null;
    if ('fechaVerificacion' in data) model.fechaVerificacion = data.fechaVerificacion ?? null;
    if ('fechaEmision' in data) model.fechaEmision = data.fechaEmision ?? null;
    if ('destinatario' in data) model.destinatario = data.destinatario ?? null;
    if ('areaRelacionada' in data) model.areaRelacionada = data.areaRelacionada ?? null;
    if ('evaluacionCualitativa' in data) model.evaluacionCualitativa = data.evaluacionCualitativa ?? null;
    if ('resultado' in data) model.resultado = data.resultado ?? null;
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
    return 'informes';
  }

  /**
   * Informes vigentes de un trámite, del más reciente al más antiguo.
   * @param {number} pasantiaId
   * @returns {Promise<Array<Object>>}
   */
  async findByPasantiaId(pasantiaId) {
    const result = await this.findAll({ pasantiaId });
    return result[this.getCollectionName()] ?? [];
  }
}
