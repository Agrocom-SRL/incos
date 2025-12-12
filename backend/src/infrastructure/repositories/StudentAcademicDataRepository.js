import { IStudentAcademicDataRepository } from '../../domain/interfaces/repositories/IStudentAcademicDataRepository.js';
import { EstudianteDatosAcademicos as EstudianteDatosAcademicosModel } from '../database/models/EstudianteDatosAcademicos.js';
import { StudentAcademicData } from '../../domain/entities/StudentAcademicData.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de datos académicos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IStudentAcademicDataRepository}
 * 
 * Esta clase cumple con el contrato IStudentAcademicDataRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByCarreraId() que son requeridos por IStudentAcademicDataRepository
 */
export class StudentAcademicDataRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de datos académicos de estudiantes
   * @returns {Object} Modelo EstudianteDatosAcademicos
   */
  getModel() {
    return EstudianteDatosAcademicosModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {StudentAcademicData|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudentAcademicData({
      id: model.id,
      studentId: model.estudianteId,
      careerId: model.carreraId,
      managementId: model.gestionIngresoId,
      academicState: model.estadoAcademico,
      previousSchool: model.unidadEducativaProcedencia,
      highSchoolGraduationYear: model.anioEgresoSecundaria,
      annualAverage: model.promedioAnual ? parseFloat(model.promedioAnual) : null,
      graduationDate: model.fechaEgreso,
      withdrawalDate: model.fechaRetiro,
      withdrawalReason: model.motivoRetiro,
      photoUrl: model.fotoUrl,
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

    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.managementId) {
      where.gestionIngresoId = filters.managementId;
    }
    if (filters.academicState) {
      where.estadoAcademico = filters.academicState;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['unidadEducativaProcedencia', 'motivoRetiro'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['gestionIngresoId', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      estudianteId: data.studentId,
      carreraId: data.careerId,
      gestionIngresoId: data.managementId,
      estadoAcademico: data.academicState || 'REGULAR',
      unidadEducativaProcedencia: data.previousSchool || null,
      anioEgresoSecundaria: data.highSchoolGraduationYear || null,
      promedioAnual: data.annualAverage || null,
      fechaEgreso: data.graduationDate || null,
      fechaRetiro: data.withdrawalDate || null,
      motivoRetiro: data.withdrawalReason || null,
      fotoUrl: data.photoUrl || null,
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
      updateData.estudianteId = data.studentId;
    }
    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId;
    }
    if (data.managementId !== undefined) {
      updateData.gestionIngresoId = data.managementId;
    }
    if (data.academicState !== undefined) {
      updateData.estadoAcademico = data.academicState;
    }
    if (data.previousSchool !== undefined) {
      updateData.unidadEducativaProcedencia = data.previousSchool || null;
    }
    if (data.highSchoolGraduationYear !== undefined) {
      updateData.anioEgresoSecundaria = data.highSchoolGraduationYear || null;
    }
    if (data.annualAverage !== undefined) {
      updateData.promedioAnual = data.annualAverage || null;
    }
    if (data.graduationDate !== undefined) {
      updateData.fechaEgreso = data.graduationDate || null;
    }
    if (data.withdrawalDate !== undefined) {
      updateData.fechaRetiro = data.withdrawalDate || null;
    }
    if (data.withdrawalReason !== undefined) {
      updateData.motivoRetiro = data.withdrawalReason || null;
    }
    if (data.photoUrl !== undefined) {
      updateData.fotoUrl = data.photoUrl || null;
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
    return 'studentAcademicData';
  }

  /**
   * Método específico: Buscar datos académicos por estudiante
   * @param {number} estudianteId
   * @returns {Promise<StudentAcademicData|null>}
   */
  async findByEstudianteId(estudianteId) {
    const model = await this.getModel().findOne({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['gestionIngresoId', 'DESC']],
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar estudiantes por carrera
   * @param {number} carreraId
   * @returns {Promise<StudentAcademicData[]>}
   */
  async findByCarreraId(carreraId) {
    const models = await this.getModel().findAll({
      where: {
        carreraId: carreraId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['gestionIngresoId', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

