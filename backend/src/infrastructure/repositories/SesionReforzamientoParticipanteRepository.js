import { BaseRepository } from './BaseRepository.js';
import { SesionReforzamientoParticipante as SesionReforzamientoParticipanteModel } from '../database/models/sesion_reforzamiento_participante.js';

/**
 * Repositorio CRUD de participantes de sesiones de reforzamiento (módulo TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). El detalle
 * enriquecido (datos del estudiante + notas) vive en
 * views/AcompanamientoSesionViewRepository.
 *
 * @implements {ISesionReforzamientoParticipanteRepository}
 */
export class SesionReforzamientoParticipanteRepository extends BaseRepository {
  getModel() {
    return SesionReforzamientoParticipanteModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      sesionReforzamientoId: v.sesionReforzamientoId ?? null,
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
    if (filters.sesionReforzamientoId !== undefined) {
      where.sesionReforzamientoId = filters.sesionReforzamientoId;
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
    if ('sesionReforzamientoId' in data) {
      model.sesionReforzamientoId = data.sesionReforzamientoId ?? null;
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
    return 'participantes';
  }

  /**
   * Participantes vigentes de una sesión.
   * @param {number} sesionReforzamientoId
   * @returns {Promise<Array<Object>>}
   */
  async findBySesionId(sesionReforzamientoId) {
    const result = await this.findAll({ sesionReforzamientoId });
    return result[this.getCollectionName()] ?? [];
  }

  /**
   * Participante vigente de la sesión para una matrícula (o null).
   * @param {number} sesionReforzamientoId
   * @param {number} matriculaMateriaId
   * @returns {Promise<Object|null>}
   */
  async findBySesionAndMatricula(sesionReforzamientoId, matriculaMateriaId) {
    return this.findBy({ sesionReforzamientoId, matriculaMateriaId });
  }
}
