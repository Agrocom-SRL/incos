import { BaseRepository } from './BaseRepository.js';
import { TutoriaIntegrante as TutoriaIntegranteModel } from '../database/models/tutoria_integrante.js';
import { ESTADOS_INTEGRANTE_TUTORIA } from '../../domain/constants/tutorias.constants.js';

/**
 * Repositorio CRUD de integrantes de proyectos de grado (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method).
 *
 * @implements {ITutoriaIntegranteRepository}
 */
export class TutoriaIntegranteRepository extends BaseRepository {
  getModel() {
    return TutoriaIntegranteModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      proyectoGradoId: v.proyectoGradoId ?? null,
      estudianteId: v.estudianteId ?? null,
      rol: v.rol ?? null,
      estado: v.estado ?? null,
      fechaIncorporacion: v.fechaIncorporacion ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.proyectoGradoId !== undefined) where.proyectoGradoId = filters.proyectoGradoId;
    if (filters.estudianteId !== undefined) where.estudianteId = filters.estudianteId;
    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.rol !== undefined) where.rol = filters.rol;
    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [
      ['rol', 'DESC'],
      ['id', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('proyectoGradoId' in data) model.proyectoGradoId = data.proyectoGradoId ?? null;
    if ('estudianteId' in data) model.estudianteId = data.estudianteId ?? null;
    if ('rol' in data) model.rol = data.rol;
    if ('estado' in data) model.estado = data.estado;
    if ('fechaIncorporacion' in data) model.fechaIncorporacion = data.fechaIncorporacion ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'integrantes';
  }

  /**
   * Integrantes vigentes (activo, no borrado) de un proyecto.
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(proyectoGradoId) {
    const result = await this.findAll({ proyectoGradoId });
    return result[this.getCollectionName()] ?? [];
  }

  /**
   * Integrante vigente del proyecto para el estudiante (estado ACTIVO), o null.
   * @param {number} proyectoGradoId
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findActivoByProyectoAndEstudiante(proyectoGradoId, estudianteId) {
    return this.findBy({
      proyectoGradoId,
      estudianteId,
      estado: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
    });
  }

  /**
   * Filas de integrante ACTIVO del estudiante (todas sus membresías vigentes).
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async findActivosByEstudianteId(estudianteId) {
    const result = await this.findAll({
      estudianteId,
      estado: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
    });
    return result[this.getCollectionName()] ?? [];
  }
}
