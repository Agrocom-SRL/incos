import { sequelize } from '../../../../infrastructure/database/sequelize.js';
import { ForbiddenError, ValidationError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import {
  expandirFechasClase,
  setDiasDesdeHorario,
  toISODate,
  hoyISO,
} from '../../../utils/asistenciaCalendario.js';
import {
  ESTADOS_ASISTENCIA_VALUES,
  ESTADOS_SESION_CLASE,
} from '../../../../domain/constants/asistencia.constants.js';

/**
 * Guarda la planilla de uno o varios días (lote, transaccional):
 *   1. Upsert de las `sesiones_clase` del/los día(s) ANTES de las marcas.
 *   2. Upsert SPARSE de las marcas (solo AUSENTE/TARDANZA; PRESENTE borra fila).
 *
 * Valida: fecha <= hoy, día válido (horario ∪ sesión especial existente), no neutro
 * (clase no dictada), sesión ABIERTA (no se edita una sesión cerrada).
 */
export class BulkRegistrarAsistenciaUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    sesionClaseRepository,
    attendanceRepository,
    asistenciaSesionViewRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.sesionClaseRepository = sesionClaseRepository;
    this.attendanceRepository = attendanceRepository;
    this.asistenciaSesionViewRepository = asistenciaSesionViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, body }) {
    const dias = Array.isArray(body?.dias) ? body.dias : [];
    if (dias.length === 0) {
      throw new ValidationError('Se requiere al menos un día con marcas');
    }

    const { gestionId } = await assertAsistenciaCursoAccess({
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

    // Días de clase del horario (para validar fecha válida) + clases no dictadas (neutros).
    const bloquesHorario =
      await this.asistenciaSesionViewRepository.listarBloquesHorario(asignacionIdNum);
    const diasSet = setDiasDesdeHorario(bloquesHorario);

    // Periodos para resolver periodo_academico_id por fecha (división BIMESTRE).
    const periodos =
      await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);

    const resolverPeriodoIdPorFecha = async (fecha) => {
      const p = (periodos ?? []).find(
        (x) => toISODate(x.fecha_inicio) <= fecha && fecha <= toISODate(x.fecha_fin),
      );
      if (!p) return null;
      return this.cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, Number(p.numero_orden));
    };

    let sesionesUpsert = 0;
    const marcasResumen = { creadas: 0, actualizadas: 0, borradas: 0, sin_cambio: 0 };

    await sequelize.transaction(async (t) => {
      // Las marcas cuelgan de la sesión: el upsert de cada día debe ser secuencial
      // dentro de la transacción (la sesión va antes que sus marcas), de ahí los await
      // en serie por diseño.
      /* eslint-disable no-await-in-loop */
      for (const dia of dias) {
        const fecha = toISODate(dia?.fechaClase);
        if (!fecha) {
          throw new ValidationError('fechaClase inválida en el lote');
        }
        // RESTRICCIÓN: no marcar fecha futura.
        if (fecha > hoy) {
          throw new ValidationError(`No se puede marcar una fecha futura (${fecha}).`);
        }

        const esEspecial = dia?.esEspecial === true;

        // ¿Día válido? Día de horario regular o sesión especial existente/declarada.
        const sesionExistente = await this.sesionClaseRepository.obtenerSesionPorFecha(
          asignacionIdNum,
          fecha,
          t,
        );
        const fechasHorario = new Set(expandirFechasClase(fecha, fecha, diasSet));
        const esDiaValido =
          fechasHorario.has(fecha) || esEspecial || sesionExistente?.esEspecial;
        if (!esDiaValido) {
          throw new ValidationError(`El día ${fecha} no corresponde a una clase del curso.`);
        }

        // Neutro por clase no dictada → no se permite marcar asistencia.
        const cnd = await this.asistenciaSesionViewRepository.listarClasesNoDictadas(
          asignacionIdNum,
          fecha,
          fecha,
        );
        if ((cnd ?? []).length > 0) {
          throw new ValidationError(
            `El día ${fecha} está registrado como clase no dictada (neutro).`,
          );
        }

        // Sesión cerrada → no editable.
        if (sesionExistente && sesionExistente.estado === ESTADOS_SESION_CLASE.CERRADA) {
          throw new ForbiddenError(
            `El registro del día ${fecha} está cerrado. Reabrí el bimestre para editar.`,
          );
        }

        const periodoAcademicoId = await resolverPeriodoIdPorFecha(fecha);

        // Upsert de la sesión ANTES de las marcas (prueba del día tomado).
        const { id: sesionClaseId } = await this.sesionClaseRepository.upsertSesion(
          asignacionIdNum,
          fecha,
          {
            esEspecial,
            motivo: esEspecial ? (dia?.motivo ?? null) : null,
            periodoAcademicoId,
            horaInicio: dia?.horaInicio ?? null,
            horaFin: dia?.horaFin ?? null,
          },
          usuarioId,
          t,
        );
        sesionesUpsert += 1;

        const marcas = Array.isArray(dia?.marcas) ? dia.marcas : [];
        for (const m of marcas) {
          const matriculaMateriaId = Number(m?.matriculaMateriaId);
          if (!Number.isFinite(matriculaMateriaId) || matriculaMateriaId < 1) {
            throw new ValidationError('matriculaMateriaId inválido en el lote');
          }
          const estado = String(m?.estado ?? '').toUpperCase();
          if (!ESTADOS_ASISTENCIA_VALUES.includes(estado)) {
            throw new ValidationError(`Estado de asistencia inválido: ${m?.estado}`);
          }

          const { accion } = await this.attendanceRepository.upsertMarcaSparse(
            {
              sesionClaseId,
              matriculaMateriaId,
              estado,
              usuarioId,
            },
            t,
          );
          marcasResumen[accion] = (marcasResumen[accion] ?? 0) + 1;
        }
      }
      /* eslint-enable no-await-in-loop */
    });

    this.logger.info('[Asistencia] Registro masivo guardado', {
      asignacionId: asignacionIdNum,
      sesionesUpsert,
      ...marcasResumen,
    });

    return { sesionesUpsert, marcas: marcasResumen };
  }
}
