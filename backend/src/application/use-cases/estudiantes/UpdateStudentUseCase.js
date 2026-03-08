import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: UpdateStudentUseCase
 * Módulo: Estudiantes
 * Actualiza un estudiante existente con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Validar que no exista otro estudiante con el mismo CI (si se actualiza CI)
 * - Actualizar datos básicos del estudiante (actualización parcial)
 * - Actualizar apoderados (reemplazo completo)
 * - Actualizar discapacidades (reemplazo completo)
 * - Actualizar orígenes (reemplazo completo)
 * - Actualizar entregas de documentos (reemplazo completo)
 * - Actualizar datos académicos (tipoAdmision, gestionIngresoId, carreraId) si se envían
 * - Si tipoAdmision = NUEVO: usar gestión vigente (configuracion_sistema + gestiones vigente) para gestion_ingreso_id en datos académicos
 * - Al cambiar tipo de admisión: eliminar registros en transitabilidades/traspasos cuando el tipo final no corresponda
 * - Asegurar que exista la clave admision_gestion_YYYY en configuracion_sistema cuando se asigna gestionIngresoId (estudiante antiguo)
 * - Retornar el estudiante actualizado con todos sus datos relacionados
 *
 * NOTA: tipoAdmision, gestionIngresoId y carreraId actualizan estudiantes_datos_academicos (estado según schema).
 * NOTA: Si se asigna una gestión de ingreso (ANTIGUO), se garantiza que exista el correlativo para ese año en config.
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la actualización completa de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class UpdateStudentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} [params.studentAcademicDataRepository] - Repositorio de datos académicos (opcional)
   * @param {Object} [params.configuracionSistemaRepository] - Repositorio de configuración del sistema (para asegurar correlativo por gestión)
   * @param {Object} [params.managementRepository] - Repositorio de gestiones (para resolver año desde gestionIngresoId)
   * @param {Object} [params.institutionRepository] - Repositorio de instituciones (para transitabilidad/traspaso)
   * @param {Object} [params.transitabilityRepository] - Repositorio de transitabilidades
   * @param {Object} [params.transferRepository] - Repositorio de traspasos
   * @param {Object} [params.documentacionRepository] - Repositorio de documentación (para resolver IDs de documentos de traspaso por tipo)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    studentAcademicDataRepository,
    configuracionSistemaRepository,
    managementRepository,
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
    this.studentAcademicDataRepository = studentAcademicDataRepository || null;
    this.configuracionSistemaRepository = configuracionSistemaRepository || null;
    this.managementRepository = managementRepository || null;
    this.institutionRepository = institutionRepository || null;
    this.transitabilityRepository = transitabilityRepository || null;
    this.transferRepository = transferRepository || null;
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
   * Crea o actualiza la transitabilidad de un estudiante (TRANSITABILIDAD).
   *
   * @param {Object} student - Entidad Student (existente)
   * @param {Object} transitability - Datos específicos de transitabilidad desde el DTO
   */
  async _createOrUpdateTransitability(student, transitability) {
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

    // Datos mínimos requeridos para crear/actualizar transitabilidad
    if (!institucionNombre || !tipoInstitucion || !carreraOrigen) {
      this.logger.warn(
        '[Estudiantes] Datos de transitabilidad incompletos en actualización; se omite upsert',
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

    // 2. Buscar transitabilidad existente del estudiante
    const existing = await this.transitabilityRepository.findBy({
      studentId: student.id,
    });

    const payload = {
      estudianteId: student.id,
      institucionOrigenId,
      carreraOrigen,
      anioConclusion: anioConclusion || null,
      regimenEstudios: regimenEstudios || null,
      estado: estado || 'SOLICITADO',
      motivoNoProcedente: motivoNoProcedente || null,
    };

    let record = null;
    if (existing) {
      const plain = existing.toPlainObject ? existing.toPlainObject() : existing;
      record = await this.transitabilityRepository.update(plain.id, payload);
      this.logger.info('[Estudiantes] Transitabilidad actualizada', {
        studentId: student.id,
        transitabilityId: plain.id,
      });
    } else {
      record = await this.transitabilityRepository.create(payload);
      this.logger.info('[Estudiantes] Transitabilidad creada (update)', {
        studentId: student.id,
        transitabilityId: record.id ?? record.toPlainObject?.().id ?? null,
      });
    }

    return record;
  }

  /**
   * Crea o actualiza el traspaso de un estudiante (TRASPASO).
   *
   * @param {Object} student - Entidad Student (existente)
   * @param {Object} transfer - Datos específicos de traspaso desde el DTO
   */
  async _createOrUpdateTransfer(student, transfer) {
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

    // Datos mínimos requeridos para crear/actualizar traspaso
    if (!institucionNombre || !carreraOrigen) {
      this.logger.warn(
        '[Estudiantes] Datos de traspaso incompletos en actualización; se omite upsert',
        {
          studentId: student.id,
          institucionNombre,
          carreraOrigen,
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

    // 2. Buscar traspaso existente del estudiante
    const existing = await this.transferRepository.findBy({
      studentId: student.id,
    });

    const payload = {
      estudianteId: student.id,
      institucionOrigenId,
      codigoRude: codigoRude ?? null,
      carreraOrigen,
      anioCursado: anioCursado || null,
      regimenOrigen: regimenOrigen || null,
      estado: estado || 'SOLICITADO',
      motivoNoProcedente: motivoNoProcedente || null,
    };

    let record = null;
    if (existing) {
      const plain = existing.toPlainObject ? existing.toPlainObject() : existing;
      record = await this.transferRepository.update(plain.id, payload);
      this.logger.info('[Estudiantes] Traspaso actualizado', {
        studentId: student.id,
        transferId: plain.id,
      });
    } else {
      record = await this.transferRepository.create(payload);
      this.logger.info('[Estudiantes] Traspaso creado (update)', {
        studentId: student.id,
        transferId: record.id ?? record.toPlainObject?.().id ?? null,
      });
    }

    return record;
  }

  /**
   * Asegura que exista la clave admision_gestion_YYYY en configuracion_sistema para el año dado.
   * Si no existe, la crea con valor '0'. Necesario para estudiantes antiguos (varias gestiones).
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
   * Obtiene la gestión vigente actual desde la configuración del sistema.
   * Misma lógica que RegisterStudentUseCase._getCurrentManagement().
   * Se usa cuando tipoAdmision = NUEVO para asignar gestion_ingreso_id en datos académicos.
   *
   * @returns {Promise<Object|null>} Entidad Management (gestión vigente) o null si no está disponible
   */
  async _getCurrentManagement() {
    if (!this.configuracionSistemaRepository || !this.managementRepository) {
      return null;
    }
    try {
      const gestionActualConfig = await this.configuracionSistemaRepository.findBy({
        key: 'gestion_actual',
      });
      if (!gestionActualConfig) {
        return null;
      }
      const gestionAnio = parseInt(gestionActualConfig.value, 10);
      if (Number.isNaN(gestionAnio)) {
        return null;
      }
      const management = await this.managementRepository.findBy({
        year: gestionAnio,
        vigente: true,
      });
      return management || null;
    } catch (err) {
      this.logger.warn('[Estudiantes] No se pudo obtener gestión vigente', { error: err.message });
      return null;
    }
  }

  /**
   * Resuelve tipo de admisión, gestión de ingreso y carrera para la actualización de datos académicos.
   * Si tipo = NUEVO, usa gestión vigente (igual que en registro); si no, usa valores enviados en data.
   *
   * @param {Object} data - Payload del request (data.tipoAdmision, data.gestionIngresoId, data.carreraId)
   * @param {number} studentId - ID del estudiante (para logs)
   * @returns {Promise<{ tipoAdmision: string, isNuevo: boolean, gestionIngresoId: number|null, carreraId: number|null }>}
   */
  async _resolveGestionAndCarreraForAcademicUpdate(data, studentId) {
    const tipoAdmision = data.tipoAdmision;
    const isNuevo = tipoAdmision === 'NUEVO';
    let gestionIngresoId;
    if (isNuevo) {
      const gestionVigente = await this._getCurrentManagement();
      gestionIngresoId = gestionVigente
        ? (gestionVigente.id ?? (gestionVigente.toPlainObject ? gestionVigente.toPlainObject().id : null))
        : null;
      if (!gestionIngresoId) {
        this.logger.warn('[Estudiantes] Tipo NUEVO sin gestión vigente; datos académicos quedarán sin gestion_ingreso_id', {
          studentId,
        });
      }
    } else {
      gestionIngresoId = data.gestionIngresoId == null || data.gestionIngresoId === ''
        ? null
        : (typeof data.gestionIngresoId === 'number' ? data.gestionIngresoId : parseInt(data.gestionIngresoId, 10));
    }
    const carreraId = isNuevo
      ? null
      : (data.carreraId == null || data.carreraId === ''
        ? null
        : (typeof data.carreraId === 'number' ? data.carreraId : parseInt(data.carreraId, 10)));
    return { tipoAdmision, isNuevo, gestionIngresoId, carreraId };
  }

  /**
   * Elimina registros en transitabilidades/traspasos cuando el tipo de admisión final no corresponde.
   * - Si tipo !== TRANSITABILIDAD → eliminar cualquier transitabilidad del estudiante.
   * - Si tipo !== TRASPASO → eliminar cualquier traspaso del estudiante.
   *
   * @param {number} studentId - ID del estudiante
   * @param {Object} data - Payload (data.tipoAdmision)
   * @param {string} tipoAdmision - Tipo de admisión que quedará guardado
   */
  async _removeTransitabilidadAndTraspasoIfNotApplicable(studentId, data, tipoAdmision) {
    if (data.tipoAdmision === undefined) return;
    if (tipoAdmision !== 'TRANSITABILIDAD' && this.transitabilityRepository) {
      try {
        const existingTransitability = await this.transitabilityRepository.findBy({ studentId });
        if (existingTransitability) {
          const plain = existingTransitability.toPlainObject ? existingTransitability.toPlainObject() : existingTransitability;
          await this.transitabilityRepository.delete(plain.id);
          this.logger.info('[Estudiantes] Registro de transitabilidad eliminado (tipo de admisión no es TRANSITABILIDAD)', {
            studentId,
            transitabilityId: plain.id,
            tipoAdmision,
          });
        }
      } catch (err) {
        this.logger.warn('[Estudiantes] Error al eliminar transitabilidad (no bloquea la actualización)', {
          studentId,
          error: err.message,
        });
      }
    }
    if (tipoAdmision !== 'TRASPASO' && this.transferRepository) {
      try {
        const existingTransfer = await this.transferRepository.findBy({ studentId });
        if (existingTransfer) {
          const plain = existingTransfer.toPlainObject ? existingTransfer.toPlainObject() : existingTransfer;
          await this.transferRepository.delete(plain.id);
          this.logger.info('[Estudiantes] Registro de traspaso eliminado (tipo de admisión no es TRASPASO)', {
            studentId,
            transferId: plain.id,
            tipoAdmision,
          });
        }
      } catch (err) {
        this.logger.warn('[Estudiantes] Error al eliminar traspaso (no bloquea la actualización)', {
          studentId,
          error: err.message,
        });
      }
    }
  }

  /**
   * Determina si debe actualizarse el código del estudiante porque cambió el tipo de admisión o la gestión de ingreso.
   * El código debe reflejar el año de la gestión (igual que en RegisterStudentUseCase).
   * Casos: (1) Cambio de tipo de admisión con datos académicos previos. (2) Cambio de gestionIngresoId.
   * (3) Primera creación de datos académicos con gestión asignada (NUEVO vigente o ANTIGUO con gestión).
   *
   * @param {Object|null} existingAcademic - Datos académicos actuales o null
   * @param {Object} data - Payload (data.tipoAdmision, data.gestionIngresoId)
   * @param {string} tipoAdmision - Tipo que quedará
   * @param {number|null} gestionIngresoId - Gestión que quedará
   * @param {string|null} tipoAdmisionActual - Tipo actual en BD
   * @param {number|null} gestionIngresoIdActual - Gestión actual en BD
   * @returns {boolean}
   */
  _shouldUpdateStudentCode(existingAcademic, data, tipoAdmision, gestionIngresoId, tipoAdmisionActual, gestionIngresoIdActual) {
    const tieneDatosAcademicosPrevios = existingAcademic !== null;
    const tipoAdmisionCambio = tieneDatosAcademicosPrevios &&
      data.tipoAdmision !== undefined &&
      tipoAdmision !== tipoAdmisionActual;
    const gestionIngresoIdCambio = tieneDatosAcademicosPrevios &&
      gestionIngresoId !== gestionIngresoIdActual &&
      (data.gestionIngresoId !== undefined || (data.tipoAdmision !== undefined && tipoAdmision === 'ANTIGUO'));
    // Primera creación de datos académicos pero con gestión (NUEVO→vigente o ANTIGUO): código debe coincidir con ese año
    const crearConGestion = !tieneDatosAcademicosPrevios && gestionIngresoId != null;
    return tipoAdmisionCambio || gestionIngresoIdCambio || crearConGestion;
  }

  /**
   * Genera un nuevo código de estudiante para la gestión indicada y actualiza el estudiante.
   * Misma lógica que en registro: código YYYYNNNN según año de la gestión y correlativo.
   *
   * @param {number} studentId - ID del estudiante
   * @param {number|null} gestionIngresoIdForCode - ID de la gestión (null = gestión vigente en generateStudentCode)
   * @param {Object} existingStudent - Estudiante antes del cambio (para log codigoAnterior)
   * @param {Object|null} existingAcademicPlain - Datos académicos actuales (para log)
   * @param {string} tipoAdmision - Tipo que quedará
   * @param {number|null} gestionIngresoIdNuevo - Gestión que quedará
   * @throws {Error} Si falla la generación o actualización del código
   */
  async _updateStudentCodeForNewManagement(studentId, gestionIngresoIdForCode, existingStudent, existingAcademicPlain, tipoAdmision, gestionIngresoIdNuevo) {
    const nuevoCodigoEstudiante = await this.generateStudentCode(gestionIngresoIdForCode);
    await this.studentRepository.update(studentId, { studentCode: nuevoCodigoEstudiante });
    this.logger.info('[Estudiantes] Código de estudiante actualizado por cambio de tipo admisión/gestión (año de gestión)', {
      studentId,
      codigoAnterior: existingStudent.studentCode || existingStudent.codigoEstudiante,
      codigoNuevo: nuevoCodigoEstudiante,
      tipoAdmisionAnterior: existingAcademicPlain?.admissionType ?? existingAcademicPlain?.tipoAdmision ?? null,
      tipoAdmisionNuevo: tipoAdmision,
      gestionIngresoIdAnterior: existingAcademicPlain?.managementId ?? existingAcademicPlain?.gestionIngresoId ?? null,
      gestionIngresoIdNuevo: gestionIngresoIdNuevo,
    });
  }

  /**
   * Asegura que exista la clave admision_gestion_YYYY en configuracion_sistema para la gestión indicada.
   * Solo si gestionIngresoId no es null.
   *
   * @param {number|null} gestionIngresoId - ID de la gestión de ingreso
   */
  async _ensureAdmisionCorrelativoForGestionIfNeeded(gestionIngresoId) {
    if (gestionIngresoId == null || !this.managementRepository || !this.configuracionSistemaRepository) {
      return;
    }
    try {
      const gestionInfo = await this.managementRepository.findById(gestionIngresoId);
      if (gestionInfo) {
        const gestionPlain = gestionInfo.toPlainObject ? gestionInfo.toPlainObject() : gestionInfo;
        const gestionAnio = gestionPlain.year ?? gestionPlain.anio;
        if (typeof gestionAnio === 'number' && !Number.isNaN(gestionAnio)) {
          await this.ensureAdmisionCorrelativoForYear(gestionAnio);
        }
      }
    } catch (err) {
      this.logger.warn('[Estudiantes] No se pudo asegurar correlativo de gestión (no bloquea la actualización)', {
        gestionIngresoId,
        error: err.message,
      });
    }
  }

  /**
   * Actualiza o crea el registro en estudiantes_datos_academicos.
   *
   * @param {number} studentId - ID del estudiante
   * @param {Object} data - Payload (data.tipoAdmision, data.gestionIngresoId, data.carreraId)
   * @param {Object|null} existingAcademic - Datos académicos actuales o null
   * @param {string} tipoAdmision - Tipo que quedará
   * @param {number|null} gestionIngresoId - Gestión que quedará
   * @param {number|null} carreraId - Carrera que quedará
   */
  async _updateOrCreateAcademicData(studentId, data, existingAcademic, tipoAdmision, gestionIngresoId, carreraId) {
    if (existingAcademic) {
      const academicPlain = existingAcademic.toPlainObject ? existingAcademic.toPlainObject() : existingAcademic;
      const updatePayload = {};
      if (data.tipoAdmision !== undefined) {
        updatePayload.admissionType = data.tipoAdmision;
      }
      if (data.tipoAdmision === 'NUEVO') {
        updatePayload.managementId = gestionIngresoId;
        updatePayload.careerId = null;
      } else {
        if (data.gestionIngresoId !== undefined) updatePayload.managementId = gestionIngresoId;
        if (data.carreraId !== undefined) updatePayload.careerId = carreraId;
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.studentAcademicDataRepository.update(academicPlain.id, updatePayload);
        this.logger.info('[Estudiantes] Datos académicos actualizados', {
          studentId,
          academicDataId: academicPlain.id,
          tipoAdmision: data.tipoAdmision,
          gestionIngresoId,
          carreraId,
        });
      }
    } else {
      const createPayload = {
        studentId,
        managementId: gestionIngresoId,
        careerId: carreraId,
        admissionType: data.tipoAdmision ?? 'NUEVO',
      };
      await this.studentAcademicDataRepository.create(createPayload);
      this.logger.info('[Estudiantes] Datos académicos creados (no existían)', {
        studentId,
        tipoAdmision: data.tipoAdmision,
        gestionIngresoId,
        carreraId,
      });
    }
  }

  /**
   * Genera un nuevo código de estudiante basado en la gestión de ingreso y el correlativo.
   * Misma lógica que RegisterStudentUseCase.generateStudentCode.
   * 
   * @param {number|null} gestionIngresoId - ID de la gestión de ingreso (null para estudiantes nuevos)
   * @returns {Promise<string>} Código del estudiante generado (YYYYNNNN)
   */
  async generateStudentCode(gestionIngresoId = null) {
    if (!this.configuracionSistemaRepository) {
      throw new Error('configuracionSistemaRepository no está disponible');
    }

    let gestionAnio;
    let gestionInfo = null;

    // 1. Determinar qué gestión usar para generar el código
    if (gestionIngresoId) {
      // Estudiante antiguo: usar la gestión de ingreso proporcionada
      if (!this.managementRepository) {
        throw new Error('managementRepository no está disponible');
      }
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
   * Ejecuta el caso de uso de actualización de estudiante
   * 
   * @param {number} studentId - ID del estudiante a actualizar
   * @param {Object} data - Datos a actualizar
   * @param {Object} data.student - Datos básicos del estudiante (opcional, actualización parcial)
   * @param {Array} data.guardians - Array de apoderados (opcional, reemplazo completo)
   * @param {Array} data.disabilities - Array de discapacidades (opcional, reemplazo completo)
   * @param {Array} data.origins - Array de orígenes (opcional, reemplazo completo)
   * @param {Object} data.documentation - Objeto con entregas de documentos (opcional, reemplazo completo)
   * @returns {Promise<Object>} Estudiante actualizado con todos sus datos relacionados
   * 
   * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
   * NOTA: userId no se pasa porque actualmente no hay autenticación
   * Los repositorios tienen userId = null como default para los campos de auditoría
   * 
   * ESTRATEGIA DE ACTUALIZACIÓN:
   * - Datos básicos del estudiante: actualización parcial (solo campos proporcionados)
   * - Relaciones (guardians, disabilities, origins, documentDeliveries): reemplazo completo
   *   Si se proporcionan, se eliminan todas las existentes y se crean las nuevas.
   *   Si no se proporcionan, no se modifican las existentes.
   */
  async execute(studentId, data) {
    this.logger.info('[Estudiantes] Iniciando actualización de estudiante', {
      studentId,
      tieneStudentData: !!data.student,
      tieneGuardians: !!data.guardians,
      tieneDisabilities: !!data.disabilities,
      tieneOrigins: !!data.origins,
      tieneDocumentation: !!data.documentation,
    });

    try {
      // 1. Validar que el estudiante exista
      const existingStudent = await this.studentRepository.findById(studentId);
      if (!existingStudent) {
        throw new NotFoundError(`Estudiante con ID ${studentId}`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId: existingStudent.id,
        studentCode: existingStudent.studentCode,
      });

      // 2. Actualizar datos básicos del estudiante (si se proporcionan)
      let updatedStudent = existingStudent;
      if (data.student && Object.keys(data.student).length > 0) {
        // 2.1. Validar que no exista otro estudiante con el mismo CI (excluyendo al que se está editando)
        const studentData = data.student;
        if (studentData.ci || studentData.expedition) {
          const ciToCheck = studentData.ci || existingStudent.ci;
          // Normalizar: string vacío y null se tratan igual para la búsqueda
          const rawExpedicion = studentData.expedition ?? existingStudent.expedition;
          const expedicionToCheck = (rawExpedicion !== undefined && rawExpedicion !== null && String(rawExpedicion).trim() !== '')
            ? String(rawExpedicion).trim()
            : null;

          // Buscar otro estudiante con mismo CI+expedición EXCLUYENDO al actual (evita falso positivo en PUT)
          const result = await this.studentRepository.findAll(
            {
              ci: ciToCheck,
              expedicion: expedicionToCheck,
              excludeId: studentId,
            },
            1,
            10
          );
          const list = result.students || [];
          const anotherWithSameCI = list.length > 0 ? list[0] : null;
          if (anotherWithSameCI) {
            const expedicionLabel = expedicionToCheck ?? 'sin expedición';
            throw new Error(
              `Ya existe otro estudiante con CI ${ciToCheck} ${expedicionLabel}`
            );
          }
        }

        // 2.2. Actualizar el estudiante (solo campos proporcionados)
        // NOTA: userId no se pasa porque actualmente no hay autenticación
        updatedStudent = await this.studentRepository.update(studentId, studentData);
        this.logger.info('[Estudiantes] Datos básicos del estudiante actualizados', {
          studentId: updatedStudent.id,
          camposActualizados: Object.keys(studentData),
        });
      }

      // 3. Actualizar apoderados (actualización inteligente: update o create según corresponda; eliminar los que ya no vienen)
      let guardians = [];
      if (data.guardians !== undefined) {
        const existingGuardiansResult = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingGuardiansList = existingGuardiansResult.studentGuardians || [];
        const existingGuardiansById = new Map();
        for (const g of existingGuardiansList) {
          const plain = g.toPlainObject ? g.toPlainObject() : g;
          existingGuardiansById.set(Number(plain.id), plain);
        }

        const requestedIds = new Set();
        if (Array.isArray(data.guardians) && data.guardians.length > 0) {
          for (const guardianData of data.guardians) {
            const guardianId = guardianData.id != null && guardianData.id !== ''
              ? (typeof guardianData.id === 'number' ? guardianData.id : parseInt(guardianData.id, 10))
              : null;
            const exists = guardianId != null && !Number.isNaN(guardianId) &&
              existingGuardiansById.has(guardianId);

            if (exists) {
              const updatePayload = {
                relationshipTypeId: guardianData.relationshipTypeId,
                firstName: guardianData.firstName,
                lastName: guardianData.lastName,
                cellphone1: guardianData.cellphone1,
                cellphone2: guardianData.cellphone2,
                livesWithStudent: guardianData.livesWithStudent,
              };
              const updated = await this.studentGuardianRepository.update(guardianId, updatePayload);
              guardians.push(updated);
              requestedIds.add(guardianId);
              this.logger.info('[Estudiantes] Apoderado actualizado', { studentId, guardianId });
            } else {
              const createPayload = {
                relationshipTypeId: guardianData.relationshipTypeId,
                firstName: guardianData.firstName,
                lastName: guardianData.lastName,
                cellphone1: guardianData.cellphone1,
                cellphone2: guardianData.cellphone2,
                livesWithStudent: guardianData.livesWithStudent,
                studentId,
              };
              const created = await this.studentGuardianRepository.create(createPayload);
              guardians.push(created);
              this.logger.info('[Estudiantes] Apoderado creado', { studentId });
            }
          }
        }

        for (const [id] of existingGuardiansById) {
          if (!requestedIds.has(id)) {
            await this.studentGuardianRepository.delete(id);
            this.logger.info('[Estudiantes] Apoderado eliminado (ya no en la lista)', { studentId, guardianId: id });
          }
        }

        this.logger.info('[Estudiantes] Apoderados procesados', {
          studentId,
          total: guardians.length,
        });
      }

      // 4. Actualizar discapacidades (reemplazo completo si se proporcionan)
      let disabilities = [];
      if (data.disabilities !== undefined) {
        // 4.1. Eliminar discapacidades existentes
        const existingDisabilitiesResult = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingDisabilities = existingDisabilitiesResult.studentDisabilities || [];
        for (const disability of existingDisabilities) {
          const d = disability.toPlainObject ? disability.toPlainObject() : disability;
          await this.studentDisabilityRepository.delete(d.id);
        }
        this.logger.info('[Estudiantes] Discapacidades existentes eliminadas', {
          studentId,
          count: existingDisabilities.length,
        });

        // 4.2. Crear nuevas discapacidades si se proporcionan
        if (Array.isArray(data.disabilities) && data.disabilities.length > 0) {
          for (const disabilityData of data.disabilities) {
            const disabilityToCreate = {
              ...disabilityData,
              studentId: studentId,
            };
            // NOTA: userId no se pasa porque actualmente no hay autenticación
            const disability = await this.studentDisabilityRepository.create(disabilityToCreate);
            disabilities.push(disability);
          }
          this.logger.info('[Estudiantes] Nuevas discapacidades creadas', {
            studentId,
            count: disabilities.length,
          });
        }
      }

      // 5. Actualizar orígenes (reemplazo completo si se proporcionan, similar a apoderados)
      // El controller ya construye el array correctamente según tipo de nacionalidad
      let origins = [];
      if (data.origins !== undefined) {
        // 5.1. Obtener orígenes existentes y crear mapa por ID
        const existingOriginsResult = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingOriginsList = existingOriginsResult.studentOrigins || [];
        const existingOriginsById = new Map();
        for (const o of existingOriginsList) {
          const plain = o.toPlainObject ? o.toPlainObject() : o;
          existingOriginsById.set(Number(plain.id), plain);
        }

        // 5.2. Procesar orígenes del request (update/create según corresponda)
        const requestedIds = new Set();
        if (Array.isArray(data.origins) && data.origins.length > 0) {
          for (const originData of data.origins) {
            const originId = originData.id != null && originData.id !== ''
              ? (typeof originData.id === 'number' ? originData.id : parseInt(originData.id, 10))
              : null;
            const exists = originId != null && !Number.isNaN(originId) &&
              existingOriginsById.has(originId);

            if (exists) {
              // Actualizar origen existente
              const updatePayload = {
                countryId: originData.countryId !== undefined ? originData.countryId : null,
                birthMunicipalityId: originData.birthMunicipalityId !== undefined ? originData.birthMunicipalityId : null,
                birthCity: originData.birthCity !== undefined ? originData.birthCity : null,
                motherTongueId: originData.motherTongueId !== undefined ? originData.motherTongueId : null,
                secondaryLanguageId: originData.secondaryLanguageId !== undefined ? originData.secondaryLanguageId : null,
                originType: originData.originType,
                isPrincipal: originData.isPrincipal !== undefined ? originData.isPrincipal : true,
              };
              const updated = await this.studentOriginRepository.update(originId, updatePayload);
              origins.push(updated);
              requestedIds.add(originId);
              this.logger.info('[Estudiantes] Origen actualizado', { studentId, originId });
            } else {
              // Crear nuevo origen
              const createPayload = {
                studentId: studentId,
                countryId: originData.countryId || null,
                birthMunicipalityId: originData.birthMunicipalityId || null,
                birthCity: originData.birthCity || null,
                motherTongueId: originData.motherTongueId || null,
                secondaryLanguageId: originData.secondaryLanguageId || null,
                originType: originData.originType || 'BOLIVIANA',
                isPrincipal: originData.isPrincipal !== undefined ? originData.isPrincipal : true,
              };
              const created = await this.studentOriginRepository.create(createPayload);
              origins.push(created);
              this.logger.info('[Estudiantes] Origen creado', { studentId });
            }
          }
        }

        // 5.3. Eliminar orígenes que ya no están en el request
        for (const [id] of existingOriginsById) {
          if (!requestedIds.has(id)) {
            await this.studentOriginRepository.delete(id);
            this.logger.info('[Estudiantes] Origen eliminado (ya no en la lista)', { studentId, originId: id });
          }
        }

        this.logger.info('[Estudiantes] Orígenes procesados', {
          studentId,
          total: origins.length,
          tipos: origins.map(o => {
            const plain = o.toPlainObject ? o.toPlainObject() : o;
            return { tipo: plain.originType, principal: plain.isPrincipal };
          }),
        });
      }

      // 6. Actualizar entregas de documentos (actualización inteligente: update o create según corresponda)
      // Solo documentos de inscripción para NUEVO/ANTIGUO/TRANSITABILIDAD; inscripción + documentos de tipo TRASPASO solo para TRASPASO (IDs desde BD por tipo_documento).
      const traspasoDocumentacionIds = await this._getTraspasoDocumentacionIds();
      let documentDeliveries = [];
      if (data.documentation !== undefined) {
        // 6.1. Obtener entregas de documentos existentes y crear un mapa por documentacionId
        const existingDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingDeliveries = existingDeliveriesResult.studentDocumentDeliveries || [];
        
        // Crear mapa de entregas existentes por documentacionId
        // NOTA: Un estudiante puede tener múltiples entregas para el mismo documento (historial)
        // Pero para actualización, tomamos la última entrega activa por documentacionId
        const deliveryMapByDocumentacionId = new Map();
        for (const delivery of existingDeliveries) {
          const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
          const docId = deliveryPlain.documentacionId;
          // Si ya existe una entrega para este documentacionId, mantener la más reciente (mayor ID)
          if (!deliveryMapByDocumentacionId.has(docId) || 
              deliveryPlain.id > deliveryMapByDocumentacionId.get(docId).id) {
            deliveryMapByDocumentacionId.set(docId, deliveryPlain);
          }
        }

        this.logger.info('[Estudiantes] Entregas existentes encontradas', {
          studentId,
          count: existingDeliveries.length,
          unicasPorDocumento: deliveryMapByDocumentacionId.size,
        });

        // 6.2. Procesar entregas de documentos del request
        if (data.documentation && typeof data.documentation === 'object') {
          let tipoAdmisionParaDoc = data.tipoAdmision;
          if (tipoAdmisionParaDoc === undefined && this.studentAcademicDataRepository) {
            const academicResult = await this.studentAcademicDataRepository.findAll(
              { studentId },
              null,
              null
            );
            const academicList = academicResult.studentAcademicData || academicResult.studentAcademicDatas || [];
            const firstAcademic = academicList[0];
            if (firstAcademic) {
              const plain = firstAcademic.toPlainObject ? firstAcademic.toPlainObject() : firstAcademic;
              tipoAdmisionParaDoc = plain.admissionType ?? plain.tipoAdmision ?? null;
            }
          }
          const processedDocumentacionIds = new Set();

          for (const [docKey, docData] of Object.entries(data.documentation)) {
            const documentacionId = parseInt(docKey.replace('doc_', ''), 10);

            if (!isNaN(documentacionId) && docData) {
              if (tipoAdmisionParaDoc !== 'TRASPASO' && traspasoDocumentacionIds.includes(documentacionId)) {
                continue;
              }
              if (processedDocumentacionIds.has(documentacionId)) {
                this.logger.warn('[Estudiantes] Documento duplicado en request, ignorando', {
                  studentId,
                  documentacionId,
                  docKey,
                });
                continue;
              }
              processedDocumentacionIds.add(documentacionId);

              // Preparar datos de la entrega
              const entregado = docData.entregado !== undefined ? docData.entregado : false;
              const deliveryData = {
                entregado,
                enTramite: docData.enTramite !== undefined ? docData.enTramite : false,
                fechaEntrega: docData.fechaEntrega || null,
                // Si se marca como entregado, observaciones debe quedar null (no conservar motivo de no entrega)
                observaciones: entregado ? null : (docData.observaciones || null),
              };

              // Verificar si ya existe una entrega para este documentacionId
              const existingDelivery = deliveryMapByDocumentacionId.get(documentacionId);
              
              if (existingDelivery) {
                // 6.2.1. Actualizar entrega existente
                // NOTA: userId no se pasa porque actualmente no hay autenticación
                const updatedDelivery = await this.studentDocumentDeliveryRepository.update(
                  existingDelivery.id,
                  deliveryData
                );
                documentDeliveries.push(updatedDelivery);
                this.logger.info('[Estudiantes] Entrega de documento actualizada', {
                  studentId,
                  deliveryId: existingDelivery.id,
                  documentacionId,
                });
              } else {
                // 6.2.2. Crear nueva entrega
                const deliveryToCreate = {
                  ...deliveryData,
                  studentId: studentId,
                  documentacionId,
                };
                // NOTA: userId no se pasa porque actualmente no hay autenticación
                const newDelivery = await this.studentDocumentDeliveryRepository.create(deliveryToCreate);
                documentDeliveries.push(newDelivery);
                this.logger.info('[Estudiantes] Nueva entrega de documento creada', {
                  studentId,
                  documentacionId,
                });
              }
            }
          }

          // 6.3. Eliminar entregas que no están en el request (opcional: solo si se quiere limpiar)
          // NOTA: Por ahora NO eliminamos entregas que no están en el request para mantener historial
          // Si se quiere eliminar entregas no mencionadas, descomentar el siguiente bloque:
          /*
          const documentacionIdsInRequest = Array.from(processedDocumentacionIds);
          for (const [docId, existingDelivery] of deliveryMapByDocumentacionId.entries()) {
            if (!documentacionIdsInRequest.includes(docId)) {
              await this.studentDocumentDeliveryRepository.delete(existingDelivery.id);
              this.logger.info('[Estudiantes] Entrega de documento eliminada (no está en request)', {
                studentId,
                deliveryId: existingDelivery.id,
                documentacionId: docId,
              });
            }
          }
          */

          this.logger.info('[Estudiantes] Entregas de documentos procesadas', {
            studentId,
            actualizadas: documentDeliveries.filter(d => {
              const plain = d.toPlainObject ? d.toPlainObject() : d;
              return deliveryMapByDocumentacionId.has(plain.documentacionId);
            }).length,
            creadas: documentDeliveries.filter(d => {
              const plain = d.toPlainObject ? d.toPlainObject() : d;
              return !deliveryMapByDocumentacionId.has(plain.documentacionId);
            }).length,
            total: documentDeliveries.length,
          });
        }
      }

      // 7. Crear o actualizar registro de Transitabilidad / Traspaso si aplica (no bloqueante)
      try {
        if (data.transitability) {
          await this._createOrUpdateTransitability(updatedStudent, data.transitability);
        }
        if (data.transfer) {
          await this._createOrUpdateTransfer(updatedStudent, data.transfer);
        }
      } catch (err) {
        this.logger.error(
          '[Estudiantes] Error al crear/actualizar transitabilidad/traspaso (no bloqueante en update)',
          {
            studentId,
            error: err.message,
            stack: err.stack,
          }
        );
      }

      // 8. Actualizar datos académicos (estudiantes_datos_academicos) si se envían tipoAdmision, gestionIngresoId o carreraId
      // Permite: NUEVO → ANTIGUO (asignar gestión/carrera anterior) y ANTIGUO → NUEVO (limpiar para que lleve solo primer periodo)
      // Si cambia tipoAdmision o gestionIngresoId, se actualiza automáticamente el código del estudiante
      const hasAcademicPayload = data.tipoAdmision !== undefined ||
        data.gestionIngresoId !== undefined ||
        data.carreraId !== undefined;
      if (hasAcademicPayload && this.studentAcademicDataRepository) {
        // 7.1. Obtener datos académicos actuales para comparar cambios
        const academicResult = await this.studentAcademicDataRepository.findAll(
          { studentId },
          null,
          null
        );
        const academicList = academicResult.studentAcademicData || academicResult.studentAcademicDatas || [];
        const existingAcademic = academicList[0] || null;
        const existingAcademicPlain = existingAcademic
          ? (existingAcademic.toPlainObject ? existingAcademic.toPlainObject() : existingAcademic)
          : null;
        
        const tipoAdmisionActual = existingAcademicPlain?.admissionType || existingAcademicPlain?.tipoAdmision || null;
        const gestionIngresoIdActual = existingAcademicPlain?.managementId || existingAcademicPlain?.gestionIngresoId || null;

        // Resolver tipo, gestión y carrera (NUEVO → gestión vigente; resto → valores enviados)
        const { tipoAdmision, gestionIngresoId, carreraId } = await this._resolveGestionAndCarreraForAcademicUpdate(data, studentId);

        // Eliminar transitabilidad/traspaso si el tipo final no corresponde
        await this._removeTransitabilidadAndTraspasoIfNotApplicable(studentId, data, tipoAdmision);

        // Si cambió el tipo de admisión o la gestión de ingreso (año), actualizar código del estudiante (YYYYNNNN) como en registro
        const debeActualizarCodigo = this._shouldUpdateStudentCode(
          existingAcademic,
          data,
          tipoAdmision,
          gestionIngresoId,
          tipoAdmisionActual,
          gestionIngresoIdActual
        );
        if (debeActualizarCodigo && this.configuracionSistemaRepository) {
          try {
            await this._updateStudentCodeForNewManagement(
              studentId,
              gestionIngresoId,
              existingStudent,
              existingAcademicPlain,
              tipoAdmision,
              gestionIngresoId
            );
            updatedStudent = await this.studentRepository.findById(studentId);
          } catch (err) {
            this.logger.error('[Estudiantes] Error al actualizar código de estudiante', {
              studentId,
              error: err.message,
              stack: err.stack,
            });
            throw new Error(`No se pudo actualizar el código del estudiante: ${err.message}`);
          }
        }

        // Asegurar correlativo admision_gestion_YYYY para la gestión asignada
        await this._ensureAdmisionCorrelativoForGestionIfNeeded(gestionIngresoId);

        // Persistir datos académicos (update o create)
        await this._updateOrCreateAcademicData(studentId, data, existingAcademic, tipoAdmision, gestionIngresoId, carreraId);
      }

      // 8. Obtener el estudiante actualizado con todas sus relaciones
      // Si no se actualizaron relaciones, obtenerlas de la base de datos
      if (guardians.length === 0 && data.guardians === undefined) {
        const res = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        guardians = res.studentGuardians || [];
      }
      if (disabilities.length === 0 && data.disabilities === undefined) {
        const res = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        disabilities = res.studentDisabilities || [];
      }
      if (origins.length === 0 && data.origins === undefined) {
        const res = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        origins = res.studentOrigins || [];
      }
      if (documentDeliveries.length === 0 && data.documentation === undefined) {
        const res = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        documentDeliveries = res.studentDocumentDeliveries || [];
      }

      // 9. Retornar el estudiante actualizado con todos sus datos relacionados
      const result = {
        student: updatedStudent.toPlainObject ? updatedStudent.toPlainObject() : updatedStudent,
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

      this.logger.info('[Estudiantes] Estudiante actualizado exitosamente', {
        studentId: updatedStudent.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al actualizar estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
