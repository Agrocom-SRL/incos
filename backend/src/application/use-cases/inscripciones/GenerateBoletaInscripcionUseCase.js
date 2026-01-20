/**
 * Use Case: GenerateBoletaInscripcionUseCase
 * Módulo: Inscripciones
 * Genera la boleta de inscripción (formulario de inscripción) en PDF para una inscripción existente
 * 
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Obtener todos los datos necesarios (estudiante, carrera, paralelo, gestión, etc.)
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
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studyPlanRepository - Repositorio de planes de estudio
   * @param {Object} params.periodRepository - Repositorio de periodos
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas de plan
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
   * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    studentRepository,
    studentAcademicDataRepository,
    managementRepository,
    careerRepository,
    studyPlanRepository,
    periodRepository,
    planSubjectRepository,
    subjectRepository,
    contributionPaymentRepository,
    studentDocumentRepository,
    studentDocumentDeliveryRepository,
    civilStatusRepository,
    municipalityRepository,
    provinceRepository,
    departmentRepository,
    languageRepository,
    configuracionSistemaRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.managementRepository = managementRepository;
    this.careerRepository = careerRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.civilStatusRepository = civilStatusRepository;
    this.municipalityRepository = municipalityRepository;
    this.provinceRepository = provinceRepository;
    this.departmentRepository = departmentRepository;
    this.languageRepository = languageRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} studentId - ID del estudiante
   * @param {Object} options - Opciones adicionales (por defecto vacío)
   * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Inscripciones] Iniciando generación de boleta de inscripción', {
      studentId,
    });

    try {
      // 1. Validar y obtener estudiante
      const student = await this._getStudent(studentId);

      // 2. Buscar inscripción activa del estudiante
      const enrollment = await this._getEnrollmentByStudentId(studentId);

      if (!enrollment) {
        throw new NotFoundError(`No se encontró una inscripción activa para el estudiante con ID ${studentId}`);
      }

      // 3. Obtener gestión desde la inscripción o la gestión vigente actual
      const enrollmentManagementId = enrollment.gestionId || enrollment.gestion_id;
      const management = enrollmentManagementId
        ? await this._getManagement(enrollmentManagementId)
        : await this._getCurrentManagement();

      // 4. Obtener datos académicos del estudiante directamente por studentId
      // La relación es 1:1 entre estudiantes y estudiantes_datos_academicos
      const studentAcademicData = await this._getStudentAcademicDataByStudentId(studentId);

      if (!studentAcademicData) {
        throw new NotFoundError(
          `No se encontraron datos académicos para el estudiante con ID ${studentId}. Por favor, asegúrese de que el estudiante tenga datos académicos registrados.`
        );
      }

      // 5. Generar la boleta
      const result = await this._generateBoleta(
        student,
        studentAcademicData,
        management
      );

      this.logger.info('[Inscripciones] Boleta de inscripción generada exitosamente', {
        studentId,
        filePath: result.filePath,
      });

      return {
        filePath: result.filePath,
        fileName: result.fileName,
        absolutePath: result.absolutePath,
      };
    } catch (error) {
      this.logger.error('[Inscripciones] Error al generar boleta de inscripción', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Obtiene la inscripción activa por ID de estudiante
   * Busca primero los datos académicos del estudiante y luego la inscripción asociada
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object|null>} Inscripción activa o null si no se encuentra
   */
  async _getEnrollmentByStudentId(studentId) {
    // 1. Buscar datos académicos activos del estudiante
    const academicDataResult = await this.studentAcademicDataRepository.findAll(
      {
        studentId: studentId,
        active: true,
      },
      null,
      null
    );

    if (!academicDataResult.studentAcademicData || academicDataResult.studentAcademicData.length === 0) {
      this.logger.warn('[Inscripciones] No se encontraron datos académicos activos para el estudiante', {
        studentId,
      });
      return null;
    }

    // 2. Para cada dato académico, buscar inscripciones activas (ordenadas por fecha más reciente)
    for (const academicData of academicDataResult.studentAcademicData) {
      const academicDataPlain = academicData.toPlainObject ? academicData.toPlainObject() : academicData;
      const academicDataId = academicDataPlain.id;

      // Buscar inscripciones activas con estos datos académicos
      const enrollmentsResult = await this.enrollmentRepository.findAll(
        {
          studentAcademicDataId: academicDataId,
          active: true,
        },
        null,
        { order: [['createdAt', 'DESC']] } // Ordenar por fecha de creación descendente para obtener la más reciente
      );

      if (enrollmentsResult.enrollments && enrollmentsResult.enrollments.length > 0) {
        // Retornar la primera inscripción activa encontrada (la más reciente)
        const enrollment = enrollmentsResult.enrollments[0];
        const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;

        this.logger.info('[Inscripciones] Inscripción encontrada para el estudiante', {
          studentId,
          enrollmentId: enrollmentPlain.id,
          academicDataId,
        });

        return enrollmentPlain;
      }
    }

    return null;
  }

  /**
   * Obtiene los datos académicos del estudiante por ID de estudiante
   * La relación es 1:1, así que obtenemos el primer registro activo del estudiante
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object|null>} Datos académicos del estudiante o null si no se encuentra
   */
  async _getStudentAcademicDataByStudentId(studentId) {
    if (!studentId) {
      throw new ValidationError('ID de estudiante no disponible');
    }

    const result = await this.studentAcademicDataRepository.findAll(
      {
        studentId: studentId,
        active: true,
      },
      null,
      null
    );

    if (!result.studentAcademicData || result.studentAcademicData.length === 0) {
      return null;
    }

    // Retornar el primer registro activo (debería ser único por la relación 1:1)
    return result.studentAcademicData[0];
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
   * Genera la boleta de inscripción
   * @private
   */
  async _generateBoleta(student, studentAcademicData, management) {
    try {
      // 1. Preparar datos del estudiante y carrera
      const { studentPlain, career, careerId, studentId } = await this._prepareStudentAndCareerData(
        student,
        studentAcademicData
      );

      // 2. Preparar datos para la boleta
      const boletaData = await this._prepareBoletaData(
        studentPlain,
        career,
        management,
        careerId,
        studentId,
        student
      );

      // 3. Generar archivos DOCX y PDF
      const filePaths = await this._generateDocumentFiles(boletaData, studentId);

      // 4. Guardar documentos en BD
      await this._saveDocuments(studentId, filePaths.relativePath, filePaths.docxFileName, filePaths.pdfFileName);

      return {
        filePath: filePaths.pdfFilePath,
        fileName: filePaths.pdfFileName,
        absolutePath: filePaths.absolutePdfPath,
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
   * Prepara los datos del estudiante y carrera
   * @private
   * @returns {Promise<{studentPlain: Object, career: Object, careerId: number, studentId: number}>}
   */
  async _prepareStudentAndCareerData(student, studentAcademicData) {
    // Convertir a objetos planos
    const studentAcademicDataPlain = studentAcademicData.toPlainObject
      ? studentAcademicData.toPlainObject()
      : studentAcademicData;

    // Obtener carrera
    const careerId = studentAcademicDataPlain.careerId || studentAcademicDataPlain.carreraId;
    if (!careerId) {
      throw new ValidationError('Los datos académicos del estudiante no tienen carrera asociada');
    }

    const career = await this.careerRepository.findById(careerId);
    if (!career) {
      throw new NotFoundError(`Carrera con ID ${careerId}`);
    }

    // Convertir a objetos planos
    const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
    const studentId = studentPlain.id || student.id;

    return { studentPlain, career, careerId, studentId };
  }

  /**
   * Prepara los datos para la boleta
   * @private
   * @returns {Promise<Object>} Datos para la boleta
   */
  async _prepareBoletaData(studentPlain, career, management, careerId, studentId, student) {
    // Convertir objetos a planos
    const careerPlain = career.toPlainObject ? career.toPlainObject() : career;
    const managementPlain = management.toPlainObject ? management.toPlainObject() : management;

    // Obtener documentos entregados (usa la misma lógica que CreateEnrollmentUseCase)
    const documentosEntregados = await this._getDocumentStatus(studentId, student, management);

    // Obtener datos de catálogos para nombres descriptivos
    const estadoCivilNombre = await this._getCivilStatusName(
      studentPlain.estadoCivilId || studentPlain.civilStatusId
    );
    const { municipioNombre, provinciaNombre, departamentoNombre } = await this._getLocationNames(
      studentPlain.municipioResidenciaId || studentPlain.municipalityResidenceId
    );
    const idiomaMaternoNombre = await this._getLanguageName(
      studentPlain.idiomaMaterno || studentPlain.nativeLanguageId
    );

    // Calcular edad y formatear fecha
    const { edad, fechaNacFormateada } = this._formatStudentAge(
      studentPlain.fechaNacimiento || studentPlain.birthDate
    );

    // Formatear género
    const generoTexto = this._formatGender(studentPlain.genero || studentPlain.gender);

    // Obtener materias del primer periodo
    const materiasPrimerPeriodo = await this._getFirstPeriodSubjects(careerId);

    // Preparar datos para la boleta
    // NOTA: El año académico (anio) se deja vacío porque la boleta solo muestra checkboxes
    // El año se determina automáticamente en el generador según la lógica del formulario
    return {
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
      anio: '', // Año académico: se deja vacío, el generador manejará la lógica por defecto
      materias: materiasPrimerPeriodo, // Materias del primer periodo (solo siglas y nombres)
      documentos: documentosEntregados,
      ciudad: 'Santa Cruz de la Sierra',
    };
  }

  /**
   * Genera los archivos DOCX y PDF de la boleta
   * @private
   * @returns {Promise<{relativePath: string, docxFileName: string, pdfFileName: string, absoluteDocxPath: string, absolutePdfPath: string, docxFilePath: string, pdfFilePath: string}>}
   */
  async _generateDocumentFiles(boletaData, studentId) {
    // Preparar rutas y nombres de archivos
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

    // Generar DOCX
    this.logger.info('[Inscripciones] Generando DOCX de la boleta de inscripción', {
      studentId: studentId,
      absolutePath: absoluteDocxPath,
    });

    await BoletaInscripcionWordGenerator.generate(boletaData, absoluteDocxPath);

    this.logger.info('[Inscripciones] DOCX generado exitosamente', {
      studentId: studentId,
      filePath: docxFilePath,
    });

    // Convertir DOCX a PDF
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

    return {
      relativePath,
      docxFileName,
      pdfFileName,
      absoluteDocxPath,
      absolutePdfPath: generatedPdfPath,
      docxFilePath,
      pdfFilePath,
    };
  }

  /**
   * Obtiene las materias del primer periodo de la carrera
   * Retorna solo las siglas y nombres de las materias
   * @private
   * @param {number} careerId - ID de la carrera
   * @returns {Promise<Array<{sigla: string, nombre: string}>>} Array de materias con sigla y nombre
   */
  async _getFirstPeriodSubjects(careerId) {
    try {
      // 1. Obtener el plan de estudios vigente de la carrera
      const studyPlansResult = await this.studyPlanRepository.findAll(
        {
          careerId: careerId,
          isActive: true,
        },
        null,
        null
      );

      if (!studyPlansResult.studyPlans || studyPlansResult.studyPlans.length === 0) {
        this.logger.warn('[Inscripciones] No se encontró plan de estudios vigente para la carrera', {
          careerId,
        });
        return [];
      }

      const studyPlan = studyPlansResult.studyPlans[0];
      const studyPlanId = studyPlan.id || studyPlan.toPlainObject?.().id;

      // 2. Obtener el periodo del primer año (numero = 1)
      const periodsResult = await this.periodRepository.findAll(
        {
          studyPlanId: studyPlanId,
          number: 1,
        },
        null,
        null
      );

      if (!periodsResult.periods || periodsResult.periods.length === 0) {
        this.logger.warn('[Inscripciones] No se encontró el primer periodo del plan de estudios', {
          careerId,
          studyPlanId,
        });
        return [];
      }

      const firstPeriod = periodsResult.periods[0];
      const periodId = firstPeriod.id || firstPeriod.toPlainObject?.().id;

      // 3. Obtener las asignaturas del plan del primer periodo
      const planSubjectsResult = await this.planSubjectRepository.findAll(
        {
          periodId: periodId,
          active: true,
        },
        null,
        { order: [['ordenVisualizacion', 'ASC']] }
      );

      if (!planSubjectsResult.planSubjects || planSubjectsResult.planSubjects.length === 0) {
        this.logger.warn('[Inscripciones] No se encontraron asignaturas para el primer periodo', {
          careerId,
          studyPlanId,
          periodId,
        });
        return [];
      }

      // 4. Obtener las materias y extraer solo sigla y nombre
      const materias = [];
      for (const planSubject of planSubjectsResult.planSubjects) {
        const planSubjectPlain = planSubject.toPlainObject ? planSubject.toPlainObject() : planSubject;
        const subjectId = planSubjectPlain.subjectId || planSubjectPlain.materiaId;

        if (subjectId) {
          const subject = await this.subjectRepository.findById(subjectId);
          if (subject) {
            const subjectPlain = subject.toPlainObject ? subject.toPlainObject() : subject;
            materias.push({
              sigla: subjectPlain.acronym || subjectPlain.sigla || '',
              nombre: subjectPlain.name || subjectPlain.nombre || '',
            });
          }
        }
      }

      this.logger.info('[Inscripciones] Materias del primer periodo obtenidas', {
        careerId,
        studyPlanId,
        periodId,
        materiasCount: materias.length,
      });

      return materias;
    } catch (error) {
      this.logger.error('[Inscripciones] Error al obtener materias del primer periodo', {
        careerId,
        error: error.message,
        stack: error.stack,
      });
      // Retornar array vacío en caso de error para no interrumpir la generación
      return [];
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
   * Verifica los documentos físicos entregados y el pago de la cuota anual
   * Usa la misma lógica que CreateEnrollmentUseCase._validatePaymentExists
   * @private
   * @param {number} studentId - ID del estudiante (para documentos)
   * @param {Object} student - Entidad Student (para verificación de pago)
   * @param {Object} management - Entidad Management (para verificación de pago)
   * @returns {Promise<Object>} Estado de los documentos entregados
   */
  async _getDocumentStatus(studentId, student, management) {
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

      // Verificar pago de la cuota anual desde pago_aporte
      // Usa la misma lógica que CreateEnrollmentUseCase._validatePaymentExists
      const paymentResult = await this.contributionPaymentRepository.findAll(
        {
          studentId: student.id,
          managementId: management.id,
        },
        1,
        null
      );

      // Si existe un pago para esta gestión, marcar como pagado
      if (paymentResult.contributionPayments && paymentResult.contributionPayments.length > 0) {
        documentosEntregados.aporteVoluntario = true;

        const payment = paymentResult.contributionPayments[0];
        this.logger.info('[Inscripciones] Pago de aporte anual encontrado', {
          studentId: student.id,
          managementId: management.id,
          paymentId: payment.id,
          amountPaid: payment.amountPaid,
          scholarshipDiscount: payment.scholarshipDiscount,
        });
      } else {
        this.logger.warn('[Inscripciones] No se encontró pago de aporte anual para la gestión', {
          studentId: student.id,
          managementId: management.id,
          managementYear: management.year,
        });
      }
    } catch (err) {
      this.logger.warn('[Inscripciones] Error al obtener estado de documentos', {
        studentId,
        studentIdFromEntity: student?.id,
        managementId: management?.id,
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
