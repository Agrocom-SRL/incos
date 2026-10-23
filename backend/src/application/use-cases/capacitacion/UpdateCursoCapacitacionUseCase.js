import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import {
  construirDatosCurso,
  normalizarRequisitos,
  sincronizarRequisitos,
  tienePagoCursoExterno,
  validarRequisitoAcreditaPago,
} from './helpers/cursoCapacitacionInput.js';
import { recalcularInscripcionesDeCurso } from './helpers/estadoInscripcion.js';
import {
  normalizarGrupos,
  sincronizarGrupos,
  validarAulasGrupos,
  validarMatriculaGrupos,
  validarHorariosGrupos,
} from './helpers/gruposCurso.js';

/**
 * Use Case: UpdateCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Actualiza un curso de capacitación. Si el payload trae `grupos`, SINCRONIZA
 * los grupos y sus horarios por diferencia (conserva los ids que siguen, da de
 * baja los ausentes y crea los nuevos; quitar un grupo con inscripciones
 * vigentes lanza 409); si trae `requisitos`,
 * sincroniza la lista de requisitos (actualiza los que traen `id`, crea los
 * nuevos y da de baja lógica los ausentes). Todo en UNA transacción.
 *
 * Costo externo: con `entidadCertificadora` el costo del curso se deposita a esa
 * entidad; a lo sumo un requisito (`acreditaPagoCurso`) acredita el depósito y
 * solo es válido con entidad. Si cambia la entidad o cuál requisito acredita el
 * depósito, se recalculan los estados de las inscripciones del curso.
 *
 * `fechaFin: null` (o '') la deja sin fecha de fin (es opcional). El aula
 * (opcional) se indica por grupo en `grupos[].aulaId`.
 *
 * `estado` (máquina de estados de negocio) NO se puede mutar por este endpoint
 * bajo ninguna circunstancia: cualquier `estado` recibido en el body se
 * ignora. Las únicas vías son las transiciones manuales
 * `AbrirCursoCapacitacionUseCase`/`CancelarCursoCapacitacionUseCase` o el
 * cálculo automático por fecha (ver `helpers/cursoEstadoEfectivo.js`).
 */
export class UpdateCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository - Repo CRUD del curso + junction
   * @param {Object} params.capacitacionRequisitoRepository - Repo de requisitos del curso
   * @param {Object} params.grupoCapacitacionRepository - Repo de grupos del curso
   * @param {Object} params.bloqueCapacitacionRepository - Repo de horarios por grupo
   * @param {Object} params.inscripcionCapacitacionRepository - Para validar la baja de grupos
   * @param {Object} params.scheduleRepository - Catálogo `horarios` (validación de bloques)
   * @param {Object} params.classroomRepository - Catálogo `aulas` (validación de aula)
   * @param {Object} params.pagoCapacitacionRepository - Para recalcular estados de las inscripciones
   * @param {Object} params.capacitacionInscritoRequisitoRepository - Idem
   * @param {Object} params.capacitacionCompromisoRepository - Idem
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
    pagoCapacitacionRepository,
    capacitacionInscritoRequisitoRepository,
    capacitacionCompromisoRepository,
    logger,
  }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.capacitacionRequisitoRepository = capacitacionRequisitoRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.bloqueCapacitacionRepository = bloqueCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @param {Object} body - Campos a actualizar (+ grupos y requisitos opcionales)
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const existing = await this.cursoCapacitacionRepository.findById(id, { paranoid: false });
    if (!existing) throw new NotFoundError('curso de capacitación');

    const updateData = construirDatosCurso(body, existing);
    const grupos = normalizarGrupos(body.grupos);
    const requisitos = normalizarRequisitos(body.requisitos);

    // Requisito que acredita el pago del curso: coherente con la entidad FINAL del curso
    const entidadFinal =
      'entidadCertificadora' in updateData
        ? updateData.entidadCertificadora
        : existing.entidadCertificadora;
    const cambioCostoExterno = tienePagoCursoExterno(entidadFinal) !== tienePagoCursoExterno(existing);
    if (requisitos !== null) {
      validarRequisitoAcreditaPago(requisitos, entidadFinal);
    } else if (cambioCostoExterno && !tienePagoCursoExterno(entidadFinal)) {
      validarRequisitoAcreditaPago(
        await this.capacitacionRequisitoRepository.findByCapacitacionId(id),
        entidadFinal
      );
    }

    if (grupos !== null) {
      validarMatriculaGrupos({
        cobraMatricula: 'cobraMatricula' in updateData ? updateData.cobraMatricula : existing.cobraMatricula,
        costoMatriculaCurso:
          'costoMatricula' in updateData ? updateData.costoMatricula : existing.costoMatricula,
        grupos,
      });
      await validarAulasGrupos(this.classroomRepository, grupos);
      await validarHorariosGrupos(this.scheduleRepository, grupos);
    }

    let updated = existing;
    let requisitosFinales = null;
    let gruposFinales = null;
    await sequelize.transaction(async (transaction) => {
      if (Object.keys(updateData).length > 0) {
        updated = await this.cursoCapacitacionRepository.update(id, updateData, userId, {
          transaction,
        });
      }
      if (grupos !== null) {
        gruposFinales = await sincronizarGrupos({
          grupoCapacitacionRepository: this.grupoCapacitacionRepository,
          bloqueCapacitacionRepository: this.bloqueCapacitacionRepository,
          inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
          capacitacionId: id,
          grupos,
          userId,
          transaction,
        });
      }
      let acreditaAntes = null;
      if (requisitos !== null) {
        const previos = await this.capacitacionRequisitoRepository.findByCapacitacionId(id, {
          transaction,
        });
        acreditaAntes = previos.find((r) => r.acreditaPagoCurso)?.id ?? null;
        requisitosFinales = await sincronizarRequisitos({
          capacitacionRequisitoRepository: this.capacitacionRequisitoRepository,
          capacitacionId: id,
          requisitos,
          userId,
          transaction,
        });
      }
      const acreditaDespues = requisitosFinales?.find((r) => r.acreditaPagoCurso)?.id ?? null;
      if (cambioCostoExterno || acreditaAntes !== acreditaDespues) {
        await recalcularInscripcionesDeCurso({
          capacitacionId: id,
          inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
          pagoCapacitacionRepository: this.pagoCapacitacionRepository,
          capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
          capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
          userId,
          transaction,
        });
      }
    });

    this.logger.info('[Capacitación] Curso de capacitación actualizado', {
      id,
      gruposSincronizados: grupos !== null,
      requisitosSincronizados: requisitos !== null,
    });

    const presentation = CursoCapacitacionMapper.entityToPresentation(updated);
    gruposFinales ??= {
      grupos: await this.grupoCapacitacionRepository.findByCapacitacionId(id),
      bloques: await this.bloqueCapacitacionRepository.findByCapacitacionId(id),
    };
    presentation.grupos = CursoCapacitacionMapper.gruposDeCursoToPresentation(
      gruposFinales.grupos,
      gruposFinales.bloques
    );
    presentation.requisitos = CursoCapacitacionMapper.requisitosToPresentation(
      requisitosFinales ?? (await this.capacitacionRequisitoRepository.findByCapacitacionId(id))
    );
    presentation.requisitoAcreditaPagoCurso = CursoCapacitacionMapper.requisitoAcreditaPagoCurso(
      presentation.requisitos
    );

    return { cursoCapacitacion: presentation };
  }
}
