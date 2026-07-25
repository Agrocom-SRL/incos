import { BaseRepository } from './BaseRepository.js';
import { SesionReforzamiento as SesionReforzamientoModel } from '../database/models/sesion_reforzamiento.js';

/**
 * Repositorio CRUD de sesiones de reforzamiento (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Las lecturas ricas
 * (curso/docente/materia/participantes) viven en
 * views/AcompanamientoSesionViewRepository (vistas 161/162); aquí solo CRUD.
 *
 * @implements {ISesionReforzamientoRepository}
 */
export class SesionReforzamientoRepository extends BaseRepository {
  getModel() {
    return SesionReforzamientoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      asignacionDocenteId: v.asignacionDocenteId ?? null,
      fecha: v.fecha ?? null,
      horaInicio: v.horaInicio ?? null,
      horaFin: v.horaFin ?? null,
      modalidad: v.modalidad ?? null,
      aulaId: v.aulaId ?? null,
      enlaceVirtual: v.enlaceVirtual ?? null,
      tema: v.tema ?? null,
      estado: v.estado ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.asignacionDocenteId !== undefined) {
      where.asignacionDocenteId = filters.asignacionDocenteId;
    }
    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.modalidad !== undefined) where.modalidad = filters.modalidad;
    if (filters.fecha !== undefined) where.fecha = filters.fecha;
    return where;
  }

  getSearchFields() {
    return ['tema'];
  }

  getDefaultSort() {
    return [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('asignacionDocenteId' in data) model.asignacionDocenteId = data.asignacionDocenteId ?? null;
    if ('fecha' in data) model.fecha = data.fecha ?? null;
    if ('horaInicio' in data) model.horaInicio = data.horaInicio ?? null;
    if ('horaFin' in data) model.horaFin = data.horaFin ?? null;
    if ('modalidad' in data) model.modalidad = data.modalidad;
    if ('aulaId' in data) model.aulaId = data.aulaId ?? null;
    if ('enlaceVirtual' in data) model.enlaceVirtual = data.enlaceVirtual ?? null;
    if ('tema' in data) model.tema = data.tema ?? null;
    if ('estado' in data) model.estado = data.estado;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'sesionesReforzamiento';
  }
}
