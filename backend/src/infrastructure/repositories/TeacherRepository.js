import { QueryTypes } from 'sequelize';
import { IDocenteRepository } from '../../domain/interfaces/repositories/IDocenteRepository.js';
import { Docente as DocenteModel } from '../database/models/docente.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { TeacherMapper } from '../mappers/TeacherMapper.js';

/**
 * Implementación del repositorio de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TeacherMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TeacherMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDocenteRepository
 * - Usa TeacherMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IDocenteRepository}
 * 
 * Esta clase cumple con el contrato IDocenteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Teacher|null} Entidad de dominio
   */
  toEntity(model) {
    return TeacherMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Teacher
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ ci: '1234567', expedition: 'LP' }) → Busca por CI y expedición
   * - findAll({ userId: 1 }) → Busca docentes de un usuario
   * - findAll({ laborState: 'ACTIVO' }) → Busca docentes activos
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - userId: ID del usuario
   *   - ci: Cédula de identidad
   *   - expedition: Expedición del CI (se convierte a mayúsculas)
   *   - firstName: Nombres (búsqueda exacta, para búsqueda de texto usar search())
   *   - lastName: Apellido paterno (búsqueda exacta, para búsqueda de texto usar search())
   *   - motherLastName: Apellido materno (búsqueda exacta, para búsqueda de texto usar search())
   *   - birthDate: Fecha de nacimiento
   *   - gender: Género
   *   - civilStatusId: ID del estado civil
   *   - nationality: Nacionalidad
   *   - phone: Teléfono
   *   - mobilePhone: Celular
   *   - personalEmail: Email personal (se convierte a minúsculas)
   *   - address: Dirección
   *   - residenceMunicipalityId: ID del municipio de residencia
   *   - zone: Zona
   *   - professionalTitle: Título profesional (búsqueda exacta, para búsqueda de texto usar search())
   *   - specialty: Especialidad (búsqueda exacta, para búsqueda de texto usar search())
   *   - academicLevel: Nivel académico
   *   - graduationInstitution: Institución de egreso
   *   - graduationYear: Año de egreso
   *   - yearsOfExperience: Años de experiencia
   *   - hireDate: Fecha de contratación
   *   - retirementDate: Fecha de retiro
   *   - contractType: Tipo de contrato
   *   - laborState: Estado laboral
   *   - observations: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.ci) {
      where.ci = filters.ci;
    }
    if (filters.expedition) {
      where.expedicion = filters.expedition.toUpperCase();
    }
    if (filters.firstName !== undefined) {
      where.nombres = filters.firstName;
    }
    if (filters.lastName !== undefined) {
      where.apellidoPaterno = filters.lastName;
    }
    if (filters.motherLastName !== undefined) {
      where.apellidoMaterno = filters.motherLastName;
    }
    if (filters.birthDate !== undefined) {
      where.fechaNacimiento = filters.birthDate;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }
    if (filters.civilStatusId) {
      where.estadoCivilId = filters.civilStatusId;
    }
    if (filters.nationality !== undefined) {
      where.nacionalidad = filters.nationality;
    }
    if (filters.phone !== undefined) {
      where.telefono = filters.phone;
    }
    if (filters.mobilePhone !== undefined) {
      where.celular = filters.mobilePhone;
    }
    if (filters.personalEmail) {
      where.emailPersonal = filters.personalEmail.toLowerCase();
    }
    if (filters.address !== undefined) {
      where.direccion = filters.address;
    }
    if (filters.residenceMunicipalityId) {
      where.municipioResidenciaId = filters.residenceMunicipalityId;
    }
    if (filters.zone !== undefined) {
      where.zona = filters.zone;
    }
    if (filters.professionalTitle !== undefined) {
      where.tituloProfesional = filters.professionalTitle;
    }
    if (filters.specialty !== undefined) {
      where.especialidad = filters.specialty;
    }
    if (filters.academicLevel) {
      where.nivelAcademico = filters.academicLevel;
    }
    if (filters.graduationInstitution !== undefined) {
      where.institucionEgreso = filters.graduationInstitution;
    }
    if (filters.graduationYear !== undefined) {
      where.anioEgreso = filters.graduationYear;
    }
    if (filters.yearsOfExperience !== undefined) {
      where.aniosExperiencia = filters.yearsOfExperience;
    }
    if (filters.hireDate !== undefined) {
      where.fechaContratacion = filters.hireDate;
    }
    if (filters.retirementDate !== undefined) {
      where.fechaRetiro = filters.retirementDate;
    }
    if (filters.contractType) {
      where.tipoContrato = filters.contractType;
    }
    if (filters.laborState) {
      where.estadoLaboral = filters.laborState;
    }
    if (filters.observations !== undefined) {
      where.observaciones = filters.observations;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return [
      'nombres',
      'apellidoPaterno',
      'apellidoMaterno',
      'ci',
      'expedicion',
      'telefono',
      'celular',
      'emailPersonal',
      'nacionalidad',
      'direccion',
      'zona',
      'tituloProfesional',
      'especialidad',
      'institucionEgreso',
      'observaciones',
      'tipoContrato',
      'estadoLaboral',
      'nivelAcademico',
    ];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Teacher|Object} data - Entidad Teacher o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return TeacherMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Teacher|Object} data - Entidad Teacher o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return TeacherMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'teachers';
  }

  /**
   * Detalle enriquecido para ficha docente (vistas SQL en `database/03-views/`):
   * - 50-vista-base-docente-ficha.sql → vista_base_docente_ficha
   * - 51-vista-base-docente-asignaciones-curso.sql → vista_base_docente_asignaciones_curso
   * - 52-vista-base-docente-curso-bloques-horario.sql → vista_base_docente_curso_bloques_horario
   * - 53-vista-docente-carga-por-gestion.sql → vista_docente_carga_por_gestion (agregado; no usada aquí)
   *
   * @param {number} teacherId
   * @returns {Promise<{ teacher: Object|null, assignments: Object[], schedules: Object[] }>}
   */
  async findDetailBundleByTeacherId(teacherId) {
    const id = Number(teacherId);
    if (!Number.isFinite(id) || id <= 0) {
      return { teacher: null, assignments: [], schedules: [] };
    }

    const sqlFicha = `
      SELECT * FROM vista_base_docente_ficha
      WHERE docente_id = :id
      LIMIT 1
    `;

    const teacherRows = await sequelize.query(sqlFicha, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });
    const teacher = Array.isArray(teacherRows) && teacherRows.length ? teacherRows[0] : null;
    if (!teacher) {
      return { teacher: null, assignments: [], schedules: [] };
    }

    const sqlAsignaciones = `
      SELECT * FROM vista_base_docente_asignaciones_curso
      WHERE docente_id = :id
      ORDER BY vigente DESC, gestion_anio DESC, curso_codigo
    `;

    const assignments = await sequelize.query(sqlAsignaciones, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    const sqlHorarios = `
      SELECT * FROM vista_base_docente_curso_bloques_horario
      WHERE docente_id = :id
      ORDER BY curso_codigo, orden_secuencia
    `;

    const schedules = await sequelize.query(sqlHorarios, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    return {
      teacher,
      assignments: Array.isArray(assignments) ? assignments : [],
      schedules: Array.isArray(schedules) ? schedules : [],
    };
  }
}

