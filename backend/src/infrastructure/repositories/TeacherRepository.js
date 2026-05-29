import { QueryTypes } from 'sequelize';
import { IDocenteRepository } from '../../domain/interfaces/repositories/IDocenteRepository.js';
import {
  DEFAULT_MAX_HORAS_MES_DOCENTE,
  DEFAULT_MAX_HORAS_SEMANA_DOCENTE,
} from '../../domain/constants/docentes.constants.js';
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

    const sqlAssignmentConflicts = `
      SELECT
        asignacion_docente_id AS assignmentId,
        conflicto_curso AS conflictCurso,
        conflicto_horario AS conflictHorario,
        conflicto_aula AS conflictAula
      FROM vista_base_docente_asignacion_conflictos
      WHERE docente_id = :id
    `;

    const assignmentConflictRows = await sequelize.query(sqlAssignmentConflicts, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    const conflictsByAssignmentId = new Map();
    for (const row of assignmentConflictRows || []) {
      const assignmentId = Number(row.assignmentId);
      if (!Number.isFinite(assignmentId)) continue;
      conflictsByAssignmentId.set(assignmentId, {
        conflictCurso: Number(row.conflictCurso) === 1,
        conflictHorario: Number(row.conflictHorario) === 1,
        conflictAula: Number(row.conflictAula) === 1,
      });
    }

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
      assignments: Array.isArray(assignments)
        ? assignments.map((assignment) => {
            const assignmentId = Number(assignment?.asignacion_docente_id);
            const conflict = conflictsByAssignmentId.get(assignmentId) || {
              conflictCurso: false,
              conflictHorario: false,
              conflictAula: false,
            };
            return {
              ...assignment,
              conflict_curso: conflict.conflictCurso,
              conflict_horario: conflict.conflictHorario,
              conflict_aula: conflict.conflictAula,
            };
          })
        : [],
      schedules: Array.isArray(schedules) ? schedules : [],
    };
  }

  /**
   * Métricas de carga y conflictos para un conjunto de docentes.
   * - carga: materias/asignaciones/paralelos
   * - conflictos:
   *   - curso: duplicidad activa del mismo curso para el mismo docente
   *   - horario: mismo bloque horario en cursos distintos del mismo docente
   *   - aula: bloque aula+horario compartido con otra asignación activa
   *
   * @param {number[]} teacherIds
   * @returns {Promise<Record<number, {
   *   totalAsignaciones:number,
   *   totalMaterias:number,
   *   totalParalelos:number,
   *   hasAsignaciones:boolean,
   *   conflictos:{ curso:number, horario:number, aula:number, total:number, hasConflictos:boolean }
   * }>>}
   */
  async getDocentesConChoqueBloques(cursoId) {
    const id = Number(cursoId);
    if (!Number.isFinite(id) || id < 1) return [];
    // Vista: 93-vista-base-docentes-choque-bloques-por-curso.sql
    const rows = await sequelize.query(
      `SELECT DISTINCT docente_id AS docenteId
       FROM vista_base_docentes_choque_bloques_por_curso
       WHERE curso_id = :cursoId`,
      { replacements: { cursoId: id }, type: QueryTypes.SELECT }
    );
    return rows.map((r) => Number(r.docenteId));
  }

  async getTeachingLoadAndConflictStats(teacherIds = []) {
    const ids = (teacherIds || []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
    if (!ids.length) return {};
    const statsRows = await sequelize.query(
      `
      SELECT
        docente_id AS teacherId,
        total_asignaciones AS totalAsignaciones,
        total_materias AS totalMaterias,
        total_paralelos AS totalParalelos,
        conflicto_curso AS conflictoCurso,
        conflicto_horario AS conflictoHorario,
        conflicto_aula AS conflictoAula
      FROM vista_docente_resumen_conflictos
      WHERE docente_id IN (:teacherIds)
      `,
      {
        replacements: { teacherIds: ids },
        type: QueryTypes.SELECT,
      }
    );

    const result = {};
    ids.forEach((id) => {
      result[id] = {
        totalAsignaciones: 0,
        totalMaterias: 0,
        totalParalelos: 0,
        hasAsignaciones: false,
        conflictos: {
          curso: 0,
          horario: 0,
          aula: 0,
          total: 0,
          hasConflictos: false,
        },
      };
    });

    for (const row of statsRows) {
      const teacherId = Number(row.teacherId);
      if (!result[teacherId]) continue;
      result[teacherId].totalAsignaciones = Number(row.totalAsignaciones) || 0;
      result[teacherId].totalMaterias = Number(row.totalMaterias) || 0;
      result[teacherId].totalParalelos = Number(row.totalParalelos) || 0;
      result[teacherId].hasAsignaciones = result[teacherId].totalAsignaciones > 0;
      const cursoConflicts = Number(row.conflictoCurso) || 0;
      const horarioConflicts = Number(row.conflictoHorario) || 0;
      const aulaConflicts = Number(row.conflictoAula) || 0;
      const totalConflicts = cursoConflicts + horarioConflicts + aulaConflicts;
      result[teacherId].conflictos = {
        curso: cursoConflicts,
        horario: horarioConflicts,
        aula: aulaConflicts,
        total: totalConflicts,
        hasConflictos: totalConflicts > 0,
      };
    }

    return result;
  }

  /**
   * Límites de carga contractual del docente (columnas max_horas_* del schema).
   * @param {number} teacherId
   * @returns {Promise<{ id: number, maxHorasSemana: number, maxHorasMes: number }|null>}
   */
  async findCargaLimitesById(teacherId) {
    const id = Number(teacherId);
    if (!Number.isFinite(id) || id < 1) return null;

    const rows = await sequelize.query(
      `
      SELECT
        id,
        COALESCE(max_horas_semana, :defaultSemana) AS max_horas_semana,
        COALESCE(max_horas_mes, :defaultMes) AS max_horas_mes
      FROM docentes
      WHERE id = :teacherId
        AND deleted_at IS NULL
        AND activo = TRUE
      LIMIT 1
      `,
      {
        replacements: {
          teacherId: id,
          defaultSemana: DEFAULT_MAX_HORAS_SEMANA_DOCENTE,
          defaultMes: DEFAULT_MAX_HORAS_MES_DOCENTE,
        },
        type: QueryTypes.SELECT,
      }
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: Number(row.id),
      maxHorasSemana: Number(row.max_horas_semana) || DEFAULT_MAX_HORAS_SEMANA_DOCENTE,
      maxHorasMes: Number(row.max_horas_mes) || DEFAULT_MAX_HORAS_MES_DOCENTE,
    };
  }

  /**
   * Colores hex asignados a docentes activos (no eliminados).
   * @returns {Promise<Array<{ docenteId: number, colorHex: string, docenteNombre: string }>>}
   */
  async findActiveColorAssignments() {
    const rows = await sequelize.query(
      `
      SELECT
        id AS docenteId,
        UPPER(TRIM(color_hex)) AS colorHex,
        TRIM(CONCAT(
          COALESCE(titulo_profesional, ''), ' ',
          COALESCE(nombres, ''), ' ',
          COALESCE(apellido_paterno, ''), ' ',
          COALESCE(apellido_materno, '')
        )) AS docenteNombre
      FROM docentes
      WHERE deleted_at IS NULL
        AND activo = TRUE
        AND color_hex IS NOT NULL
        AND TRIM(color_hex) <> ''
      ORDER BY id ASC
      `,
      { type: QueryTypes.SELECT }
    );

    return rows
      .map((row) => ({
        docenteId: Number(row.docenteId),
        colorHex: String(row.colorHex || '').toUpperCase(),
        docenteNombre: String(row.docenteNombre || '').replace(/\s+/g, ' ').trim() || null,
      }))
      .filter((row) => row.colorHex);
  }

  /**
   * Docente activo distinto de excludeId que ya usa el color indicado.
   * @param {string} colorHex - #RRGGBB normalizado
   * @param {number|null} excludeTeacherId
   */
  async findActiveByColorHex(colorHex, excludeTeacherId = null) {
    const normalized = String(colorHex || '').trim().toUpperCase();
    if (!normalized) return null;

    const replacements = { colorHex: normalized };
    let excludeClause = '';
    if (excludeTeacherId != null && Number.isFinite(Number(excludeTeacherId))) {
      excludeClause = 'AND id <> :excludeTeacherId';
      replacements.excludeTeacherId = Number(excludeTeacherId);
    }

    const rows = await sequelize.query(
      `
      SELECT id
      FROM docentes
      WHERE deleted_at IS NULL
        AND activo = TRUE
        AND UPPER(TRIM(color_hex)) = :colorHex
        ${excludeClause}
      LIMIT 1
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    if (!rows[0]) return null;
    return this.findById(Number(rows[0].id));
  }
}

