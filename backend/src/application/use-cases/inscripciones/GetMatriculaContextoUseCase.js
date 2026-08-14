import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import {
  cargarEstructuraPlan,
  resolverPlanEstudioInscripcion,
  calcularMinPeriodoPendiente,
  ESTADOS_KARDEX_APROBADO,
  ESTADOS_KARDEX_CONCLUIDO,
} from './enrollmentBusinessRules.js';

/**
 * Use Case: GetMatriculaContextoUseCase
 * Módulo: Inscripciones
 *
 * GET /v1/inscripciones/contexto-matricula?estudiante_id=&carrera_id=&plan_estudio_id=
 *
 * Compone en UNA respuesta todo lo que el wizard de matrícula necesita para
 * armar sus pasos (rediseño 2026-08, docs/plan/matricula-wizard-rediseno.md §3-A3):
 * estudiante + datos académicos + traspaso, gestión vigente, carrera, planes
 * habilitados de la carrera en la gestión, plan resuelto, periodos con
 * asignaturas del plan (sigla/nombre/horas/modalidad/prerrequisito) anotadas
 * con el kardex del estudiante (vista 141) y resumen del historial.
 *
 * Sin vistas SQL nuevas: reutiliza repositorios existentes.
 * dataFieldName: 'contexto'.
 */
export class GetMatriculaContextoUseCase {
  constructor({
    studentRepository,
    studentAcademicDataRepository,
    enrollmentRepository,
    transferRepository,
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    careerRepository,
    periodRepository,
    planSubjectRepository,
    subjectRepository,
    prerequisiteRepository,
    historialAcademicoRepository,
    configuracionSistemaRepository,
    evaluationConfigurationRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.transferRepository = transferRepository;
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.prerequisiteRepository = prerequisiteRepository;
    this.historialAcademicoRepository = historialAcademicoRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.logger = logger;
  }

  /**
   * @param {{ estudianteId: number, carreraId?: number|null, planEstudioId?: number|null }} input
   * @returns {Promise<Object>} contexto (§3-A3 del plan de rediseño)
   */
  async execute({ estudianteId, carreraId = null, planEstudioId = null }) {
    const student = await this.studentRepository.findById(estudianteId);
    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${estudianteId}`);
    }

    // Datos académicos: fila activa más reciente del estudiante.
    const edaActivos = await this.studentAcademicDataRepository.findAll(
      { studentId: estudianteId },
      null,
      null
    );
    const edaRows = edaActivos.studentAcademicData ?? [];
    const eda = edaRows.length > 0 ? edaRows[edaRows.length - 1] : null;
    const carreraFijaId = eda?.careerId ?? null;

    // Carrera efectiva: fija del estudiante o la pedida (solo si no tiene fija).
    let carreraEfectivaId = carreraFijaId;
    if (carreraFijaId != null) {
      if (carreraId != null && Number(carreraId) !== Number(carreraFijaId)) {
        throw new ValidationError(
          'El estudiante ya tiene una carrera registrada; no puede generar el contexto de matrícula para otra carrera.'
        );
      }
    } else {
      if (carreraId == null) {
        throw new ValidationError(
          'Debe indicar la carrera (carrera_id) para generar el contexto de matrícula de un estudiante sin carrera registrada.'
        );
      }
      carreraEfectivaId = Number(carreraId);
    }

    const career = await this.careerRepository.findById(carreraEfectivaId);
    if (!career) {
      throw new NotFoundError(`Carrera con ID ${carreraEfectivaId}`);
    }

    const management = await this._getCurrentManagement();

    // Kardex (vista 141) + total de inscripciones activas en cualquier gestión.
    const historialFilas =
      await this.historialAcademicoRepository.listarFilasHistorialPorEstudiante(estudianteId);
    const totalInscripciones = await this._contarInscripcionesActivas(estudianteId);
    const esNuevoSistema = totalInscripciones === 0;

    // ¿Ya matriculado en la gestión vigente?
    let yaMatriculadoGestionActual = false;
    if (eda) {
      const enGestion = await this.enrollmentRepository.findAll(
        { academicDataId: eda.id, managementId: management.id },
        1,
        1
      );
      yaMatriculadoGestionActual = (enGestion.enrollments ?? []).length > 0;
    }

    // Traspaso más reciente (anio_cursado PRIMERO/SEGUNDO).
    const traspasoAnioCursado = await this._getTraspasoAnioCursado(estudianteId);

    // Planes habilitados de la carrera en la gestión (vista 56 vía repositorio).
    const planes = await this._getPlanesHabilitadosCarrera(management.id, carreraEfectivaId);

    // Plan resuelto: pedido (validado) > derivado del kardex > vigente de la carrera.
    const { studyPlan } = await resolverPlanEstudioInscripcion({
      requestedPlanId: planEstudioId,
      careerId: carreraEfectivaId,
      management,
      historialFilas,
      preferKardexOverRequested: false,
      studyPlanRepository: this.studyPlanRepository,
      managementPlanRepository: this.managementPlanRepository,
      logger: this.logger,
    });

    // Estructura del plan + anotación del kardex por asignatura.
    const estructura = await cargarEstructuraPlan({
      studyPlanId: studyPlan.id,
      periodRepository: this.periodRepository,
      planSubjectRepository: this.planSubjectRepository,
      subjectRepository: this.subjectRepository,
      prerequisiteRepository: this.prerequisiteRepository,
    });

    const kardexPorAsignatura = this._indexarKardexPorAsignatura(historialFilas, estructura);
    const periodos = this._buildPeriodosDto(estructura, kardexPorAsignatura);
    const resumenHistorial = this._buildResumenHistorial({
      estructura,
      kardexPorAsignatura,
      esNuevoSistema,
    });

    const notaMinimaAprobacion = await this._getNotaMinimaAprobacion(management.id);

    const nombreCompleto = [student.lastName, student.motherLastName, student.firstName]
      .filter((x) => String(x ?? '').trim())
      .join(' ')
      .trim();

    const contexto = {
      estudiante: {
        id: student.id,
        nombreCompleto: nombreCompleto || student.studentCode,
        codigoEstudiante: student.studentCode ?? null,
        ci: student.ci ?? null,
        tipoAdmision: eda?.admissionType ?? null,
        carreraId: carreraFijaId,
        carreraNombre: carreraFijaId != null ? career.name ?? null : null,
        esNuevoSistema,
        traspasoAnioCursado,
        yaMatriculadoGestionActual,
      },
      gestion: {
        id: management.id,
        anio: management.year ?? null,
        nombre: management.name ?? null,
      },
      carrera: {
        id: career.id,
        nombre: career.name ?? null,
        codigo: career.code ?? null,
      },
      planes,
      plan: {
        id: studyPlan.id,
        nombre: studyPlan.planName ?? null,
        vigente: studyPlan.isActive === true,
      },
      periodos,
      resumenHistorial,
      notaMinimaAprobacion,
    };

    this.logger.info('[Inscripciones] Contexto de matrícula generado', {
      estudianteId,
      carreraId: carreraEfectivaId,
      planEstudioId: studyPlan.id,
      esNuevoSistema,
      totalInscripciones,
      periodos: periodos.length,
    });

    return contexto;
  }

  /**
   * Gestión vigente desde configuración del sistema (mismo patrón que
   * CreateEnrollmentUseCase._getCurrentManagement).
   * @private
   */
  async _getCurrentManagement() {
    const config = await this.configuracionSistemaRepository.findBy({ key: 'gestion_actual' });
    if (!config || !config.value) {
      throw new ValidationError(
        'No se encontró la configuración de gestión actual. Por favor, configure el sistema.'
      );
    }

    const gestionYear = parseInt(config.value, 10);
    if (Number.isNaN(gestionYear)) {
      throw new ValidationError(
        `El valor de gestión actual (${config.value}) no es un año válido`
      );
    }

    const management = await this.managementRepository.findBy({
      year: gestionYear,
      vigente: true,
    });
    if (!management) {
      throw new ValidationError(
        `No se encontró una gestión vigente para el año ${gestionYear}. Por favor, configure el sistema.`
      );
    }
    return management;
  }

  /**
   * COUNT de inscripciones activas del estudiante en CUALQUIER gestión
   * (a través de todas sus filas de datos académicos, incluidas inactivas).
   * @private
   */
  async _contarInscripcionesActivas(estudianteId) {
    const edaTodos = await this.studentAcademicDataRepository.findAll(
      { studentId: estudianteId, includeInactive: true },
      null,
      null
    );
    const conteos = await Promise.all(
      (edaTodos.studentAcademicData ?? []).map((eda) =>
        this.enrollmentRepository.count({ academicDataId: eda.id })
      )
    );
    return conteos.reduce((acc, n) => acc + (Number(n) || 0), 0);
  }

  /**
   * Nota mínima de aprobación de la política institucional vigente
   * (configuracion_evaluacion.valor JSON — mismo camino que los use cases de
   * calificaciones, util cargarCuotasPoliticaGestion). Fallback 61 si no hay
   * configuración para la gestión (DEFAULT_POLITICA_DOCUMENTO).
   * @private
   * @param {number} gestionId
   * @returns {Promise<number>}
   */
  async _getNotaMinimaAprobacion(gestionId) {
    if (!this.evaluationConfigurationRepository) return 61;
    try {
      const cuotas = await cargarCuotasPoliticaGestion({
        evaluationConfigurationRepository: this.evaluationConfigurationRepository,
        gestionId,
      });
      const nota = Number(cuotas?.notaMinimaAprobacion);
      return Number.isFinite(nota) ? nota : 61;
    } catch (error) {
      this.logger.warn('[Inscripciones] No se pudo leer la política de evaluación; se usa 61', {
        gestionId,
        error: error.message,
      });
      return 61;
    }
  }

  /**
   * anio_cursado (PRIMERO/SEGUNDO) del traspaso activo más reciente del estudiante.
   * @private
   */
  async _getTraspasoAnioCursado(estudianteId) {
    const result = await this.transferRepository.findAll(
      { studentId: estudianteId },
      null,
      null
    );
    const transfers = result.transfers ?? [];
    if (transfers.length === 0) return null;
    const ultimo = transfers[transfers.length - 1];
    const plain = ultimo.toPlainObject ? ultimo.toPlainObject() : ultimo;
    return plain.anioCursado ?? plain.anio_cursado ?? null;
  }

  /**
   * Planes habilitados en la gestión para la carrera (vista 56 vía
   * ManagementPlanRepository.findPlanesDocenteAsignacionCatalog).
   * @private
   */
  async _getPlanesHabilitadosCarrera(gestionId, carreraId) {
    const { rows } = await this.managementPlanRepository.findPlanesDocenteAsignacionCatalog({
      gestionId,
      page: 1,
      limit: 500,
    });
    return (rows ?? [])
      .filter((row) => Number(row.carreraId) === Number(carreraId) && row.planEstudioId != null)
      .map((row) => ({
        id: row.planEstudioId,
        nombre: row.planNombre ?? row.nombre ?? null,
        resolucionMinisterial: row.planResolucion ?? null,
        vigente: row.planVigente === true || row.planVigente === 1,
      }));
  }

  /**
   * Indexa el kardex del estudiante por asignatura del plan resuelto:
   * estado concluido (APROBADO/CONVALIDADO/REPROBADO) + nota efectiva.
   * Prioridad: aprobada/convalidada gana sobre reprobada; empata la más reciente.
   * Match por asignatura_plan_id con fallback por sigla (planes duales).
   * @private
   */
  _indexarKardexPorAsignatura(historialFilas, estructura) {
    const porId = new Map();
    const porSigla = new Map();

    const pesoEstado = (estado) => (ESTADOS_KARDEX_APROBADO.includes(estado) ? 2 : 1);

    const filasConcluidas = (historialFilas ?? []).filter((fila) =>
      ESTADOS_KARDEX_CONCLUIDO.includes(String(fila.estado ?? '').toUpperCase())
    );
    for (const fila of filasConcluidas) {
      const estado = String(fila.estado ?? '').toUpperCase();
      const anotacion = {
        estado,
        nota: fila.nota_final != null ? Number(fila.nota_final) : null,
        anio: Number(fila.gestion_anio ?? 0) || 0,
      };

      const registrar = (map, clave) => {
        const previa = map.get(clave);
        if (
          !previa ||
          pesoEstado(estado) > pesoEstado(previa.estado) ||
          (pesoEstado(estado) === pesoEstado(previa.estado) && anotacion.anio >= previa.anio)
        ) {
          map.set(clave, anotacion);
        }
      };

      if (fila.asignatura_plan_id != null) {
        registrar(porId, Number(fila.asignatura_plan_id));
      }
      const sigla = String(fila.asignatura_sigla ?? '').trim().toUpperCase();
      if (sigla) registrar(porSigla, sigla);
    }

    return {
      dePlanSubject: (planSubject) => {
        const directa = porId.get(Number(planSubject.id));
        if (directa) return directa;
        const materiaId = Number(planSubject.subjectId ?? planSubject.materiaId);
        const sigla = String(estructura.siglaByMateriaId.get(materiaId) ?? '')
          .trim()
          .toUpperCase();
        return sigla ? porSigla.get(sigla) ?? null : null;
      },
    };
  }

  /**
   * periodos: [{ id, numero, nombre, asignaturas: [...] }] (§3-A3).
   * @private
   */
  _buildPeriodosDto(estructura, kardexPorAsignatura) {
    const buckets = new Map();
    for (const periodo of estructura.periodoById.values()) {
      buckets.set(periodo.id, {
        id: periodo.id,
        numero: periodo.numero,
        nombre: periodo.nombre,
        asignaturas: [],
      });
    }

    const ordenadas = [...estructura.planSubjects].sort((a, b) => {
      const oa = Number(a.displayOrder ?? 0) || 0;
      const ob = Number(b.displayOrder ?? 0) || 0;
      if (oa !== ob) return oa - ob;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    const conBucket = ordenadas.filter((ps) =>
      buckets.has(Number(ps.periodId ?? ps.periodoId))
    );
    for (const ps of conBucket) {
      const bucket = buckets.get(Number(ps.periodId ?? ps.periodoId));

      const materiaId = Number(ps.subjectId ?? ps.materiaId);
      const materia = estructura.materiaById.get(materiaId) ?? null;

      const prereqPlanSubjectId =
        estructura.prereqPlanSubjectIdByPlanSubjectId.get(Number(ps.id)) ?? null;
      let prerrequisito = null;
      if (prereqPlanSubjectId != null) {
        const prereqPs = estructura.planSubjectById.get(Number(prereqPlanSubjectId)) ?? null;
        const prereqMateriaId = Number(prereqPs?.subjectId ?? prereqPs?.materiaId);
        prerrequisito = {
          asignaturaPlanId: Number(prereqPlanSubjectId),
          materiaId: Number.isFinite(prereqMateriaId) ? prereqMateriaId : null,
          sigla: estructura.siglaByMateriaId.get(prereqMateriaId) ?? null,
        };
      }

      const anotacion = kardexPorAsignatura.dePlanSubject(ps);

      bucket.asignaturas.push({
        asignaturaPlanId: Number(ps.id),
        materiaId: Number.isFinite(materiaId) ? materiaId : null,
        sigla: materia?.acronym ?? materia?.sigla ?? null,
        nombre: materia?.name ?? materia?.nombre ?? null,
        horasSemanales: ps.weeklyHours ?? null,
        modalidad: ps.modality ?? null,
        prerrequisito,
        estadoHistorial: anotacion?.estado ?? null,
        notaFinal: anotacion?.nota ?? null,
      });
    }

    return [...buckets.values()].sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
  }

  /**
   * resumenHistorial: { totalAprobadas, totalPendientes, minPeriodoPendiente }.
   * minPeriodoPendiente = null si es nuevo en el sistema (§2 del plan).
   * @private
   */
  _buildResumenHistorial({ estructura, kardexPorAsignatura, esNuevoSistema }) {
    let totalAprobadas = 0;
    const estaAprobada = (ps) => {
      const anotacion = kardexPorAsignatura.dePlanSubject(ps);
      return anotacion != null && ESTADOS_KARDEX_APROBADO.includes(anotacion.estado);
    };
    for (const ps of estructura.planSubjects) {
      if (estaAprobada(ps)) totalAprobadas += 1;
    }
    const totalPendientes = estructura.planSubjects.length - totalAprobadas;

    const minPeriodoPendiente = esNuevoSistema
      ? null
      : calcularMinPeriodoPendiente({
          planSubjects: estructura.planSubjects,
          periodoById: estructura.periodoById,
          estaAprobada,
        });

    return { totalAprobadas, totalPendientes, minPeriodoPendiente };
  }
}
