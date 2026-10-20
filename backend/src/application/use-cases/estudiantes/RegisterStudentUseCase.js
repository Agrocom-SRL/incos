/**
 * Use Case: RegisterStudentUseCase
 * Módulo: Estudiantes
 * Registra un nuevo estudiante con todos sus datos relacionados
 *
 * Responsabilidades:
 * - Validar que no exista un estudiante con el mismo CI
 * - Generar código del estudiante (YYYYNNNN) según gestión de ingreso (nuevo: gestión actual; antiguo: gestionIngresoId)
 * - Asegurar que exista admision_gestion_YYYY en configuracion_sistema para la gestión usada (crear con valor 0 si no existe)
 * - Crear el estudiante principal
 * - Crear apoderados (múltiples)
 * - Crear discapacidades (múltiples)
 * - Crear orígenes (múltiples)
 * - Crear entregas de documentos (múltiples)
 * - Crear deuda en pago_aporte para la gestión vigente si no existe (una cabecera por estudiante por gestión)
 * - Retornar el estudiante creado con todos sus datos
 *
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el registro completo de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class RegisterStudentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {Object} params.contributionPaymentRepository - Repositorio de cabecera de aporte (pago_aporte)
   * @param {Object} params.managementRepository - Repositorio de gestiones académicas
   * @param {Object} params.contributionConfigurationRepository - Repositorio de configuración de aportes por gestión
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos del estudiante
   * @param {Object} params.institutionRepository - Repositorio de instituciones (origen UETHP/CEA/ITT)
   * @param {Object} params.transitabilityRepository - Repositorio de transitabilidades
   * @param {Object} params.transferRepository - Repositorio de traspasos
   * @param {Object} [params.documentacionRepository] - Repositorio de documentación (para resolver IDs de documentos de traspaso por tipo)
   * @param {ILogger} params.logger - Logger para registro de eventos
 */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    configuracionSistemaRepository,
    contributionPaymentRepository,
    managementRepository,
    contributionConfigurationRepository,
    studentAcademicDataRepository,
    institutionRepository,
    transitabilityRepository,
    transferRepository,
    documentacionRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.managementRepository = managementRepository;
    this.contributionConfigurationRepository = contributionConfigurationRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.institutionRepository = institutionRepository;
    this.transitabilityRepository = transitabilityRepository;
    this.transferRepository = transferRepository;
    this.documentacionRepository = documentacionRepository || null;
    this.logger = logger;
  }

  /**
   * Obtiene los IDs de documentación cuyo tipo es TRASPASO (desde BD, sin IDs fijos).
   * Usado para filtrar qué documentos aplicar solo cuando tipoAdmision === TRASPASO.
   *
   * @returns {Promise<number[]>} Array de IDs de documentación de tipo TRASPASO
   */
  async _getTraspasoDocumentacionIds() {
    if (!this.documentacionRepository) {
      return [];
    }
    try {
      const result = await this.documentacionRepository.findAll(
        { documentType: 'TRASPASO' },
        null,
        null
      );
      const list = result.documentations || [];
      return list
        .map((d) => (d && (d.id ?? (d.toPlainObject ? d.toPlainObject().id : null))) ?? null)
        .filter((id) => id != null && !Number.isNaN(Number(id)))
        .map((id) => Number(id));
    } catch (err) {
      this.logger.warn('[Estudiantes] No se pudieron obtener IDs de documentación TRASPASO', {
        error: err.message,
      });
      return [];
    }
  }

  /**
   * Asegura que exista la clave admision_gestion_YYYY en configuracion_sistema para el año dado.
   * Si no existe, la crea con valor '0'. Usado tanto para estudiantes nuevos (gestión actual) como antiguos (gestión de ingreso).
   *
   * @param {number} gestionAnio - Año de la gestión (ej: 2023, 2026)
   */
  async ensureAdmisionCorrelativoForYear(gestionAnio) {
    if (!this.configuracionSistemaRepository || typeof gestionAnio !== 'number' || Number.isNaN(gestionAnio)) {
      return;
    }
    const claveCorrelativo = `admision_gestion_${gestionAnio}`;
    const existing = await this.configuracionSistemaRepository.findBy({ key: claveCorrelativo });
    if (existing) {
      return;
    }
    await this.configuracionSistemaRepository.create({
      key: claveCorrelativo,
      value: '0',
      type: 'NUMBER',
      description: `Último número correlativo usado para códigos de estudiantes en la gestión ${gestionAnio}`,
    });
    this.logger.info('[Estudiantes] Correlativo de gestión creado en configuracion_sistema', {
      clave: claveCorrelativo,
      gestionAnio,
    });
  }

  /**
   * Genera el código del estudiante basado en la gestión de ingreso y el correlativo
   * Formato: YYYYNNNN (ej: 20260001)
   *
   * IMPORTANTE: Si se proporciona gestionIngresoId, usa esa gestión para generar el código.
   * Esto permite registrar estudiantes antiguos con el código de su gestión original.
   * Si no se proporciona, usa la gestión actual (comportamiento para estudiantes nuevos).
   * Siempre asegura que exista la clave admision_gestion_YYYY (crea con 0 si no existe) antes de incrementar.
   *
   * @param {number|null} gestionIngresoId - ID de la gestión de ingreso (opcional)
   * @returns {Promise<string>} Código del estudiante generado
   */
  async generateStudentCode(gestionIngresoId = null) {
    let gestionAnio;
    let gestionInfo = null;

    // 1. Determinar qué gestión usar para generar el código
    if (gestionIngresoId) {
      // Estudiante antiguo: usar la gestión de ingreso proporcionada
      gestionInfo = await this.managementRepository.findById(gestionIngresoId);
      if (!gestionInfo) {
        throw new Error(`No se encontró la gestión con ID ${gestionIngresoId}`);
      }

      const gestionPlain = gestionInfo.toPlainObject ? gestionInfo.toPlainObject() : gestionInfo;
      gestionAnio = gestionPlain.year || gestionPlain.anio;

      if (!gestionAnio) {
        throw new Error(`La gestión con ID ${gestionIngresoId} no tiene año definido`);
      }

      this.logger.info('[Estudiantes] Usando gestión de ingreso para código', {
        gestionIngresoId,
        gestionAnio,
        gestionCodigo: gestionPlain.code || gestionPlain.codigo,
      });
    } else {
      // Estudiante nuevo: usar la gestión actual de la configuración
      const gestionActualConfig = await this.configuracionSistemaRepository.findBy(
        { key: 'gestion_actual' }
      );

      if (!gestionActualConfig) {
        throw new Error('No se encontró la configuración de gestión actual');
      }

      gestionAnio = parseInt(gestionActualConfig.value, 10);
      if (Number.isNaN(gestionAnio)) {
        throw new Error('La gestión actual configurada no es un año válido');
      }

      this.logger.info('[Estudiantes] Usando gestión actual para código', { gestionAnio });
    }

    // 2. Asegurar que exista el correlativo para esta gestión (crear admision_gestion_YYYY con 0 si no existe)
    await this.ensureAdmisionCorrelativoForYear(gestionAnio);

    // 3. Obtener el correlativo (ya existe tras ensure), incrementar y actualizar
    const claveCorrelativo = `admision_gestion_${gestionAnio}`;
    const correlativoConfig = await this.configuracionSistemaRepository.findBy(
      { key: claveCorrelativo }
    );
    if (!correlativoConfig) {
      throw new Error(`No se pudo obtener el correlativo para gestión ${gestionAnio} tras asegurarlo`);
    }

    const nuevoCorrelativo = parseInt(correlativoConfig.value, 10) + 1;
    this.logger.info('[Estudiantes] Nuevo correlativo calculado', {
      gestionAnio,
      correlativoAnterior: correlativoConfig.value,
      nuevoCorrelativo,
    });

    await this.configuracionSistemaRepository.update(
      correlativoConfig.id,
      { value: nuevoCorrelativo.toString() }
    );

    const codigoEstudiante = `${gestionAnio}${nuevoCorrelativo.toString().padStart(4, '0')}`;

    this.logger.info('[Estudiantes] Código de estudiante generado', {
      codigoEstudiante,
      gestionAnio,
      correlativo: nuevoCorrelativo,
      gestionIngresoId: gestionIngresoId || 'gestión actual',
    });

    return codigoEstudiante;
  }

  /**
   * Obtiene la gestión vigente actual desde la configuración del sistema.
   * Misma lógica que BaseDocumentGenerationUseCase._getCurrentManagement().
   *
   * @returns {Promise<Object>} Entidad Management (gestión vigente)
   * @throws {Error} Si no se encuentra la configuración o la gestión vigente
   */
  async _getCurrentManagement() {
    const gestionActualConfig = await this.configuracionSistemaRepository.findBy({
      key: 'gestion_actual',
    });
    if (!gestionActualConfig) {
      throw new Error('Configuración de gestión actual no encontrada');
    }
    const gestionAnio = parseInt(gestionActualConfig.value, 10);
    if (Number.isNaN(gestionAnio)) {
      throw new Error('La gestión actual configurada no es un año válido');
    }
    const management = await this.managementRepository.findBy({
      year: gestionAnio,
      vigente: true,
    });
    if (!management) {
      throw new Error(`No se encontró una gestión vigente para el año ${gestionAnio}`);
    }
    return management;
  }

  /**
   * Crea la deuda en pago_aporte para la gestión vigente si el estudiante aún no tiene cabecera para esa gestión.
   * Una sola cabecera por (estudiante, gestión). Monto base desde configuracion_aportes; sin beca al registro.
   *
   * @param {number} studentId - ID del estudiante recién creado
   */
  async _createPagoAporteIfNeeded(studentId) {
    if (!this.contributionPaymentRepository || !this.managementRepository || !this.contributionConfigurationRepository) {
      this.logger.warn('[Estudiantes] Repositorios de pago/gestión/config no inyectados; no se crea pago_aporte');
      return;
    }
    try {
      const management = await this._getCurrentManagement();
      const managementId = management.id ?? management.toPlainObject?.().id;

      const existing = await this.contributionPaymentRepository.findBy({
        studentId,
        managementId,
      });
      if (existing) {
        this.logger.info('[Estudiantes] Ya existe pago_aporte para estudiante y gestión vigente; no se crea otro', {
          studentId,
          managementId,
        });
        return;
      }

      const configResult = await this.contributionConfigurationRepository.findAll(
        { managementId, contributionActive: true },
        1,
        1
      );
      const list = configResult.contributionConfigurations ?? configResult.configuracionesAportes ?? [];
      const config = list[0] ?? null;
      const montoBase = config
        ? (parseFloat(config.baseAmount ?? config.montoBase) || 400)
        : 400;

      const pagoAporteData = {
        studentId,
        managementId,
        baseAmount: montoBase,
        scholarshipDiscount: 0,
        mandatoryAmount: montoBase,
        state: 'PENDIENTE',
      };
      await this.contributionPaymentRepository.create(pagoAporteData);
      this.logger.info('[Estudiantes] Deuda pago_aporte creada para gestión vigente', {
        studentId,
        managementId,
        montoBase,
      });
    } catch (err) {
      this.logger.error('[Estudiantes] Error al crear pago_aporte (no se bloquea el registro)', {
        studentId,
        error: err.message,
        stack: err.stack,
      });
      // No relanzar: el registro del estudiante ya fue exitoso; la deuda se puede crear después
    }
  }

  /**
   * Crea (o reutiliza) la institución de origen y el registro de transitabilidad
   * para estudiantes con tipo de admisión TRANSITABILIDAD.
   *
   * No lanza error si faltan datos mínimos; simplemente no crea el registro
   * para no interrumpir el flujo de registro.
   *
   * @param {Object} student - Entidad Student recién creada
   * @param {Object|null} transitability - Datos específicos de transitabilidad desde el DTO
   */
  async _createTransitabilityIfNeeded(student, transitability) {
    if (
      !this.institutionRepository ||
      !this.transitabilityRepository ||
      !student ||
      !transitability
    ) {
      return null;
    }

    const {
      institucionNombre,
      codigoSie,
      tipoInstitucion,
      dependencia,
      departamentoId,
      distritoEducativo,
      carreraOrigen,
      anioConclusion,
      regimenEstudios,
      estado,
      motivoNoProcedente,
    } = transitability;

    // Datos mínimos requeridos para crear transitabilidad
    // IMPORTANTE: carreraOrigen es NOT NULL en la tabla transitabilidades,
    // así que si viene vacío provocaríamos un error de base de datos.
    if (!institucionNombre || !tipoInstitucion || !carreraOrigen) {
      this.logger.warn(
        '[Estudiantes] Datos de transitabilidad incompletos; se omite creación de registro',
        {
          studentId: student.id,
          institucionNombre,
          tipoInstitucion,
          carreraOrigen,
        }
      );
      return null;
    }

    // 1. Buscar o crear institución de origen (UETHP / CEA)
    // Buscar SOLO por nombre + tipo para reutilizar la misma institución y no crear duplicados
    // (dependencia, departamento, distrito, codigoSie pueden variar entre formularios y provocar duplicados)
    const where = { name: institucionNombre, type: tipoInstitucion };
    let institution = await this.institutionRepository.findBy(where);
    if (!institution) {
      const institutionToCreate = {
        nombre: institucionNombre,
        tipo: tipoInstitucion,
        dependencia: dependencia || null,
        codigoSie: codigoSie || null,
        departamentoId: departamentoId || null,
        distritoEducativo: distritoEducativo || null,
      };
      institution = await this.institutionRepository.create(institutionToCreate);
    } else {
      // Actualizar campos opcionales si llegaron datos nuevos (evita perder distrito/dependencia/SIE)
      const institutionPlain = institution.toPlainObject ? institution.toPlainObject() : institution;
      const updates = {};
      if (dependencia != null && dependencia !== '') updates.dependencia = dependencia;
      if (codigoSie != null && codigoSie !== '') updates.codigoSie = codigoSie;
      if (departamentoId != null) updates.departamentoId = departamentoId;
      if (distritoEducativo != null && distritoEducativo !== '') updates.distritoEducativo = distritoEducativo;
      if (Object.keys(updates).length > 0) {
        institution = await this.institutionRepository.update(institutionPlain.id, { ...institutionPlain, ...updates });
      }
    }

    const institutionPlain = institution.toPlainObject
      ? institution.toPlainObject()
      : institution;
    const institucionOrigenId = institutionPlain.id;

    // 2. Crear registro en transitabilidades
    const transitabilityToCreate = {
      estudianteId: student.id,
      institucionOrigenId,
      carreraOrigen: carreraOrigen || null,
      anioConclusion: anioConclusion || null,
      regimenEstudios: regimenEstudios || null,
      estado: estado || 'SOLICITADO',
      motivoNoProcedente: motivoNoProcedente || null,
    };

    const transitabilityRecord = await this.transitabilityRepository.create(
      transitabilityToCreate
    );
    this.logger.info('[Estudiantes] Registro de transitabilidad creado', {
      studentId: student.id,
      transitabilityId:
        transitabilityRecord.id ??
        transitabilityRecord.toPlainObject?.().id ??
        null,
    });

    return transitabilityRecord;
  }

  /**
   * Crea (o reutiliza) la institución de origen y el registro de traspaso
   * para estudiantes con tipo de admisión TRASPASO.
   *
   * No lanza error si faltan datos mínimos; simplemente no crea el registro
   * para no interrumpir el flujo de registro.
   *
   * @param {Object} student - Entidad Student recién creada
   * @param {Object|null} transfer - Datos específicos de traspaso desde el DTO
   */
  async _createTransferIfNeeded(student, transfer) {
    if (!this.institutionRepository || !this.transferRepository || !student || !transfer) {
      return null;
    }

    const {
      institucionNombre,
      codigoRude,
      dependencia,
      departamentoId,
      distritoEducativo,
      carreraOrigen,
      anioCursado,
      regimenOrigen,
      estado,
      motivoNoProcedente,
    } = transfer;

    // Datos mínimos requeridos para crear traspaso
    if (!institucionNombre) {
      this.logger.warn(
        '[Estudiantes] Datos de traspaso incompletos; se omite creación de registro',
        {
          studentId: student.id,
        }
      );
      return null;
    }

    // 1. Buscar o crear institución de origen (ITT). Solo por nombre + tipo para no duplicar.
    const where = { name: institucionNombre, type: 'ITT' };
    let institution = await this.institutionRepository.findBy(where);
    if (!institution) {
      const institutionToCreate = {
        nombre: institucionNombre,
        tipo: 'ITT',
        dependencia: dependencia || null,
        codigoSie: null,
        departamentoId: departamentoId || null,
        distritoEducativo: distritoEducativo || null,
      };
      institution = await this.institutionRepository.create(institutionToCreate);
    } else {
      const institutionPlain = institution.toPlainObject ? institution.toPlainObject() : institution;
      const updates = {};
      if (dependencia != null && dependencia !== '') updates.dependencia = dependencia;
      if (departamentoId != null) updates.departamentoId = departamentoId;
      if (distritoEducativo != null && distritoEducativo !== '') updates.distritoEducativo = distritoEducativo;
      if (Object.keys(updates).length > 0) {
        institution = await this.institutionRepository.update(institutionPlain.id, { ...institutionPlain, ...updates });
      }
    }

    const institutionPlain = institution.toPlainObject
      ? institution.toPlainObject()
      : institution;
    const institucionOrigenId = institutionPlain.id;

    // 2. Crear registro en traspasos
    const transferToCreate = {
      estudianteId: student.id,
      institucionOrigenId,
      codigoRude: codigoRude || null,
      carreraOrigen: carreraOrigen || null,
      anioCursado: anioCursado || null,
      regimenOrigen: regimenOrigen || null,
      estado: estado || 'SOLICITADO',
      motivoNoProcedente: motivoNoProcedente || null,
    };

    const transferRecord = await this.transferRepository.create(transferToCreate);
    this.logger.info('[Estudiantes] Registro de traspaso creado', {
      studentId: student.id,
      transferId: transferRecord.id ?? transferRecord.toPlainObject?.().id ?? null,
    });

    return transferRecord;
  }

  /**
   * Ejecuta el caso de uso de registro de estudiante
   *
   * @param {Object} data - Datos del estudiante a registrar
   * @param {Object} data.student - Datos del estudiante principal
   * @param {Array} data.guardians - Array de apoderados
   * @param {Array} data.disabilities - Array de discapacidades
   * @param {Array} data.origins - Array de orígenes
   * @param {Object} data.documentation - Objeto con entregas de documentos (key: documentacionId)
   * @returns {Promise<Object>} Estudiante creado con todos sus datos relacionados
   *
   * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
   * NOTA: userId no se pasa porque actualmente no hay autenticación
   * Los repositorios tienen userId = null como default para los campos de auditoría
   */
  async execute(data) {
    this.logger.info('[Estudiantes] Iniciando registro de estudiante', {
      ci: data.student?.ci,
      expedicion: data.student?.expedicion,
    });

    try {
      // 1. Validar que no exista un estudiante con el mismo CI + expedición (par único)
      // Importante: validar siempre que haya CI; si expedición viene vacía o null, se trata como "sin expedición" (un solo permitido por CI)
      if (data.student?.ci) {
        const rawExpedicion = data.student.expedicion ?? null;
        const expedicionToCheck =
          rawExpedicion !== undefined &&
          rawExpedicion !== null &&
          String(rawExpedicion).trim() !== ''
            ? String(rawExpedicion).trim()
            : null;

        const existingStudent = await this.studentRepository.findBy({
          ci: data.student.ci,
          expedicion: expedicionToCheck,
        });

        if (existingStudent) {
          const expedicionLabel = expedicionToCheck
            ? expedicionToCheck
            : 'sin expedición';
          throw new Error(
            `Ya existe un estudiante con CI ${data.student.ci} ${expedicionLabel}`
          );
        }
      }

      // 2. Resolver tipo de admisión y datos académicos iniciales
      // Si se proporciona gestionIngresoId, usar esa gestión para generar el código
      // Esto permite registrar estudiantes antiguos con el código de su gestión original
      // Si llegan gestión/carrera pero no tipoAdmision, inferir ANTIGUO (evita guardar NUEVO por error)
      const hasGestionOrCarrera =
        (data.gestionIngresoId != null && data.gestionIngresoId !== '') ||
        (data.carreraId != null && data.carreraId !== '');
      const tipoAdmision =
        data.tipoAdmision && data.tipoAdmision !== ''
          ? data.tipoAdmision
          : hasGestionOrCarrera
          ? 'ANTIGUO'
          : 'NUEVO';
      const gestionIngresoId = data.gestionIngresoId || null;
      const carreraId = data.carreraId || null;

      this.logger.info('[Estudiantes] Datos de admisión recibidos en RegisterStudentUseCase', {
        tipoAdmision,
        gestionIngresoId,
        carreraId,
        transitability: data.transitability || null,
        transfer: data.transfer || null,
      });

      // 3. Generar el código del estudiante
      const studentCode = await this.generateStudentCode(gestionIngresoId);

      // 4. Crear el estudiante principal con el código generado
      const studentData = {
        ...data.student,
        studentCode, // Usar studentCode (dominio) en vez de codigoEstudiante (base de datos)
      };
      // NOTA: userId no se pasa porque actualmente no hay autenticación
      // El repositorio tiene userId = null como default
      const student = await this.studentRepository.create(studentData);
      this.logger.info('[Estudiantes] Estudiante creado', {
        studentId: student.id,
        studentCode: student.studentCode,
      });

      // 5. Crear apoderados (múltiples)
      const guardians = [];
      if (data.guardians && Array.isArray(data.guardians)) {
        for (const guardianData of data.guardians) {
          const guardianToCreate = {
            ...guardianData,
            studentId: student.id,
          };
          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const guardian = await this.studentGuardianRepository.create(guardianToCreate);
          guardians.push(guardian);
        }
        this.logger.info('[Estudiantes] Apoderados creados', {
          studentId: student.id,
          count: guardians.length,
        });
      }

      // 4.1 Crear registro de Transitabilidad / Traspaso si aplica (no bloqueante)
      try {
        if (tipoAdmision === 'TRANSITABILIDAD' && data.transitability) {
          await this._createTransitabilityIfNeeded(student, data.transitability);
        } else if (tipoAdmision === 'TRASPASO' && data.transfer) {
          await this._createTransferIfNeeded(student, data.transfer);
        }
      } catch (err) {
        // No bloquear el registro completo por errores en estos módulos
        this.logger.error(
          '[Estudiantes] Error al crear registro de transitabilidad/traspaso (no bloqueante)',
          {
            studentId: student.id,
            tipoAdmision,
            error: err.message,
            stack: err.stack,
          }
        );
      }

      // 5. Crear discapacidades (múltiples)
      const disabilities = [];
      if (data.disabilities && Array.isArray(data.disabilities)) {
        for (const disabilityData of data.disabilities) {
          const disabilityToCreate = {
            ...disabilityData,
            studentId: student.id,
          };
          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const disability = await this.studentDisabilityRepository.create(disabilityToCreate);
          disabilities.push(disability);
        }
        this.logger.info('[Estudiantes] Discapacidades creadas', {
          studentId: student.id,
          count: disabilities.length,
        });
      }

      // 6. Crear orígenes (el DTO ya construye el array correctamente según tipo de nacionalidad)
      // Lógica: BOLIVIANA/EXTRANJERA = 1 registro; DOBLE_NACIONALIDAD = 2 registros (principal + secundario)
      const origins = [];
      if (data.origins && Array.isArray(data.origins) && data.origins.length > 0) {
        for (const originData of data.origins) {
          const originToCreate = {
            studentId: student.id,
            countryId: originData.countryId || null,
            birthMunicipalityId: originData.birthMunicipalityId || null,
            birthCity: originData.birthCity || null,
            motherTongueId: originData.motherTongueId || null,
            secondaryLanguageId: originData.secondaryLanguageId || null,
            originType: originData.originType || 'BOLIVIANA',
            isPrincipal: originData.isPrincipal !== undefined ? originData.isPrincipal : true,
          };

          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const origin = await this.studentOriginRepository.create(originToCreate);
          origins.push(origin);
        }
        this.logger.info('[Estudiantes] Orígenes creados', {
          studentId: student.id,
          count: origins.length,
          tipos: origins.map(o => {
            const plain = o.toPlainObject ? o.toPlainObject() : o;
            return { tipo: plain.originType, principal: plain.isPrincipal };
          }),
        });
      }

      // 7. Crear entregas de documentos (múltiples)
      // Solo documentos de inscripción para NUEVO, ANTIGUO, TRANSITABILIDAD.
      // Inscripción + documentos de tipo TRASPASO solo cuando tipoAdmision === TRASPASO (IDs desde BD por tipo_documento).
      const traspasoDocumentacionIds = await this._getTraspasoDocumentacionIds();
      const documentDeliveries = [];
      if (data.documentation && typeof data.documentation === 'object') {
        for (const [docKey, docData] of Object.entries(data.documentation)) {
          const documentacionId = parseInt(docKey.replace('doc_', ''), 10);

          if (!isNaN(documentacionId) && docData) {
            if (tipoAdmision !== 'TRASPASO' && traspasoDocumentacionIds.includes(documentacionId)) {
              continue;
            }
            const deliveryToCreate = {
              studentId: student.id,
              documentacionId,
              entregado: docData.entregado !== undefined ? docData.entregado : false,
              enTramite: docData.enTramite !== undefined ? docData.enTramite : false,
              fechaEntrega: docData.fechaEntrega || null,
              observaciones: docData.observaciones || null,
            };

            // NOTA: userId no se pasa porque actualmente no hay autenticación
            // El repositorio tiene userId = null como default
            const delivery = await this.studentDocumentDeliveryRepository.create(deliveryToCreate);
            documentDeliveries.push(delivery);
          }
        }
        this.logger.info('[Estudiantes] Entregas de documentos creadas', {
          studentId: student.id,
          count: documentDeliveries.length,
        });
      }

      // 8. Crear datos académicos del estudiante (estudiantes_datos_academicos) con gestion_ingreso_id
      let academicData = null;
      if (this.studentAcademicDataRepository) {
        // Obtener gestión de ingreso (ya se obtuvo antes para generar el código)
        // Si no se proporcionó gestionIngresoId, obtener la gestión vigente
        let gestionIngresoIdFinal = gestionIngresoId;

        if (!gestionIngresoIdFinal) {
          // Si no se proporciona gestionIngresoId, obtener la gestión vigente
          try {
            const gestionVigente = await this._getCurrentManagement();
            gestionIngresoIdFinal = gestionVigente.id ?? gestionVigente.toPlainObject?.().id;
          } catch (err) {
            this.logger.warn('[Estudiantes] No se pudo obtener gestión vigente para datos académicos', {
              error: err.message,
            });
            // Continuar sin gestionIngresoId (será NULL)
            gestionIngresoIdFinal = null;
          }
        }

        // Crear datos académicos con gestion_ingreso_id y carrera_id
        // Para estudiantes ANTIGUOS, ambos campos son requeridos
        // Para estudiantes NUEVOS, se pueden dejar como null o usar valores por defecto
        // NOTA: El repositorio usa StudentAcademicDataMapper.toModel() que espera nombres de dominio (careerId, managementId)
        const academicDataToCreate = {
          studentId: student.id,
          managementId: gestionIngresoIdFinal || null, // dominio: managementId → BD gestion_ingreso_id
          careerId: carreraId || null, // dominio: careerId → BD carrera_id
          admissionType: tipoAdmision, // dominio: admissionType → BD tipo_admision
        };

        academicData = await this.studentAcademicDataRepository.create(academicDataToCreate);
        this.logger.info('[Estudiantes] Datos académicos creados', {
          studentId: student.id,
          academicDataId: academicData.id,
          gestionIngresoId: gestionIngresoIdFinal || null,
          carreraId: carreraId || null,
          tipoAdmision,
        });
      }

      // 9. Crear deuda en pago_aporte para la gestión vigente si no existe (una cabecera por estudiante por gestión)
      await this._createPagoAporteIfNeeded(student.id);

      // 10. Retornar el estudiante creado con todos sus datos relacionados
      const result = {
        student: student.toPlainObject ? student.toPlainObject() : student,
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
      };

      this.logger.info('[Estudiantes] Estudiante registrado exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al registrar estudiante', {
        error: error.message,
        stack: error.stack,
        ci: data.student?.ci,
        expedicion: data.student?.expedicion,
      });
      throw error;
    }
  }
}
