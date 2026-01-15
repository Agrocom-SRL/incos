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

      // 7. Retornar el estudiante con todos sus datos relacionados
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
      };

      this.logger.info('[Estudiantes] Estudiante obtenido exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
        scholarshipsCount: scholarships.length,
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
}

