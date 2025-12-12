import { IStudentBecaRepository } from '../../domain/interfaces/repositories/IStudentBecaRepository.js';
import { EstudianteBeca as EstudianteBecaModel } from '../database/models/EstudianteBeca.js';
import { StudentScholarship } from '../../domain/entities/StudentScholarship.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de becas de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IStudentBecaRepository}
 * 
 * Esta clase cumple con el contrato IStudentBecaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByGestionId() que son requeridos por IStudentBecaRepository
 */
export class StudentScholarshipRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de becas de estudiantes
   * @returns {Object} Modelo EstudianteBeca
   */
  getModel() {
    return EstudianteBecaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {StudentScholarship|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudentScholarship({
      id: model.id,
      studentId: model.estudianteId,
      scholarshipId: model.becaDescuentoId,
      managementId: model.gestionId,
      requestDate: model.fechaSolicitud,
      state: model.estado,
      documentsComplete: model.documentosCompletos,
      documentDeliveryStartDate: model.fechaInicioEntregaDocumentos,
      documentDeliveryEndDate: model.fechaFinEntregaDocumentos,
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

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.scholarshipId) {
      where.becaDescuentoId = filters.scholarshipId;
    }
    if (filters.state) {
      where.estado = filters.state;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['fechaSolicitud', 'DESC']];
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
      becaDescuentoId: data.scholarshipId || null,
      gestionId: data.managementId || null,
      fechaSolicitud: data.requestDate,
      estado: data.state || 'PENDIENTE',
      documentosCompletos: data.documentsComplete !== undefined ? data.documentsComplete : false,
      fechaInicioEntregaDocumentos: data.documentDeliveryStartDate || null,
      fechaFinEntregaDocumentos: data.documentDeliveryEndDate || null,
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
    if (data.scholarshipId !== undefined) {
      updateData.becaDescuentoId = data.scholarshipId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.requestDate !== undefined) {
      updateData.fechaSolicitud = data.requestDate;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
    }
    if (data.documentsComplete !== undefined) {
      updateData.documentosCompletos = data.documentsComplete;
    }
    if (data.documentDeliveryStartDate !== undefined) {
      updateData.fechaInicioEntregaDocumentos = data.documentDeliveryStartDate || null;
    }
    if (data.documentDeliveryEndDate !== undefined) {
      updateData.fechaFinEntregaDocumentos = data.documentDeliveryEndDate || null;
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
    return 'studentScholarships';
  }

  /**
   * Método específico: Buscar becas por estudiante
   * @param {number} estudianteId
   * @returns {Promise<StudentScholarship[]>}
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar becas por gestión
   * @param {number} gestionId
   * @returns {Promise<StudentScholarship[]>}
   */
  async findByGestionId(gestionId) {
    const models = await this.getModel().findAll({
      where: {
        gestionId: gestionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

