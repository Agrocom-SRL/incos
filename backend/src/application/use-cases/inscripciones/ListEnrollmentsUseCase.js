/**
 * Use Case: ListEnrollmentsUseCase
 * Módulo: Inscripciones
 * Lista inscripciones con filtros, paginación y ordenamiento
 *
 * Enriquece los datos con relaciones:
 * - Estudiante (student) - a través de studentAcademicData
 * - Carrera (career) - a través de studentAcademicData
 * - Gestión (management)
 * - Cantidad de materias inscritas (cantidadMaterias) - para listado
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { EnrollmentMapper } from '../../mappers/inscripciones/index.js';

export class ListEnrollmentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.subjectEnrollmentRepository - Repositorio de materias inscritas (para cantidad)
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos del estudiante
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    studentRepository,
    careerRepository,
    managementRepository,
    logger,
  }) {
    super({
      repository: enrollmentRepository,
      logger,
      moduleName: 'Inscripciones',
      resourceName: 'inscripciones',
      collectionFieldName: 'enrollments',
      dataFieldName: 'inscripciones',
    });

    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentRepository = studentRepository;
    this.careerRepository = careerRepository;
    this.managementRepository = managementRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Enrollment a presentación
   * @returns {EnrollmentMapper}
   */
  getMapper() {
    return EnrollmentMapper;
  }

  /**
   * Enriquece los datos de inscripciones con información de relaciones
   * Similar a GetEnrollmentByIdUseCase y ListPagosAportesUseCase, obtiene datos completos de:
   * - Estudiante (a través de studentAcademicData)
   * - Carrera (a través de studentAcademicData)
   * - Gestión
   * 
   * @param {Array} data - Array de inscripciones ya convertidos a formato de presentación
   * @param {Object} repositoryResult - Resultado completo del repository
   * @returns {Promise<Array>} Array de inscripciones enriquecidos con relaciones
   */
  async enrichData(data, repositoryResult) {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    this.logger.info('[Inscripciones] Iniciando enriquecimiento de datos de inscripciones', {
      count: data.length,
    });

    try {
      // Recopilar todos los IDs únicos para hacer consultas en batch
      // NOTA: Los datos vienen en snake_case después del mapper (datosAcademicosId, gestionId)
      const academicDataIds = new Set();
      const managementIds = new Set();

      data.forEach((enrollment) => {
        // Usar snake_case que viene del mapper
        const academicDataId = enrollment.datosAcademicosId || enrollment.academicDataId;
        const managementId = enrollment.gestionId || enrollment.managementId;
        
        if (academicDataId) {
          academicDataIds.add(academicDataId);
        }
        if (managementId) {
          managementIds.add(managementId);
        }
      });

      // Obtener datos académicos y gestiones en paralelo
      const [academicDataMap, managements] = await Promise.all([
        this._fetchStudentAcademicData(Array.from(academicDataIds)),
        this._fetchManagements(Array.from(managementIds)),
      ]);

      // Extraer IDs de estudiantes y carreras de los datos académicos
      // Las entidades de dominio usan camelCase (studentId, careerId)
      const studentIds = new Set();
      const careerIds = new Set();

      Object.values(academicDataMap).forEach((academicData) => {
        // Las entidades usan camelCase
        const studentId = academicData.studentId || academicData.estudianteId;
        const careerId = academicData.careerId || academicData.carreraId;
        
        if (studentId) {
          studentIds.add(studentId);
        }
        if (careerId) {
          careerIds.add(careerId);
        }
      });

      // Obtener estudiantes, carreras y conteo de materias por inscripción en paralelo
      const enrollmentIds = data.map((e) => e.id).filter((id) => id != null);
      const [students, careers, subjectCounts] = await Promise.all([
        this._fetchStudents(Array.from(studentIds)),
        this._fetchCareers(Array.from(careerIds)),
        this._fetchSubjectCountByEnrollmentIds(enrollmentIds),
      ]);

      // Enriquecer cada inscripción con sus relaciones
      const enrichedData = data.map((enrollment) => {
        const enriched = { ...enrollment };

        // Obtener datos académicos usando snake_case del mapper
        const academicDataId = enrollment.datosAcademicosId || enrollment.academicDataId;
        const academicData = academicDataId ? academicDataMap[academicDataId] : null;

        // Estudiante - las entidades usan camelCase (studentId)
        const studentId = academicData?.studentId || academicData?.estudianteId;
        if (studentId && students[studentId]) {
          enriched.estudiante = this._mapStudent(students[studentId]);
        }

        // Carrera - las entidades usan camelCase (careerId)
        const careerId = academicData?.careerId || academicData?.carreraId;
        if (careerId && careers[careerId]) {
          enriched.carrera = this._mapCareer(careers[careerId]);
        }

        // Gestión - usar snake_case del mapper (gestionId)
        const managementId = enrollment.gestionId || enrollment.managementId;
        if (managementId && managements[managementId]) {
          enriched.gestion = this._mapManagement(managements[managementId]);
        }

        // Cantidad de materias inscritas (para columna en listado)
        enriched.cantidadMaterias = subjectCounts[enrollment.id] ?? 0;

        return enriched;
      });

      this.logger.info('[Inscripciones] Datos enriquecidos exitosamente', {
        count: enrichedData.length,
        studentsCount: Object.keys(students).length,
        careersCount: Object.keys(careers).length,
        managementsCount: Object.keys(managements).length,
      });

      return enrichedData;
    } catch (error) {
      this.logger.error('[Inscripciones] Error al enriquecer datos de inscripciones', {
        error: error.message,
        stack: error.stack,
      });
      // En caso de error, retornar datos sin enriquecer en lugar de fallar
      return data;
    }
  }

  /**
   * Obtiene la cantidad de materias inscritas por cada inscripción (batch).
   * @param {number[]} enrollmentIds - IDs de inscripciones
   * @returns {Promise<Object>} Mapa { enrollmentId: cantidad }
   * @private
   */
  async _fetchSubjectCountByEnrollmentIds(enrollmentIds) {
    if (!enrollmentIds || enrollmentIds.length === 0) return {};
    if (!this.subjectEnrollmentRepository) return {};

    try {
      const result = await this.subjectEnrollmentRepository.findAll(
        { enrollmentIds },
        null,
        null
      );
      const list = result.enrollmentSubjects || result.enrollmentsSubjects || [];
      const countByEnrollmentId = {};
      list.forEach((item) => {
        const eid = item.enrollmentId ?? item.inscripcionId ?? (item.toPlainObject && item.toPlainObject().enrollmentId);
        if (eid != null) {
          countByEnrollmentId[eid] = (countByEnrollmentId[eid] || 0) + 1;
        }
      });
      return countByEnrollmentId;
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener conteo de materias por inscripción', {
        error: err.message,
      });
      return {};
    }
  }

  /**
   * Obtiene datos académicos del estudiante por IDs
   * @private
   */
  async _fetchStudentAcademicData(academicDataIds) {
    if (academicDataIds.length === 0) return {};

    const academicDataMap = {};
    for (const academicDataId of academicDataIds) {
      try {
        const academicData = await this.studentAcademicDataRepository.findById(academicDataId, {
          attributes: ['id', 'estudianteId', 'carreraId', 'estadoRegistro'],
        });
        if (academicData) {
          academicDataMap[academicDataId] = academicData.toPlainObject 
            ? academicData.toPlainObject() 
            : academicData;
        }
      } catch (err) {
        this.logger.warn('[Inscripciones] Error al obtener datos académicos', {
          academicDataId,
          error: err.message,
        });
      }
    }
    return academicDataMap;
  }

  /**
   * Obtiene estudiantes por IDs
   * @private
   */
  async _fetchStudents(studentIds) {
    if (studentIds.length === 0) return {};

    const students = {};
    for (const studentId of studentIds) {
      try {
        const student = await this.studentRepository.findById(studentId, {
          attributes: ['id', 'codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'expedicion'],
        });
        if (student) {
          students[studentId] = student.toPlainObject ? student.toPlainObject() : student;
        }
      } catch (err) {
        this.logger.warn('[Inscripciones] Error al obtener estudiante', {
          studentId,
          error: err.message,
        });
      }
    }
    return students;
  }

  /**
   * Obtiene carreras por IDs
   * @private
   */
  async _fetchCareers(careerIds) {
    if (careerIds.length === 0) return {};

    const careers = {};
    for (const careerId of careerIds) {
      try {
        const career = await this.careerRepository.findById(careerId, {
          attributes: ['id', 'codigo', 'nombre'],
        });
        if (career) {
          careers[careerId] = career.toPlainObject ? career.toPlainObject() : career;
        }
      } catch (err) {
        this.logger.warn('[Inscripciones] Error al obtener carrera', {
          careerId,
          error: err.message,
        });
      }
    }
    return careers;
  }

  /**
   * Obtiene gestiones por IDs
   * @private
   */
  async _fetchManagements(managementIds) {
    if (managementIds.length === 0) return {};

    const managements = {};
    for (const managementId of managementIds) {
      try {
        const management = await this.managementRepository.findById(managementId, {
          attributes: ['id', 'codigo', 'nombre', 'anio'],
        });
        if (management) {
          managements[managementId] = management.toPlainObject ? management.toPlainObject() : management;
        }
      } catch (err) {
        this.logger.warn('[Inscripciones] Error al obtener gestión', {
          managementId,
          error: err.message,
        });
      }
    }
    return managements;
  }

  /**
   * Mapea estudiante a formato de presentación
   * @private
   */
  _mapStudent(student) {
    const firstName = student.firstName || student.nombres || '';
    const lastName = student.lastName || student.apellidoPaterno || '';
    const motherLastName = student.motherLastName || student.apellidoMaterno || '';

    let nombreCompleto = [firstName, lastName, motherLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!nombreCompleto) {
      nombreCompleto = student.nombreCompleto || '';
    }

    return {
      id: student.id,
      nombreCompleto,
      nombre: firstName,
      apellidoPaterno: lastName,
      apellidoMaterno: motherLastName,
      ci: student.ci,
      expedicion: student.expedition || student.expedicion,
      codigoEstudiante: student.codigoEstudiante || student.studentCode,
    };
  }

  /**
   * Mapea carrera a formato de presentación
   * @private
   */
  _mapCareer(career) {
    return {
      id: career.id,
      codigo: career.codigo || career.code,
      nombre: career.nombre || career.name,
    };
  }

  /**
   * Mapea gestión a formato de presentación
   * @private
   */
  _mapManagement(management) {
    return {
      id: management.id,
      codigo: management.codigo || management.code,
      nombre: management.nombre || management.name,
      anio: management.anio || management.year,
    };
  }
}
