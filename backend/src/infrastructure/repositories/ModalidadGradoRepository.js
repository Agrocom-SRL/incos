import { BaseRepository } from './BaseRepository.js';
import { ModalidadGrado as ModalidadGradoModel } from '../database/models/modalidad_grado.js';

/**
 * Repositorio CRUD del catálogo de modalidades de grado (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository.
 *
 * @implements {IModalidadGradoRepository}
 */
export class ModalidadGradoRepository extends BaseRepository {
  getModel() {
    return ModalidadGradoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      codigo: v.codigo ?? null,
      nombre: v.nombre ?? null,
      descripcion: v.descripcion ?? null,
      requiereTutor: v.requiereTutor ?? null,
      requiereProyecto: v.requiereProyecto ?? null,
      requiereDefensa: v.requiereDefensa ?? null,
      requiereExamen: v.requiereExamen ?? null,
      duracionMeses: v.duracionMeses ?? null,
      cargaHorariaEstimada: v.cargaHorariaEstimada ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.codigo !== undefined) {
      where.codigo = filters.codigo;
    }
    return where;
  }

  getSearchFields() {
    return ['codigo', 'nombre'];
  }

  getDefaultSort() {
    return [['id', 'ASC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('codigo' in data) model.codigo = data.codigo;
    if ('nombre' in data) model.nombre = data.nombre;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('requiereTutor' in data) model.requiereTutor = data.requiereTutor;
    if ('requiereProyecto' in data) model.requiereProyecto = data.requiereProyecto;
    if ('requiereDefensa' in data) model.requiereDefensa = data.requiereDefensa;
    if ('requiereExamen' in data) model.requiereExamen = data.requiereExamen;
    if ('duracionMeses' in data) model.duracionMeses = data.duracionMeses ?? null;
    if ('cargaHorariaEstimada' in data) model.cargaHorariaEstimada = data.cargaHorariaEstimada ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'modalidadesGrado';
  }
}
