import { IDocenteRepository } from '../../domain/interfaces/repositories/IDocenteRepository.js';
import { Docente as DocenteModel } from '../database/models/docente.js';
import { Teacher } from '../../domain/entities/Teacher.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IDocenteRepository}
 * 
 * Esta clase cumple con el contrato IDocenteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCI() que es requerido por IDocenteRepository
 */
export class TeacherRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de docentes
   * @returns {Object} Modelo Docente
   */
  getModel() {
    return DocenteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Teacher|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Teacher({
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
      nationality: model.nacionalidad,
      phone: model.telefono,
      mobilePhone: model.celular,
      personalEmail: model.emailPersonal,
      address: model.direccion,
      residenceMunicipalityId: model.municipioResidenciaId,
      zone: model.zona,
      professionalTitle: model.tituloProfesional,
      specialty: model.especialidad,
      academicLevel: model.nivelAcademico,
      graduationInstitution: model.institucionEgreso,
      graduationYear: model.anioEgreso,
      yearsOfExperience: model.aniosExperiencia,
      hireDate: model.fechaContratacion,
      retirementDate: model.fechaRetiro,
      contractType: model.tipoContrato,
      laborState: model.estadoLaboral,
      weeklyHours: model.cargaHorariaSemanal,
      bank: model.banco,
      accountNumber: model.numeroCuenta,
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
    if (filters.laborState) {
      where.estadoLaboral = filters.laborState;
    }
    if (filters.contractType) {
      where.tipoContrato = filters.contractType;
    }
    if (filters.academicLevel) {
      where.nivelAcademico = filters.academicLevel;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal', 'tituloProfesional', 'especialidad'];
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
      fechaNacimiento: data.birthDate,
      genero: data.gender,
      estadoCivilId: data.civilStatusId || null,
      nacionalidad: data.nationality || 'Boliviana',
      telefono: data.phone || null,
      celular: data.mobilePhone,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      direccion: data.address || null,
      municipioResidenciaId: data.residenceMunicipalityId || null,
      zona: data.zone || null,
      tituloProfesional: data.professionalTitle || null,
      especialidad: data.specialty || null,
      nivelAcademico: data.academicLevel || 'LICENCIATURA',
      institucionEgreso: data.graduationInstitution || null,
      anioEgreso: data.graduationYear || null,
      aniosExperiencia: data.yearsOfExperience !== undefined ? data.yearsOfExperience : 0,
      fechaContratacion: data.hireDate || null,
      fechaRetiro: data.retirementDate || null,
      tipoContrato: data.contractType || 'CONTRATO',
      estadoLaboral: data.laborState || 'ACTIVO',
      cargaHorariaSemanal: data.weeklyHours !== undefined ? data.weeklyHours : 0,
      banco: data.bank || null,
      numeroCuenta: data.accountNumber || null,
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
    if (data.phone !== undefined) {
      updateData.telefono = data.phone || null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone;
    }
    if (data.personalEmail !== undefined) {
      updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null;
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
    if (data.professionalTitle !== undefined) {
      updateData.tituloProfesional = data.professionalTitle || null;
    }
    if (data.specialty !== undefined) {
      updateData.especialidad = data.specialty || null;
    }
    if (data.academicLevel !== undefined) {
      updateData.nivelAcademico = data.academicLevel;
    }
    if (data.graduationInstitution !== undefined) {
      updateData.institucionEgreso = data.graduationInstitution || null;
    }
    if (data.graduationYear !== undefined) {
      updateData.anioEgreso = data.graduationYear || null;
    }
    if (data.yearsOfExperience !== undefined) {
      updateData.aniosExperiencia = data.yearsOfExperience;
    }
    if (data.hireDate !== undefined) {
      updateData.fechaContratacion = data.hireDate || null;
    }
    if (data.retirementDate !== undefined) {
      updateData.fechaRetiro = data.retirementDate || null;
    }
    if (data.contractType !== undefined) {
      updateData.tipoContrato = data.contractType;
    }
    if (data.laborState !== undefined) {
      updateData.estadoLaboral = data.laborState;
    }
    if (data.weeklyHours !== undefined) {
      updateData.cargaHorariaSemanal = data.weeklyHours;
    }
    if (data.bank !== undefined) {
      updateData.banco = data.bank || null;
    }
    if (data.accountNumber !== undefined) {
      updateData.numeroCuenta = data.accountNumber || null;
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
    return 'teachers';
  }

  /**
   * Método específico: Buscar docente por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Teacher|null>}
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

