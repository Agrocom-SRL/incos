import { BaseRepository } from './BaseRepository.js';
import { FichaSeguimientoClase as FichaSeguimientoClaseModel } from '../database/models/ficha_seguimiento_clase.js';

/**
 * Repositorio CRUD de fichas de seguimiento en la clase presencial (tabla raíz
 * `fichas_seguimiento_clase`, módulo DOC · supervisión docente).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Las lecturas ricas
 * de listado viven en views/FichaSeguimientoListadoViewRepository (vista 174);
 * aquí el CRUD del agregado raíz, incluidos los TEXT de observaciones que la
 * vista NO expone.
 *
 * `supervisorId` se fija SIEMPRE en el use case desde la sesión
 * (req.usuario.id); el mapper de payload lo ignora si viene del cliente.
 *
 * @implements {IFichaSeguimientoClaseRepository}
 */
export class FichaSeguimientoClaseRepository extends BaseRepository {
  getModel() {
    return FichaSeguimientoClaseModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      asignacionDocenteId: v.asignacionDocenteId ?? null,
      supervisorId: v.supervisorId ?? null,
      fechaSeguimiento: v.fechaSeguimiento ?? null,
      claseObservada: v.claseObservada ?? null,
      tieneCronogramaBimestral: v.tieneCronogramaBimestral ?? null,
      tienePlanBimestral: v.tienePlanBimestral ?? null,
      tieneRegistroAsistencia: v.tieneRegistroAsistencia ?? null,
      tieneRegistroPedagogico: v.tieneRegistroPedagogico ?? null,
      obsDocumentacion: v.obsDocumentacion ?? null,
      estudiantesEnPlanilla:
        v.estudiantesEnPlanilla !== undefined && v.estudiantesEnPlanilla !== null
          ? Number(v.estudiantesEnPlanilla)
          : null,
      estudiantesAsistentes:
        v.estudiantesAsistentes !== undefined && v.estudiantesAsistentes !== null
          ? Number(v.estudiantesAsistentes)
          : null,
      obsAvanceAsignatura: v.obsAvanceAsignatura ?? null,
      obsPresentacionTema: v.obsPresentacionTema ?? null,
      obsRecursos: v.obsRecursos ?? null,
      obsExposicion: v.obsExposicion ?? null,
      obsParticipacion: v.obsParticipacion ?? null,
      obsActividadesPracticas: v.obsActividadesPracticas ?? null,
      obsActividadesEvaluacion: v.obsActividadesEvaluacion ?? null,
      otrasObservaciones: v.otrasObservaciones ?? null,
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
    if (filters.supervisorId !== undefined) where.supervisorId = filters.supervisorId;
    if (filters.fechaSeguimiento !== undefined) where.fechaSeguimiento = filters.fechaSeguimiento;
    return where;
  }

  getSearchFields() {
    return ['otrasObservaciones'];
  }

  getDefaultSort() {
    return [
      ['fechaSeguimiento', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('asignacionDocenteId' in data) model.asignacionDocenteId = data.asignacionDocenteId ?? null;
    if ('supervisorId' in data) model.supervisorId = data.supervisorId ?? null;
    if ('fechaSeguimiento' in data) model.fechaSeguimiento = data.fechaSeguimiento;
    if ('claseObservada' in data) model.claseObservada = data.claseObservada;
    if ('tieneCronogramaBimestral' in data) {
      model.tieneCronogramaBimestral = data.tieneCronogramaBimestral ?? null;
    }
    if ('tienePlanBimestral' in data) model.tienePlanBimestral = data.tienePlanBimestral ?? null;
    if ('tieneRegistroAsistencia' in data) {
      model.tieneRegistroAsistencia = data.tieneRegistroAsistencia ?? null;
    }
    if ('tieneRegistroPedagogico' in data) {
      model.tieneRegistroPedagogico = data.tieneRegistroPedagogico ?? null;
    }
    if ('obsDocumentacion' in data) model.obsDocumentacion = data.obsDocumentacion ?? null;
    if ('estudiantesEnPlanilla' in data) {
      model.estudiantesEnPlanilla = data.estudiantesEnPlanilla ?? null;
    }
    if ('estudiantesAsistentes' in data) {
      model.estudiantesAsistentes = data.estudiantesAsistentes ?? null;
    }
    if ('obsAvanceAsignatura' in data) model.obsAvanceAsignatura = data.obsAvanceAsignatura ?? null;
    if ('obsPresentacionTema' in data) model.obsPresentacionTema = data.obsPresentacionTema ?? null;
    if ('obsRecursos' in data) model.obsRecursos = data.obsRecursos ?? null;
    if ('obsExposicion' in data) model.obsExposicion = data.obsExposicion ?? null;
    if ('obsParticipacion' in data) model.obsParticipacion = data.obsParticipacion ?? null;
    if ('obsActividadesPracticas' in data) {
      model.obsActividadesPracticas = data.obsActividadesPracticas ?? null;
    }
    if ('obsActividadesEvaluacion' in data) {
      model.obsActividadesEvaluacion = data.obsActividadesEvaluacion ?? null;
    }
    if ('otrasObservaciones' in data) model.otrasObservaciones = data.otrasObservaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'fichasSeguimientoClase';
  }
}
