import { BaseRepository } from './BaseRepository.js';
import { SesionRefuerzoEstudiante as SesionRefuerzoEstudianteModel } from '../database/models/sesion_refuerzo_estudiante.js';

/**
 * Repositorio CRUD de estudiantes (por matrícula) de sesiones de refuerzo
 * (módulo ACA · acompañamiento).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). El detalle
 * enriquecido (datos del estudiante + notas) vive en
 * views/AcompanamientoSesionViewRepository.
 *
 * @implements {ISesionRefuerzoEstudianteRepository}
 */
export class SesionRefuerzoEstudianteRepository extends BaseRepository {
  getModel() {
    return SesionRefuerzoEstudianteModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      sesionRefuerzoId: v.sesionRefuerzoId ?? null,
      matriculaMateriaId: v.matriculaMateriaId ?? null,
      origen: v.origen ?? null,
      asistio: v.asistio ?? null,
      progreso: v.progreso ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.sesionRefuerzoId !== undefined) {
      where.sesionRefuerzoId = filters.sesionRefuerzoId;
    }
    if (filters.matriculaMateriaId !== undefined) {
      where.matriculaMateriaId = filters.matriculaMateriaId;
    }
    if (filters.origen !== undefined) where.origen = filters.origen;
    if (filters.progreso !== undefined) where.progreso = filters.progreso;
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
    if ('sesionRefuerzoId' in data) {
      model.sesionRefuerzoId = data.sesionRefuerzoId ?? null;
    }
    if ('matriculaMateriaId' in data) model.matriculaMateriaId = data.matriculaMateriaId ?? null;
    if ('origen' in data) model.origen = data.origen;
    if ('asistio' in data) model.asistio = data.asistio ?? null;
    if ('progreso' in data) model.progreso = data.progreso;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'estudiantes';
  }

  /**
   * Estudiantes vigentes de una sesión.
   * @param {number} sesionRefuerzoId
   * @returns {Promise<Array<Object>>}
   */
  async findBySesionId(sesionRefuerzoId) {
    const result = await this.findAll({ sesionRefuerzoId });
    return result[this.getCollectionName()] ?? [];
  }

  /**
   * Estudiante vigente de la sesión para una matrícula (o null).
   * @param {number} sesionRefuerzoId
   * @param {number} matriculaMateriaId
   * @returns {Promise<Object|null>}
   */
  async findBySesionAndMatricula(sesionRefuerzoId, matriculaMateriaId) {
    return this.findBy({ sesionRefuerzoId, matriculaMateriaId });
  }
}
