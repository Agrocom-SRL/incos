import { BaseRepository } from './BaseRepository.js';
import { PasantiaSeguimiento as PasantiaSeguimientoModel } from '../database/models/pasantia_seguimiento.js';

/**
 * Repositorio CRUD de seguimientos de pasantía (tabla
 * `pasantias_seguimientos`, módulo TUT · pasantías).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method).
 *
 * @implements {IPasantiaSeguimientoRepository}
 */
export class PasantiaSeguimientoRepository extends BaseRepository {
  getModel() {
    return PasantiaSeguimientoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      pasantiaId: v.pasantiaId ?? null,
      fecha: v.fecha ?? null,
      descripcionTrabajo: v.descripcionTrabajo ?? null,
      principalesActividades: v.principalesActividades ?? null,
      nivelDesempeno: v.nivelDesempeno ?? null,
      fortalezas: v.fortalezas ?? null,
      areasMejorar: v.areasMejorar ?? null,
      sugerencias: v.sugerencias ?? null,
      firmadoDocente: v.firmadoDocente ?? null,
      firmadoEmpresa: v.firmadoEmpresa ?? null,
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
    if (filters.nivelDesempeno !== undefined) where.nivelDesempeno = filters.nivelDesempeno;
    return where;
  }

  getSearchFields() {
    return ['descripcionTrabajo', 'principalesActividades'];
  }

  getDefaultSort() {
    // Cronológico: seguimientos del trámite en orden de fecha (formulario por visita).
    return [
      ['fecha', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('pasantiaId' in data) model.pasantiaId = data.pasantiaId ?? null;
    if ('fecha' in data) model.fecha = data.fecha ?? null;
    if ('descripcionTrabajo' in data) model.descripcionTrabajo = data.descripcionTrabajo ?? null;
    if ('principalesActividades' in data)
      model.principalesActividades = data.principalesActividades ?? null;
    if ('nivelDesempeno' in data) model.nivelDesempeno = data.nivelDesempeno ?? null;
    if ('fortalezas' in data) model.fortalezas = data.fortalezas ?? null;
    if ('areasMejorar' in data) model.areasMejorar = data.areasMejorar ?? null;
    if ('sugerencias' in data) model.sugerencias = data.sugerencias ?? null;
    if ('firmadoDocente' in data) model.firmadoDocente = data.firmadoDocente ?? false;
    if ('firmadoEmpresa' in data) model.firmadoEmpresa = data.firmadoEmpresa ?? false;
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
    return 'seguimientos';
  }

  /**
   * Seguimientos vigentes de un trámite, en orden cronológico.
   * @param {number} pasantiaId
   * @returns {Promise<Array<Object>>}
   */
  async findByPasantiaId(pasantiaId) {
    const result = await this.findAll({ pasantiaId });
    return result[this.getCollectionName()] ?? [];
  }
}
