import { ValidationError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import { PlanillaAsistenciaPresentationMapper } from '../../../mappers/asistencia/PlanillaAsistenciaPresentationMapper.js';
import {
  expandirFechasClase,
  expandirFeriados,
  enumerarFechasRango,
  setDiasDesdeHorario,
  toISODate,
  hoyISO,
  resolverBimestreActivo,
  semanaDeFecha,
} from '../../../utils/asistenciaCalendario.js';
import {
  ESTADOS_REGISTRO_ASISTENCIA,
  MOTIVOS_NEUTRO,
} from '../../../../domain/constants/asistencia.constants.js';

/**
 * Planilla de asistencia de un curso en un rango (semana o mes).
 *
 * Filas = estudiantes (roster), columnas = días de clase del rango. Cada celda lleva
 * estado/marca (P/R/F/L), neutralidad, si es futuro, si es día de clase y el estado de
 * la sesión. Incluye `diasValidos` (columnas con clase) y `registroEstado`.
 */
export class GetPlanillaAsistenciaSemanalUseCase {
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

  async execute({ usuarioId, asignacionId, desde, hasta }) {
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
    const hoy = hoyISO();

    // Rango: el solicitado si vino; si no, la semana (lun–sáb) vigente del bimestre activo.
    // El frontend no envía rango por defecto: el backend lo calcula según la fecha.
    let desdeIso = toISODate(desde);
    let hastaIso = toISODate(hasta);
    if (!desdeIso || !hastaIso) {
      const periodos =
        await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);
      const bimestreNum = resolverBimestreActivo(periodos, hoy);
      const periodo = (periodos ?? []).find((p) => Number(p.numero_orden) === bimestreNum);
      if (!periodo) {
        throw new ValidationError('No hay bimestre activo para derivar la semana');
      }
      const rangoBim = {
        desde: toISODate(periodo.fecha_inicio),
        hasta: toISODate(periodo.fecha_fin),
      };
      // Semana de hoy si cae en el bimestre; si no, la primera semana del bimestre.
      const ref = hoy >= rangoBim.desde && hoy <= rangoBim.hasta ? hoy : rangoBim.desde;
      const semana = semanaDeFecha(ref, rangoBim);
      desdeIso = semana.desde;
      hastaIso = semana.hasta;
    }
    if (!desdeIso || !hastaIso || desdeIso > hastaIso) {
      throw new ValidationError('Rango de fechas inválido');
    }

    const sesionRepo = this.asistenciaSesionViewRepository;
    const planillaRepo = this.asistenciaPlanillaViewRepository;
    const [bloquesHorario, roster, celdas, licenciasRoster, feriados, clasesNoDictadas] =
      await Promise.all([
        sesionRepo.listarBloquesHorario(asignacionIdNum),
        planillaRepo.listarRoster(asignacionIdNum),
        planillaRepo.listarCeldasPlanilla(asignacionIdNum, desdeIso, hastaIso),
        planillaRepo.listarLicenciasRoster(asignacionIdNum, desdeIso, hastaIso),
        sesionRepo.listarFeriadosCalendario(gestionId, desdeIso, hastaIso),
        sesionRepo.listarClasesNoDictadas(asignacionIdNum, desdeIso, hastaIso),
      ]);

    // Licencias APROBADAS por matrícula (rangos), para cruzar SIN depender de sesiones:
    // un día de clase dentro del rango debe marcar LICENCIA aunque no se haya tomado asistencia.
    const licenciaRangosPorMatricula = new Map();
    for (const l of licenciasRoster ?? []) {
      const key = Number(l.matricula_materia_id);
      const rango = { inicio: toISODate(l.fecha_inicio), fin: toISODate(l.fecha_fin) };
      if (!licenciaRangosPorMatricula.has(key)) licenciaRangosPorMatricula.set(key, []);
      licenciaRangosPorMatricula.get(key).push(rango);
    }
    const tieneLicenciaEnFecha = (matriculaMateriaId, fecha) =>
      (licenciaRangosPorMatricula.get(matriculaMateriaId) ?? []).some(
        (r) => r.inicio <= fecha && fecha <= r.fin,
      );

    // Días de clase (horario) ∪ fechas con sesión tomada (incluye especiales).
    const diasSet = setDiasDesdeHorario(bloquesHorario);
    const fechasClase = new Set(expandirFechasClase(desdeIso, hastaIso, diasSet));

    const sesionPorFecha = new Map();
    for (const c of celdas) {
      const f = toISODate(c.fecha_clase);
      if (!sesionPorFecha.has(f)) {
        sesionPorFecha.set(f, {
          sesionEstado: c.sesion_estado,
          esEspecial: c.es_especial === 1 || c.es_especial === true,
          motivo: c.motivo ?? null,
        });
      }
    }

    const feriadoSet = expandirFeriados(feriados);
    const cndPorFecha = new Map(
      (clasesNoDictadas ?? []).map((c) => [toISODate(c.fecha_clase), c.motivo ?? 'Clase no dictada']),
    );

    const todasFechas = new Set([...fechasClase, ...sesionPorFecha.keys()]);
    const fechasOrdenadas = [...todasFechas].sort();

    const neutroDeFecha = (fecha) => {
      if (feriadoSet.has(fecha)) return MOTIVOS_NEUTRO.FERIADO;
      if (cndPorFecha.has(fecha)) return MOTIVOS_NEUTRO.CLASE_NO_DICTADA;
      return null;
    };

    // diasValidos = columnas que cuentan (día de clase y no neutro institucional).
    const diasValidos = fechasOrdenadas.filter(
      (f) =>
        (fechasClase.has(f) || sesionPorFecha.get(f)?.esEspecial) && neutroDeFecha(f) == null,
    );

    // Celdas indexadas por matricula+fecha.
    const celdaPorClave = new Map();
    for (const c of celdas) {
      const f = toISODate(c.fecha_clase);
      celdaPorClave.set(`${c.matricula_materia_id}|${f}`, c);
    }

    const filas = (roster ?? []).map((est) => {
      const matriculaMateriaId = Number(est.matricula_materia_id);
      const dias = fechasOrdenadas.map((fecha) => {
        const sesion = sesionPorFecha.get(fecha) ?? null;
        const esDiaClase = fechasClase.has(fecha) || Boolean(sesion?.esEspecial);
        const neutroDia = neutroDeFecha(fecha);
        const celda = celdaPorClave.get(`${matriculaMateriaId}|${fecha}`) ?? null;
        const estado = celda?.estado ?? null;
        // Licencia: la del cruce por sesión (vista 133) O la del rango directo (sin sesión).
        const tieneLicencia =
          celda?.tiene_licencia === 1 ||
          celda?.tiene_licencia === true ||
          tieneLicenciaEnFecha(matriculaMateriaId, fecha);

        // Solo se deriva marca si hay sesión (día tomado); sin sesión no hay marca.
        let marca = null;
        let neutro = neutroDia;
        if (sesion != null) {
          const derivada = PlanillaAsistenciaPresentationMapper.derivarMarca({
            estado,
            tieneLicencia,
            neutroDia,
          });
          marca = derivada.marca;
          neutro = derivada.neutro;
        } else if (tieneLicencia && esDiaClase) {
          neutro = MOTIVOS_NEUTRO.LICENCIA;
        }

        return {
          fechaClase: fecha,
          estado: sesion != null ? estado : null,
          marca,
          neutro,
          esFuturo: fecha > hoy,
          esDiaClase,
          sesionEstado: sesion?.sesionEstado ?? null,
        };
      });

      return {
        matriculaMateriaId,
        estudianteId: est.estudiante_id ?? null,
        estudianteNombre: est.estudiante_nombre ?? '',
        estudianteCodigo: est.estudiante_codigo ?? null,
        dias,
      };
    });

    // Estado de registro: si todas las sesiones del rango están CERRADA → CERRADO.
    const sesiones = [...sesionPorFecha.values()];
    const registroEstado =
      sesiones.length > 0 && sesiones.every((s) => s.sesionEstado === 'CERRADA')
        ? ESTADOS_REGISTRO_ASISTENCIA.CERRADO
        : ESTADOS_REGISTRO_ASISTENCIA.ABIERTO;

    this.logger.info('[Asistencia] Planilla', {
      asignacionId: asignacionIdNum,
      desde: desdeIso,
      hasta: hastaIso,
      filas: filas.length,
      columnas: fechasOrdenadas.length,
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
      },
      rango: { desde: desdeIso, hasta: hastaIso },
      // Columnas = TODOS los días del rango (lun–sáb), no solo los de clase: la grilla
      // pinta cada día según su naturaleza (clase / feriado / sin clase) y deja el resto
      // como columnas vacías habilitables para una sesión especial.
      dias: enumerarFechasRango(desdeIso, hastaIso).map((fecha) => {
        const sesion = sesionPorFecha.get(fecha) ?? null;
        const esDiaClase = fechasClase.has(fecha) || Boolean(sesion?.esEspecial);
        const neutro = neutroDeFecha(fecha);
        return {
          fechaClase: fecha,
          esDiaClase,
          tieneAsistencia: sesion != null,
          neutro,
          esFuturo: fecha > hoy,
          esSesionEspecial: Boolean(sesion?.esEspecial),
          sesionEstado: sesion?.sesionEstado ?? null,
          // Día hábil sin clase ni feriado: se puede habilitar una sesión especial.
          puedeHabilitarEspecial: !esDiaClase && neutro == null,
        };
      }),
      diasValidos,
      registroEstado,
      filas,
    };
  }
}
