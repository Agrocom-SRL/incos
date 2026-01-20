/**
 * Use Case: GenerateBoletaInscripcionUseCase
 * Módulo: Inscripciones
 * Genera la boleta de inscripción (formulario de inscripción) en PDF para una inscripción existente
 * 
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Obtener todos los datos necesarios (estudiante, carrera, paralelo, gestión, materias, etc.)
 * - Generar el documento PDF
 * - Guardar el documento en BD
 * - Retornar la ruta del archivo generado
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo genera la boleta de inscripción
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { BoletaInscripcionWordGenerator } from '../../../infrastructure/external/word/BoletaInscripcionWordGenerator.js';
import { WordToPdfConverter } from '../../../infrastructure/external/word/WordToPdfConverter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GenerateBoletaInscripcionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.enrollmentSubjectRepository - Repositorio de materias inscritas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.courseRepository - Repositorio de cursos
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {Object} params.teacherRepository - Repositorio de docentes
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    enrollmentSubjectRepository,
    studentRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseRepository,
    teacherAssignmentRepository,
    managementRepository,
    careerRepository,
    studentDocumentRepository,
    studentDocumentDeliveryRepository,
    civilStatusRepository,
    municipalityRepository,
    provinceRepository,
    departmentRepository,
    languageRepository,
    teacherRepository,
    configuracionSistemaRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentSubjectRepository = enrollmentSubjectRepository;
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.careerRepository = careerRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.civilStatusRepository = civilStatusRepository;
    this.municipalityRepository = municipalityRepository;
    this.provinceRepository = provinceRepository;
    this.departmentRepository = departmentRepository;
    this.languageRepository = languageRepository;
    this.teacherRepository = teacherRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} enrollmentId - ID de la inscripción
   * @param {Object} options - Opciones adicionales (por defecto vacío)
   * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
   */
  async execute(enrollmentId, options = {}) {
    this.logger.info('[Inscripciones] Iniciando generación de boleta de inscripción', {
      enrollmentId,
    });

    try {
      // 1. Validar y obtener inscripción
      const enrollment = await this._getEnrollment(enrollmentId);

      // 2. Obtener gestión (la necesitamos para buscar datos académicos si no están en la inscripción)
      // Si la inscripción no tiene gestionId, obtenemos la gestión vigente actual
      const enrollmentManagementId = enrollment.gestionId || enrollment.gestion_id;
      const management = enrollmentManagementId 
        ? await this._getManagement(enrollmentManagementId)
        : await this._getCurrentManagement();
      
      // Obtener el ID de la gestión (puede venir de la inscripción o de la gestión vigente)
      const managementPlain = management.toPlainObject ? management.toPlainObject() : management;
      const managementId = managementPlain.id || management.id;

      // 3. Obtener datos académicos del estudiante
      // El enrollment ya está convertido a objeto plano, así que accedemos directamente
      const studentAcademicDataId = enrollment.estudianteDatosAcademicosId || enrollment.estudiante_datos_academicos_id;
      
      let studentAcademicData;
      
      if (studentAcademicDataId) {
        // Si la inscripción tiene datos académicos asociados, usarlos
        studentAcademicData = await this._getStudentAcademicData(studentAcademicDataId);
      } else {
        // Si no tiene estudianteDatosAcademicosId, necesitamos obtenerlo desde el estudiante
        // Primero obtenemos las materias inscritas para ver si podemos obtener información
        const enrollmentSubjects = await this._getEnrollmentSubjects(enrollmentId);
        
        if (!enrollmentSubjects || enrollmentSubjects.length === 0) {
          throw new ValidationError(
            'La inscripción no tiene materias inscritas ni datos académicos asociados. No se puede generar la boleta.'
          );
        }

        // Buscar datos académicos que tengan una inscripción activa en esta gestión con este ID
        studentAcademicData = await this._findStudentAcademicDataByEnrollmentId(enrollmentId, managementId);
        
        if (!studentAcademicData) {
          throw new ValidationError(
            'No se pudieron encontrar los datos académicos del estudiante asociados a esta inscripción. Por favor, asegúrese de que la inscripción tenga datos académicos asociados.'
          );
        }
      }

      // 4. Obtener estudiante
      const studentAcademicDataPlain = studentAcademicData.toPlainObject ? studentAcademicData.toPlainObject() : studentAcademicData;
      const studentId = studentAcademicDataPlain.estudianteId || studentAcademicDataPlain.studentId;
      
      if (!studentId) {
        throw new ValidationError(
          'Los datos académicos no tienen un estudiante asociado. No se puede generar la boleta.'
        );
      }
      
      const student = await this._getStudent(studentId);

      // 5. Obtener materias inscritas (si no las obtuvimos antes en el bloque else)
      let enrollmentSubjects = await this._getEnrollmentSubjects(enrollmentId);
      
      if (!enrollmentSubjects || enrollmentSubjects.length === 0) {
        throw new ValidationError(
          'La inscripción no tiene materias inscritas. No se puede generar la boleta.'
        );
      }

      // 6. Obtener paralelo opcionalmente desde la primera asignación docente
      // Si no se puede obtener, se usará un valor por defecto en la generación
      let parallel = null;
      try {
        const firstEnrollmentSubject = enrollmentSubjects[0];
        const firstEnrollmentSubjectPlain = firstEnrollmentSubject.toPlainObject 
          ? firstEnrollmentSubject.toPlainObject() 
          : firstEnrollmentSubject;
        const teacherAssignmentId = firstEnrollmentSubjectPlain.asignacionDocenteId || firstEnrollmentSubjectPlain.teacherAssignmentId;
        
        if (teacherAssignmentId) {
          const firstAssignment = await this._getTeacherAssignment(teacherAssignmentId);
          const assignmentPlain = firstAssignment.toPlainObject ? firstAssignment.toPlainObject() : firstAssignment;
          const courseId = assignmentPlain.cursoId || assignmentPlain.courseId;
          
          if (courseId) {
            parallel = await this._getParallelFromCourse(courseId);
          }
        }
      } catch (error) {
        // Si no se puede obtener el paralelo, continuamos sin él
        // Se usará un valor por defecto en la generación de la boleta
        this.logger.warn('[Inscripciones] No se pudo obtener el paralelo, se usará valor por defecto', {
          enrollmentId,
          error: error.message,
        });
      }

      // 7. Generar la boleta
      const result = await this._generateBoleta(
        student,
        studentAcademicData,
        parallel,
        management,
        enrollmentSubjects
      );

      this.logger.info('[Inscripciones] Boleta de inscripción generada exitosamente', {
        enrollmentId,
        filePath: result.filePath,
      });

      return {
        filePath: result.filePath,
        fileName: result.fileName,
        absolutePath: result.absolutePath,
      };
    } catch (error) {
      this.logger.error('[Inscripciones] Error al generar boleta de inscripción', {
        enrollmentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Obtiene la inscripción por ID
   * @private
   */
  async _getEnrollment(enrollmentId) {
    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const enrollment = await this.enrollmentRepository.findById(enrollmentId, {
      attributes: ['id', 'estudianteDatosAcademicosId', 'gestionId', 'tipoInscripcion'],
    });
    
    if (!enrollment) {
      throw new NotFoundError(`Inscripción con ID ${enrollmentId} no encontrada`);
    }
    
    // Convertir a objeto plano si tiene el método toPlainObject
    const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
    
    return enrollmentPlain;
  }

  /**
   * Obtiene los datos académicos del estudiante
   * @private
   */
  async _getStudentAcademicData(studentAcademicDataId) {
    if (!studentAcademicDataId) {
      throw new ValidationError('ID de datos académicos del estudiante no disponible');
    }
    
    const studentAcademicData = await this.studentAcademicDataRepository.findById(
      studentAcademicDataId
    );
    if (!studentAcademicData) {
      throw new NotFoundError(
        `Datos académicos con ID ${studentAcademicDataId} no encontrados`
      );
    }
    return studentAcademicData;
  }

  /**
   * Obtiene el estudiante
   * @private
   */
  async _getStudent(studentId) {
    if (!studentId) {
      throw new ValidationError('ID de estudiante no disponible');
    }
    
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${studentId} no encontrado`);
    }
    return student;
  }

  /**
   * Obtiene la gestión por ID
   * @private
   */
  async _getManagement(managementId) {
    if (!managementId) {
      throw new ValidationError('ID de gestión no disponible');
    }
    
    const management = await this.managementRepository.findById(managementId);
    if (!management) {
      throw new NotFoundError(`Gestión con ID ${managementId} no encontrada`);
    }
    return management;
  }

  /**
   * Obtiene la gestión actual desde la configuración del sistema
   * La configuración almacena el año académico, no el ID de la gestión
   * Similar al método en CreateStudentScholarshipUseCase y RegisterAporteVoluntarioUseCase
   * 
   * @private
   * @returns {Promise<Object>} Entidad Management
   * @throws {NotFoundError} Si no se encuentra la configuración o la gestión
   * @throws {ValidationError} Si la gestión no está vigente
   */
  async _getCurrentManagement() {
    // 1. Obtener la gestión actual desde la configuración del sistema
    const gestionActualConfig = await this.configuracionSistemaRepository.findBy(
      { key: 'gestion_actual' }
    );

    // 2. Validar que se encontró la configuración
    if (!gestionActualConfig) {
      throw new NotFoundError('Configuración de gestión actual no encontrada');
    }

    // 3. Convertir el año académico a número
    const gestionAnio = parseInt(gestionActualConfig.value, 10);
    if (isNaN(gestionAnio)) {
      throw new ValidationError('La gestión actual configurada no es un año válido');
    }

    // 4. Buscar la gestión vigente por año usando findBy
    // Filtrar directamente por año y vigente: true en la consulta
    const management = await this.managementRepository.findBy(
      { year: gestionAnio, vigente: true }
    );

    // 5. Validar que se encontró la gestión vigente
    if (!management) {
      throw new NotFoundError(`No se encontró una gestión vigente para el año ${gestionAnio}`);
    }

    this.logger.info('[Inscripciones] Gestión vigente obtenida desde configuración', {
      managementId: management.id,
      year: management.year,
    });

    return management;
  }

  /**
   * Obtiene las materias inscritas
   * @private
   */
  async _getEnrollmentSubjects(enrollmentId) {
    const result = await this.enrollmentSubjectRepository.findAll(
      { enrollmentId },
      null,
      null
    );
    return result.enrollmentSubjects || [];
  }

  /**
   * Busca datos académicos del estudiante por ID de inscripción
   * Esto se usa cuando la inscripción no tiene estudianteDatosAcademicosId
   * Busca datos académicos que tengan una inscripción activa con este ID en esta gestión
   * @private
   */
  async _findStudentAcademicDataByEnrollmentId(enrollmentId, managementId) {
    // Buscar todos los datos académicos activos
    // Luego verificar cuál tiene una inscripción activa con este enrollmentId en esta gestión
    const allAcademicDataResult = await this.studentAcademicDataRepository.findAll(
      {
        active: true,
      },
      null,
      null
    );

    if (!allAcademicDataResult.studentAcademicData || allAcademicDataResult.studentAcademicData.length === 0) {
      return null;
    }

    // Para cada dato académico, verificar si tiene una inscripción activa con este ID en esta gestión
    for (const academicData of allAcademicDataResult.studentAcademicData) {
      const academicDataPlain = academicData.toPlainObject ? academicData.toPlainObject() : academicData;
      const academicDataId = academicDataPlain.id;
      
      // Buscar inscripciones de este estudiante en esta gestión
      const studentEnrollmentsResult = await this.enrollmentRepository.findAll(
        {
          estudianteDatosAcademicosId: academicDataId,
          gestionId: managementId,
          active: true,
        },
        null,
        null
      );

      // Verificar si alguna de estas inscripciones tiene el enrollmentId que buscamos
      if (studentEnrollmentsResult.enrollments && studentEnrollmentsResult.enrollments.length > 0) {
        const foundEnrollment = studentEnrollmentsResult.enrollments.find(e => {
          const ePlain = e.toPlainObject ? e.toPlainObject() : e;
          return ePlain.id === enrollmentId;
        });

        if (foundEnrollment) {
          // Encontramos los datos académicos del estudiante que tiene esta inscripción
          return academicData;
        }
      }
    }

    return null;
  }

  /**
   * Obtiene la asignación docente
   * @private
   */
  async _getTeacherAssignment(teacherAssignmentId) {
    const assignment = await this.teacherAssignmentRepository.findById(teacherAssignmentId);
    if (!assignment) {
      throw new NotFoundError(
        `Asignación docente con ID ${teacherAssignmentId} no encontrada`
      );
    }
    return assignment;
  }

  /**
   * Obtiene el paralelo desde el curso
   * @private
   * @returns {Promise<Object|null>} Paralelo encontrado o null si no se encuentra
   */
  async _getParallelFromCourse(courseId) {
    if (!courseId) {
      return null;
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      return null;
    }

    const coursePlain = course.toPlainObject ? course.toPlainObject() : course;
    const parallelId = coursePlain.paraleloId;

    if (!parallelId) {
      return null;
    }

    const parallel = await this.parallelRepository.findById(parallelId);
    return parallel;
  }

  /**
   * Genera la boleta de inscripción
   * @private
   */
  async _generateBoleta(student, studentAcademicData, parallel, management, enrollmentSubjects) {
    try {
      // 1. Convertir a objetos planos
      const studentAcademicDataPlain = studentAcademicData.toPlainObject 
        ? studentAcademicData.toPlainObject() 
        : studentAcademicData;
      
      // 2. Obtener carrera
      const careerId = studentAcademicDataPlain.careerId || studentAcademicDataPlain.carreraId;
      if (!careerId) {
        throw new ValidationError('Los datos académicos del estudiante no tienen carrera asociada');
      }
      
      const career = await this.careerRepository.findById(careerId);
      if (!career) {
        throw new NotFoundError(`Carrera con ID ${careerId}`);
      }

      // 3. Obtener estudiante completo
      const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
      const careerPlain = career.toPlainObject ? career.toPlainObject() : career;
      const managementPlain = management.toPlainObject ? management.toPlainObject() : management;

      // 4. Obtener materias desde las materias inscritas
      const materias = [];
      
      for (const enrollmentSubject of enrollmentSubjects) {
        const enrollmentSubjectPlain = enrollmentSubject.toPlainObject 
          ? enrollmentSubject.toPlainObject() 
          : enrollmentSubject;
        const teacherAssignmentId = enrollmentSubjectPlain.asignacionDocenteId || enrollmentSubjectPlain.teacherAssignmentId;
        
        if (!teacherAssignmentId) continue;
        
        const assignment = await this._getTeacherAssignment(teacherAssignmentId);
        const assignmentPlain = assignment.toPlainObject
          ? assignment.toPlainObject()
          : assignment;

        const courseId = assignmentPlain.cursoId || assignmentPlain.courseId;
        if (!courseId) continue;
        
        const course = await this.courseRepository.findById(courseId);
        if (!course) continue;

        const coursePlain = course.toPlainObject ? course.toPlainObject() : course;

        // Obtener docente
        let docenteNombre = 'Por asignar';
        if (assignmentPlain.docenteId && this.teacherRepository) {
          try {
            const teacher = await this.teacherRepository.findById(assignmentPlain.docenteId);
            if (teacher) {
              const teacherPlain = teacher.toPlainObject ? teacher.toPlainObject() : teacher;
              docenteNombre = `${teacherPlain.nombres || ''} ${teacherPlain.apellidoPaterno || ''} ${teacherPlain.apellidoMaterno || ''}`.trim() || 'Por asignar';
            }
          } catch (err) {
            this.logger.warn('[Inscripciones] Error al obtener docente', {
              teacherId: assignmentPlain.docenteId,
              error: err.message,
            });
          }
        }

        // Obtener horario (simplificado por ahora)
        const horario = 'Por definir';

        materias.push({
          codigo: coursePlain.codigo || 'N/A',
          nombre: coursePlain.nombre || 'N/A',
          docente: docenteNombre,
          horario: horario,
        });
      }

      // 5. Obtener documentos entregados (necesitamos studentId antes de obtener catálogos)
      const studentId = studentPlain.id || student.id;
      const documentosEntregados = await this._getDocumentStatus(studentId);

      // 6. Obtener datos de catálogos para nombres descriptivos
      const estadoCivilNombre = await this._getCivilStatusName(
        studentPlain.estadoCivilId || studentPlain.civilStatusId
      );
      const { municipioNombre, provinciaNombre, departamentoNombre } =
        await this._getLocationNames(
          studentPlain.municipioResidenciaId || studentPlain.municipalityResidenceId
        );
      const idiomaMaternoNombre = await this._getLanguageName(
        studentPlain.idiomaMaterno || studentPlain.nativeLanguageId
      );

      // 7. Calcular edad y formatear fecha
      const { edad, fechaNacFormateada } = this._formatStudentAge(
        studentPlain.fechaNacimiento || studentPlain.birthDate
      );

      // 8. Formatear género
      const generoTexto = this._formatGender(studentPlain.genero || studentPlain.gender);

      // 9. Preparar datos para la boleta
      // El paralelo es opcional, si no está disponible se usa un valor vacío
      const parallelPlain = parallel ? (parallel.toPlainObject ? parallel.toPlainObject() : parallel) : null;
      const anioNombre = parallelPlain ? (parallelPlain.nombre || parallelPlain.name || '') : '';

      const boletaData = {
        gestionYear: managementPlain.anio || managementPlain.year,
        apellidoPaterno: studentPlain.apellidoPaterno || studentPlain.lastName || '',
        apellidoMaterno: studentPlain.apellidoMaterno || studentPlain.motherLastName || '',
        nombres: studentPlain.nombres || studentPlain.firstName || '',
        ci: studentPlain.ci || '',
        expedicion: studentPlain.expedicion || studentPlain.expedition || 'S.C.',
        genero: generoTexto,
        tipoSangre: studentPlain.tipoSangre || studentPlain.bloodType || '',
        emailPersonal: studentPlain.emailPersonal || studentPlain.personalEmail || '',
        estadoCivil: estadoCivilNombre,
        tieneDiscapacidad:
          studentPlain.tieneDiscapacidad !== undefined
            ? studentPlain.tieneDiscapacidad
            : studentPlain.hasDisability || false,
        ciudadNacimiento: municipioNombre,
        provincia: provinciaNombre,
        departamento: departamentoNombre,
        fechaNacimiento: fechaNacFormateada,
        nacionalidad: 'Boliviana',
        edad: String(edad),
        direccion: studentPlain.direccion || studentPlain.address || '',
        idiomaMaterno: idiomaMaternoNombre,
        celular: studentPlain.celular || studentPlain.mobilePhone || '',
        trabaja: false,
        cargo: '',
        empresa: '',
        carrera: careerPlain.nombre || careerPlain.name || '',
        anio: anioNombre,
        documentos: documentosEntregados,
        ciudad: 'Santa Cruz de la Sierra',
        materias: materias,
      };

      // 10. Generar archivos
      const uploadDir = serverConfig.uploadsPath || 'uploads';
      const relativePath = path.join('documentos', 'estudiantes', String(studentId));
      const timestamp = Date.now();
      const baseFileName = `BOLETA_INSCRIPCION_${studentId}_${timestamp}`;

      const docxFileName = `${baseFileName}.docx`;
      const pdfFileName = `${baseFileName}.pdf`;

      // Rutas absolutas
      const absoluteDocxPath = path.isAbsolute(uploadDir)
        ? path.join(uploadDir, relativePath, docxFileName)
        : path.resolve(__dirname, '../../../..', uploadDir, relativePath, docxFileName);

      const absolutePdfPath = path.isAbsolute(uploadDir)
        ? path.join(uploadDir, relativePath, pdfFileName)
        : path.resolve(__dirname, '../../../..', uploadDir, relativePath, pdfFileName);

      // Rutas relativas
      const docxFilePath = path.join('/', uploadDir, relativePath, docxFileName).replace(/\\/g, '/');
      const pdfFilePath = path.join('/', uploadDir, relativePath, pdfFileName).replace(/\\/g, '/');

      // 11. Generar DOCX
      this.logger.info('[Inscripciones] Generando DOCX de la boleta de inscripción', {
        studentId: studentId,
        absolutePath: absoluteDocxPath,
        materiasCount: materias.length,
      });

      await BoletaInscripcionWordGenerator.generate(boletaData, absoluteDocxPath);

      this.logger.info('[Inscripciones] DOCX generado exitosamente', {
        studentId: studentId,
        filePath: docxFilePath,
      });

      // 12. Convertir DOCX a PDF
      this.logger.info('[Inscripciones] Convirtiendo DOCX a PDF', {
        studentId: studentId,
        docxPath: absoluteDocxPath,
        pdfPath: absolutePdfPath,
      });

      const generatedPdfPath = await WordToPdfConverter.convert(absoluteDocxPath, absolutePdfPath);
      
      if (!fs.existsSync(generatedPdfPath)) {
        throw new Error(`El PDF fue generado pero no se encuentra en: ${generatedPdfPath}`);
      }

      this.logger.info('[Inscripciones] ✅ PDF generado exitosamente', {
        studentId: studentId,
        filePath: pdfFilePath,
        fileName: pdfFileName,
        absolutePath: generatedPdfPath,
        fileSize: fs.statSync(generatedPdfPath).size,
      });

      // 13. Guardar documentos en BD
      await this._saveDocuments(studentId, relativePath, docxFileName, pdfFileName);

      return {
        filePath: pdfFilePath,
        fileName: pdfFileName,
        absolutePath: generatedPdfPath,
      };
    } catch (error) {
      this.logger.error('[Inscripciones] Error al generar boleta de inscripción', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`No se pudo generar la boleta: ${error.message}`);
    }
  }

  /**
   * Obtiene el nombre del estado civil
   * @private
   */
  async _getCivilStatusName(estadoCivilId) {
    if (!estadoCivilId) return '';
    try {
      const estadoCivil = await this.civilStatusRepository.findById(estadoCivilId);
      return estadoCivil?.toPlainObject ? estadoCivil.toPlainObject().nombre : estadoCivil?.nombre || '';
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener estado civil', {
        estadoCivilId,
        error: err.message,
      });
      return '';
    }
  }

  /**
   * Obtiene los nombres de ubicación (municipio, provincia, departamento)
   * @private
   */
  async _getLocationNames(municipioResidenciaId) {
    let municipioNombre = '';
    let provinciaNombre = '';
    let departamentoNombre = '';

    if (!municipioResidenciaId) {
      return { municipioNombre, provinciaNombre, departamentoNombre };
    }

    try {
      const municipio = await this.municipalityRepository.findById(municipioResidenciaId);
      if (municipio) {
        const municipioPlain = municipio.toPlainObject ? municipio.toPlainObject() : municipio;
        municipioNombre = municipioPlain.nombre || '';

        if (municipioPlain.provinciaId) {
          const provincia = await this.provinceRepository.findById(municipioPlain.provinciaId);
          if (provincia) {
            const provinciaPlain = provincia.toPlainObject ? provincia.toPlainObject() : provincia;
            provinciaNombre = provinciaPlain.nombre || '';

            if (provinciaPlain.departamentoId) {
              const departamento = await this.departmentRepository.findById(
                provinciaPlain.departamentoId
              );
              if (departamento) {
                const departamentoPlain = departamento.toPlainObject
                  ? departamento.toPlainObject()
                  : departamento;
                departamentoNombre = departamentoPlain.nombre || '';
              }
            }
          }
        }
      }
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener datos geográficos', {
        municipioResidenciaId,
        error: err.message,
      });
    }

    return { municipioNombre, provinciaNombre, departamentoNombre };
  }

  /**
   * Obtiene el nombre del idioma
   * @private
   */
  async _getLanguageName(idiomaId) {
    if (!idiomaId) return '';
    
    const idiomaIdNum = parseInt(idiomaId, 10);
    if (isNaN(idiomaIdNum)) {
      return idiomaId; // Si no es número, es un string directo
    }

    try {
      const idioma = await this.languageRepository.findById(idiomaIdNum);
      return idioma?.toPlainObject ? idioma.toPlainObject().nombre : idioma?.nombre || '';
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener idioma materno', {
        idiomaId,
        error: err.message,
      });
      return '';
    }
  }

  /**
   * Obtiene el estado de los documentos entregados
   * @private
   */
  async _getDocumentStatus(studentId) {
    const documentosEntregados = {
      ci: false,
      certificadoNacimiento: false,
      diplomaBachiller: false,
      aporteVoluntario: false,
    };

    try {
      // Obtener entregas de documentos
      const documentDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
        { studentId },
        null,
        null
      );
      const documentDeliveries = documentDeliveriesResult.studentDocumentDeliveries || [];

      documentDeliveries.forEach((delivery) => {
        const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
        if (deliveryPlain.entregado) {
          const docId = deliveryPlain.documentacionId;
          if (docId === 3) documentosEntregados.ci = true;
          if (docId === 2) documentosEntregados.certificadoNacimiento = true;
          if (docId === 1) documentosEntregados.diplomaBachiller = true;
        }
      });

      // Verificar aporte voluntario desde documentos_estudiante
      const studentDocumentsResult = await this.studentDocumentRepository.findAll(
        {
          studentId,
          tipoDocumento: 'PAGO',
        },
        null,
        null
      );
      const paymentDocuments = studentDocumentsResult.studentDocuments || [];
      documentosEntregados.aporteVoluntario = paymentDocuments.length > 0;
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener estado de documentos', {
        studentId,
        error: err.message,
      });
    }

    return documentosEntregados;
  }

  /**
   * Formatea la edad del estudiante
   * @private
   */
  _formatStudentAge(fechaNacimiento) {
    let edad = '';
    let fechaNacFormateada = '';

    if (!fechaNacimiento) {
      return { edad, fechaNacFormateada };
    }

    const fechaNac = new Date(fechaNacimiento);
    
    // Calcular edad
    const hoy = new Date();
    edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    // Formatear fecha
    const dia = String(fechaNac.getDate()).padStart(2, '0');
    const mesFormateado = String(fechaNac.getMonth() + 1).padStart(2, '0');
    const anio = fechaNac.getFullYear();
    fechaNacFormateada = `${dia}/${mesFormateado}/${anio}`;

    return { edad: String(edad), fechaNacFormateada };
  }

  /**
   * Formatea el género
   * @private
   */
  _formatGender(genero) {
    if (!genero) return '';
    if (genero === 'M' || genero === 'MASCULINO') return 'Masculino';
    if (genero === 'F' || genero === 'FEMENINO') return 'Femenino';
    return genero;
  }

  /**
   * Guarda los documentos generados en BD
   * @private
   */
  async _saveDocuments(studentId, relativePath, docxFileName, pdfFileName) {
    try {
      // Guardar DOCX
      const relativeDocxFilePath = path.join(relativePath, docxFileName).replace(/\\/g, '/');
      const docxData = {
        studentId,
        tipoDocumento: 'INSCRIPCION',
        documentacionId: null,
        fileName: docxFileName,
        filePath: relativeDocxFilePath,
        extension: 'docx',
        tipoMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        contieneMultipleDocumentos: false,
        verified: true,
        state: 'APROBADO',
      };

      await this.studentDocumentRepository.create(docxData);

      // Guardar PDF
      const relativePdfFilePath = path.join(relativePath, pdfFileName).replace(/\\/g, '/');
      const pdfData = {
        studentId,
        tipoDocumento: 'INSCRIPCION',
        documentacionId: null,
        fileName: pdfFileName,
        filePath: relativePdfFilePath,
        extension: 'pdf',
        tipoMime: 'application/pdf',
        contieneMultipleDocumentos: false,
        verified: true,
        state: 'APROBADO',
      };

      await this.studentDocumentRepository.create(pdfData);

      this.logger.info('[Inscripciones] Documentos de boleta guardados en BD', {
        studentId,
        docxFileName,
        pdfFileName,
      });
    } catch (error) {
      this.logger.error('[Inscripciones] Error al guardar documentos en BD', {
        error: error.message,
        stack: error.stack,
        studentId,
      });
      // No lanzar error, solo loguear, para no interrumpir la generación
    }
  }
}
