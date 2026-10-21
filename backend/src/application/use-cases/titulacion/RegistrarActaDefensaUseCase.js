import { ValidationError, ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PROYECTO_GRADO,
  ESTADOS_ACTA_DEFENSA,
  RESULTADOS_ACTA_DEFENSA,
  TRIBUNAL_ACTA_DEFENSA_MIEMBROS,
  ROLES_INTEGRANTE_TUTORIA,
  ESTADOS_INTEGRANTE_TUTORIA,
} from '../../../domain/constants/titulacion.constants.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { parseNumero } from '../../utils/validacionEntrada.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { ActaDefensaMapper } from '../../mappers/titulacion/index.js';

/** Nombre institucional (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES). */
function buildNombreInstitucional({ lastName, motherLastName, firstName }) {
  return [lastName, motherLastName, firstName].filter(Boolean).join(' ').trim();
}

/**
 * Use Case: RegistrarActaDefensaUseCase
 * Módulo: Titulación (TIT), extensión 2026-08-01 (acta de defensa de grado)
 *
 * Registra el/los acta(s) de defensa de un proyecto en estado `DEFENSA`
 * (P3 resuelta: UNA acta por estudiante integrante ACTIVO — en PSP grupal
 * son N actas con el mismo tribunal y números correlativos). Al terminar,
 * DELEGA en `AprobarEtapaProyectoUseCase` (T11) la transición
 * `DEFENSA → APROBADO|REPROBADO` del proyecto (nota del TITULAR, fecha =
 * fecha de la defensa) — así `proyectos_grado` queda sincronizado sin
 * duplicar la máquina de estados ni el dictamen VIABILIDAD_TECNICA que ya
 * emite ese use case.
 *
 * El resultado (APRUEBA/REPRUEBA) se DERIVA en servidor contra
 * `notaMinimaAprobacion` de `configuracion_evaluacion` (seed 54) — misma
 * fuente que consume el centralizador/boletín (P2 resuelta); no se acepta
 * un `resultado` del cliente.
 */
export class RegistrarActaDefensaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.actaDefensaRepository
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.integranteProyectoRepository
   * @param {Object} params.teacherRepository - Tribunal: siempre docentes del instituto (P5)
   * @param {Object} params.calificacionContextoRepository
   * @param {Object} params.evaluationConfigurationRepository
   * @param {Object} params.aprobarEtapaProyectoUseCase - T11, se delega tras registrar
   * @param {ILogger} params.logger
   */
  constructor({
    actaDefensaRepository,
    proyectoGradoRepository,
    integranteProyectoRepository,
    teacherRepository,
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    aprobarEtapaProyectoUseCase,
    logger,
  }) {
    this.actaDefensaRepository = actaDefensaRepository;
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.integranteProyectoRepository = integranteProyectoRepository;
    this.teacherRepository = teacherRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.aprobarEtapaProyectoUseCase = aprobarEtapaProyectoUseCase;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {Object} body - { fechaDefensa, horaInicio, horaConclusion?, tribunal[3],
   *   calificaciones[{estudianteId, calificacionFinal}], numeroActa?, observaciones? }
   * @param {number|null} userId
   * @returns {Promise<{actasDefensa: Array<Object>}>}
   */
  async execute(proyectoGradoId, body = {}, userId = null) {
    const proyecto = await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    if (proyecto.estado !== ESTADOS_PROYECTO_GRADO.DEFENSA) {
      throw new ConflictError(
        `El proyecto debe estar en estado DEFENSA para registrar el acta (estado actual: ${proyecto.estado}).`
      );
    }

    const { fechaDefensa, horaInicio, horaConclusion } = this._validarHorario(body);
    const integrantesOrdenados = await this._resolverIntegrantesActivos(proyectoGradoId);
    const calificacionesPorEstudiante = this._validarCalificaciones(
      body.calificaciones,
      integrantesOrdenados
    );
    await this._validarSinActaPrevia(proyectoGradoId, integrantesOrdenados);
    const tribunalRows = await this._resolverTribunal(body.tribunal);

    const notaMinimaAprobacion = await this._resolverNotaMinimaAprobacion(proyecto.gestionId);

    const numeroActaBase = await this._resolverNumeroActaBase(
      proyecto.gestionId,
      body.numeroActa,
      integrantesOrdenados.length
    );

    let actasCreadas = [];
    try {
      await sequelize.transaction(async (transaction) => {
        const resultados = [];
        for (let i = 0; i < integrantesOrdenados.length; i += 1) {
          const integrante = integrantesOrdenados[i];
          const calificacionFinal = calificacionesPorEstudiante.get(integrante.estudianteId);
          const resultado =
            calificacionFinal >= notaMinimaAprobacion
              ? RESULTADOS_ACTA_DEFENSA.APRUEBA
              : RESULTADOS_ACTA_DEFENSA.REPRUEBA;

          const actaData = {
            proyectoGradoId,
            estudianteId: integrante.estudianteId,
            gestionId: proyecto.gestionId,
            numeroActa: numeroActaBase + i,
            fechaDefensa,
            horaInicio,
            horaConclusion,
            calificacionFinal,
            resultado,
            observaciones: body.observaciones ?? null,
            estado: ESTADOS_ACTA_DEFENSA.EMITIDA,
          };

          // eslint-disable-next-line no-await-in-loop
          const acta = await this.actaDefensaRepository.createConTribunal(
            actaData,
            tribunalRows,
            userId,
            { transaction }
          );
          resultados.push(acta);
        }
        actasCreadas = resultados;
      });
    } catch (error) {
      // Colisión de `numero_acta` bajo carrera (UNIQUE uk_gestion_numero) no
      // atrapada por la pre-validación (condición de carrera entre 2 requests
      // concurrentes) → 409 en vez de 500 crudo de Sequelize.
      if (error?.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictError('El número de acta ya está asignado en esta gestión.');
      }
      throw error;
    }

    const titular =
      integrantesOrdenados.find((i) => i.rol === ROLES_INTEGRANTE_TUTORIA.TITULAR) ??
      integrantesOrdenados[0];
    const actaTitular = actasCreadas.find((a) => a.estudianteId === titular.estudianteId);

    await this._delegarTransicionProyecto({
      proyectoGradoId,
      actaTitular,
      fechaDefensa,
      userId,
    });

    this.logger.info('[Titulación] Acta(s) de defensa registrada(s)', {
      proyectoGradoId,
      actas: actasCreadas.length,
      numeroActaBase,
    });

    return { actasDefensa: ActaDefensaMapper.toList(actasCreadas) };
  }

  /** @private Valida fecha/horas del acto. */
  _validarHorario(body) {
    if (!body.fechaDefensa) {
      throw new ValidationError('fechaDefensa es requerida');
    }
    if (!body.horaInicio) {
      throw new ValidationError('horaInicio es requerida');
    }
    if (body.horaConclusion && body.horaConclusion <= body.horaInicio) {
      throw new ValidationError('horaConclusion debe ser posterior a horaInicio');
    }
    return {
      fechaDefensa: body.fechaDefensa,
      horaInicio: body.horaInicio,
      horaConclusion: body.horaConclusion ?? null,
    };
  }

  /**
   * @private Integrantes ACTIVOS del proyecto, TITULAR primero.
   */
  async _resolverIntegrantesActivos(proyectoGradoId) {
    const integrantes = await this.integranteProyectoRepository.findByProyectoGradoId(
      proyectoGradoId
    );
    const activos = integrantes.filter(
      (i) => i.estado === ESTADOS_INTEGRANTE_TUTORIA.ACTIVO
    );
    if (activos.length === 0) {
      throw new ValidationError(
        'El proyecto no tiene integrantes activos: no es posible registrar el acta de defensa.'
      );
    }
    return activos.sort((a, b) => {
      if (a.rol === ROLES_INTEGRANTE_TUTORIA.TITULAR) return -1;
      if (b.rol === ROLES_INTEGRANTE_TUTORIA.TITULAR) return 1;
      return 0;
    });
  }

  /**
   * @private Valida `body.calificaciones`: debe cubrir EXACTAMENTE a los
   * integrantes ACTIVOS (P3: una acta por integrante, calificación individual).
   */
  _validarCalificaciones(calificaciones, integrantesActivos) {
    if (!Array.isArray(calificaciones) || calificaciones.length === 0) {
      throw new ValidationError('calificaciones debe ser un array con al menos un elemento');
    }
    const mapa = new Map();
    for (const item of calificaciones) {
      const estudianteId = Number(item?.estudianteId);
      if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
        throw new ValidationError('calificaciones[].estudianteId debe ser un entero positivo');
      }
      // `Number(null)` y `Number('')` dan 0: una nota ausente no puede emitirse como 0 que REPRUEBA.
      const nota = parseNumero(item?.calificacionFinal, 'calificaciones[].calificacionFinal', {
        min: 0,
        max: 100,
      });
      if (mapa.has(estudianteId)) {
        throw new ValidationError(
          `calificaciones tiene al estudiante ${estudianteId} repetido: una calificación por integrante`
        );
      }
      mapa.set(estudianteId, nota);
    }

    const idsActivos = new Set(integrantesActivos.map((i) => i.estudianteId));
    if (mapa.size !== idsActivos.size || [...idsActivos].some((id) => !mapa.has(id))) {
      throw new ValidationError(
        'calificaciones debe incluir exactamente una calificación por cada integrante ACTIVO del proyecto (uno por estudiante, sin faltantes ni sobrantes).'
      );
    }
    return mapa;
  }

  /** @private Ningún integrante puede tener ya un acta EMITIDA vigente. */
  async _validarSinActaPrevia(proyectoGradoId, integrantesActivos) {
    for (const integrante of integrantesActivos) {
      // eslint-disable-next-line no-await-in-loop
      const existente = await this.actaDefensaRepository.findEmitidaByProyectoEstudiante(
        proyectoGradoId,
        integrante.estudianteId
      );
      if (existente) {
        throw new ConflictError(
          `El estudiante con ID ${integrante.estudianteId} ya tiene un acta de defensa EMITIDA para este proyecto (acta ${existente.numeroActa}).`
        );
      }
    }
  }

  /**
   * @private Tribunal: EXACTAMENTE TRIBUNAL_ACTA_DEFENSA_MIEMBROS filas, cada
   * una con `docenteId` de un docente del instituto (P5: sin externos). El
   * nombre se toma en snapshot (orden institucional) al momento de registrar.
   */
  async _resolverTribunal(tribunal) {
    if (!Array.isArray(tribunal) || tribunal.length !== TRIBUNAL_ACTA_DEFENSA_MIEMBROS) {
      throw new ValidationError(
        `tribunal debe tener exactamente ${TRIBUNAL_ACTA_DEFENSA_MIEMBROS} miembros`
      );
    }

    const filas = [];
    const docentesVistos = new Set();
    for (let i = 0; i < tribunal.length; i += 1) {
      const item = tribunal[i];
      const docenteId = Number(item?.docenteId);
      if (!Number.isInteger(docenteId) || docenteId <= 0) {
        throw new ValidationError(
          'tribunal[].docenteId es requerido: el tribunal siempre está compuesto por docentes del instituto (P5), sin profesionales externos.'
        );
      }
      if (docentesVistos.has(docenteId)) {
        throw new ValidationError(
          'El tribunal debe estar formado por docentes distintos: hay un docente repetido.'
        );
      }
      docentesVistos.add(docenteId);
      // eslint-disable-next-line no-await-in-loop
      const docente = await this.teacherRepository.findById(docenteId);
      if (!docente) {
        throw new NotFoundError(`docente con ID ${docenteId}`);
      }
      filas.push({
        orden: i + 1,
        docenteId,
        nombreCompleto: buildNombreInstitucional(docente),
        cargo: item?.cargo ?? undefined,
      });
    }
    return filas;
  }

  /** @private Nota mínima de aprobación: misma fuente que centralizador/boletín (P2). */
  async _resolverNotaMinimaAprobacion(gestionId) {
    const cuotas = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });
    return cuotas.notaMinimaAprobacion;
  }

  /**
   * @private Autoasigna MAX+1 por gestión, o valida el override manual
   * (`numeroActa`) y el rango consecutivo que usarán las N actas (PSP).
   */
  async _resolverNumeroActaBase(gestionId, numeroActaManual, cantidadActas) {
    let base;
    if (numeroActaManual !== undefined && numeroActaManual !== null) {
      base = Number(numeroActaManual);
      if (!Number.isInteger(base) || base <= 0) {
        throw new ValidationError('numeroActa debe ser un entero positivo');
      }
    } else {
      base = (await this.actaDefensaRepository.maxNumeroActaByGestion(gestionId)) + 1;
    }

    for (let i = 0; i < cantidadActas; i += 1) {
      const numero = base + i;
      // eslint-disable-next-line no-await-in-loop
      const existente = await this.actaDefensaRepository.findBy({ gestionId, numeroActa: numero });
      if (existente) {
        throw new ConflictError(
          `El número de acta ${numero} ya está asignado en esta gestión.`
        );
      }
    }
    return base;
  }

  /**
   * @private Delega la transición DEFENSA → APROBADO|REPROBADO en T11
   * (AprobarEtapaProyectoUseCase), con la nota del TITULAR y la fecha de la
   * defensa — sincroniza `proyectos_grado` sin duplicar la máquina de
   * estados ni el dictamen VIABILIDAD_TECNICA.
   */
  async _delegarTransicionProyecto({ proyectoGradoId, actaTitular, fechaDefensa, userId }) {
    const destino =
      actaTitular.resultado === RESULTADOS_ACTA_DEFENSA.APRUEBA
        ? ESTADOS_PROYECTO_GRADO.APROBADO
        : ESTADOS_PROYECTO_GRADO.REPROBADO;

    await this.aprobarEtapaProyectoUseCase.execute(
      proyectoGradoId,
      {
        estado: destino,
        fecha: fechaDefensa,
        nota: actaTitular.calificacionFinal,
      },
      userId
    );
  }
}
