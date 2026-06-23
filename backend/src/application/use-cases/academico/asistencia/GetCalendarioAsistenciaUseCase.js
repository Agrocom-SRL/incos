import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import {
  expandirFechasClase,
  expandirFeriados,
  setDiasDesdeHorario,
  resumirHorarioSemanal,
  toISODate,
  hoyISO,
  resolverBimestreActivo,
} from '../../../utils/asistenciaCalendario.js';
import {
  ESTADOS_REGISTRO_ASISTENCIA,
  MOTIVOS_NEUTRO,
} from '../../../../domain/constants/asistencia.constants.js';

/**
 * Calendario de asistencia de un curso en un bimestre.
 *
 * Devuelve los días del bimestre (expansión horario → fechas, lógica de app) con su
 * estado: si toca clase, si ya se tomó asistencia (dot), si es neutro, si es futuro,
 * si fue sesión especial. Más los datos del curso y el estado de registro derivado.
 */
export class GetCalendarioAsistenciaUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    asistenciaSesionViewRepository,
    asistenciaPlanillaViewRepository,
    asistenciaRegistroEstadoViewRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.asistenciaSesionViewRepository = asistenciaSesionViewRepository;
    this.asistenciaPlanillaViewRepository = asistenciaPlanillaViewRepository;
    this.asistenciaRegistroEstadoViewRepository = asistenciaRegistroEstadoViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  /**
   * Resuelve el número de bimestre (1-4): el solicitado si es válido, si no el activo.
   * @param {number|string|undefined} bimestre solicitado (opcional)
   * @param {Array<Object>} periodos de la gestión
   * @returns {number|null}
   */
  _resolverBimestre(bimestre, periodos) {
    const pedido = Number(bimestre);
    if (Number.isFinite(pedido) && pedido >= 1 && pedido <= 4) {
      return pedido;
    }
    return resolverBimestreActivo(periodos);
  }

  async execute({ usuarioId, asignacionId, bimestre }) {
    const { cursoRow, ctx, gestionId } = await assertAsistenciaCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const asignacionIdNum = Number(asignacionId);

    // Rango del bimestre desde periodos_academicos (vista 105 vía cuadernoRepository).
    const periodos =
      await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);

    // Bimestre: el solicitado si vino; si no, el activo del calendario (abierto),
    // con respaldo al que contiene hoy y, en último caso, al último ya iniciado.
    const bimestreNum = this._resolverBimestre(bimestre, periodos);
    if (!bimestreNum) {
      throw new NotFoundError('Bimestre activo del curso');
    }

    const periodo = (periodos ?? []).find((p) => Number(p.numero_orden) === bimestreNum);
    if (!periodo) {
      throw new NotFoundError('Periodo académico del bimestre');
    }
    const periodoAcademicoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );

    const desde = toISODate(periodo.fecha_inicio);
    const hasta = toISODate(periodo.fecha_fin);
    const hoy = hoyISO();

    const [bloquesHorario, diasTomados, feriados, clasesNoDictadas, estadoRow, celdas] =
      await Promise.all([
        this.asistenciaSesionViewRepository.listarBloquesHorario(asignacionIdNum),
        this.asistenciaSesionViewRepository.listarDiasTomados(asignacionIdNum, desde, hasta),
        this.asistenciaSesionViewRepository.listarFeriadosCalendario(gestionId, desde, hasta),
        this.asistenciaSesionViewRepository.listarClasesNoDictadas(asignacionIdNum, desde, hasta),
        periodoAcademicoId
          ? this.asistenciaRegistroEstadoViewRepository.obtenerEstadoBimestre(
              asignacionIdNum,
              periodoAcademicoId,
            )
          : Promise.resolve(null),
        this.asistenciaPlanillaViewRepository.listarCeldasPlanilla(asignacionIdNum, desde, hasta),
      ]);

    // Resumen P/R/F/L del bimestre (1 celda = 1 estudiante × 1 sesión tomada).
    const resumen = { presentes: 0, atrasados: 0, faltantes: 0, conLicencia: 0, total: 0 };
    for (const c of celdas ?? []) {
      resumen.total += 1;
      if (c.tiene_licencia === 1 || c.tiene_licencia === true) resumen.conLicencia += 1;
      else if (c.estado === 'AUSENTE') resumen.faltantes += 1;
      else if (c.estado === 'TARDANZA') resumen.atrasados += 1;
      else resumen.presentes += 1; // estado NULL/PRESENTE = presente implícito (sparse)
    }

    // Nombre del docente (orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES).
    let docenteNombre = '';
    try {
      const docente = await this.teacherRepository.findById(Number(cursoRow.docente_id));
      const d = typeof docente?.toPlainObject === 'function' ? docente.toPlainObject() : docente;
      docenteNombre = [d?.lastName, d?.motherLastName, d?.firstName]
        .filter(Boolean)
        .join(' ')
        .trim();
    } catch {
      docenteNombre = '';
    }

    // Días sin clase (feriados/receso/vacaciones) del bimestre, para listar y pintar en rojo.
    const actividadesSinClase = (feriados ?? []).map((f) => ({
      id: f.actividad_calendario_id ?? null,
      nombre: f.nombre ?? 'Día sin clase',
      tipo: f.tipo ?? 'OTRO',
      fechaInicio: toISODate(f.fecha_inicio),
      fechaFin: toISODate(f.fecha_fin) ?? toISODate(f.fecha_inicio),
      estado: f.estado_actividad ?? null,
      esDestacada: f.es_destacada === 1 || f.es_destacada === true,
    }));

    // Horario semanal agrupado por día (día + horas) para mostrar en el sidebar.
    const horario = resumirHorarioSemanal(bloquesHorario);

    // Expansión día-de-semana → fechas reales (lógica de app, no SQL).
    const diasSet = setDiasDesdeHorario(bloquesHorario);
    const fechasClase = new Set(expandirFechasClase(desde, hasta, diasSet));

    // Índices de neutros por fecha.
    const feriadoPorFecha = expandirFeriados(feriados);
    const cndPorFecha = new Map(
      (clasesNoDictadas ?? []).map((c) => [toISODate(c.fecha_clase), c.motivo ?? 'Clase no dictada']),
    );

    // Sesiones tomadas indexadas por fecha (incluye sesiones especiales fuera de horario).
    const sesionPorFecha = new Map(
      (diasTomados ?? []).map((s) => [toISODate(s.fecha), s]),
    );

    // Fechas con asistencia REALMENTE registrada (hay celdas de planilla ese día).
    // Sirve para saber si una sesión especial puede eliminarse (solo si no tiene marcas).
    const fechasConMarcas = new Set((celdas ?? []).map((c) => toISODate(c.fecha_clase)));

    // Unión de fechas a mostrar: días de clase del horario ∪ fechas con sesión tomada
    // (las especiales pueden caer en días sin horario regular).
    const todasFechas = new Set([...fechasClase, ...sesionPorFecha.keys()]);
    const fechasOrdenadas = [...todasFechas].sort();

    const dias = fechasOrdenadas.map((fecha) => {
      const sesion = sesionPorFecha.get(fecha) ?? null;
      const esEspecial = sesion?.es_especial === 1 || sesion?.es_especial === true;
      const esDiaClase = fechasClase.has(fecha) || esEspecial;
      let neutro = null;
      if (feriadoPorFecha.has(fecha)) neutro = MOTIVOS_NEUTRO.FERIADO;
      else if (cndPorFecha.has(fecha)) neutro = MOTIVOS_NEUTRO.CLASE_NO_DICTADA;

      return {
        fechaClase: fecha,
        esDiaClase,
        tieneAsistencia: sesion != null,
        tieneMarcas: fechasConMarcas.has(fecha),
        neutro,
        esFuturo: fecha > hoy,
        esSesionEspecial: Boolean(sesion?.es_especial),
        motivo: sesion?.motivo ?? cndPorFecha.get(fecha) ?? null,
        horaInicio: sesion?.hora_inicio ?? null,
        horaFin: sesion?.hora_fin ?? null,
        sesionEstado: sesion?.sesion_estado ?? null,
      };
    });

    const registroEstado =
      estadoRow?.registro_estado === ESTADOS_REGISTRO_ASISTENCIA.CERRADO
        ? ESTADOS_REGISTRO_ASISTENCIA.CERRADO
        : ESTADOS_REGISTRO_ASISTENCIA.ABIERTO;

    this.logger.info('[Asistencia] Calendario', {
      asignacionId: asignacionIdNum,
      bimestre: bimestreNum,
      dias: dias.length,
      tomados: sesionPorFecha.size,
      registroEstado,
    });

    return {
      curso: {
        id: asignacionIdNum,
        materia: cursoRow.materia_nombre ?? '',
        materiaSigla: cursoRow.materia_sigla ?? null,
        carrera: cursoRow.carrera_nombre ?? '',
        paralelo: cursoRow.paralelo_nombre ?? '',
        turno: cursoRow.paralelo_turno ?? '',
        docente: docenteNombre,
        estudiantes: Number(cursoRow.cantidad_estudiantes ?? 0),
      },
      bimestre: bimestreNum,
      bimestreNombre: periodo.nombre ?? `Bimestre ${bimestreNum}`,
      bimestreColor: periodo.color_hex ?? null,
      periodoAcademicoId: periodoAcademicoId ?? null,
      anioCalendario: Number(String(desde).slice(0, 4)),
      gestion: ctx?.gestion_nombre ?? ctx?.gestion_anio ?? null,
      rango: { desde, hasta },
      hoy,
      registroEstado,
      resumen,
      horario,
      actividadesSinClase,
      dias,
    };
  }
}
