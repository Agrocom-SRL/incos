import { IPersonalRepository } from '../../domain/interfaces/repositories/IPersonalRepository.js';
import { Personal as PersonalModel } from '../database/models/Personal.js';
import { Staff } from '../../domain/entities/Staff.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de personal usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IPersonalRepository}
 * 
 * Esta clase cumple con el contrato IPersonalRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCI() que es requerido por IPersonalRepository
 */
export class StaffRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de personal
   * @returns {Object} Modelo Personal
   */
  getModel() {
    return PersonalModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Staff|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Staff({
      id: model.id,
      userId: model.usuarioId,
      ci: model.ci,
      expedition: model.expedicion,
      firstName: model.nombres,
      lastName: model.apellidoPaterno,
      motherLastName: model.apellidoMaterno,
      birthDate: model.fechaNacimiento,
      gender: model.genero,
      civilStatusId: model.estadoCivilId,
      personalEmail: model.emailPersonal,
      phone: model.telefono,
      mobilePhone: model.celular,
      address: model.direccion,
      municipalityId: model.municipioId,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.municipalityId) {
      where.municipioId = filters.municipalityId;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['apellidoPaterno', 'ASC'], ['apellidoMaterno', 'ASC'], ['nombres', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      usuarioId: data.userId || null,
      ci: data.ci,
      expedicion: data.expedition ? data.expedition.toUpperCase() : null,
      nombres: data.firstName,
      apellidoPaterno: data.lastName,
      apellidoMaterno: data.motherLastName || null,
      fechaNacimiento: data.birthDate || null,
      genero: data.gender || null,
      estadoCivilId: data.civilStatusId || null,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      telefono: data.phone || null,
      celular: data.mobilePhone || null,
      direccion: data.address || null,
      municipioId: data.municipalityId || null,
    };
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.userId !== undefined) {
      updateData.usuarioId = data.userId || null;
    }
    if (data.ci !== undefined) {
      updateData.ci = data.ci;
    }
    if (data.expedition !== undefined) {
      updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null;
    }
    if (data.firstName !== undefined) {
      updateData.nombres = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.apellidoPaterno = data.lastName;
    }
    if (data.motherLastName !== undefined) {
      updateData.apellidoMaterno = data.motherLastName || null;
    }
    if (data.birthDate !== undefined) {
      updateData.fechaNacimiento = data.birthDate || null;
    }
    if (data.gender !== undefined) {
      updateData.genero = data.gender || null;
    }
    if (data.civilStatusId !== undefined) {
      updateData.estadoCivilId = data.civilStatusId || null;
    }
    if (data.personalEmail !== undefined) {
      updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null;
    }
    if (data.phone !== undefined) {
      updateData.telefono = data.phone || null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone || null;
    }
    if (data.address !== undefined) {
      updateData.direccion = data.address || null;
    }
    if (data.municipalityId !== undefined) {
      updateData.municipioId = data.municipalityId || null;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'staff';
  }

  /**
   * Método específico: Buscar personal por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Staff|null>}
   */
  async findByCI(ci, expedicion) {
    const model = await this.getModel().findOne({
      where: {
        ci: ci,
        expedicion: expedicion.toUpperCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }
}

