import { BaseRepository } from './BaseRepository.js';
import { PasantiaEmpresa as PasantiaEmpresaModel } from '../database/models/pasantia_empresa.js';

/**
 * Repositorio CRUD del catálogo de empresas para práctica laboral (tabla
 * `pasantias_empresas`, módulo TUT · pasantías).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Patrón catálogo:
 * findAll respeta filters.includeInactive (query incluirInactivos) y el
 * toggle activo va por PATCH /:id/estado.
 *
 * @implements {IPasantiaEmpresaRepository}
 */
export class PasantiaEmpresaRepository extends BaseRepository {
  getModel() {
    return PasantiaEmpresaModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      nombre: v.nombre ?? null,
      nombreComercial: v.nombreComercial ?? null,
      tipoSocietario: v.tipoSocietario ?? null,
      nit: v.nit ?? null,
      enFuncionamiento: v.enFuncionamiento ?? null,
      direccion: v.direccion ?? null,
      telefono: v.telefono ?? null,
      sectorActividad: v.sectorActividad ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.tipoSocietario !== undefined) where.tipoSocietario = filters.tipoSocietario;
    if (filters.nit !== undefined) where.nit = filters.nit;
    return where;
  }

  getSearchFields() {
    return ['nombre', 'nombreComercial', 'nit', 'sectorActividad'];
  }

  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('nombre' in data) model.nombre = data.nombre;
    if ('nombreComercial' in data) model.nombreComercial = data.nombreComercial ?? null;
    if ('tipoSocietario' in data) model.tipoSocietario = data.tipoSocietario ?? null;
    if ('nit' in data) model.nit = data.nit ?? null;
    if ('enFuncionamiento' in data) model.enFuncionamiento = data.enFuncionamiento ?? null;
    if ('direccion' in data) model.direccion = data.direccion ?? null;
    if ('telefono' in data) model.telefono = data.telefono ?? null;
    if ('sectorActividad' in data) model.sectorActividad = data.sectorActividad ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'pasantiasEmpresas';
  }
}
