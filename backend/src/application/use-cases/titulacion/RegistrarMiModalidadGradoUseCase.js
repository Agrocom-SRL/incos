import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { MODALIDAD_GRUPAL_CODIGO } from '../../../domain/constants/titulacion.constants.js';
import { resolveInscripcionVigenteEstudiante } from './helpers/proyectoTutoriaGuards.js';

/** periodo_numero (vista 101) que habilita el autorregistro (3er año). */
const PERIODO_NUMERO_HABILITADO = 3;

/** Estados del kardex (matriculas_materia.estado / historial_previo.estado, vistas 138/140/141). */
const ESTADOS_KARDEX_REPROBATORIOS = ['REPROBADO', 'ABANDONO'];
const ESTADOS_KARDEX_APROBATORIOS = ['APROBADO', 'CONVALIDADO'];

/**
 * Use Case: RegistrarMiModalidadGradoUseCase (Fase B3, autorregistro del
 * estudiante, extensión 2026-08-17)
 * Módulo: Titulación (TIT)
 *
 * "Registrar mi modalidad de grado": el propio estudiante crea su proyecto de
 * grado (POST /proyectos-grado/mi-proyecto). El estudiante se resuelve
 * SIEMPRE en servidor desde req.usuario.id (resolveEstudianteIdForUsuario);
 * NUNCA se acepta estudianteId/estudianteIds/titularEstudianteId del body —
 * el autorregistro es siempre INDIVIDUAL (la modalidad grupal PSP requiere
 * gestión administrativa de los integrantes, fuera del alcance de esta acción).
 *
 * Prerrequisito (decisión cerrada 2026-08-17, no renegociable):
 *   periodo_numero === 3 en la inscripción vigente del estudiante (vista 101,
 *   mismo campo que resolveInscripcionVigenteEstudiante) Y sin materias
 *   REPROBADO/ABANDONO pendientes de periodo_numero 1 o 2 (kardex, vista 141,
 *   mismo criterio de conteo por materia de la Fase 3 — "Regla de 3ra
 *   matrícula" — del plan de arrastre/choques, sin duplicar esa lógica: aquí
 *   solo se resuelve la consulta puntual "¿hay alguna pendiente?", no el
 *   conteo general de instancias).
 *
 * Delega la creación en CreateProyectoGradoUseCase (transacción, validación
 * de modalidad, integrante TITULAR) una vez validado el prerrequisito.
 */
export class RegistrarMiModalidadGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.createProyectoGradoUseCase
   * @param {Object} params.modalidadGradoRepository
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {Object} params.enrollmentRepository - Inscripción vigente (vista 101)
   * @param {Object} params.historialAcademicoRepository - Kardex (vista 141)
   * @param {ILogger} params.logger
   */
  constructor({
    createProyectoGradoUseCase,
    modalidadGradoRepository,
    studentRepository,
    userRepository,
    enrollmentRepository,
    historialAcademicoRepository,
    logger,
  }) {
    this.createProyectoGradoUseCase = createProyectoGradoUseCase;
    this.modalidadGradoRepository = modalidadGradoRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.historialAcademicoRepository = historialAcademicoRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, body: Object }} input - body: { titulo, objetivos?, modalidadId }
   * @returns {Promise<{proyectoGrado: Object}>}
   */
  async execute({ usuarioId, body = {} } = {}) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    await this._validarModalidadIndividual(body.modalidadId);
    await this._validarPrerrequisito(estudianteId);

    const { proyectoGrado } = await this.createProyectoGradoUseCase.execute(
      {
        titulo: body.titulo,
        objetivos: body.objetivos ?? null,
        modalidadId: body.modalidadId,
        estudianteIds: [estudianteId],
        titularEstudianteId: estudianteId,
      },
      usuarioId
    );

    this.logger.info('[Titulación] Autorregistro de modalidad de grado creado', {
      usuarioId,
      estudianteId,
      proyectoGradoId: proyectoGrado.id,
    });

    return { proyectoGrado };
  }

  /**
   * El autorregistro es siempre INDIVIDUAL: la modalidad PSP (grupal) exige
   * gestión administrativa de los integrantes, que un estudiante no puede
   * hacer por sí mismo.
   * @private
   */
  async _validarModalidadIndividual(modalidadId) {
    if (!modalidadId) {
      throw new ValidationError('modalidadId es requerido');
    }
    const modalidad = await this.modalidadGradoRepository.findById(modalidadId);
    if (!modalidad) {
      throw new NotFoundError(`modalidad de grado con ID ${modalidadId}`);
    }
    if (modalidad.codigo === MODALIDAD_GRUPAL_CODIGO) {
      throw new ValidationError(
        `La modalidad ${MODALIDAD_GRUPAL_CODIGO} (grupal) requiere gestión administrativa de los ` +
          'integrantes; no está disponible para el autorregistro individual. Contacte a Dirección Académica.'
      );
    }
  }

  /**
   * Prerrequisito: 3er año vigente + sin materias reprobadas/abandonadas
   * pendientes de 1º/2º año.
   * @private
   */
  async _validarPrerrequisito(estudianteId) {
    const inscripcion = await resolveInscripcionVigenteEstudiante({
      enrollmentRepository: this.enrollmentRepository,
      estudianteId,
    });

    if (Number(inscripcion.periodo_numero) !== PERIODO_NUMERO_HABILITADO) {
      throw new ConflictError(
        'Usted debe estar cursando el 3er año para registrar su modalidad de graduación.'
      );
    }

    const historialFilas =
      await this.historialAcademicoRepository.listarFilasHistorialPorEstudiante(estudianteId);
    if (this._tienePendientesPrimerSegundo(historialFilas)) {
      throw new ConflictError(
        'Usted tiene materias reprobadas o en abandono de 1º o 2º año pendientes de aprobar; ' +
          'no puede registrar su modalidad de graduación hasta regularizar su situación académica.'
      );
    }
  }

  /**
   * ¿Alguna materia de 1º/2º año del kardex quedó pendiente? Agrupa por
   * `asignatura_sigla` (identidad estable de la materia entre cambios de
   * plan — mismo criterio de fallback que
   * `GetMatriculaContextoUseCase._indexarKardexPorAsignatura`; la vista 141
   * no expone `materia_id` directo). Para cada materia se toma la fila MÁS
   * RECIENTE conocida (mayor gestion_anio; en empate gana un estado
   * aprobatorio, que refleja subsanación en la misma gestión): si esa fila es
   * reprobatoria (REPROBADO/ABANDONO), la materia queda pendiente.
   * @private
   * @param {Array<Object>} historialFilas - Filas crudas de la vista 141
   * @returns {boolean}
   */
  _tienePendientesPrimerSegundo(historialFilas) {
    const filasRelevantes = (historialFilas ?? [])
      .filter((fila) => {
        const periodoNumero = Number(fila.periodo_numero);
        return periodoNumero === 1 || periodoNumero === 2;
      })
      .map((fila) => ({
        clave: String(fila.asignatura_sigla ?? '').trim().toUpperCase(),
        estado: String(fila.estado ?? '').toUpperCase(),
        anio: Number(fila.gestion_anio ?? 0) || 0,
      }))
      .filter(
        (fila) =>
          fila.clave &&
          (ESTADOS_KARDEX_REPROBATORIOS.includes(fila.estado) ||
            ESTADOS_KARDEX_APROBATORIOS.includes(fila.estado))
      );

    const porMateria = new Map();
    for (const fila of filasRelevantes) {
      const aprobatoria = ESTADOS_KARDEX_APROBATORIOS.includes(fila.estado);
      const previa = porMateria.get(fila.clave);
      const esMasReciente =
        !previa ||
        fila.anio > previa.anio ||
        (fila.anio === previa.anio && aprobatoria && !previa.aprobatoria);
      if (esMasReciente) {
        porMateria.set(fila.clave, { anio: fila.anio, aprobatoria });
      }
    }

    return [...porMateria.values()].some(({ aprobatoria }) => !aprobatoria);
  }
}
