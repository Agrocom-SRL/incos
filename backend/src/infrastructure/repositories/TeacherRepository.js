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

/** Vistas SQL en `database/03-views/` consumidas por este repositorio. */
const DOCENTE_SQL_VIEWS = {
  FICHA: 'vista_base_docente_ficha',
  ASIGNACIONES_CURSO: 'vista_base_docente_asignaciones_curso',
  ASIGNACION_CONFLICTOS: 'vista_base_docente_asignacion_conflictos',
  CURSO_BLOQUES_HORARIO: 'vista_base_docente_curso_bloques_horario',
  CONFLICTO_HORARIO_PAR: 'vista_base_docente_conflicto_horario_par',
  RESUMEN_CONFLICTOS: 'vista_docente_resumen_conflictos',
  DOCENTES_OCUPADOS_FRANJA_CURSO: 'vista_base_curso_docentes_ocupados_franja',
};

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
   * Lectura parametrizada sobre una vista SQL del módulo docente.
   * @param {string} viewName
   * @param {{ where?: string[], replacements?: object, orderBy?: string, limit?: number }} [opts]
   */
  async _selectFromView(viewName, opts = {}) {
    const { where = [], replacements = {}, orderBy = '', limit = null } = opts;
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitSql = limit != null && Number.isFinite(Number(limit)) ? 'LIMIT :limit' : '';
    const sql = `SELECT * FROM ${viewName} ${whereSql} ${orderSql} ${limitSql}`.replace(/\s+/g, ' ').trim();
    const reps = { ...replacements };
    if (limitSql) reps.limit = Number(limit);
    const rows = await sequelize.query(sql, { replacements: reps, type: QueryTypes.SELECT });
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Detalle enriquecido para ficha docente (vistas SQL en `database/03-views/`):
   * - 50 → vista_base_docente_ficha
   * - 51 → vista_base_docente_asignaciones_curso
   * - 52 → vista_base_docente_curso_bloques_horario (requiere 65)
   * - 67 → vista_base_docente_asignacion_conflictos
   *
   * @param {number} teacherId
   * @returns {Promise<{ teacher: Object|null, assignments: Object[], schedules: Object[] }>}
   */
  async findDetailBundleByTeacherId(teacherId) {
    const id = Number(teacherId);
    if (!Number.isFinite(id) || id <= 0) {
      return { teacher: null, assignments: [], schedules: [] };
    }

    const teacherRows = await this._selectFromView(DOCENTE_SQL_VIEWS.FICHA, {
      where: ['docente_id = :id'],
      replacements: { id },
      limit: 1,
    });
    const teacher = teacherRows[0] ?? null;
    if (!teacher) {
      return { teacher: null, assignments: [], schedules: [] };
    }

    const assignments = await this._selectFromView(DOCENTE_SQL_VIEWS.ASIGNACIONES_CURSO, {
      where: ['docente_id = :id'],
      replacements: { id },
      orderBy: 'vigente DESC, gestion_anio DESC, curso_codigo',
    });

    const assignmentConflictRows = await this._selectFromView(DOCENTE_SQL_VIEWS.ASIGNACION_CONFLICTOS, {
      where: ['docente_id = :id'],
      replacements: { id },
    });

    const conflictsByAssignmentId = new Map();
    for (const row of assignmentConflictRows) {
      const assignmentId = Number(row.asignacion_docente_id);
      if (!Number.isFinite(assignmentId)) continue;
      conflictsByAssignmentId.set(assignmentId, {
        conflictCurso: Number(row.conflicto_curso) === 1,
        conflictHorario: Number(row.conflicto_horario) === 1,
        conflictAula: Number(row.conflicto_aula) === 1,
      });
    }

    const schedules = await this._selectFromView(DOCENTE_SQL_VIEWS.CURSO_BLOQUES_HORARIO, {
      where: ['docente_id = :id'],
      replacements: { id },
      orderBy: 'curso_codigo, orden_secuencia',
    });

    return {
      teacher,
      assignments: assignments.map((assignment) => {
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
      }),
      schedules,
    };
  }

  /**
   * @param {object} row — fila de vista_base_docente_conflicto_horario_par
   */
  _mapParConflictoHorarioRow(row) {
    const siglaA = row.sigla_a ?? '—';
    const siglaB = row.sigla_b ?? '—';
    const dia = row.dia ? String(row.dia).toUpperCase() : '';
    const hi = row.hora_inicio != null ? String(row.hora_inicio).slice(0, 5) : '';
    const hf = row.hora_fin != null ? String(row.hora_fin).slice(0, 5) : '';
    return {
      bloqueAId: row.bloque_a_id != null ? Number(row.bloque_a_id) : null,
      bloqueBId: row.bloque_b_id != null ? Number(row.bloque_b_id) : null,
      horarioId: row.horario_id != null ? Number(row.horario_id) : null,
      dia,
      horaInicio: hi,
      horaFin: hf,
      siglaA,
      siglaB,
      paraleloA: row.paralelo_a ?? null,
      paraleloB: row.paralelo_b ?? null,
      paraleloGestionIdA:
        row.paralelo_gestion_id_a != null ? Number(row.paralelo_gestion_id_a) : null,
      paraleloGestionIdB:
        row.paralelo_gestion_id_b != null ? Number(row.paralelo_gestion_id_b) : null,
      descripcion: `${siglaA} (${row.paralelo_a || '—'}) ↔ ${siglaB} (${row.paralelo_b || '—'}) · ${dia} ${hi}-${hf}`,
    };
  }

  /**
   * Bloques y pares en choque de horario para resolución en grilla (gestión concreta).
   * Vistas: 52 (bloques), 128 (pares), 50 (cabecera docente).
   *
   * @param {number} teacherId
   * @param {number} gestionId
   */
  async findGrillaConflictosByDocenteAndGestion(teacherId, gestionId) {
    const docenteId = Number(teacherId);
    const gestionPk = Number(gestionId);
    if (!Number.isFinite(docenteId) || docenteId < 1 || !Number.isFinite(gestionPk) || gestionPk < 1) {
      return { teacher: null, scheduleRows: [], paresConflicto: [] };
    }

    const teacherRows = await this._selectFromView(DOCENTE_SQL_VIEWS.FICHA, {
      where: ['docente_id = :docenteId'],
      replacements: { docenteId },
      limit: 1,
    });
    const teacher = teacherRows[0] ?? null;
    if (!teacher) {
      return { teacher: null, scheduleRows: [], paresConflicto: [] };
    }

    const scheduleRows = await this._selectFromView(DOCENTE_SQL_VIEWS.CURSO_BLOQUES_HORARIO, {
      where: ['docente_id = :docenteId', 'gestion_id = :gestionId'],
      replacements: { docenteId, gestionId: gestionPk },
      orderBy: 'curso_codigo, orden_secuencia',
    });

    const paresRows = await this._selectFromView(DOCENTE_SQL_VIEWS.CONFLICTO_HORARIO_PAR, {
      where: ['docente_id = :docenteId', 'gestion_id = :gestionId'],
      replacements: { docenteId, gestionId: gestionPk },
      orderBy: 'dia, hora_inicio, sigla_a, sigla_b',
    });

    const solapeParaleloHorario = await sequelize.query(
      `
      SELECT sol.paraleloGestionId AS paralelo_gestion_id, sol.horarioId AS horario_id
      FROM vista_base_paralelo_gestion_conflicto_paralelo_bloque sol
      INNER JOIN paralelos_gestion pg ON pg.id = sol.paraleloGestionId AND pg.deleted_at IS NULL
      INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id AND gp.deleted_at IS NULL
      WHERE gp.gestion_id = :gestionId
      `,
      { replacements: { gestionId: gestionPk }, type: QueryTypes.SELECT },
    );

    return {
      teacher,
      scheduleRows,
      paresConflicto: paresRows.map((row) => this._mapParConflictoHorarioRow(row)),
      solapeParaleloHorario,
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
    // Vista: 92-vista-base-curso-docentes-ocupados-franja.sql (disponibilidad cruzada)
    const rows = await this._selectFromView(DOCENTE_SQL_VIEWS.DOCENTES_OCUPADOS_FRANJA_CURSO, {
      where: ['curso_id = :cursoId'],
      replacements: { cursoId: id },
    });
    return rows.map((r) => Number(r.docente_id ?? r.docenteId));
  }

  async getTeachingLoadAndConflictStats(teacherIds = []) {
    const ids = (teacherIds || []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
    if (!ids.length) return {};
    const statsRows = await this._selectFromView(DOCENTE_SQL_VIEWS.RESUMEN_CONFLICTOS, {
      where: ['docente_id IN (:teacherIds)'],
      replacements: { teacherIds: ids },
    });

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
      const teacherId = Number(row.docente_id);
      if (!result[teacherId]) continue;
      result[teacherId].totalAsignaciones = Number(row.total_asignaciones) || 0;
      result[teacherId].totalMaterias = Number(row.total_materias) || 0;
      result[teacherId].totalParalelos = Number(row.total_paralelos) || 0;
      result[teacherId].hasAsignaciones = result[teacherId].totalAsignaciones > 0;
      const cursoConflicts = Number(row.conflicto_curso) || 0;
      const horarioConflicts = Number(row.conflicto_horario) || 0;
      const aulaConflicts = Number(row.conflicto_aula) || 0;
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

