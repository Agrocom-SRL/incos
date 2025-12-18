import { IStudentRepository } from '../../domain/interfaces/repositories/IStudentRepository.js';
import { Estudiante as EstudianteModel } from '../database/models/Estudiante.js';
import { Student } from '../../domain/entities/Student.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IStudentRepository}
 * 
 * Esta clase cumple con el contrato IStudentRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCI(), findByCodigo(), findByEmail() y getNextStudentNumber() que son requeridos por IStudentRepository
 */
export class StudentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estudiantes
   * @returns {Object} Modelo Estudiante
   */
  getModel() {
    return EstudianteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Student|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Student({
      id: model.id,
      userId: model.usuarioId,
      studentCode: model.codigoEstudiante,
      ci: model.ci,
      expedition: model.expedicion,
      firstName: model.nombres,
      lastName: model.apellidoPaterno,
      motherLastName: model.apellidoMaterno,
      birthDate: model.fechaNacimiento,
      gender: model.genero,
      civilStatusId: model.estadoCivilId,
      nationality: model.nacionalidad,
      birthMunicipalityId: model.municipioNacimientoId,
      birthCity: model.ciudadNacimiento,
      nativeLanguageId: model.idiomaNatalId,
      bloodType: model.tipoSangre,
      hasDisability: model.tieneDiscapacidad,
      disabilityTypeId: model.tipoDiscapacidadId,
      personalEmail: model.emailPersonal,
      mobilePhone: model.celular,
      landlinePhone: model.telefonoFijo,
      address: model.direccion,
      residenceMunicipalityId: model.municipioResidenciaId,
      zone: model.zona,
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

    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }
    if (filters.hasDisability !== undefined) {
      where.tieneDiscapacidad = filters.hasDisability;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
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
      codigoEstudiante: data.studentCode,
      ci: data.ci,
      expedicion: data.expedition ? data.expedition.toUpperCase() : null,
      nombres: data.firstName,
      apellidoPaterno: data.lastName,
      apellidoMaterno: data.motherLastName || null,
      fechaNacimiento: data.birthDate,
      genero: data.gender,
      estadoCivilId: data.civilStatusId || null,
      nacionalidad: data.nationality || 'Boliviana',
      municipioNacimientoId: data.birthMunicipalityId || null,
      ciudadNacimiento: data.birthCity || null,
      idiomaNatalId: data.nativeLanguageId || null,
      tipoSangre: data.bloodType || null,
      tieneDiscapacidad: data.hasDisability !== undefined ? data.hasDisability : false,
      tipoDiscapacidadId: data.disabilityTypeId || null,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      celular: data.mobilePhone,
      telefonoFijo: data.landlinePhone || null,
      direccion: data.address || null,
      municipioResidenciaId: data.residenceMunicipalityId || null,
      zona: data.zone || null,
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

    // IMPORTANTE: Incluir todos los campos que vienen en data, incluso si son null
    // Esto permite actualizar campos a null (limpiarlos)
    if (data.userId !== undefined) {
      updateData.usuarioId = data.userId || null;
    }
    if (data.studentCode !== undefined) {
      updateData.codigoEstudiante = data.studentCode;
    }
    if (data.ci !== undefined) {
      // Permitir null para limpiar CI (aunque normalmente no debería ser null)
      updateData.ci = data.ci;
    }
    if (data.expedition !== undefined) {
      updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null;
    }
    if (data.firstName !== undefined) {
      // Permitir null para limpiar nombre (aunque normalmente no debería ser null)
      updateData.nombres = data.firstName;
    }
    if (data.lastName !== undefined) {
      // Permitir null para limpiar apellido (aunque normalmente no debería ser null)
      updateData.apellidoPaterno = data.lastName;
    }
    if (data.motherLastName !== undefined) {
      updateData.apellidoMaterno = data.motherLastName || null;
    }
    if (data.birthDate !== undefined) {
      updateData.fechaNacimiento = data.birthDate;
    }
    if (data.gender !== undefined) {
      updateData.genero = data.gender;
    }
    if (data.civilStatusId !== undefined) {
      updateData.estadoCivilId = data.civilStatusId || null;
    }
    if (data.nationality !== undefined) {
      updateData.nacionalidad = data.nationality;
    }
    if (data.birthMunicipalityId !== undefined) {
      updateData.municipioNacimientoId = data.birthMunicipalityId || null;
    }
    if (data.birthCity !== undefined) {
      updateData.ciudadNacimiento = data.birthCity || null;
    }
    if (data.nativeLanguageId !== undefined) {
      updateData.idiomaNatalId = data.nativeLanguageId || null;
    }
    if (data.bloodType !== undefined) {
      updateData.tipoSangre = data.bloodType || null;
    }
    if (data.hasDisability !== undefined) {
      updateData.tieneDiscapacidad = data.hasDisability;
    }
    if (data.disabilityTypeId !== undefined) {
      updateData.tipoDiscapacidadId = data.disabilityTypeId || null;
    }
    if (data.personalEmail !== undefined) {
      updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone;
    }
    if (data.landlinePhone !== undefined) {
      updateData.telefonoFijo = data.landlinePhone || null;
    }
    if (data.address !== undefined) {
      updateData.direccion = data.address || null;
    }
    if (data.residenceMunicipalityId !== undefined) {
      updateData.municipioResidenciaId = data.residenceMunicipalityId || null;
    }
    if (data.zone !== undefined) {
      updateData.zona = data.zone || null;
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
    return 'students';
  }

  /**
   * Método específico: Buscar estudiante por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Student|null>}
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

  /**
   * Método específico: Buscar estudiante por código
   * @param {string} codigoEstudiante
   * @returns {Promise<Student|null>}
   */
  async findByCodigo(codigoEstudiante) {
    const model = await this.getModel().findOne({
      where: {
        codigoEstudiante: codigoEstudiante,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar estudiante por email
   * @param {string} email
   * @returns {Promise<Student|null>}
   */
  async findByEmail(email) {
    const model = await this.getModel().findOne({
      where: {
        emailPersonal: email.toLowerCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Obtiene el siguiente número para generar código de estudiante
   * @param {string} gestionCodigo - Código de la gestión (ej: "2025-1")
   * @returns {Promise<number>}
   */
  async getNextStudentNumber(gestionCodigo) {
    // Buscar el último código que empiece con el código de gestión
    const prefix = gestionCodigo.replace('-', '');
    const pattern = `${prefix}%`;

    const lastStudent = await this.getModel().findOne({
      where: {
        codigoEstudiante: { [Op.like]: pattern },
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigoEstudiante', 'DESC']],
    });

    if (!lastStudent) {
      return 1; // Primer estudiante de la gestión
    }

    // Extraer el número del último código (ej: "20251-001" -> 1)
    const lastCode = lastStudent.codigoEstudiante;
    const parts = lastCode.split('-');
    if (parts.length === 2) {
      const lastNumber = parseInt(parts[1], 10);
      return isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    return 1;
  }
}

