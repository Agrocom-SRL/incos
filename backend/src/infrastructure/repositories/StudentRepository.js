import { IStudentRepository } from '../../domain/interfaces/repositories/IStudentRepository.js';
import { Student as StudentModel } from '../database/models/Student.js';
import { Student } from '../../domain/entities/Student.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de estudiantes usando Sequelize
 */
export class StudentRepository extends IStudentRepository {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Student}
   */
  toEntity(model) {
    if (!model) return null;
    return new Student({
      id: model.id,
      codigoEstudiante: model.codigoEstudiante,
      ci: model.ci,
      expedicion: model.expedicion,
      nombres: model.nombres,
      apellidoPaterno: model.apellidoPaterno,
      apellidoMaterno: model.apellidoMaterno,
      fechaNacimiento: model.fechaNacimiento,
      genero: model.genero,
      estadoCivilId: model.estadoCivilId,
      nacionalidad: model.nacionalidad,
      municipioNacimientoId: model.municipioNacimientoId,
      ciudadNacimiento: model.ciudadNacimiento,
      idiomaNatalId: model.idiomaNatalId,
      tipoSangre: model.tipoSangre,
      tieneDiscapacidad: model.tieneDiscapacidad,
      tipoDiscapacidadId: model.tipoDiscapacidadId,
      emailPersonal: model.emailPersonal,
      celular: model.celular,
      telefonoFijo: model.telefonoFijo,
      direccion: model.direccion,
      municipioResidenciaId: model.municipioResidenciaId,
      zona: model.zona,
      observaciones: model.observaciones,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Buscar estudiante por ID
   */
  async findById(id) {
    const model = await StudentModel.findByPk(id);
    return this.toEntity(model);
  }

  /**
   * Buscar estudiante por CI y expedición
   */
  async findByCI(ci, expedicion) {
    const model = await StudentModel.findOne({
      where: {
        ci,
        expedicion: expedicion.toUpperCase(),
        activo: true,
      },
    });
    return this.toEntity(model);
  }

  /**
   * Buscar estudiante por código
   */
  async findByCodigo(codigoEstudiante) {
    const model = await StudentModel.findOne({
      where: {
        codigoEstudiante,
        activo: true,
      },
    });
    return this.toEntity(model);
  }

  /**
   * Buscar estudiante por email
   */
  async findByEmail(email) {
    if (!email) return null;
    const model = await StudentModel.findOne({
      where: {
        emailPersonal: email,
        activo: true,
      },
    });
    return this.toEntity(model);
  }

  /**
   * Crear un nuevo estudiante
   */
  async create(student, userId) {
    const modelData = {
      codigoEstudiante: student.codigoEstudiante,
      ci: student.ci,
      expedicion: student.expedicion.toUpperCase(),
      nombres: student.nombres,
      apellidoPaterno: student.apellidoPaterno,
      apellidoMaterno: student.apellidoMaterno,
      fechaNacimiento: student.fechaNacimiento,
      genero: student.genero,
      estadoCivilId: student.estadoCivilId,
      nacionalidad: student.nacionalidad,
      municipioNacimientoId: student.municipioNacimientoId,
      ciudadNacimiento: student.ciudadNacimiento,
      idiomaNatalId: student.idiomaNatalId,
      tipoSangre: student.tipoSangre,
      tieneDiscapacidad: student.tieneDiscapacidad,
      tipoDiscapacidadId: student.tipoDiscapacidadId,
      emailPersonal: student.emailPersonal,
      celular: student.celular,
      telefonoFijo: student.telefonoFijo,
      direccion: student.direccion,
      municipioResidenciaId: student.municipioResidenciaId,
      zona: student.zona,
      observaciones: student.observaciones,
      activo: student.activo !== undefined ? student.activo : true,
      createdBy: userId,
    };

    const model = await StudentModel.create(modelData);
    return this.toEntity(model);
  }

  /**
   * Actualizar un estudiante
   */
  async update(id, studentData, userId) {
    const updateData = {
      ...studentData,
      updatedBy: userId,
    };

    await StudentModel.update(updateData, {
      where: { id },
    });

    return this.findById(id);
  }

  /**
   * Buscar estudiantes con filtros y paginación
   */
  async findAll(filters = {}, page = 1, limit = 50) {
    const where = {
      activo: true,
    };

    if (filters.search) {
      where[Op.or] = [
        { nombres: { [Op.like]: `%${filters.search}%` } },
        { apellidoPaterno: { [Op.like]: `%${filters.search}%` } },
        { apellidoMaterno: { [Op.like]: `%${filters.search}%` } },
        { ci: { [Op.like]: `%${filters.search}%` } },
        { codigoEstudiante: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.carreraId) {
      // Esto requiere un join con estudiantes_datos_academicos
      // Por ahora lo dejamos simple
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await StudentModel.findAndCountAll({
      where,
      limit,
      offset,
      order: filters.sort ? [[filters.sort.split(':')[0], filters.sort.includes(':') ? filters.sort.split(':')[1] : 'ASC']] : [['createdAt', 'DESC']],
    });

    return {
      students: rows.map((model) => this.toEntity(model)),
      total: count,
    };
  }

  /**
   * Obtiene el siguiente número para generar código de estudiante
   * @param {string} gestionCodigo - Código de la gestión (ej: "2025-1")
   * @returns {Promise<number>}
   */
  async getNextStudentNumber(gestionCodigo) {
    const anio = gestionCodigo.split('-')[0];
    const prefix = `EST-${anio}-`;

    // Buscar el último código con ese prefijo
    const lastStudent = await StudentModel.findOne({
      where: {
        codigoEstudiante: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [['codigoEstudiante', 'DESC']],
    });

    if (!lastStudent) {
      return 1;
    }

    // Extraer el número del último código
    const lastNumber = parseInt(lastStudent.codigoEstudiante.split('-')[2], 10);
    return lastNumber + 1;
  }
}
