/**
 * Use Case: GetStudentByIdUseCase
 * Módulo: Estudiantes
 * Obtiene un estudiante por ID con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Obtener el estudiante principal
 * - Obtener apoderados (múltiples)
 * - Obtener discapacidades (múltiples)
 * - Obtener orígenes (múltiples)
 * - Obtener entregas de documentos (múltiples)
 * - Obtener asignaciones de becas (múltiples)
 * - Calcular si faltan documentos de inscripción
 * - Retornar el estudiante con todos sus datos relacionados
 * 
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { normalizeId } from '../../../domain/utils/mapUtils.js';

export class GetStudentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.countryRepository - Repositorio de países
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
 * @param {Object} params.disabilityTypeRepository - Repositorio de tipos de discapacidad
 * @param {Object} params.relationshipTypeRepository - Repositorio de tipos de parentesco
 * @param {Object} params.documentacionRepository - Repositorio de documentación
 * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
 * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos
 * @param {Object} params.managementRepository - Repositorio de gestiones
 * @param {ILogger} params.logger - Logger para registro de eventos
 */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    countryRepository,
    departmentRepository,
    provinceRepository,
    municipalityRepository,
    languageRepository,
    civilStatusRepository,
    disabilityTypeRepository,
    relationshipTypeRepository,
    documentacionRepository,
    studentScholarshipRepository,
    scholarshipRepository,
    managementRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.countryRepository = countryRepository;
    this.departmentRepository = departmentRepository;
    this.provinceRepository = provinceRepository;
    this.municipalityRepository = municipalityRepository;
    this.languageRepository = languageRepository;
    this.civilStatusRepository = civilStatusRepository;
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de estudiante por ID
   * 
   * @param {number} studentId - ID del estudiante a obtener
   * @returns {Promise<Object>} Estudiante con todos sus datos relacionados
   */
  async execute(studentId) {
    this.logger.info('[Estudiantes] Iniciando obtención de estudiante por ID', {
      studentId,
    });

    try {
      // 1. Obtener el estudiante principal
      const student = await this.studentRepository.findById(studentId);

      if (!student) {
        throw new Error(`No se encontró un estudiante con ID ${studentId}`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId: student.id,
        studentCode: student.studentCode,
      });

      // 2. Obtener apoderados (múltiples)
      const guardiansResult = await this.studentGuardianRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const guardians = guardiansResult.studentGuardians || [];

      this.logger.info('[Estudiantes] Apoderados encontrados', {
        studentId: student.id,
        count: guardians.length,
      });

      // 3. Obtener discapacidades (múltiples)
      const disabilitiesResult = await this.studentDisabilityRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const disabilities = disabilitiesResult.studentDisabilities || [];

      this.logger.info('[Estudiantes] Discapacidades encontradas', {
        studentId: student.id,
        count: disabilities.length,
      });

      // 4. Obtener orígenes (múltiples)
      const originsResult = await this.studentOriginRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const origins = originsResult.studentOrigins || [];

      this.logger.info('[Estudiantes] Orígenes encontrados', {
        studentId: student.id,
        count: origins.length,
      });

      // 5. Obtener entregas de documentos (múltiples)
      const documentDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const documentDeliveries = documentDeliveriesResult.studentDocumentDeliveries || [];

      this.logger.info('[Estudiantes] Entregas de documentos encontradas', {
        studentId: student.id,
        count: documentDeliveries.length,
      });

      // 6. Obtener asignaciones de becas (múltiples)
      const scholarshipsResult = await this.studentScholarshipRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const scholarships = scholarshipsResult.studentScholarships || [];

      this.logger.info('[Estudiantes] Asignaciones de becas encontradas', {
        studentId: student.id,
        count: scholarships.length,
      });

      // 7. Obtener datos relacionados de catálogos
      const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
      
      // 6.1. Estado civil del estudiante
      let civilStatus = null;
      if (studentPlain.civilStatusId) {
        try {
          civilStatus = await this.civilStatusRepository.findById(studentPlain.civilStatusId);
          civilStatus = civilStatus?.toPlainObject ? civilStatus.toPlainObject() : civilStatus;
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener estado civil', {
            studentId: student.id,
            civilStatusId: studentPlain.civilStatusId,
            error: err.message,
          });
        }
      }

      // 6.2. Municipio de residencia (y su provincia y departamento)
      let residenceMunicipality = null;
      let residenceProvince = null;
      let residenceDepartment = null;
      if (studentPlain.residenceMunicipalityId) {
        try {
          residenceMunicipality = await this.municipalityRepository.findById(studentPlain.residenceMunicipalityId);
          residenceMunicipality = residenceMunicipality?.toPlainObject ? residenceMunicipality.toPlainObject() : residenceMunicipality;
          
          if (residenceMunicipality?.provinciaId) {
            residenceProvince = await this.provinceRepository.findById(residenceMunicipality.provinciaId);
            residenceProvince = residenceProvince?.toPlainObject ? residenceProvince.toPlainObject() : residenceProvince;
            
            if (residenceProvince?.departamentoId) {
              residenceDepartment = await this.departmentRepository.findById(residenceProvince.departamentoId);
              residenceDepartment = residenceDepartment?.toPlainObject ? residenceDepartment.toPlainObject() : residenceDepartment;
            }
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener datos geográficos de residencia', {
            studentId: student.id,
            residenceMunicipalityId: studentPlain.residenceMunicipalityId,
            error: err.message,
          });
        }
      }

      // 6.3. Datos relacionados de orígenes (países, idiomas, municipios)
      const originCountryIds = new Set();
      const originLanguageIds = new Set();
      const originMunicipalityIds = new Set();
      
      origins.forEach((origin) => {
        if (origin.countryId) originCountryIds.add(origin.countryId);
        if (origin.motherTongueId) originLanguageIds.add(origin.motherTongueId);
        if (origin.secondaryLanguageId) originLanguageIds.add(origin.secondaryLanguageId);
        if (origin.birthMunicipalityId) originMunicipalityIds.add(origin.birthMunicipalityId);
      });

      const originCountries = {};
      const originLanguages = {};
      const originMunicipalities = {};
      const originProvinces = {};
      const originDepartments = {};

      // Obtener países de orígenes
      for (const countryId of originCountryIds) {
        try {
          const country = await this.countryRepository.findById(countryId);
          if (country) {
            originCountries[countryId] = country.toPlainObject ? country.toPlainObject() : country;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener país de origen', {
            studentId: student.id,
            countryId,
            error: err.message,
          });
        }
      }

      // Obtener idiomas de orígenes
      for (const languageId of originLanguageIds) {
        try {
          const language = await this.languageRepository.findById(languageId);
          if (language) {
            originLanguages[languageId] = language.toPlainObject ? language.toPlainObject() : language;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener idioma', {
            studentId: student.id,
            languageId,
            error: err.message,
          });
        }
      }

      // Obtener municipios de orígenes (y sus provincias y departamentos)
      for (const municipalityId of originMunicipalityIds) {
        try {
          const municipality = await this.municipalityRepository.findById(municipalityId);
          if (municipality) {
            const municipalityPlain = municipality.toPlainObject ? municipality.toPlainObject() : municipality;
            originMunicipalities[municipalityId] = municipalityPlain;
            
            if (municipalityPlain.provinciaId) {
              const province = await this.provinceRepository.findById(municipalityPlain.provinciaId);
              if (province) {
                const provincePlain = province.toPlainObject ? province.toPlainObject() : province;
                originProvinces[municipalityPlain.provinciaId] = provincePlain;
                
                if (provincePlain.departamentoId) {
                  const department = await this.departmentRepository.findById(provincePlain.departamentoId);
                  if (department) {
                    originDepartments[provincePlain.departamentoId] = department.toPlainObject ? department.toPlainObject() : department;
                  }
                }
              }
            }
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener municipio de origen', {
            studentId: student.id,
            municipalityId,
            error: err.message,
          });
        }
      }

      // 6.4. Tipos de discapacidad
      const disabilityTypeIds = new Set();
      disabilities.forEach((disability) => {
        if (disability.disabilityTypeId) disabilityTypeIds.add(disability.disabilityTypeId);
      });

      const disabilityTypes = {};
      for (const disabilityTypeId of disabilityTypeIds) {
        try {
          const disabilityType = await this.disabilityTypeRepository.findById(disabilityTypeId);
          if (disabilityType) {
            disabilityTypes[disabilityTypeId] = disabilityType.toPlainObject ? disabilityType.toPlainObject() : disabilityType;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de discapacidad', {
            studentId: student.id,
            disabilityTypeId,
            error: err.message,
          });
        }
      }

      // 6.5. Tipos de parentesco de apoderados
      const relationshipTypeIds = new Set();
      guardians.forEach((guardian) => {
        if (guardian.relationshipTypeId) relationshipTypeIds.add(guardian.relationshipTypeId);
      });

      const relationshipTypes = {};
      for (const relationshipTypeId of relationshipTypeIds) {
        try {
          const relationshipType = await this.relationshipTypeRepository.findById(relationshipTypeId);
          if (relationshipType) {
            relationshipTypes[relationshipTypeId] = relationshipType.toPlainObject ? relationshipType.toPlainObject() : relationshipType;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de parentesco', {
            studentId: student.id,
            relationshipTypeId,
            error: err.message,
          });
        }
      }

      // 6.6. Documentación de entregas
      const documentacionIds = new Set();
      documentDeliveries.forEach((delivery) => {
        if (delivery.documentacionId) documentacionIds.add(delivery.documentacionId);
      });

      const documentaciones = {};
      for (const documentacionId of documentacionIds) {
        try {
          const documentacion = await this.documentacionRepository.findById(documentacionId);
          if (documentacion) {
            documentaciones[documentacionId] = documentacion.toPlainObject ? documentacion.toPlainObject() : documentacion;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener documentación', {
            studentId: student.id,
            documentacionId,
            error: err.message,
          });
        }
      }

      // 6.7. Datos relacionados de becas (tipo de beca y gestión)
      const scholarshipIds = new Set();
      const managementIds = new Set();
      scholarships.forEach((scholarship) => {
        if (scholarship.scholarshipId) scholarshipIds.add(scholarship.scholarshipId);
        if (scholarship.managementId) managementIds.add(scholarship.managementId);
      });

      const scholarshipsCatalog = {};
      for (const scholarshipId of scholarshipIds) {
        try {
          const scholarship = await this.scholarshipRepository.findById(scholarshipId);
          if (scholarship) {
            scholarshipsCatalog[scholarshipId] = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de beca', {
            studentId: student.id,
            scholarshipId,
            error: err.message,
          });
        }
      }

      const managements = {};
      for (const managementId of managementIds) {
        try {
          const management = await this.managementRepository.findById(managementId);
          if (management) {
            managements[managementId] = management.toPlainObject ? management.toPlainObject() : management;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener gestión de beca', {
            studentId: student.id,
            managementId,
            error: err.message,
          });
        }
      }

      // 7. Calcular si faltan documentos de inscripción
      const tieneDocumentosFaltantes = await this._checkMissingDocuments(
        student.id,
        documentDeliveries
      );

      this.logger.info('[Estudiantes] Estado de documentos calculado', {
        studentId: student.id,
        tieneDocumentosFaltantes,
        tipo: typeof tieneDocumentosFaltantes,
        documentDeliveriesCount: documentDeliveries.length,
      });

      // 8. Retornar el estudiante con todos sus datos relacionados
      const result = {
        student: studentPlain,
        guardians: guardians.map((g) =>
          g.toPlainObject ? g.toPlainObject() : g
        ),
        disabilities: disabilities.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
        origins: origins.map((o) => (o.toPlainObject ? o.toPlainObject() : o)),
        documentDeliveries: documentDeliveries.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
        scholarships: scholarships.map((s) =>
          s.toPlainObject ? s.toPlainObject() : s
        ),
        // Datos relacionados de catálogos
        catalogs: {
          civilStatus,
          residenceMunicipality,
          residenceProvince,
          residenceDepartment,
          originCountries,
          originLanguages,
          originMunicipalities,
          originProvinces,
          originDepartments,
          disabilityTypes,
          relationshipTypes,
          documentaciones,
          scholarships: scholarshipsCatalog,
          managements,
        },
        // Campo para indicar si faltan documentos (para mostrar botón de acta de compromiso)
        tieneDocumentosFaltantes,
      };

      this.logger.info('[Estudiantes] Estudiante obtenido exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
        scholarshipsCount: scholarships.length,
        tieneDocumentosFaltantes: result.tieneDocumentosFaltantes,
        tipoTieneDocumentosFaltantes: typeof result.tieneDocumentosFaltantes,
        resultKeys: Object.keys(result),
        catalogsCount: {
          countries: Object.keys(result.catalogs.originCountries).length,
          languages: Object.keys(result.catalogs.originLanguages).length,
          municipalities: Object.keys(result.catalogs.originMunicipalities).length,
          disabilityTypes: Object.keys(result.catalogs.disabilityTypes).length,
          relationshipTypes: Object.keys(result.catalogs.relationshipTypes).length,
          documentaciones: Object.keys(result.catalogs.documentaciones).length,
          scholarships: Object.keys(result.catalogs.scholarships).length,
          managements: Object.keys(result.catalogs.managements).length,
        },
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener estudiante por ID', {
        error: error.message,
        stack: error.stack,
        studentId,
      });
      throw error;
    }
  }

  /**
   * Verifica si el estudiante tiene documentos de inscripción faltantes
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {Array} documentDeliveries - Array de entregas de documentos del estudiante
   * @returns {Promise<boolean>} true si faltan documentos, false si todos están entregados
   */
  async _checkMissingDocuments(studentId, documentDeliveries) {
    try {
      // 1. Obtener documentos de inscripción (documentos padre requeridos)
      // Usar la misma lógica que GenerateActaCompromisoUseCase
      const inscripcionDocsResult = await this.documentacionRepository.findAll({
        documentType: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
        parentDocumentId: null,
        attributes: ['id'],
      });

      const documentosInscripcion = inscripcionDocsResult.documentations || [];

      this.logger.info('[Estudiantes] _checkMissingDocuments - documentos de inscripción obtenidos', {
        studentId,
        cantidad: documentosInscripcion.length,
      });

      if (documentosInscripcion.length === 0) {
        // Si no hay documentos de inscripción definidos, no hay faltantes
        this.logger.info('[Estudiantes] _checkMissingDocuments - no hay documentos de inscripción definidos', { studentId });
        return false;
      }

      // 2. Obtener IDs de documentos de inscripción (usando la misma lógica que GenerateActaCompromisoUseCase)
      const idsDocumentosInscripcion = documentosInscripcion.map(doc => {
        const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
        return docPlain.id; // No normalizar aquí, solo obtener el ID directamente
      }).filter(id => id !== undefined && id !== null);

      this.logger.info('[Estudiantes] _checkMissingDocuments - IDs documentos inscripcion', {
        studentId,
        ids: idsDocumentosInscripcion.join(', '),
        idsCount: idsDocumentosInscripcion.length,
      });

      // Debug: Log de todas las entregas de documentos del estudiante
      this.logger.info('[Estudiantes] _checkMissingDocuments - todas las entregas del estudiante', {
        studentId,
        totalEntregas: documentDeliveries.length,
        entregas: documentDeliveries.map(e => {
          const ePlain = e.toPlainObject ? e.toPlainObject() : e;
          return { id: ePlain.id, documentacionId: ePlain.documentacionId, entregado: ePlain.entregado };
        }),
      });

      // 3. Filtrar entregas que correspondan a documentos de inscripción
      // Usar la misma lógica que GenerateActaCompromisoUseCase._filterInscripcionDeliveries
      const entregasInscripcion = documentDeliveries.filter(entrega => {
        const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
        const entregaId = normalizeId(entregaPlain.documentacionId);
        const estaIncluido = entregaId !== null && idsDocumentosInscripcion.includes(entregaId);
        if (!estaIncluido) {
          this.logger.info('[Estudiantes] _checkMissingDocuments - entrega filtrada (no es inscripción)', {
            studentId,
            entregaId: entregaPlain.id,
            documentacionId: entregaPlain.documentacionId,
            entregado: entregaPlain.entregado,
            normalizedId: entregaId,
          });
        }
        return estaIncluido;
      });

      this.logger.info('[Estudiantes] _checkMissingDocuments - entregas filtradas de inscripción', {
        studentId,
        totalEntregas: documentDeliveries.length,
        entregasInscripcion: entregasInscripcion.length,
        entregasInscripcionDetalle: entregasInscripcion.map(e => {
          const ePlain = e.toPlainObject ? e.toPlainObject() : e;
          return { id: ePlain.id, documentacionId: ePlain.documentacionId, entregado: ePlain.entregado };
        }),
      });

      // 4. Separar entregas en entregados y faltantes (usar la misma lógica que GenerateActaCompromisoUseCase._separateDeliveredAndMissing)
      const entregados = entregasInscripcion.filter(entrega => {
        const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
        const isDelivered = entregaPlain.entregado === true || entregaPlain.entregado === 1;
        this.logger.info('[Estudiantes] _checkMissingDocuments - evaluando entrega (entregado)', {
          studentId,
          entregaId: entregaPlain.id,
          documentacionId: entregaPlain.documentacionId,
          entregado: entregaPlain.entregado,
          tipo: typeof entregaPlain.entregado,
          isDelivered,
        });
        return isDelivered;
      });

      const faltantes = entregasInscripcion.filter(entrega => {
        const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
        const isMissing = entregaPlain.entregado === false || entregaPlain.entregado === 0 || entregaPlain.entregado === null;
        this.logger.info('[Estudiantes] _checkMissingDocuments - evaluando entrega (faltante)', {
          studentId,
          entregaId: entregaPlain.id,
          documentacionId: entregaPlain.documentacionId,
          entregado: entregaPlain.entregado,
          tipo: typeof entregaPlain.entregado,
          isMissing,
        });
        return isMissing;
      });

      // 5. Identificar documentos sin entrega registrada (usar la misma lógica que GenerateActaCompromisoUseCase._findDocumentsWithoutDelivery)
      const entregasDocumentacionIds = entregasInscripcion.map(e => {
        const ePlain = e.toPlainObject ? e.toPlainObject() : e;
        return normalizeId(ePlain.documentacionId);
      }).filter(id => id !== null);

      this.logger.info('[Estudiantes] _checkMissingDocuments - IDs de entregas registradas', {
        studentId,
        idsEntregas: entregasDocumentacionIds.join(', '),
        idsDocumentosInscripcion: idsDocumentosInscripcion.join(', '),
      });

      const documentosSinEntrega = documentosInscripcion.filter(doc => {
        const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
        const docId = normalizeId(docPlain.id);
        const sinEntrega = docId !== null && !entregasDocumentacionIds.includes(docId);
        if (sinEntrega) {
          this.logger.info('[Estudiantes] _checkMissingDocuments - documento sin entrega encontrado', {
            studentId,
            documentId: docPlain.id,
            normalizedId: docId,
          });
        }
        return sinEntrega;
      });

      // 6. Calcular total de faltantes
      const totalFaltantes = faltantes.length + documentosSinEntrega.length;

      const resultadoFinal = totalFaltantes > 0;
      this.logger.info('[Estudiantes] _checkMissingDocuments - resultado final', {
        studentId,
        totalDocumentosInscripcion: documentosInscripcion.length,
        totalEntregasInscripcion: entregasInscripcion.length,
        entregados: entregados.length,
        faltantes: faltantes.length,
        documentosSinEntrega: documentosSinEntrega.length,
        totalFaltantes,
        resultado: resultadoFinal,
        'resultado (boolean)': resultadoFinal,
        detallesFaltantes: faltantes.map(f => {
          const fPlain = f.toPlainObject ? f.toPlainObject() : f;
          return { id: fPlain.id, documentacionId: fPlain.documentacionId, entregado: fPlain.entregado };
        }),
        detallesSinEntrega: documentosSinEntrega.map(d => {
          const dPlain = d.toPlainObject ? d.toPlainObject() : d;
          return { id: dPlain.id };
        }),
      });

      // 7. Retornar true si hay faltantes
      return totalFaltantes > 0;
    } catch (err) {
      // Si hay error al verificar, asumir que no faltan para no bloquear la visualización
      this.logger.warn('[Estudiantes] Error al verificar documentos faltantes', {
        studentId,
        error: err.message,
      });
      return false;
    }
  }
}

