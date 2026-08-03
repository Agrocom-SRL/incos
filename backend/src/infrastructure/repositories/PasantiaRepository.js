import { BaseRepository } from './BaseRepository.js';
import { Pasantia as PasantiaModel } from '../database/models/pasantia.js';

/**
 * Repositorio CRUD de trámites de práctica laboral (tabla raíz `pasantias`,
 * módulo TUT · pasantías).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Las lecturas ricas
 * de listado/ficha viven en views/PasantiaViewRepository (vistas 166/167/168);
 * aquí solo el CRUD del agregado raíz.
 *
 * @implements {IPasantiaRepository}
 */
export class PasantiaRepository extends BaseRepository {
  getModel() {
    return PasantiaModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      estudianteId: v.estudianteId ?? null,
      empresaId: v.empresaId ?? null,
      carreraId: v.carreraId ?? null,
      gestionId: v.gestionId ?? null,
      docenteSupervisorId: v.docenteSupervisorId ?? null,
      tipo: v.tipo ?? null,
      areaDepartamento: v.areaDepartamento ?? null,
      cargoPuesto: v.cargoPuesto ?? null,
      funciones: v.funciones ?? null,
      fechaInicio: v.fechaInicio ?? null,
      fechaFinalizacion: v.fechaFinalizacion ?? null,
      horasRequeridas:
        v.horasRequeridas !== undefined && v.horasRequeridas !== null
          ? Number(v.horasRequeridas)
          : null,
      horasCumplidas:
        v.horasCumplidas !== undefined && v.horasCumplidas !== null
          ? Number(v.horasCumplidas)
          : null,
      tipoContrato: v.tipoContrato ?? null,
      tipoContratoDetalle: v.tipoContratoDetalle ?? null,
      responsableEmpresa: v.responsableEmpresa ?? null,
      cargoResponsable: v.cargoResponsable ?? null,
      telefonoResponsable: v.telefonoResponsable ?? null,
      estado: v.estado ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.estudianteId !== undefined) where.estudianteId = filters.estudianteId;
    if (filters.empresaId !== undefined) where.empresaId = filters.empresaId;
    if (filters.carreraId !== undefined) where.carreraId = filters.carreraId;
    if (filters.gestionId !== undefined) where.gestionId = filters.gestionId;
    if (filters.docenteSupervisorId !== undefined) {
      where.docenteSupervisorId = filters.docenteSupervisorId;
    }
    if (filters.tipo !== undefined) where.tipo = filters.tipo;
    if (filters.estado !== undefined) where.estado = filters.estado;
    return where;
  }

  getSearchFields() {
    return ['cargoPuesto', 'areaDepartamento'];
  }

  getDefaultSort() {
    return [['id', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('estudianteId' in data) model.estudianteId = data.estudianteId ?? null;
    if ('empresaId' in data) model.empresaId = data.empresaId ?? null;
    if ('carreraId' in data) model.carreraId = data.carreraId ?? null;
    if ('gestionId' in data) model.gestionId = data.gestionId ?? null;
    if ('docenteSupervisorId' in data) model.docenteSupervisorId = data.docenteSupervisorId ?? null;
    if ('tipo' in data) model.tipo = data.tipo;
    if ('areaDepartamento' in data) model.areaDepartamento = data.areaDepartamento ?? null;
    if ('cargoPuesto' in data) model.cargoPuesto = data.cargoPuesto ?? null;
    if ('funciones' in data) model.funciones = data.funciones ?? null;
    if ('fechaInicio' in data) model.fechaInicio = data.fechaInicio ?? null;
    if ('fechaFinalizacion' in data) model.fechaFinalizacion = data.fechaFinalizacion ?? null;
    if ('horasRequeridas' in data) model.horasRequeridas = data.horasRequeridas ?? null;
    if ('horasCumplidas' in data) model.horasCumplidas = data.horasCumplidas ?? null;
    if ('tipoContrato' in data) model.tipoContrato = data.tipoContrato ?? null;
    if ('tipoContratoDetalle' in data) model.tipoContratoDetalle = data.tipoContratoDetalle ?? null;
    if ('responsableEmpresa' in data) model.responsableEmpresa = data.responsableEmpresa ?? null;
    if ('cargoResponsable' in data) model.cargoResponsable = data.cargoResponsable ?? null;
    if ('telefonoResponsable' in data) model.telefonoResponsable = data.telefonoResponsable ?? null;
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
    return 'pasantias';
  }
}
