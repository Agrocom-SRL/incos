import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import {
  construirDatosCurso,
  normalizarRequisitos,
  sincronizarRequisitos,
  validarRequisitoAcreditaPago,
} from './helpers/cursoCapacitacionInput.js';
import {
  normalizarGrupos,
  sincronizarGrupos,
  validarAulasGrupos,
  validarHorariosGrupos,
  validarMatriculaGrupos,
} from './helpers/gruposCurso.js';

/**
 * Use Case: CreateCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Crea un curso de capacitación, sus grupos con sus horarios
 * (`capacitacion_grupos` + `capacitacion_horarios`) y su lista de requisitos de
 * inscripción (`capacitacion_requisitos`) en UNA transacción.
 *
 * - `tieneCosto`/`cobraMatricula` habilitan `costo` (del CURSO, se deposita a la
 *   entidad certificadora) y la matrícula (se paga en secretaría); con el
 *   interruptor apagado el monto se guarda en 0. La matrícula la fija cada GRUPO
 *   (`grupos[].costoMatricula`); `costoMatricula` del curso es solo el valor por defecto.
 * - `edicion` (etiqueta de la oferta) y `cursoOrigenId` (oferta de la que se copió, «Nueva
 *   edición») relacionan las ofertas de un mismo curso; cada oferta conserva su historial.
 * - Un curso sin grupos es válido (borrador PROPUESTO): la coherencia con la
 *   modalidad se valida al abrirlo (`AbrirCursoCapacitacionUseCase`).
 * - `fechaFin` es opcional (el curso puede definirse solo por `duracion`).
 * - El curso es conceptual: el aula (opcional, `grupos[].aulaId`) y los horarios
 *   viven en cada grupo.
 * - Los horarios (catálogo `horarios`) pueden ser de tipo CLASES o CAPACITACION.
 *
 * `estado` SIEMPRE se crea como PROPUESTO (máquina de estados de negocio):
 * cualquier `estado` recibido en el body se ignora. Las transiciones son
 * manuales vía `AbrirCursoCapacitacionUseCase`/`CancelarCursoCapacitacionUseCase`
 * o automáticas por fecha (ver `helpers/cursoEstadoEfectivo.js`).
 */
export class CreateCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository - Repo CRUD del curso + junction
   * @param {Object} params.capacitacionRequisitoRepository - Repo de requisitos del curso
   * @param {Object} params.grupoCapacitacionRepository - Repo de grupos del curso
   * @param {Object} params.bloqueCapacitacionRepository - Repo de horarios por grupo
   * @param {Object} params.inscripcionCapacitacionRepository - Para validar la baja de grupos
   * @param {Object} params.scheduleRepository - Catálogo `horarios` (validación de bloques)
   * @param {Object} params.classroomRepository - Catálogo `aulas` (validación de aula)
   * @param {ILogger} params.logger
   */
  constructor({
    cursoCapacitacionRepository,
    capacitacionRequisitoRepository,
    grupoCapacitacionRepository,
    bloqueCapacitacionRepository,
    inscripcionCapacitacionRepository,
    scheduleRepository,
    classroomRepository,
    logger,
  }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.capacitacionRequisitoRepository = capacitacionRequisitoRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.bloqueCapacitacionRepository = bloqueCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos del curso (+ grupos y requisitos opcionales)
   * @param {number|null} userId - Usuario que crea (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(body = {}, userId = null) {
    const data = {
      ...construirDatosCurso(body),
      // Siempre PROPUESTO al crear: ignora cualquier `estado` del body.
      estado: ESTADOS_CAPACITACION.PROPUESTO,
    };
    if (data.cursoOrigenId !== null) {
      const origen = await this.cursoCapacitacionRepository.findById(data.cursoOrigenId);
      if (!origen) throw new NotFoundError('curso de capacitación de origen');
    }
    const grupos = normalizarGrupos(body.grupos) ?? [];
    const requisitos = normalizarRequisitos(body.requisitos) ?? [];
    validarRequisitoAcreditaPago(requisitos, data.entidadCertificadora);

    validarMatriculaGrupos({
      cobraMatricula: data.cobraMatricula,
      costoMatriculaCurso: data.costoMatricula,
      grupos,
    });
    await validarAulasGrupos(this.classroomRepository, grupos);
    await validarHorariosGrupos(this.scheduleRepository, grupos);

    let created = null;
    let requisitosCreados = [];
    let gruposCreados = { grupos: [], bloques: [] };
    await sequelize.transaction(async (transaction) => {
      created = await this.cursoCapacitacionRepository.create(data, userId, { transaction });
      if (grupos.length > 0) {
        gruposCreados = await sincronizarGrupos({
          grupoCapacitacionRepository: this.grupoCapacitacionRepository,
          bloqueCapacitacionRepository: this.bloqueCapacitacionRepository,
          inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
          capacitacionId: created.id,
          grupos,
          userId,
          transaction,
        });
      }
      if (requisitos.length > 0) {
        requisitosCreados = await sincronizarRequisitos({
          capacitacionRequisitoRepository: this.capacitacionRequisitoRepository,
          capacitacionId: created.id,
          requisitos,
          userId,
          transaction,
        });
      }
    });

    this.logger.info('[Capacitación] Curso de capacitación creado', {
      id: created.id,
      grupos: grupos.length,
      requisitos: requisitos.length,
    });

    const presentation = CursoCapacitacionMapper.entityToPresentation(created);
    presentation.grupos = CursoCapacitacionMapper.gruposDeCursoToPresentation(
      gruposCreados.grupos,
      gruposCreados.bloques
    );
    presentation.requisitos = CursoCapacitacionMapper.requisitosToPresentation(requisitosCreados);
    presentation.requisitoAcreditaPagoCurso = CursoCapacitacionMapper.requisitoAcreditaPagoCurso(
      presentation.requisitos
    );
    return { cursoCapacitacion: presentation };
  }
}
