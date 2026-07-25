import { BaseRepository } from './BaseRepository.js';
import { ProyectoGrado as ProyectoGradoModel } from '../database/models/proyecto_grado.js';

/**
 * Repositorio CRUD de proyectos de grado (tabla raíz `proyectos_grado`, TUT).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Las lecturas ricas
 * de listado/ficha viven en views/ProyectoGradoListadoViewRepository
 * (vistas 159/160/163); aquí solo el CRUD del agregado raíz.
 *
 * @implements {IProyectoGradoRepository}
 */
export class ProyectoGradoRepository extends BaseRepository {
  getModel() {
    return ProyectoGradoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      estudianteId: v.estudianteId ?? null,
      modalidadId: v.modalidadId ?? null,
      tutorId: v.tutorId ?? null,
      carreraId: v.carreraId ?? null,
      gestionId: v.gestionId ?? null,
      titulo: v.titulo ?? null,
      descripcion: v.descripcion ?? null,
      objetivos: v.objetivos ?? null,
      alcance: v.alcance ?? null,
      metodologia: v.metodologia ?? null,
      estado: v.estado ?? null,
      fechaPresentacionPerfil: v.fechaPresentacionPerfil ?? null,
      fechaAprobacionPerfil: v.fechaAprobacionPerfil ?? null,
      fechaInicioDesarrollo: v.fechaInicioDesarrollo ?? null,
      fechaPresentacionPredefensa: v.fechaPresentacionPredefensa ?? null,
      fechaAprobacionPredefensa: v.fechaAprobacionPredefensa ?? null,
      fechaDefensa: v.fechaDefensa ?? null,
      fechaAprobacion: v.fechaAprobacion ?? null,
      notaPerfil: v.notaPerfil !== undefined && v.notaPerfil !== null ? Number(v.notaPerfil) : null,
      notaPredefensa:
        v.notaPredefensa !== undefined && v.notaPredefensa !== null
          ? Number(v.notaPredefensa)
          : null,
      notaDefensa:
        v.notaDefensa !== undefined && v.notaDefensa !== null ? Number(v.notaDefensa) : null,
      notaFinal: v.notaFinal !== undefined && v.notaFinal !== null ? Number(v.notaFinal) : null,
      observaciones: v.observaciones ?? null,
      observacionesTutor: v.observacionesTutor ?? null,
      observacionesComite: v.observacionesComite ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.gestionId !== undefined) where.gestionId = filters.gestionId;
    if (filters.carreraId !== undefined) where.carreraId = filters.carreraId;
    if (filters.tutorId !== undefined) where.tutorId = filters.tutorId;
    if (filters.modalidadId !== undefined) where.modalidadId = filters.modalidadId;
    return where;
  }

  getSearchFields() {
    return ['titulo'];
  }

  getDefaultSort() {
    return [['id', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('estudianteId' in data) model.estudianteId = data.estudianteId ?? null;
    if ('modalidadId' in data) model.modalidadId = data.modalidadId ?? null;
    if ('tutorId' in data) model.tutorId = data.tutorId ?? null;
    if ('carreraId' in data) model.carreraId = data.carreraId ?? null;
    if ('gestionId' in data) model.gestionId = data.gestionId ?? null;
    if ('titulo' in data) model.titulo = data.titulo;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('objetivos' in data) model.objetivos = data.objetivos ?? null;
    if ('alcance' in data) model.alcance = data.alcance ?? null;
    if ('metodologia' in data) model.metodologia = data.metodologia ?? null;
    if ('estado' in data) model.estado = data.estado;
    if ('fechaPresentacionPerfil' in data) model.fechaPresentacionPerfil = data.fechaPresentacionPerfil ?? null;
    if ('fechaAprobacionPerfil' in data) model.fechaAprobacionPerfil = data.fechaAprobacionPerfil ?? null;
    if ('fechaInicioDesarrollo' in data) model.fechaInicioDesarrollo = data.fechaInicioDesarrollo ?? null;
    if ('fechaPresentacionPredefensa' in data) model.fechaPresentacionPredefensa = data.fechaPresentacionPredefensa ?? null;
    if ('fechaAprobacionPredefensa' in data) model.fechaAprobacionPredefensa = data.fechaAprobacionPredefensa ?? null;
    if ('fechaDefensa' in data) model.fechaDefensa = data.fechaDefensa ?? null;
    if ('fechaAprobacion' in data) model.fechaAprobacion = data.fechaAprobacion ?? null;
    if ('notaPerfil' in data) model.notaPerfil = data.notaPerfil ?? null;
    if ('notaPredefensa' in data) model.notaPredefensa = data.notaPredefensa ?? null;
    if ('notaDefensa' in data) model.notaDefensa = data.notaDefensa ?? null;
    if ('notaFinal' in data) model.notaFinal = data.notaFinal ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    if ('observacionesTutor' in data) model.observacionesTutor = data.observacionesTutor ?? null;
    if ('observacionesComite' in data) model.observacionesComite = data.observacionesComite ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'proyectosGrado';
  }
}
