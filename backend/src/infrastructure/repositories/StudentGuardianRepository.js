import { IStudentApoderadoRepository } from '../../domain/interfaces/repositories/IStudentApoderadoRepository.js';
import { EstudianteApoderado as EstudianteApoderadoModel } from '../database/models/EstudianteApoderado.js';
import { StudentGuardian } from '../../domain/entities/StudentGuardian.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de apoderados de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IStudentApoderadoRepository}
 * 
 * Esta clase cumple con el contrato IStudentApoderadoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() que es requerido por IStudentApoderadoRepository
 */
export class StudentGuardianRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de apoderados de estudiantes
   * @returns {Object} Modelo EstudianteApoderado
   */
  getModel() {
    return EstudianteApoderadoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {StudentGuardian|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudentGuardian({
      id: model.id,
      studentId: model.estudianteId,
      relationshipTypeId: model.tipoParentescoId,
      firstName: model.nombres,
      lastName: model.apellidos,
      ci: model.ci,
      occupation: model.ocupacion,
      workplace: model.lugarTrabajo,
      address: model.direccion,
      phone: model.telefono,
      mobilePhone: model.celular,
      email: model.email,
      isEmergencyContact: model.esContactoEmergencia,
      isLegalGuardian: model.esApoderadoLegal,
      livesWithStudent: model.viveConEstudiante,
      observations: model.observaciones,
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

    if (filters.relationshipTypeId) {
      where.tipoParentescoId = filters.relationshipTypeId;
    }
    if (filters.isEmergencyContact !== undefined) {
      where.esContactoEmergencia = filters.isEmergencyContact;
    }
    if (filters.isLegalGuardian !== undefined) {
      where.esApoderadoLegal = filters.isLegalGuardian;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidos', 'ci', 'email', 'ocupacion', 'lugarTrabajo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombres', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      estudianteId: data.studentId || null,
      tipoParentescoId: data.relationshipTypeId || null,
      nombres: data.firstName,
      apellidos: data.lastName || null,
      ci: data.ci || null,
      ocupacion: data.occupation || null,
      lugarTrabajo: data.workplace || null,
      direccion: data.address || null,
      telefono: data.phone || null,
      celular: data.mobilePhone || null,
      email: data.email ? data.email.toLowerCase() : null,
      esContactoEmergencia: data.isEmergencyContact !== undefined ? data.isEmergencyContact : true,
      esApoderadoLegal: data.isLegalGuardian !== undefined ? data.isLegalGuardian : false,
      viveConEstudiante: data.livesWithStudent !== undefined ? data.livesWithStudent : false,
      observaciones: data.observations || null,
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

    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.relationshipTypeId !== undefined) {
      updateData.tipoParentescoId = data.relationshipTypeId || null;
    }
    if (data.firstName !== undefined) {
      updateData.nombres = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.apellidos = data.lastName || null;
    }
    if (data.ci !== undefined) {
      updateData.ci = data.ci || null;
    }
    if (data.occupation !== undefined) {
      updateData.ocupacion = data.occupation || null;
    }
    if (data.workplace !== undefined) {
      updateData.lugarTrabajo = data.workplace || null;
    }
    if (data.address !== undefined) {
      updateData.direccion = data.address || null;
    }
    if (data.phone !== undefined) {
      updateData.telefono = data.phone || null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone || null;
    }
    if (data.email !== undefined) {
      updateData.email = data.email ? data.email.toLowerCase() : null;
    }
    if (data.isEmergencyContact !== undefined) {
      updateData.esContactoEmergencia = data.isEmergencyContact;
    }
    if (data.isLegalGuardian !== undefined) {
      updateData.esApoderadoLegal = data.isLegalGuardian;
    }
    if (data.livesWithStudent !== undefined) {
      updateData.viveConEstudiante = data.livesWithStudent;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations || null;
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
    return 'studentGuardians';
  }

  /**
   * Método específico: Buscar apoderados por estudiante
   * @param {number} estudianteId
   * @returns {Promise<StudentGuardian[]>}
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['esContactoEmergencia', 'DESC'], ['esApoderadoLegal', 'DESC'], ['nombres', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

