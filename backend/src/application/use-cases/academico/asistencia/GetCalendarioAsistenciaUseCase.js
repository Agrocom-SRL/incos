import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import {
  expandirFechasClase,
  expandirFeriados,
  setDiasDesdeHorario,
  toISODate,
  hoyISO,
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
    this.asistenciaRegistroEstadoViewRepository = asistenciaRegistroEstadoViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    const { cursoRow, gestionId } = await assertAsistenciaCursoAccess({
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

    const [bloquesHorario, diasTomados, feriados, clasesNoDictadas, estadoRow] =
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
      ]);

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
        neutro,
        esFuturo: fecha > hoy,
        esSesionEspecial: Boolean(sesion?.es_especial),
        motivo: sesion?.motivo ?? cndPorFecha.get(fecha) ?? null,
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
        estudiantes: Number(cursoRow.cantidad_estudiantes ?? 0),
      },
      bimestre: bimestreNum,
      periodoAcademicoId: periodoAcademicoId ?? null,
      rango: { desde, hasta },
      registroEstado,
      dias,
    };
  }
}
